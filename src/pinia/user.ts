import type { User as FirebaseUser } from 'firebase/auth'
import type { Unsubscribe } from 'firebase/firestore'
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { useCoupleStore } from '@/pinia/couple'
import {
  ensureUserProfile,
  subscribeToUserProfile,
  updateUserDisplayName,
} from '@/services/userService'
import type { UserProfile } from '@/views/settings/types/interface'

const normalizeErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message
  }

  return '目前無法處理使用者資料，請稍後再試。'
}

const useUserStore = defineStore('user', () => {
  const profile = ref<UserProfile | null>(null)
  const isLoading = ref(false)
  const isUpdatingProfile = ref(false)
  const errorMessage = ref('')
  let unsubscribeProfile: Unsubscribe | null = null

  const isPaired = computed(() => Boolean(profile.value?.partnerUid))
  const hasCoupleContext = computed(() => Boolean(profile.value?.coupleId))

  const clearError = () => {
    errorMessage.value = ''
  }

  const stopSync = () => {
    unsubscribeProfile?.()
    unsubscribeProfile = null
  }

  const syncProfileForSession = async (authUser: FirebaseUser) => {
    stopSync()
    isLoading.value = true
    clearError()

    try {
      await ensureUserProfile(authUser)

      unsubscribeProfile = subscribeToUserProfile(authUser.uid, (nextProfile) => {
        profile.value = nextProfile
        isLoading.value = false

        const coupleStore = useCoupleStore()

        if (nextProfile?.coupleId) {
          void coupleStore.syncCouple(nextProfile.coupleId)
          return
        }

        coupleStore.reset()
      })
    } catch (error) {
      profile.value = null
      isLoading.value = false
      errorMessage.value = normalizeErrorMessage(error)
      throw error
    }
  }

  const saveDisplayName = async (displayName: string) => {
    const trimmedDisplayName = displayName.trim()

    if (!profile.value) {
      throw new Error('目前沒有可更新的使用者資料。')
    }

    if (!trimmedDisplayName) {
      throw new Error('暱稱不能是空白。')
    }

    isUpdatingProfile.value = true
    clearError()

    try {
      await updateUserDisplayName(profile.value.uid, trimmedDisplayName)
    } catch (error) {
      errorMessage.value = normalizeErrorMessage(error)
      throw error
    } finally {
      isUpdatingProfile.value = false
    }
  }

  const reset = () => {
    stopSync()
    profile.value = null
    isLoading.value = false
    isUpdatingProfile.value = false
    clearError()
    useCoupleStore().reset()
  }

  return {
    clearError,
    errorMessage,
    hasCoupleContext,
    isLoading,
    isPaired,
    isUpdatingProfile,
    profile,
    reset,
    saveDisplayName,
    syncProfileForSession,
  }
})

export { useUserStore }
