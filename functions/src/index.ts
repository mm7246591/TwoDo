import { initializeApp } from 'firebase-admin/app'
import {
  FieldValue,
  getFirestore,
  Timestamp,
} from 'firebase-admin/firestore'
import { getMessaging } from 'firebase-admin/messaging'
import { setGlobalOptions } from 'firebase-functions/v2'
import { HttpsError, onCall } from 'firebase-functions/v2/https'

initializeApp()
setGlobalOptions({ invoker: 'public' })

const db = getFirestore()
const callableOptions = {
  cors: true,
  invoker: 'public',
} as const

type UserProfile = {
  uid: string
  email: string
  displayName: string
  photoURL: string
  inviteCode: string
  coupleId: string | null
  partnerUid: string | null
  points: number
  fcmTokens?: string[]
}

type TaskStatus =
  | 'pending'
  | 'completed_pending_confirm'
  | 'confirmed'
  | 'cancelled'
  | 'rejected'

type TaskRecord = {
  assignedTo: string
  completedAt?: Timestamp | null
  confirmedAt?: Timestamp | null
  coupleId: string
  createdAt?: Timestamp | null
  createdBy: string
  description?: string
  dueDate?: Timestamp | null
  points: number
  status: TaskStatus
  title: string
  updatedAt?: Timestamp | null
}

type RewardRecord = {
  coupleId: string
  title: string
  description?: string
  cost: number
  createdBy: string
  isActive: boolean
}

const usersCollection = db.collection('users')
const couplesCollection = db.collection('couples')
const tasksCollection = db.collection('tasks')
const rewardsCollection = db.collection('rewards')
const pointLogsCollection = db.collection('pointLogs')
const redemptionsCollection = db.collection('redemptions')
const notificationsCollection = db.collection('notifications')
const WEB_PUSH_FALLBACK_LINK = '/notifications'
const WEB_PUSH_CLICK_LINK = 'https://twodo-3741f.web.app/notifications'

const getAuthenticatedUid = (auth: { uid: string } | null | undefined) => {
  if (!auth?.uid) {
    throw new HttpsError('unauthenticated', '請先登入後再試。')
  }

  return auth.uid
}

const normalizeInviteCode = (value: string) => value.trim().toUpperCase().replace(/\s+/g, '')

const getUserProfile = async (uid: string) => {
  const snapshot = await usersCollection.doc(uid).get()

  if (!snapshot.exists) {
    throw new HttpsError('failed-precondition', '目前找不到你的使用者資料，請重新登入後再試。')
  }

  return snapshot.data() as UserProfile
}

const createNotificationPayload = (payload: {
  userUid: string
  coupleId: string
  type: 'new_task' | 'task_completed_pending_confirm' | 'task_confirmed' | 'reward_redeemed'
  title: string
  message: string
  refId: string | null
}) => ({
  ...payload,
  isRead: false,
  createdAt: FieldValue.serverTimestamp(),
})

const normalizeFcmTokens = (tokens?: string[]) => Array.from(
  new Set(
    (tokens ?? [])
      .filter((token) => typeof token === 'string')
      .map((token) => token.trim())
      .filter(Boolean),
  ),
)

const sendPushNotification = async (payload: {
  userUid: string
  coupleId: string
  type: 'new_task' | 'task_completed_pending_confirm' | 'task_confirmed' | 'reward_redeemed'
  title: string
  message: string
  refId: string | null
}) => {
  const userSnapshot = await usersCollection.doc(payload.userUid).get()

  if (!userSnapshot.exists) {
    return
  }

  const user = userSnapshot.data() as UserProfile
  const tokens = normalizeFcmTokens(user.fcmTokens)

  if (!tokens.length) {
    return
  }

  try {
    const response = await getMessaging().sendEachForMulticast({
      tokens,
      data: {
        coupleId: payload.coupleId,
        link: WEB_PUSH_FALLBACK_LINK,
        message: payload.message,
        refId: payload.refId ?? '',
        title: payload.title,
        type: payload.type,
      },
      webpush: {
        fcmOptions: {
          link: WEB_PUSH_CLICK_LINK,
        },
        headers: {
          Urgency: 'high',
        },
      },
    })

    const invalidTokens = response.responses.flatMap((result, index) => {
      if (result.success || !result.error) {
        return []
      }

      if (
        result.error.code === 'messaging/invalid-registration-token'
        || result.error.code === 'messaging/registration-token-not-registered'
      ) {
        return [tokens[index]]
      }

      console.error(`Failed to send push notification to ${payload.userUid}:`, result.error)
      return []
    })

    if (invalidTokens.length) {
      await usersCollection.doc(payload.userUid).update({
        fcmTokens: FieldValue.arrayRemove(...invalidTokens),
        updatedAt: FieldValue.serverTimestamp(),
      })
    }
  } catch (error) {
    console.error(`Push notification dispatch failed for ${payload.userUid}:`, error)
  }
}

