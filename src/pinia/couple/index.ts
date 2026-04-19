import type { Unsubscribe } from 'firebase/firestore'
import { computed, reactive, ref, toRefs } from 'vue'
import { defineStore } from 'pinia'
import {
  createCoupleInviteForUser,
  joinCoupleByInviteCode,
  subscribeToCouple,
} from '@/services/coupleService'
import { normalizeInviteCode } from '@/utils/inviteCode'
import type { Couple } from '@/views/pairing/types/interface'
import type { CoupleStoreState } from '@/pinia/couple/types/interface'

const normalizeErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message
  }

  return '配對流程發生未預期錯誤，請稍後再試。'
}

const useCoupleStore = defineStore('couple', () => {
  const currentCouple = ref<Couple | null>(null)
  const currentCoupleId = ref<string | null>(null)
  const state = reactive<CoupleStoreState>({
    errorMessage: '',
    isLoading: false,
    isSubmitting: false,
  })
  let unsubscribeCouple: Unsubscribe | null = null

  const inviteCode = computed(() => currentCouple.value?.inviteCode ?? currentCoupleId.value ?? '')
  const isPaired = computed(() => currentCouple.value?.status === 'paired')
  const isWaitingPartner = computed(() => Boolean(currentCouple.value) && currentCouple.value?.status === 'waiting_partner')

  const clearError = () => {
    state.errorMessage = ''
  }

  const stopSync = () => {
    unsubscribeCouple?.()
    unsubscribeCouple = null
  }

  const syncCouple = async (coupleId: string) => {
    if (currentCoupleId.value === coupleId && unsubscribeCouple) {
      return
    }

    stopSync()
    clearError()
    currentCoupleId.value = coupleId
    state.isLoading = true

    unsubscribeCouple = subscribeToCouple(coupleId, (nextCouple) => {
      currentCouple.value = nextCouple
      state.isLoading = false
    })
  }

  const createInviteCode = async (uid: string) => {
    state.isSubmitting = true
    clearError()

    try {
      const newInviteCode = await createCoupleInviteForUser(uid)
      await syncCouple(newInviteCode)
    } catch (error) {
      state.errorMessage = normalizeErrorMessage(error)
      throw error
    } finally {
      state.isSubmitting = false
    }
  }

  const joinByInviteCode = async (uid: string, rawInviteCode: string) => {
    state.isSubmitting = true
    clearError()

    try {
      const inviteCodeValue = normalizeInviteCode(rawInviteCode)
      await joinCoupleByInviteCode(uid, inviteCodeValue)
      await syncCouple(inviteCodeValue)
    } catch (error) {
      state.errorMessage = normalizeErrorMessage(error)
      throw error
    } finally {
      state.isSubmitting = false
    }
  }

  const reset = () => {
    stopSync()
    currentCouple.value = null
    currentCoupleId.value = null
    state.isLoading = false
    state.isSubmitting = false
    clearError()
  }

  return {
    ...toRefs(state),
    clearError,
    createInviteCode,
    currentCouple,
    currentCoupleId,
    inviteCode,
    isPaired,
    isWaitingPartner,
    joinByInviteCode,
    reset,
    syncCouple,
  }
})

export { useCoupleStore }
