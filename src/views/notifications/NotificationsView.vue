<script setup lang="ts">
import { computed, ref, watch } from "vue";
import AppEmptyState from "@/components/common/AppEmptyState.vue";
import NotificationListCard from "@/components/notification/NotificationListCard.vue";
import MobileAppShell from "@/components/MobileAppShell.vue";
import { useErrorToast } from "@/composables/useErrorToast";
import { useNotificationsStore } from "@/pinia/notifications";
import { useUserStore } from "@/pinia/user";
import {
  disablePushNotifications,
  enablePushNotifications,
  getPushNotificationStatus,
} from "@/services/pushNotificationService";
import { showSuccessMessage } from "@/services/uiFeedback";
import type { NotificationItem } from "@/views/notifications/types/interface";

const userStore = useUserStore();
const notificationsStore = useNotificationsStore();

const pushState = ref({
  errorMessage: "",
  isCurrentDeviceEnabled: false,
  isLoading: false,
  isSupported: false,
  isSubmitting: false,
  permission: "unsupported" as NotificationPermission | "unsupported",
  token: "",
  vapidReady: false,
});

const canUseNotifications = computed(() =>
  Boolean(userStore.profile?.uid && userStore.profile?.coupleId),
);

useErrorToast(() => notificationsStore.errorMessage);
useErrorToast(() => pushState.value.errorMessage);

const pushPermissionLabel = computed(() => {
  if (pushState.value.permission === "granted") {
    return "已允許通知";
  }

  if (pushState.value.permission === "denied") {
    return "已封鎖通知";
  }

  if (pushState.value.permission === "default") {
    return "尚未選擇";
  }

  return "不支援";
});

const pushStatusLabel = computed(() => {
  if (!pushState.value.isSupported) {
    return "目前瀏覽器不支援";
  }

  if (!pushState.value.vapidReady) {
    return "缺少推播憑證";
  }

  if (pushState.value.isCurrentDeviceEnabled) {
    return "這台裝置已啟用";
  }

  if (pushState.value.permission === "denied") {
    return "瀏覽器已封鎖";
  }

  return "這台裝置尚未啟用";
});

const syncPushStatus = async () => {
  const storedTokens = userStore.profile?.fcmTokens ?? [];

  pushState.value.isLoading = true;
  pushState.value.errorMessage = "";

  try {
    const status = await getPushNotificationStatus(storedTokens);

    pushState.value.isSupported = status.isSupported;
    pushState.value.isCurrentDeviceEnabled = status.isCurrentDeviceEnabled;
    pushState.value.permission = status.permission;
    pushState.value.token = status.token ?? "";
    pushState.value.vapidReady = status.hasVapidKey;
  } catch (error) {
    pushState.value.errorMessage =
      error instanceof Error ? error.message : "推播狀態同步失敗，請稍後再試。";
  } finally {
    pushState.value.isLoading = false;
  }
};

const handleEnablePush = async () => {
  const uid = userStore.profile?.uid;

  if (!uid) {
    return;
  }

  pushState.value.isSubmitting = true;
  pushState.value.errorMessage = "";

  try {
    await enablePushNotifications(uid);
    await syncPushStatus();
  } catch (error) {
    pushState.value.errorMessage =
      error instanceof Error ? error.message : "開啟推播失敗，請稍後再試。";
    return;
  } finally {
    pushState.value.isSubmitting = false;
  }

  showSuccessMessage("這台裝置已開啟推播");
};

const handleDisablePush = async () => {
  const uid = userStore.profile?.uid;

  if (!uid) {
    return;
  }

  pushState.value.isSubmitting = true;
  pushState.value.errorMessage = "";

  try {
    await disablePushNotifications(uid);
    await syncPushStatus();
  } catch (error) {
    pushState.value.errorMessage =
      error instanceof Error ? error.message : "關閉推播失敗，請稍後再試。";
    return;
  } finally {
    pushState.value.isSubmitting = false;
  }

  showSuccessMessage("這台裝置已關閉推播");
};

const handleReadNotification = async (notification: NotificationItem) => {
  try {
    await notificationsStore.markOneAsRead(notification.id);
  } catch {}
};

const handleReadAll = async () => {
  try {
    await notificationsStore.markAllAsRead();
  } catch {
    return;
  }

  showSuccessMessage("提醒已全部標為已讀");
};

watch(
  () => ({
    coupleId: userStore.profile?.coupleId ?? "",
    tokensKey: (userStore.profile?.fcmTokens ?? []).join("|"),
    uid: userStore.profile?.uid ?? "",
  }),
  ({ coupleId, uid }) => {
    if (!uid) {
      notificationsStore.reset();
      pushState.value.errorMessage = "";
      pushState.value.isCurrentDeviceEnabled = false;
      pushState.value.isLoading = false;
      pushState.value.isSupported = false;
      pushState.value.permission = "unsupported";
      pushState.value.token = "";
      pushState.value.vapidReady = false;
      return;
    }

    void syncPushStatus();

    if (!coupleId) {
      notificationsStore.reset();
      return;
    }

    void notificationsStore.syncNotifications(uid, coupleId);
  },
  { immediate: true },
);
</script>

