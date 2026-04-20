import type { Unsubscribe } from 'firebase/firestore'
import { computed, ref, toRefs } from 'vue'
import { defineStore } from 'pinia'
import type { CoupleStoreState } from '@/pinia/couple/types/interface'
import { joinCoupleByInviteCode, subscribeToCouple, unpairCouple } from '@/services/coupleService'
import type { Couple } from '@/views/pairing/types/interface'

const normalizeErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message
  }

  return '配對流程發生未預期錯誤，請稍後再試。'
}

const useCoupleStore = defineStore('couple', () => {
  const currentCouple = ref<Couple | null>(null)
  const state = ref<CoupleStoreState>({
    currentCoupleId: null,
    errorMessage: '',
    isLoading: false,
    isSubmitting: false,
  })
  let unsubscribeCouple: Unsubscribe | null = null

  const getIsPaired = computed(() => currentCouple.value?.status === 'paired')
  const getIsWaitingPartner = computed(() => Boolean(currentCouple.value) && currentCouple.value?.status === 'waiting_partner')

  const clearError = () => {
    state.value.errorMessage = ''
  }

  const stopSync = () => {
    unsubscribeCouple?.()
    unsubscribeCouple = null
  }

  const syncCouple = async (coupleId: string) => {
    if (state.value.currentCoupleId === coupleId && unsubscribeCouple) {
      return
    }

    stopSync()
    clearError()
    state.value.currentCoupleId = coupleId
    state.value.isLoading = true

    unsubscribeCouple = subscribeToCouple(coupleId, (nextCouple) => {
      currentCouple.value = nextCouple
      state.value.isLoading = false
    })
  }

  const joinByInviteCode = async (uid: string, rawInviteCode: string) => {
    state.value.isSubmitting = true
    clearError()

    try {
      const coupleId = await joinCoupleByInviteCode(uid, rawInviteCode)
      await syncCouple(coupleId)
    } catch (error) {
      state.value.errorMessage = normalizeErrorMessage(error)
      throw error
    } finally {
      state.value.isSubmitting = false
    }
  }

  const unpairCurrentCouple = async () => {
    state.value.isSubmitting = true
    clearError()

    try {
      await unpairCouple()
    } catch (error) {
      state.value.errorMessage = normalizeErrorMessage(error)
      throw error
    } finally {
      state.value.isSubmitting = false
    }
  }

  const reset = () => {
    stopSync()
    currentCouple.value = null
    state.value.currentCoupleId = null
    state.value.isLoading = false
    state.value.isSubmitting = false
    clearError()
  }

  return {
    ...toRefs(state.value),
    clearError,
    currentCouple,
    getIsPaired,
    getIsWaitingPartner,
    joinByInviteCode,
    reset,
    syncCouple,
    unpairCurrentCouple,
  }
})

export { useCoupleStore }
