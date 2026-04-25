import type { Unsubscribe } from "firebase/firestore";
import { computed, ref, toRefs } from "vue";
import { defineStore } from "pinia";
import {
  markAllNotificationsAsRead,
  markNotificationAsRead,
  subscribeToNotifications,
} from "@/services/notificationService";
import type { NotificationsStoreState } from "@/pinia/notifications/types/interface";
import type { NotificationItem } from "@/views/notification/types/interface";

const normalizeErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message;
  }

  return "通知流程發生未預期錯誤，請稍後再試。";
};

const useNotificationsStore = defineStore("notifications", () => {
  const notifications = ref<NotificationItem[]>([]);
  const state = ref<NotificationsStoreState>({
    currentCoupleId: null,
    currentUserUid: null,
    errorMessage: "",
    isLoading: false,
    isSubmitting: false,
  });
  let unsubscribeNotifications: Unsubscribe | null = null;

  const getUnreadCount = computed(
    () =>
      notifications.value.filter((notification) => !notification.isRead).length,
  );

  const clearError = () => {
    state.value.errorMessage = "";
  };

  const stopSync = () => {
    unsubscribeNotifications?.();
    unsubscribeNotifications = null;
  };

  const syncNotifications = async (userUid: string, coupleId: string) => {
    if (
      state.value.currentUserUid === userUid &&
      state.value.currentCoupleId === coupleId &&
      unsubscribeNotifications
    ) {
      return;
    }

    stopSync();
    clearError();
    state.value.currentUserUid = userUid;
    state.value.currentCoupleId = coupleId;
    state.value.isLoading = true;

    unsubscribeNotifications = subscribeToNotifications(
      userUid,
      coupleId,
      (nextNotifications) => {
        clearError();
        notifications.value = nextNotifications;
        state.value.isLoading = false;
      },
      (error) => {
        notifications.value = [];
        state.value.isLoading = false;
        state.value.errorMessage = normalizeErrorMessage(error);
      },
    );
  };

  const markOneAsRead = async (notificationId: string) => {
    state.value.isSubmitting = true;
    clearError();

    try {
      await markNotificationAsRead(notificationId);
    } catch (error) {
      state.value.errorMessage = normalizeErrorMessage(error);
      throw error;
    } finally {
      state.value.isSubmitting = false;
    }
  };

  const markAllAsRead = async () => {
    if (!state.value.currentUserUid || !state.value.currentCoupleId) {
      return;
    }

    state.value.isSubmitting = true;
    clearError();

    try {
      await markAllNotificationsAsRead(
        state.value.currentUserUid,
        state.value.currentCoupleId,
      );
    } catch (error) {
      state.value.errorMessage = normalizeErrorMessage(error);
      throw error;
    } finally {
      state.value.isSubmitting = false;
    }
  };

  const reset = () => {
    stopSync();
    notifications.value = [];
    state.value.currentUserUid = null;
    state.value.currentCoupleId = null;
    state.value.errorMessage = "";
    state.value.isLoading = false;
    state.value.isSubmitting = false;
  };

  return {
    ...toRefs(state.value),
    clearError,
    getUnreadCount,
    markAllAsRead,
    markOneAsRead,
    notifications,
    reset,
    syncNotifications,
  };
});

export { useNotificationsStore };