export const joinCoupleByInviteCode = onCall(callableOptions, async (request) => {
  const uid = getAuthenticatedUid(request.auth)
  const rawInviteCode = typeof request.data?.inviteCode === 'string' ? request.data.inviteCode : ''
  const inviteCode = normalizeInviteCode(rawInviteCode)

  if (!inviteCode) {
    throw new HttpsError('invalid-argument', '請先輸入邀請碼。')
  }

  const targetUserSnapshot = await usersCollection
    .where('inviteCode', '==', inviteCode)
    .limit(1)
    .get()

  if (targetUserSnapshot.empty) {
    throw new HttpsError('not-found', '找不到這組邀請碼，請重新確認。')
  }

  const targetUserDoc = targetUserSnapshot.docs[0]

  if (targetUserDoc.id === uid) {
    throw new HttpsError('failed-precondition', '不能輸入自己的邀請碼。')
  }

  const coupleReference = couplesCollection.doc()

  await db.runTransaction(async (transaction) => {
    const currentUserRef = usersCollection.doc(uid)
    const targetUserRef = usersCollection.doc(targetUserDoc.id)
    const [currentUserSnapshot, latestTargetUserSnapshot] = await Promise.all([
      transaction.get(currentUserRef),
      transaction.get(targetUserRef),
    ])

    if (!currentUserSnapshot.exists) {
      throw new HttpsError('failed-precondition', '目前找不到你的使用者資料，請重新登入後再試。')
    }

    if (!latestTargetUserSnapshot.exists) {
      throw new HttpsError('not-found', '這組邀請碼的使用者資料不存在。')
    }

    const currentUser = currentUserSnapshot.data() as UserProfile
    const targetUser = latestTargetUserSnapshot.data() as UserProfile

    if (currentUser.coupleId) {
      throw new HttpsError('failed-precondition', '你目前已經在一組 couple 內，不能再加入其他邀請碼。')
    }

    if (targetUser.coupleId) {
      throw new HttpsError('failed-precondition', '對方已經完成配對，這組邀請碼不能再使用。')
    }

    if (targetUser.inviteCode !== inviteCode) {
      throw new HttpsError('aborted', '這組邀請碼已更新，請向對方確認最新邀請碼。')
    }

    transaction.set(coupleReference, {
      id: coupleReference.id,
      memberUids: [targetUserDoc.id, uid],
      inviteCode,
      status: 'paired',
      createdBy: targetUserDoc.id,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })

    transaction.update(currentUserRef, {
      coupleId: coupleReference.id,
      partnerUid: targetUserDoc.id,
      updatedAt: FieldValue.serverTimestamp(),
    })

    transaction.update(targetUserRef, {
      coupleId: coupleReference.id,
      partnerUid: uid,
      updatedAt: FieldValue.serverTimestamp(),
    })
  })

  return { coupleId: coupleReference.id }
})

export const unpairCouple = onCall(callableOptions, async (request) => {
  const uid = getAuthenticatedUid(request.auth)
  const currentUser = await getUserProfile(uid)

  if (!currentUser.coupleId) {
    throw new HttpsError('failed-precondition', '你目前沒有配對資料，無法解除配對。')
  }

  const coupleReference = couplesCollection.doc(currentUser.coupleId)
  const currentUserReference = usersCollection.doc(uid)
  const partnerReference = currentUser.partnerUid
    ? usersCollection.doc(currentUser.partnerUid)
    : null

  await db.runTransaction(async (transaction) => {
    const coupleSnapshotPromise = transaction.get(coupleReference)
    const partnerSnapshotPromise = partnerReference
      ? transaction.get(partnerReference)
      : Promise.resolve(null)
    const [coupleSnapshot, partnerSnapshot] = await Promise.all([
      coupleSnapshotPromise,
      partnerSnapshotPromise,
    ])

    if (coupleSnapshot.exists) {
      transaction.delete(coupleReference)
    }

    transaction.update(currentUserReference, {
      coupleId: null,
      partnerUid: null,
      updatedAt: FieldValue.serverTimestamp(),
    })

    if (partnerReference && partnerSnapshot?.exists) {
      const partner = partnerSnapshot.data() as UserProfile

      if (partner.coupleId === currentUser.coupleId) {
        transaction.update(partnerReference, {
          coupleId: null,
          partnerUid: null,
          updatedAt: FieldValue.serverTimestamp(),
        })
      }
    }
  })

  return { success: true as const }
})

