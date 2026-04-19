import {
  doc,
  getDocs,
  limit,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  where,
  type Timestamp,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '@/services/firebase/app'
import { coupleDoc, couplesCollection, userDoc, usersCollection } from '@/services/firebase/firestore'
import type {
  FirestoreCouple,
  FirestoreUserState,
} from '@/services/firebase/types/firestore-couple.interface'
import { normalizeInviteCode } from '@/utils/inviteCode'
import type { Couple } from '@/views/pairing/types/interface'

const toDate = (value?: Timestamp | null) => value ? value.toDate() : null

const mapCouple = (data: FirestoreCouple): Couple => ({
  id: data.id,
  memberUids: Array.isArray(data.memberUids) ? data.memberUids : [],
  inviteCode: data.inviteCode,
  status: data.status,
  createdBy: data.createdBy,
  createdAt: toDate(data.createdAt),
  updatedAt: toDate(data.updatedAt),
})

const subscribeToCouple = (
  coupleId: string,
  callback: (couple: Couple | null) => void,
): Unsubscribe => onSnapshot(coupleDoc(coupleId), (snapshot) => {
  if (!snapshot.exists()) {
    callback(null)
    return
  }

  callback(mapCouple(snapshot.data() as FirestoreCouple))
})

const findUserByInviteCode = async (inviteCode: string) => {
  const snapshot = await getDocs(query(
    usersCollection,
    where('inviteCode', '==', inviteCode),
    limit(1),
  ))

  if (snapshot.empty) {
    return null
  }

  return snapshot.docs[0]
}

const joinCoupleByInviteCode = async (uid: string, rawInviteCode: string) => {
  const inviteCode = normalizeInviteCode(rawInviteCode)

  if (!inviteCode) {
    throw new Error('請先輸入邀請碼。')
  }

  const targetUserSnapshot = await findUserByInviteCode(inviteCode)

  if (!targetUserSnapshot) {
    throw new Error('找不到這組邀請碼，請重新確認。')
  }

  if (targetUserSnapshot.id === uid) {
    throw new Error('不能輸入自己的邀請碼。')
  }

  const coupleReference = doc(couplesCollection)

  await runTransaction(db, async (transaction) => {
    const currentUserRef = userDoc(uid)
    const targetUserRef = userDoc(targetUserSnapshot.id)
    const currentUserSnapshot = await transaction.get(currentUserRef)
    const latestTargetUserSnapshot = await transaction.get(targetUserRef)

    if (!currentUserSnapshot.exists()) {
      throw new Error('目前找不到你的使用者資料，請重新登入後再試。')
    }

    if (!latestTargetUserSnapshot.exists()) {
      throw new Error('這組邀請碼的使用者資料不存在。')
    }

    const currentUserState = currentUserSnapshot.data() as FirestoreUserState
    const targetUserState = latestTargetUserSnapshot.data() as FirestoreUserState

    if (currentUserState.coupleId) {
      throw new Error('你目前已經在一組 couple 內，不能再加入其他邀請碼。')
    }

    if (targetUserState.coupleId) {
      throw new Error('對方已經完成配對，這組邀請碼不能再使用。')
    }

    if (targetUserState.inviteCode !== inviteCode) {
      throw new Error('這組邀請碼已更新，請向對方確認最新邀請碼。')
    }

    transaction.set(coupleReference, {
      id: coupleReference.id,
      memberUids: [targetUserSnapshot.id, uid],
      inviteCode,
      status: 'paired',
      createdBy: targetUserSnapshot.id,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    transaction.update(currentUserRef, {
      coupleId: coupleReference.id,
      partnerUid: targetUserSnapshot.id,
      updatedAt: serverTimestamp(),
    })

    transaction.update(targetUserRef, {
      coupleId: coupleReference.id,
      partnerUid: uid,
      updatedAt: serverTimestamp(),
    })
  })

  return coupleReference.id
}

export { joinCoupleByInviteCode, subscribeToCouple }
