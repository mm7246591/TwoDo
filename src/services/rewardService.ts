import {
  getDoc,
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
import {
  redemptionsCollection,
  rewardDoc,
  rewardsCollection,
} from '@/services/firebase/firestore'
import type { FirestoreRedemption } from '@/services/firebase/types/firestore-redemption.interface'
import type {
  CreateRewardPayload,
  FirestoreReward,
} from '@/services/firebase/types/firestore-reward.interface'
import type {
  Redemption,
  Reward,
} from '@/views/rewards/types/interface'

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

const mapRedemption = (
  redemptionId: string,
  data: FirestoreRedemption,
  rewardTitle: string | null,
): Redemption => ({
  id: redemptionId,
  coupleId: data.coupleId,
  rewardId: data.rewardId,
  rewardTitle,
  redeemedBy: data.redeemedBy,
  cost: typeof data.cost === 'number' ? data.cost : 0,
  status: data.status,
  createdAt: toDate(data.createdAt) ?? new Date(),
  updatedAt: toDate(data.updatedAt) ?? new Date(),
})

const sortRedemptionsByCreatedAt = (redemptions: Redemption[]) => [...redemptions].sort(
  (leftRedemption, rightRedemption) => rightRedemption.createdAt.getTime() - leftRedemption.createdAt.getTime(),
)

const subscribeToRewards = (
  coupleId: string,
  callback: (rewards: Reward[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe => onSnapshot(
  query(rewardsCollection, where('coupleId', '==', coupleId)),
  (snapshot) => {
    const rewards = snapshot.docs.map((documentSnapshot) => mapReward(
      documentSnapshot.id,
      documentSnapshot.data() as FirestoreReward,
    ))

    callback(sortRewardsByUpdatedAt(rewards))
  },
  (error) => {
    onError?.(error)
  },
)

const subscribeToRedemptions = (
  coupleId: string,
  callback: (redemptions: Redemption[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe => onSnapshot(
  query(redemptionsCollection, where('coupleId', '==', coupleId)),
  async (snapshot) => {
    try {
      const rawRedemptions = snapshot.docs.map((documentSnapshot) => ({
        data: documentSnapshot.data() as FirestoreRedemption,
        id: documentSnapshot.id,
      }))

      const rewardIds = Array.from(
        new Set(rawRedemptions.map((redemption) => redemption.data.rewardId).filter(Boolean)),
      ) as string[]

      const rewardEntries = await Promise.all(rewardIds.map(async (rewardId) => {
        const snapshot = await getDoc(rewardDoc(rewardId))
        const reward = snapshot.data() as FirestoreReward | undefined

        return [rewardId, reward?.title ?? null] as const
      }))

      const rewardTitleMap = new Map(rewardEntries)

      const redemptions = rawRedemptions.map((redemption) => mapRedemption(
        redemption.id,
        redemption.data,
        rewardTitleMap.get(redemption.data.rewardId) ?? null,
      ))

      callback(sortRedemptionsByCreatedAt(redemptions))
    } catch (error) {
      onError?.(
        error instanceof Error
          ? error
          : new Error('獎勵兌換紀錄補充資料讀取失敗，請稍後再試。'),
      )
    }
  },
  (error) => {
    onError?.(error)
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

const updateRewardStatus = async (
  reward: Reward,
  actorUid: string,
  isActive: boolean,
) => {
  if (reward.createdBy !== actorUid) {
    throw new Error('只有建立獎勵的人可以切換狀態。')
  }

  if (reward.isActive === isActive) {
    return
  }

  try {
    const updateRewardStatusCallable = httpsCallable<
      { rewardId: string; isActive: boolean },
      { success: true }
    >(firebaseFunctions, 'updateRewardStatus')

    await updateRewardStatusCallable({
      rewardId: reward.id,
      isActive,
    })
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'message' in error) {
      throw new Error(String((error as FunctionsError).message))
    }

    throw error
  }
}

export {
  createReward,
  redeemReward,
  subscribeToRedemptions,
  subscribeToRewards,
  updateRewardStatus,
}
