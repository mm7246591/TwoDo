import type { User as FirebaseUser } from 'firebase/auth'
import type { Unsubscribe } from 'firebase/firestore'
import { computed, reactive, ref, toRefs } from 'vue'
import { defineStore } from 'pinia'
import { useCoupleStore } from '@/pinia/couple'
import { usePointsStore } from '@/pinia/points'
import { useTasksStore } from '@/pinia/tasks'
import {
  ensureUserProfile,
  subscribeToUserProfile,
  updateUserDisplayName,
} from '@/services/userService'
import type { UserStoreState } from '@/pinia/user/types/interface'
import type { UserProfile } from '@/views/settings/types/interface'

const normalizeErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message
  }

  return '使用者資料同步時發生錯誤，請稍後再試。'
}

const useUserStore = defineStore('user', () => {
  const profile = ref<UserProfile | null>(null)
  const state = reactive<UserStoreState>({
    errorMessage: '',
    isLoading: false,
    isUpdatingProfile: false,
  })
  let unsubscribeProfile: Unsubscribe | null = null

  const getIsPaired = computed(() => Boolean(profile.value?.partnerUid))
  const getHasCoupleContext = computed(() => Boolean(profile.value?.coupleId))

  const clearError = () => {
    state.errorMessage = ''
  }

  const stopSync = () => {
    unsubscribeProfile?.()
    unsubscribeProfile = null
  }

  const syncProfileForSession = async (authUser: FirebaseUser) => {
    stopSync()
    state.isLoading = true
    clearError()

    try {
      await ensureUserProfile(authUser)

      unsubscribeProfile = subscribeToUserProfile(authUser.uid, (nextProfile) => {
        profile.value = nextProfile
        state.isLoading = false

        const coupleStore = useCoupleStore()

        if (nextProfile?.coupleId) {
          void coupleStore.syncCouple(nextProfile.coupleId)
          return
        }

        coupleStore.reset()
      })
    } catch (error) {
      profile.value = null
      state.isLoading = false
      state.errorMessage = normalizeErrorMessage(error)
      throw error
    }
  }

  const saveDisplayName = async (displayName: string) => {
    const trimmedDisplayName = displayName.trim()

    if (!profile.value) {
      throw new Error('目前沒有可更新的使用者資料。')
    }

    if (!trimmedDisplayName) {
      throw new Error('請先輸入暱稱。')
    }

    state.isUpdatingProfile = true
    clearError()

    try {
      await updateUserDisplayName(profile.value.uid, trimmedDisplayName)
    } catch (error) {
      state.errorMessage = normalizeErrorMessage(error)
      throw error
    } finally {
      state.isUpdatingProfile = false
    }
  }

  const reset = () => {
    stopSync()
    profile.value = null
    state.isLoading = false
    state.isUpdatingProfile = false
    clearError()
    useCoupleStore().reset()
    usePointsStore().reset()
    useTasksStore().reset()
  }

  return {
    ...toRefs(state),
    clearError,
    getHasCoupleContext,
    getIsPaired,
    profile,
    reset,
    saveDisplayName,
    syncProfileForSession,
  }
})

export { useUserStore }
