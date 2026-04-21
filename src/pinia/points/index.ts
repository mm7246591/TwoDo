import type { Unsubscribe } from 'firebase/firestore'
import { computed, ref, toRefs } from 'vue'
import { defineStore } from 'pinia'
import { subscribeToPointLogs } from '@/services/pointsService'
import type { PointsStoreState } from '@/pinia/points/types/interface'
import type { PointLog } from '@/views/points/types/interface'

const normalizeErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message
  }

  return '積分紀錄同步時發生未預期錯誤，請稍後再試。'
}

const usePointsStore = defineStore('points', () => {
  const pointLogs = ref<PointLog[]>([])
  const state = ref<PointsStoreState>({
    currentCoupleId: null,
    currentUserUid: null,
    errorMessage: '',
    isLoading: false,
  })
  let unsubscribePointLogs: Unsubscribe | null = null

  const getEarnedPoints = computed(() => pointLogs.value.reduce((totalPoints, pointLog) => {
    if (pointLog.points > 0) {
      return totalPoints + pointLog.points
    }

    return totalPoints
  }, 0))

  const clearError = () => {
    state.value.errorMessage = ''
  }

  const stopSync = () => {
    unsubscribePointLogs?.()
    unsubscribePointLogs = null
  }

  const syncPointLogs = async (userUid: string, coupleId: string) => {
    if (
      state.value.currentUserUid === userUid
      && state.value.currentCoupleId === coupleId
      && unsubscribePointLogs
    ) {
      return
    }

    stopSync()
    clearError()
    state.value.currentUserUid = userUid
    state.value.currentCoupleId = coupleId
    state.value.isLoading = true

    try {
      unsubscribePointLogs = subscribeToPointLogs(
        userUid,
        coupleId,
        (nextPointLogs) => {
          clearError()
          pointLogs.value = nextPointLogs
          state.value.isLoading = false
        },
        (error) => {
          pointLogs.value = []
          state.value.isLoading = false
          state.value.errorMessage = normalizeErrorMessage(error)
        },
      )
    } catch (error) {
      state.value.errorMessage = normalizeErrorMessage(error)
      state.value.isLoading = false
      throw error
    }
  }

  const reset = () => {
    stopSync()
    pointLogs.value = []
    state.value.currentUserUid = null
    state.value.currentCoupleId = null
    state.value.errorMessage = ''
    state.value.isLoading = false
  }

  return {
    ...toRefs(state.value),
    clearError,
    getEarnedPoints,
    pointLogs,
    reset,
    syncPointLogs,
  }
})

export { usePointsStore }