export const createTask = onCall(callableOptions, async (request) => {
  const uid = getAuthenticatedUid(request.auth)
  const title = typeof request.data?.title === 'string' ? request.data.title.trim() : ''
  const description = typeof request.data?.description === 'string' ? request.data.description.trim() : ''
  const assignedTo = typeof request.data?.assignedTo === 'string' ? request.data.assignedTo : ''
  const points = typeof request.data?.points === 'number' ? request.data.points : 0
  const dueDateIso = typeof request.data?.dueDateIso === 'string' ? request.data.dueDateIso : null
  const currentUser = await getUserProfile(uid)

  if (!title) {
    throw new HttpsError('invalid-argument', '請先輸入任務標題。')
  }

  if (!currentUser.coupleId || !currentUser.partnerUid) {
    throw new HttpsError('failed-precondition', '目前沒有配對資料，無法建立任務。')
  }

  if (assignedTo !== currentUser.partnerUid) {
    throw new HttpsError('failed-precondition', '目前只能把任務指派給你的另一半。')
  }

  if (points <= 0) {
    throw new HttpsError('invalid-argument', '任務點數至少要大於 0。')
  }

  const taskReference = tasksCollection.doc()

  await taskReference.set({
    assignedTo,
    completedAt: null,
    confirmedAt: null,
    coupleId: currentUser.coupleId,
    createdAt: FieldValue.serverTimestamp(),
    createdBy: uid,
    description,
    dueDate: dueDateIso ? Timestamp.fromDate(new Date(dueDateIso)) : null,
    points,
    status: 'pending',
    title,
    updatedAt: FieldValue.serverTimestamp(),
  })

  const notificationPayload = {
    userUid: assignedTo,
    coupleId: currentUser.coupleId,
    type: 'new_task',
    title: '你有新的待辦事項',
    message: `對方指派了「${title}」給你`,
    refId: taskReference.id,
  } as const

  await notificationsCollection.add(createNotificationPayload(notificationPayload))
  await sendPushNotification(notificationPayload)

  return { taskId: taskReference.id }
})

export const completeTask = onCall(callableOptions, async (request) => {
  const uid = getAuthenticatedUid(request.auth)
  const taskId = typeof request.data?.taskId === 'string' ? request.data.taskId : ''

  if (!taskId) {
    throw new HttpsError('invalid-argument', '缺少 taskId。')
  }

  const taskReference = tasksCollection.doc(taskId)
  let pushPayload: Parameters<typeof sendPushNotification>[0] | null = null

  await db.runTransaction(async (transaction) => {
    const taskSnapshot = await transaction.get(taskReference)

    if (!taskSnapshot.exists) {
      throw new HttpsError('not-found', '找不到這筆任務，請重新整理後再試。')
    }

    const task = taskSnapshot.data() as TaskRecord

    if (task.assignedTo !== uid) {
      throw new HttpsError('permission-denied', '只有被指派的人可以標記任務完成。')
    }

    if (task.status !== 'pending') {
      throw new HttpsError('failed-precondition', '目前只有待處理的任務可以標記完成。')
    }

    transaction.update(taskReference, {
      completedAt: FieldValue.serverTimestamp(),
      status: 'completed_pending_confirm',
      updatedAt: FieldValue.serverTimestamp(),
    })

    pushPayload = {
      userUid: task.createdBy,
      coupleId: task.coupleId,
      type: 'task_completed_pending_confirm',
      title: '有任務等待你確認',
      message: `「${task.title}」已標記完成，等你確認後就會加分。`,
      refId: taskId,
    }

    transaction.set(notificationsCollection.doc(), createNotificationPayload(pushPayload))
  })

  if (pushPayload) {
    await sendPushNotification(pushPayload)
  }

  return { success: true as const }
})

