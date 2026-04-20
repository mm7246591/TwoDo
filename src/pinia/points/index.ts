import type { Unsubscribe } from 'firebase/firestore'
import { computed, reactive, ref, toRefs } from 'vue'
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
  const currentUserUid = ref<string | null>(null)
  const currentCoupleId = ref<string | null>(null)
  const state = reactive<PointsStoreState>({
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
    state.errorMessage = ''
  }

  const stopSync = () => {
    unsubscribePointLogs?.()
    unsubscribePointLogs = null
  }

  const syncPointLogs = async (userUid: string, coupleId: string) => {
    if (
      currentUserUid.value === userUid
      && currentCoupleId.value === coupleId
      && unsubscribePointLogs
    ) {
      return
    }

    stopSync()
    clearError()
    currentUserUid.value = userUid
    currentCoupleId.value = coupleId
    state.isLoading = true

    try {
      unsubscribePointLogs = subscribeToPointLogs(userUid, coupleId, (nextPointLogs) => {
        pointLogs.value = nextPointLogs
        state.isLoading = false
      })
    } catch (error) {
      state.errorMessage = normalizeErrorMessage(error)
      state.isLoading = false
      throw error
    }
  }

  const reset = () => {
    stopSync()
    pointLogs.value = []
    currentUserUid.value = null
    currentCoupleId.value = null
    state.errorMessage = ''
    state.isLoading = false
  }

  return {
    ...toRefs(state),
    clearError,
    currentCoupleId,
    currentUserUid,
    getEarnedPoints,
    pointLogs,
    reset,
    syncPointLogs,
  }
})

export { usePointsStore }
