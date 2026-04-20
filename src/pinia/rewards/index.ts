import type { Unsubscribe } from 'firebase/firestore'
import { computed, ref, toRefs } from 'vue'
import { defineStore } from 'pinia'
import type { CreateRewardInput, RewardsStoreState } from '@/pinia/rewards/types/interface'
import {
  createReward,
  redeemReward,
  subscribeToRewards,
  updateRewardStatus,
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
  const state = ref<RewardsStoreState>({
    currentCoupleId: null,
    errorMessage: '',
    isLoading: false,
    isSubmitting: false,
  })
  let unsubscribeRewards: Unsubscribe | null = null

  const getActiveRewards = computed(() => rewards.value.filter((reward) => reward.isActive))
  const getInactiveRewards = computed(() => rewards.value.filter((reward) => !reward.isActive))

  const clearError = () => {
    state.value.errorMessage = ''
  }

  const stopSync = () => {
    unsubscribeRewards?.()
    unsubscribeRewards = null
  }

  const syncRewards = async (coupleId: string) => {
    if (state.value.currentCoupleId === coupleId && unsubscribeRewards) {
      return
    }

    stopSync()
    clearError()
    state.value.currentCoupleId = coupleId
    state.value.isLoading = true

    unsubscribeRewards = subscribeToRewards(coupleId, (nextRewards) => {
      rewards.value = nextRewards
      state.value.isLoading = false
    })
  }

  const createNewReward = async (input: CreateRewardInput) => {
    state.value.isSubmitting = true
    clearError()

    try {
      await createReward(input)
    } catch (error) {
      state.value.errorMessage = normalizeErrorMessage(error)
      throw error
    } finally {
      state.value.isSubmitting = false
    }
  }

  const redeemExistingReward = async (reward: Reward, actorUid: string) => {
    state.value.isSubmitting = true
    clearError()

    try {
      await redeemReward(reward, actorUid)
    } catch (error) {
      state.value.errorMessage = normalizeErrorMessage(error)
      throw error
    } finally {
      state.value.isSubmitting = false
    }
  }

  const toggleRewardAvailability = async (
    reward: Reward,
    actorUid: string,
    isActive: boolean,
  ) => {
    state.value.isSubmitting = true
    clearError()

    try {
      await updateRewardStatus(reward, actorUid, isActive)
    } catch (error) {
      state.value.errorMessage = normalizeErrorMessage(error)
      throw error
    } finally {
      state.value.isSubmitting = false
    }
  }

  const reset = () => {
    stopSync()
    rewards.value = []
    state.value.currentCoupleId = null
    state.value.errorMessage = ''
    state.value.isLoading = false
    state.value.isSubmitting = false
  }

  return {
    ...toRefs(state.value),
    clearError,
    createNewReward,
    getActiveRewards,
    getInactiveRewards,
    redeemExistingReward,
    reset,
    rewards,
    syncRewards,
    toggleRewardAvailability,
  }
})

export { useRewardsStore }