<template>
  <MobileAppShell>
    <header class="app-page-header">
      <div class="app-page-header-row">
        <div class="min-w-[0px]">
          <div class="app-chip">通知</div>
          <h1 class="app-page-title mt-[12px] max-w-[11ch]">提醒設定</h1>
        </div>
      </div>

      <p class="app-page-summary">查看你們的提醒，設定這台裝置的推播。</p>
    </header>

    <section class="app-page-content app-section-stack flex-1">
      <section v-if="!canUseNotifications" class="app-card app-card-section">
        <p class="app-label">目前狀態</p>
        <p class="app-status-title mt-[12px]">
          還沒有提醒
        </p>
        <p class="app-card-caption mt-[12px]">
          完成配對後，待辦與獎勵提醒會開始同步。
        </p>
      </section>

      <section v-else class="app-metric-grid">
        <article class="app-card app-card-section-sm">
          <p class="app-label">全部提醒</p>
          <p class="app-metric-value mt-[8px]">
            {{ notificationsStore.notifications.length }}
          </p>
        </article>

        <article class="app-card-muted app-card-section-sm">
          <p class="app-label">未讀</p>
          <p class="app-metric-value mt-[8px]">
            {{ notificationsStore.getUnreadCount }}
          </p>
        </article>
      </section>

      <section
        v-if="userStore.profile?.uid"
        class="app-card app-card-section"
      >
        <div class="app-card-header-split">
          <div class="min-w-[0px]">
            <p class="app-label">推播狀態</p>
            <p class="app-card-title mt-[8px]">{{ pushStatusLabel }}</p>
            <p class="app-card-caption mt-[8px]">
              瀏覽器權限：{{ pushPermissionLabel }}
            </p>
          </div>

          <span
            :class="[
              'app-meta-pill',
              pushState.isCurrentDeviceEnabled
                ? 'app-meta-pill-success'
                : 'app-meta-pill-strong',
            ]"
          >
            {{ pushState.isCurrentDeviceEnabled ? "本機已啟用" : "本機未啟用" }}
          </span>
        </div>

        <div class="app-form-grid-2 mt-[20px]">
          <article class="app-card-muted app-card-section-sm">
            <p class="app-label">這台裝置</p>
            <p class="app-inline-title mt-[8px]">
              {{
                pushState.isCurrentDeviceEnabled ? "已接收推播" : "尚未接收推播"
              }}
            </p>
          </article>

          <article class="app-card-muted app-card-section-sm">
            <p class="app-label">推播憑證</p>
            <p class="app-inline-title mt-[8px]">
              {{ pushState.vapidReady ? "已設定" : "尚未設定" }}
            </p>
          </article>
        </div>

        <p class="app-card-caption mt-[16px]">
          開啟後會收到待辦與獎勵提醒。
        </p>

        <div class="app-actions-row mt-[20px]">
          <button
            class="app-secondary-button px-[16px] py-[12px]"
            type="button"
            :disabled="
              pushState.isSubmitting || pushState.isCurrentDeviceEnabled
            "
            @click="handleEnablePush"
          >
            {{ pushState.isSubmitting ? "處理中..." : "開啟推播" }}
          </button>

          <button
            class="app-ghost-button px-[16px] py-[12px]"
            type="button"
            :disabled="
              pushState.isSubmitting || !pushState.isCurrentDeviceEnabled
            "
            @click="handleDisablePush"
          >
            關閉推播
          </button>
        </div>

        <p v-if="pushState.isLoading" class="app-card-caption mt-[16px]">
          同步推播狀態...
        </p>
      </section>

      <section class="app-card app-card-section">
        <div class="app-page-header-row">
          <div class="min-w-[0px]">
            <div>
              <p class="app-card-title">最新提醒</p>
              <p class="app-card-caption mt-[8px]">未讀提醒會保留標記。</p>
            </div>
          </div>

          <button
            class="app-secondary-button app-button-compact min-h-[44px] shrink-0 px-[12px] py-[8px]"
            type="button"
            :disabled="
              !notificationsStore.getUnreadCount ||
              notificationsStore.isSubmitting
            "
            @click="handleReadAll"
          >
            全部標為已讀
          </button>
        </div>

        <div class="app-card-list mt-[20px]">
          <NotificationListCard
            v-for="notification in notificationsStore.notifications"
            :key="notification.id"
            :is-submitting="notificationsStore.isSubmitting"
            :notification="notification"
            @read="handleReadNotification"
          />

          <AppEmptyState
            v-if="!notificationsStore.notifications.length"
            title="目前沒有通知"
            description="待辦與獎勵提醒會顯示在清單中。"
          />
        </div>
      </section>
    </section>
  </MobileAppShell>
</template>
