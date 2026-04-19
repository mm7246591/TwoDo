import type { Unsubscribe } from 'firebase/firestore'
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  createCoupleInviteForUser,
  joinCoupleByInviteCode,
  subscribeToCouple,
} from '@/services/coupleService'
import { normalizeInviteCode } from '@/utils/inviteCode'
import type { Couple } from '@/views/pairing/types/interface'

const normalizeErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message
  }

  return '目前無法更新配對資料，請稍後再試。'
}

const useCoupleStore = defineStore('couple', () => {
  const currentCouple = ref<Couple | null>(null)
  const currentCoupleId = ref<string | null>(null)
  const isLoading = ref(false)
  const isSubmitting = ref(false)
  const errorMessage = ref('')
  let unsubscribeCouple: Unsubscribe | null = null

  const inviteCode = computed(() => currentCouple.value?.inviteCode ?? currentCoupleId.value ?? '')
  const isPaired = computed(() => currentCouple.value?.status === 'paired')
  const isWaitingPartner = computed(() => Boolean(currentCouple.value) && currentCouple.value?.status === 'waiting_partner')

  const clearError = () => {
    errorMessage.value = ''
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
    isLoading.value = true

    unsubscribeCouple = subscribeToCouple(coupleId, (nextCouple) => {
      currentCouple.value = nextCouple
      isLoading.value = false
    })
  }

  const createInviteCode = async (uid: string) => {
    isSubmitting.value = true
    clearError()

    try {
      const newInviteCode = await createCoupleInviteForUser(uid)
      await syncCouple(newInviteCode)
    } catch (error) {
      errorMessage.value = normalizeErrorMessage(error)
      throw error
    } finally {
      isSubmitting.value = false
    }
  }

  const joinByInviteCode = async (uid: string, rawInviteCode: string) => {
    isSubmitting.value = true
    clearError()

    try {
      const inviteCodeValue = normalizeInviteCode(rawInviteCode)
      await joinCoupleByInviteCode(uid, inviteCodeValue)
      await syncCouple(inviteCodeValue)
    } catch (error) {
      errorMessage.value = normalizeErrorMessage(error)
      throw error
    } finally {
      isSubmitting.value = false
    }
  }

  const reset = () => {
    stopSync()
    currentCouple.value = null
    currentCoupleId.value = null
    isLoading.value = false
    isSubmitting.value = false
    clearError()
  }

  return {
    clearError,
    currentCouple,
    currentCoupleId,
    errorMessage,
    inviteCode,
    isLoading,
    isPaired,
    isSubmitting,
    isWaitingPartner,
    createInviteCode,
    joinByInviteCode,
    reset,
    syncCouple,
  }
})

export { useCoupleStore }
