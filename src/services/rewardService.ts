import {
  addDoc,
  doc,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  where,
  type Timestamp,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '@/services/firebase/app'
import {
  pointLogsCollection,
  redemptionsCollection,
  rewardsCollection,
  userDoc,
} from '@/services/firebase/firestore'
import type { FirestoreUserProfile } from '@/services/firebase/types/firestore-user-profile.interface'
import type {
  CreateRewardPayload,
  FirestoreReward,
} from '@/services/firebase/types/firestore-reward.interface'
import type { Reward } from '@/views/rewards/types/interface'

const toDate = (value?: Timestamp | null) => value ? value.toDate() : null

const mapReward = (rewardId: string, data: FirestoreReward): Reward => ({
  id: rewardId,
  coupleId: data.coupleId,
  title: data.title,
  description: data.description ?? '',
  cost: typeof data.cost === 'number' ? data.cost : 0,
  createdBy: data.createdBy,
  isActive: Boolean(data.isActive),
  createdAt: toDate(data.createdAt) ?? new Date(),
  updatedAt: toDate(data.updatedAt) ?? new Date(),
})

const sortRewardsByUpdatedAt = (rewards: Reward[]) => [...rewards].sort((leftReward, rightReward) => {
  const leftTime = leftReward.updatedAt.getTime()
  const rightTime = rightReward.updatedAt.getTime()

  return rightTime - leftTime
})

const subscribeToRewards = (
  coupleId: string,
  callback: (rewards: Reward[]) => void,
): Unsubscribe => onSnapshot(
  query(rewardsCollection, where('coupleId', '==', coupleId)),
  (snapshot) => {
    const rewards = snapshot.docs.map((documentSnapshot) => mapReward(
      documentSnapshot.id,
      documentSnapshot.data() as FirestoreReward,
    ))

    callback(sortRewardsByUpdatedAt(rewards))
  },
)

const createReward = async (payload: CreateRewardPayload) => {
  const trimmedTitle = payload.title.trim()
  const trimmedDescription = payload.description.trim()

  if (!trimmedTitle) {
    throw new Error('請先輸入獎勵名稱。')
  }

  if (!payload.coupleId) {
    throw new Error('目前沒有配對資料，無法建立獎勵。')
  }

  if (payload.cost <= 0) {
    throw new Error('獎勵兌換點數至少要大於 0。')
  }

  await addDoc(rewardsCollection, {
    coupleId: payload.coupleId,
    title: trimmedTitle,
    description: trimmedDescription,
    cost: payload.cost,
    createdBy: payload.createdBy,
    isActive: payload.isActive,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

const redeemReward = async (reward: Reward, actorUid: string) => {
  if (reward.createdBy === actorUid) {
    throw new Error('不能兌換自己建立的獎勵。')
  }

  await runTransaction(db, async (transaction) => {
    const rewardReference = doc(rewardsCollection, reward.id)
    const actorUserRef = userDoc(actorUid)
    const pointLogReference = doc(pointLogsCollection)
    const redemptionReference = doc(redemptionsCollection)
    const [latestRewardSnapshot, actorUserSnapshot] = await Promise.all([
      transaction.get(rewardReference),
      transaction.get(actorUserRef),
    ])

    if (!latestRewardSnapshot.exists()) {
      throw new Error('找不到這筆獎勵，請重新整理後再試。')
    }

    if (!actorUserSnapshot.exists()) {
      throw new Error('目前找不到你的使用者資料，請重新登入後再試。')
    }

    const latestReward = latestRewardSnapshot.data() as FirestoreReward
    const actorUser = actorUserSnapshot.data() as FirestoreUserProfile
    const currentPoints = typeof actorUser.points === 'number' ? actorUser.points : 0

    if (!latestReward.isActive) {
      throw new Error('這個獎勵目前未啟用，暫時不能兌換。')
    }

    if (latestReward.createdBy === actorUid) {
      throw new Error('不能兌換自己建立的獎勵。')
    }

    if (currentPoints < latestReward.cost) {
      throw new Error('目前點數不足，還不能兌換這個獎勵。')
    }

    transaction.update(actorUserRef, {
      points: currentPoints - latestReward.cost,
      updatedAt: serverTimestamp(),
    })

    transaction.set(pointLogReference, {
      coupleId: latestReward.coupleId,
      userUid: actorUid,
      type: 'reward_redeem',
      points: -latestReward.cost,
      taskId: null,
      rewardId: reward.id,
      source: 'reward_redeemed',
      createdAt: serverTimestamp(),
    })

    transaction.set(redemptionReference, {
      coupleId: latestReward.coupleId,
      rewardId: reward.id,
      redeemedBy: actorUid,
      cost: latestReward.cost,
      status: 'completed',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  })
}

export { createReward, redeemReward, subscribeToRewards }
