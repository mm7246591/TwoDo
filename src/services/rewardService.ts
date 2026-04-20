import {
  onSnapshot,
  query,
  where,
  type Timestamp,
  type Unsubscribe,
} from 'firebase/firestore'
import {
  type FunctionsError,
  httpsCallable,
} from 'firebase/functions'
import { firebaseFunctions } from '@/services/firebase/app'
import { rewardsCollection } from '@/services/firebase/firestore'
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

  try {
    const createRewardCallable = httpsCallable<
      {
        coupleId: string
        title: string
        description: string
        cost: number
        isActive: boolean
      },
      { rewardId: string }
    >(firebaseFunctions, 'createReward')

    await createRewardCallable({
      coupleId: payload.coupleId,
      title: trimmedTitle,
      description: trimmedDescription,
      cost: payload.cost,
      isActive: payload.isActive,
    })
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'message' in error) {
      throw new Error(String((error as FunctionsError).message))
    }

    throw error
  }
}

const redeemReward = async (reward: Reward, actorUid: string) => {
  if (reward.createdBy === actorUid) {
    throw new Error('不能兌換自己建立的獎勵。')
  }

  try {
    const redeemRewardCallable = httpsCallable<
      { rewardId: string },
      { redemptionId: string }
    >(firebaseFunctions, 'redeemReward')

    await redeemRewardCallable({ rewardId: reward.id })
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'message' in error) {
      throw new Error(String((error as FunctionsError).message))
    }

    throw error
  }
}

export { createReward, redeemReward, subscribeToRewards }