export const confirmTask = onCall(callableOptions, async (request) => {
  const uid = getAuthenticatedUid(request.auth)
  const taskId = typeof request.data?.taskId === 'string' ? request.data.taskId : ''
  let pushPayload: Parameters<typeof sendPushNotification>[0] | null = null

  if (!taskId) {
    throw new HttpsError('invalid-argument', '缺少 taskId。')
  }

  await db.runTransaction(async (transaction) => {
    const taskReference = tasksCollection.doc(taskId)
    const taskSnapshot = await transaction.get(taskReference)

    if (!taskSnapshot.exists) {
      throw new HttpsError('not-found', '找不到這筆任務，請重新整理後再試。')
    }

    const task = taskSnapshot.data() as TaskRecord

    if (task.createdBy !== uid) {
      throw new HttpsError('permission-denied', '只有建立任務的人可以確認完成。')
    }

    if (task.status !== 'completed_pending_confirm') {
      throw new HttpsError('failed-precondition', '只有待確認的任務可以確認完成。')
    }

    const assignedUserRef = usersCollection.doc(task.assignedTo)
    const assignedUserSnapshot = await transaction.get(assignedUserRef)

    if (!assignedUserSnapshot.exists) {
      throw new HttpsError('not-found', '被指派的使用者資料不存在，無法發放積分。')
    }

    const assignedUser = assignedUserSnapshot.data() as UserProfile
    const nextPoints = (typeof assignedUser.points === 'number' ? assignedUser.points : 0) + task.points

    transaction.update(taskReference, {
      confirmedAt: FieldValue.serverTimestamp(),
      status: 'confirmed',
      updatedAt: FieldValue.serverTimestamp(),
    })

    transaction.update(assignedUserRef, {
      points: nextPoints,
      updatedAt: FieldValue.serverTimestamp(),
    })

    transaction.set(pointLogsCollection.doc(), {
      coupleId: task.coupleId,
      userUid: task.assignedTo,
      type: 'task_reward',
      points: task.points,
      taskId,
      rewardId: null,
      source: 'task_confirmed',
      createdAt: FieldValue.serverTimestamp(),
    })

    pushPayload = {
      userUid: task.assignedTo,
      coupleId: task.coupleId,
      type: 'task_confirmed',
      title: '任務已確認完成',
      message: `「${task.title}」已確認完成，你獲得 ${task.points} 點。`,
      refId: taskId,
    }

    transaction.set(notificationsCollection.doc(), createNotificationPayload(pushPayload))
  })

  if (pushPayload) {
    await sendPushNotification(pushPayload)
  }

  return { success: true as const }
})

export const cancelTask = onCall(callableOptions, async (request) => {
  const uid = getAuthenticatedUid(request.auth)
  const taskId = typeof request.data?.taskId === 'string' ? request.data.taskId : ''

  if (!taskId) {
    throw new HttpsError('invalid-argument', '缺少 taskId。')
  }

  const taskReference = tasksCollection.doc(taskId)

  await db.runTransaction(async (transaction) => {
    const taskSnapshot = await transaction.get(taskReference)

    if (!taskSnapshot.exists) {
      throw new HttpsError('not-found', '找不到這筆任務，請重新整理後再試。')
    }

    const task = taskSnapshot.data() as TaskRecord

    if (task.createdBy !== uid) {
      throw new HttpsError('permission-denied', '只有建立任務的人可以取消任務。')
    }

    if (task.status === 'confirmed' || task.status === 'cancelled') {
      throw new HttpsError('failed-precondition', '這個任務目前不能取消。')
    }

    transaction.update(taskReference, {
      status: 'cancelled',
      updatedAt: FieldValue.serverTimestamp(),
    })
  })

  return { success: true as const }
})

export const createReward = onCall(callableOptions, async (request) => {
  const uid = getAuthenticatedUid(request.auth)
  const title = typeof request.data?.title === 'string' ? request.data.title.trim() : ''
  const description = typeof request.data?.description === 'string' ? request.data.description.trim() : ''
  const cost = typeof request.data?.cost === 'number' ? request.data.cost : 0
  const isActive = Boolean(request.data?.isActive)
  const currentUser = await getUserProfile(uid)

  if (!title) {
    throw new HttpsError('invalid-argument', '請先輸入獎勵名稱。')
  }

  if (!currentUser.coupleId) {
    throw new HttpsError('failed-precondition', '目前沒有配對資料，無法建立獎勵。')
  }

  if (cost <= 0) {
    throw new HttpsError('invalid-argument', '獎勵兌換點數至少要大於 0。')
  }

  const rewardReference = rewardsCollection.doc()

  await rewardReference.set({
    coupleId: currentUser.coupleId,
    title,
    description,
    cost,
    createdBy: uid,
    isActive,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })

  return { rewardId: rewardReference.id }
})

