<script setup lang="ts">
import { onBeforeUnmount, watch } from "vue";
import { useUserStore } from "@/pinia/user";
import {
  showForegroundPushNotification,
  subscribeToForegroundPushMessages,
  syncCurrentDevicePushToken,
} from "@/services/pushNotificationService";

const userStore = useUserStore();

let stopForegroundPushSync: (() => void) | null = null;

onBeforeUnmount(() => {
  stopForegroundPushSync?.();
  stopForegroundPushSync = null;
});

watch(
  () => ({
    tokensKey: (userStore.profile?.fcmTokens ?? []).join("|"),
    uid: userStore.profile?.uid ?? "",
  }),
  async ({ uid }) => {
    if (!uid) {
      stopForegroundPushSync?.();
      stopForegroundPushSync = null;
      return;
    }

    try {
      await syncCurrentDevicePushToken(uid, userStore.profile?.fcmTokens ?? []);
    } catch (error) {
      console.error("Failed to sync current device push token:", error);
    }

    if (stopForegroundPushSync) {
      return;
    }

    stopForegroundPushSync = await subscribeToForegroundPushMessages(
      (payload) => {
        showForegroundPushNotification(payload);
      },
    );
  },
  { immediate: true },
);
</script>

<template>
  <RouterView />
</template>
