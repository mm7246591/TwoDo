import type { Unsubscribe } from 'firebase/firestore'
import { computed, reactive, ref, toRefs } from 'vue'
import { defineStore } from 'pinia'
import type { CreateRewardInput, RewardsStoreState } from '@/pinia/rewards/types/interface'
import {
  createReward,
  redeemReward,
  subscribeToRewards,
} from '@/services/rewardService'
import type { Reward } from '@/views/rewards/types/interface'

const normalizeErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message
  }

  return '獎勵流程發生未預期錯誤，請稍後再試。'
}

const useRewardsStore = defineStore('rewards', () => {
  const rewards = ref<Reward[]>([])
  const currentCoupleId = ref<string | null>(null)
  const state = reactive<RewardsStoreState>({
    errorMessage: '',
    isLoading: false,
    isSubmitting: false,
  })
  let unsubscribeRewards: Unsubscribe | null = null

  const getActiveRewards = computed(() => rewards.value.filter((reward) => reward.isActive))
  const getInactiveRewards = computed(() => rewards.value.filter((reward) => !reward.isActive))

  const clearError = () => {
    state.errorMessage = ''
  }

  const stopSync = () => {
    unsubscribeRewards?.()
    unsubscribeRewards = null
  }

  const syncRewards = async (coupleId: string) => {
    if (currentCoupleId.value === coupleId && unsubscribeRewards) {
      return
    }

    stopSync()
    clearError()
    currentCoupleId.value = coupleId
    state.isLoading = true

    unsubscribeRewards = subscribeToRewards(coupleId, (nextRewards) => {
      rewards.value = nextRewards
      state.isLoading = false
    })
  }

  const createNewReward = async (input: CreateRewardInput) => {
    state.isSubmitting = true
    clearError()

    try {
      await createReward(input)
    } catch (error) {
      state.errorMessage = normalizeErrorMessage(error)
      throw error
    } finally {
      state.isSubmitting = false
    }
  }

  const redeemExistingReward = async (reward: Reward, actorUid: string) => {
    state.isSubmitting = true
    clearError()

    try {
      await redeemReward(reward, actorUid)
    } catch (error) {
      state.errorMessage = normalizeErrorMessage(error)
      throw error
    } finally {
      state.isSubmitting = false
    }
  }

  const reset = () => {
    stopSync()
    rewards.value = []
    currentCoupleId.value = null
    state.errorMessage = ''
    state.isLoading = false
    state.isSubmitting = false
  }

  return {
    ...toRefs(state),
    clearError,
    createNewReward,
    currentCoupleId,
    getActiveRewards,
    getInactiveRewards,
    redeemExistingReward,
    reset,
    rewards,
    syncRewards,
  }
})

export { useRewardsStore }
