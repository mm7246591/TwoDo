import type { Unsubscribe } from 'firebase/firestore'
import { computed, reactive, ref, toRefs } from 'vue'
import { defineStore } from 'pinia'
import {
  markAllNotificationsAsRead,
  markNotificationAsRead,
  subscribeToNotifications,
} from '@/services/notificationService'
import type { NotificationsStoreState } from '@/pinia/notifications/types/interface'
import type { NotificationItem } from '@/views/notifications/types/interface'

const normalizeErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message
  }

  return '通知流程發生未預期錯誤，請稍後再試。'
}

const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref<NotificationItem[]>([])
  const currentUserUid = ref<string | null>(null)
  const currentCoupleId = ref<string | null>(null)
  const state = reactive<NotificationsStoreState>({
    errorMessage: '',
    isLoading: false,
    isSubmitting: false,
  })
  let unsubscribeNotifications: Unsubscribe | null = null

  const getUnreadCount = computed(() => notifications.value.filter((notification) => !notification.isRead).length)

  const clearError = () => {
    state.errorMessage = ''
  }

  const stopSync = () => {
    unsubscribeNotifications?.()
    unsubscribeNotifications = null
  }

  const syncNotifications = async (userUid: string, coupleId: string) => {
    if (
      currentUserUid.value === userUid
      && currentCoupleId.value === coupleId
      && unsubscribeNotifications
    ) {
      return
    }

    stopSync()
    clearError()
    currentUserUid.value = userUid
    currentCoupleId.value = coupleId
    state.isLoading = true

    unsubscribeNotifications = subscribeToNotifications(userUid, coupleId, (nextNotifications) => {
      notifications.value = nextNotifications
      state.isLoading = false
    })
  }

  const markOneAsRead = async (notificationId: string) => {
    state.isSubmitting = true
    clearError()

    try {
      await markNotificationAsRead(notificationId)
    } catch (error) {
      state.errorMessage = normalizeErrorMessage(error)
      throw error
    } finally {
      state.isSubmitting = false
    }
  }

  const markAllAsRead = async () => {
    if (!currentUserUid.value || !currentCoupleId.value) {
      return
    }

    state.isSubmitting = true
    clearError()

    try {
      await markAllNotificationsAsRead(currentUserUid.value, currentCoupleId.value)
    } catch (error) {
      state.errorMessage = normalizeErrorMessage(error)
      throw error
    } finally {
      state.isSubmitting = false
    }
  }

  const reset = () => {
    stopSync()
    notifications.value = []
    currentUserUid.value = null
    currentCoupleId.value = null
    state.errorMessage = ''
    state.isLoading = false
    state.isSubmitting = false
  }

  return {
    ...toRefs(state),
    clearError,
    currentCoupleId,
    currentUserUid,
    getUnreadCount,
    markAllAsRead,
    markOneAsRead,
    notifications,
    reset,
    syncNotifications,
  }
})

export { useNotificationsStore }
