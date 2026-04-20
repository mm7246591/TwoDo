import type { User as FirebaseUser } from 'firebase/auth'
import type { Unsubscribe } from 'firebase/firestore'
import { computed, ref, toRefs } from 'vue'
import { defineStore } from 'pinia'
import { useCoupleStore } from '@/pinia/couple'
import { useNotificationsStore } from '@/pinia/notifications'
import { usePointsStore } from '@/pinia/points'
import { useRewardsStore } from '@/pinia/rewards'
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
  const state = ref<UserStoreState>({
    errorMessage: '',
    isLoading: false,
    isUpdatingProfile: false,
  })
  let unsubscribeProfile: Unsubscribe | null = null

  const getIsPaired = computed(() => Boolean(profile.value?.partnerUid))
  const getHasCoupleContext = computed(() => Boolean(profile.value?.coupleId))

  const clearError = () => {
    state.value.errorMessage = ''
  }

  const stopSync = () => {
    unsubscribeProfile?.()
    unsubscribeProfile = null
  }

  const syncProfileForSession = async (authUser: FirebaseUser) => {
    stopSync()
    state.value.isLoading = true
    clearError()

    try {
      await ensureUserProfile(authUser)

      unsubscribeProfile = subscribeToUserProfile(authUser.uid, (nextProfile) => {
        profile.value = nextProfile
        state.value.isLoading = false

        const coupleStore = useCoupleStore()
        const notificationsStore = useNotificationsStore()
        const pointsStore = usePointsStore()
        const rewardsStore = useRewardsStore()
        const tasksStore = useTasksStore()

        if (nextProfile?.coupleId) {
          void coupleStore.syncCouple(nextProfile.coupleId)
          return
        }

        coupleStore.reset()
        notificationsStore.reset()
        pointsStore.reset()
        rewardsStore.reset()
        tasksStore.reset()
      })
    } catch (error) {
      profile.value = null
      state.value.isLoading = false
      state.value.errorMessage = normalizeErrorMessage(error)
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

    state.value.isUpdatingProfile = true
    clearError()

    try {
      await updateUserDisplayName(profile.value.uid, trimmedDisplayName)
    } catch (error) {
      state.value.errorMessage = normalizeErrorMessage(error)
      throw error
    } finally {
      state.value.isUpdatingProfile = false
    }
  }

  const reset = () => {
    stopSync()
    profile.value = null
    state.value.isLoading = false
    state.value.isUpdatingProfile = false
    clearError()
    useCoupleStore().reset()
    useNotificationsStore().reset()
    usePointsStore().reset()
    useRewardsStore().reset()
    useTasksStore().reset()
  }

  return {
    ...toRefs(state.value),
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