export const updateRewardStatus = onCall(callableOptions, async (request) => {
  const uid = getAuthenticatedUid(request.auth)
  const rewardId = typeof request.data?.rewardId === 'string' ? request.data.rewardId : ''
  const isActive = Boolean(request.data?.isActive)

  if (!rewardId) {
    throw new HttpsError('invalid-argument', '缺少 rewardId。')
  }

  const rewardReference = rewardsCollection.doc(rewardId)
  const rewardSnapshot = await rewardReference.get()

  if (!rewardSnapshot.exists) {
    throw new HttpsError('not-found', '找不到這筆獎勵，請重新整理後再試。')
  }

  const reward = rewardSnapshot.data() as RewardRecord

  if (reward.createdBy !== uid) {
    throw new HttpsError('permission-denied', '只有建立獎勵的人可以切換狀態。')
  }

  if (reward.isActive === isActive) {
    return { success: true as const }
  }

  await rewardReference.update({
    isActive,
    updatedAt: FieldValue.serverTimestamp(),
  })

  return { success: true as const }
})

export const redeemReward = onCall(callableOptions, async (request) => {
  const uid = getAuthenticatedUid(request.auth)
  const rewardId = typeof request.data?.rewardId === 'string' ? request.data.rewardId : ''
  let pushPayload: Parameters<typeof sendPushNotification>[0] | null = null

  if (!rewardId) {
    throw new HttpsError('invalid-argument', '缺少 rewardId。')
  }

  await db.runTransaction(async (transaction) => {
    const rewardReference = rewardsCollection.doc(rewardId)
    const rewardSnapshot = await transaction.get(rewardReference)

    if (!rewardSnapshot.exists) {
      throw new HttpsError('not-found', '找不到這筆獎勵，請重新整理後再試。')
    }

    const reward = rewardSnapshot.data() as RewardRecord

    if (!reward.isActive) {
      throw new HttpsError('failed-precondition', '這個獎勵目前未啟用，暫時不能兌換。')
    }

    if (reward.createdBy === uid) {
      throw new HttpsError('failed-precondition', '不能兌換自己建立的獎勵。')
    }

    const actorUserRef = usersCollection.doc(uid)
    const actorUserSnapshot = await transaction.get(actorUserRef)

    if (!actorUserSnapshot.exists) {
      throw new HttpsError('not-found', '目前找不到你的使用者資料，請重新登入後再試。')
    }

    const actorUser = actorUserSnapshot.data() as UserProfile
    const currentPoints = typeof actorUser.points === 'number' ? actorUser.points : 0

    if (currentPoints < reward.cost) {
      throw new HttpsError('failed-precondition', '目前點數不足，還不能兌換這個獎勵。')
    }

    const redemptionReference = redemptionsCollection.doc()

    transaction.update(actorUserRef, {
      points: currentPoints - reward.cost,
      updatedAt: FieldValue.serverTimestamp(),
    })

    transaction.set(pointLogsCollection.doc(), {
      coupleId: reward.coupleId,
      userUid: uid,
      type: 'reward_redeem',
      points: -reward.cost,
      taskId: null,
      rewardId,
      source: 'reward_redeemed',
      createdAt: FieldValue.serverTimestamp(),
    })

    transaction.set(redemptionReference, {
      coupleId: reward.coupleId,
      rewardId,
      redeemedBy: uid,
      cost: reward.cost,
      status: 'completed',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })

    pushPayload = {
      userUid: reward.createdBy,
      coupleId: reward.coupleId,
      type: 'reward_redeemed',
      title: '你的獎勵已被兌換',
      message: `另一半兌換了「${reward.title}」，已扣除 ${reward.cost} 點。`,
      refId: rewardId,
    }

    transaction.set(notificationsCollection.doc(), createNotificationPayload(pushPayload))
  })

  if (pushPayload) {
    await sendPushNotification(pushPayload)
  }

  return { success: true as const }
})
