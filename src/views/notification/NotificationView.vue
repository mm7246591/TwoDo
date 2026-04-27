<script setup lang="ts">
import { computed, ref, watch } from "vue";
import AppEmptyState from "@/components/common/AppEmptyState.vue";
import NotificationListCard from "@/components/notification/NotificationListCard.vue";
import MobileAppShell from "@/components/common/MobileAppShell.vue";
import { useErrorToast } from "@/composables/useErrorToast";
import { useNotificationsStore } from "@/pinia/notifications";
import { useUserStore } from "@/pinia/user";
import {
  disablePushNotifications,
  enablePushNotifications,
  getPushNotificationStatus,
} from "@/services/pushNotificationService";
import { withGlobalLoading } from "@/services/globalLoading";
import { showSuccessMessage } from "@/services/uiFeedback";
import type { NotificationItem } from "@/views/notification/types/interface";

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
    const status = await withGlobalLoading(() =>
      getPushNotificationStatus(storedTokens),
    );

    pushState.value.isSupported = status.isSupported;
    pushState.value.isCurrentDeviceEnabled = status.isCurrentDeviceEnabled;
    pushState.value.permission = status.permission;
    pushState.value.token = status.token ?? "";
    pushState.value.vapidReady = status.hasVapidKey;
  } catch (error) {
    pushState.value.errorMessage =
      error instanceof Error ? error.message : "讀取推播狀態失敗，請稍後再試";
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
    await withGlobalLoading(() => enablePushNotifications(uid));
    await syncPushStatus();
  } catch (error) {
    pushState.value.errorMessage =
      error instanceof Error ? error.message : "啟用推播失敗，請稍後再試";
    return;
  } finally {
    pushState.value.isSubmitting = false;
  }

  showSuccessMessage("這台裝置已啟用推播");
};

const handleDisablePush = async () => {
  const uid = userStore.profile?.uid;

  if (!uid) {
    return;
  }

  pushState.value.isSubmitting = true;
  pushState.value.errorMessage = "";

  try {
    await withGlobalLoading(() => disablePushNotifications(uid));
    await syncPushStatus();
  } catch (error) {
    pushState.value.errorMessage =
      error instanceof Error ? error.message : "停用推播失敗，請稍後再試";
    return;
  } finally {
    pushState.value.isSubmitting = false;
  }

  showSuccessMessage("這台裝置已停用推播");
};

const handleReadNotification = async (notification: NotificationItem) => {
  try {
    await notificationsStore.markOneAsRead(notification.id);
  } catch { }
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
    <header
      class="grid gap-[20px] px-[20px] pb-[24px] pt-[32px] sm:px-[28px] sm:pt-[40px]">
      <div class="flex items-start justify-between gap-[12px]">
        <div class="min-w-[0px]">
          <div
            class="inline-flex items-center gap-[8px] rounded-full border border-[var(--app-chip-border)] bg-[var(--app-chip-bg)] px-[12px] py-[8px] text-[13px] font-[700] leading-[1.2] tracking-[0.045em] text-[var(--app-chip-text)] shadow-[var(--app-shadow-chip)] backdrop-blur-[12px]">
            通知</div>
          <h1
            class="text-[32px] font-[700] leading-[1.04] tracking-[-0.03em] text-[var(--app-text-strong)] mt-[12px] max-w-[11ch]">
            提醒設定</h1>
        </div>
      </div>

      <p class="max-w-[34ch] text-[16px] leading-[1.65] text-[var(--app-text-muted)]">
        查看你們的提醒，設定這台裝置的推播。</p>
    </header>

    <section
      class="px-[20px] pb-[24px] sm:px-[28px] grid gap-[16px] flex-1">
      <section v-if="!canUseNotifications"
        class="rounded-[var(--app-radius-xl)] border border-[var(--app-border)] bg-[var(--app-surface)] shadow-[var(--app-shadow-card)] backdrop-blur-[14px] p-[20px]">
        <p
          class="text-[13px] font-[700] leading-[1.28] tracking-[0.03em] text-[var(--app-text-soft)]">
          目前狀態</p>
        <p
          class="text-[20px] font-[700] leading-[1.24] tracking-[-0.02em] text-[var(--app-text-strong)] mt-[12px]">
          還沒有提醒
        </p>
        <p class="text-[15px] leading-[1.58] text-[var(--app-text-soft)] mt-[12px]">
          完成配對後，待辦與獎勵提醒會開始同步。
        </p>
      </section>

      <section v-else class="grid grid-cols-2 gap-[16px]">
        <article
          class="rounded-[var(--app-radius-xl)] border border-[var(--app-border)] bg-[var(--app-surface)] shadow-[var(--app-shadow-card)] backdrop-blur-[14px] p-[16px]">
          <p
            class="text-[13px] font-[700] leading-[1.28] tracking-[0.03em] text-[var(--app-text-soft)]">
            全部提醒</p>
          <p
            class="text-[28px] font-[700] leading-[1.02] tracking-[-0.03em] text-[var(--app-text-strong)] [font-variant-numeric:tabular-nums] mt-[8px]">
            {{ notificationsStore.notifications.length }}
          </p>
        </article>

        <article
          class="rounded-[var(--app-radius-xl)] border border-[var(--app-card-muted-border)] bg-[image:var(--app-card-muted-bg)] backdrop-blur-[10px] p-[16px]">
          <p
            class="text-[13px] font-[700] leading-[1.28] tracking-[0.03em] text-[var(--app-text-soft)]">
            未讀</p>
          <p
            class="text-[28px] font-[700] leading-[1.02] tracking-[-0.03em] text-[var(--app-text-strong)] [font-variant-numeric:tabular-nums] mt-[8px]">
            {{ notificationsStore.getUnreadCount }}
          </p>
        </article>
      </section>

      <section v-if="userStore.profile?.uid"
        class="rounded-[var(--app-radius-xl)] border border-[var(--app-border)] bg-[var(--app-surface)] shadow-[var(--app-shadow-card)] backdrop-blur-[14px] p-[20px]">
        <div class="flex flex-col gap-[16px] sm:flex-row sm:items-start sm:justify-between">
          <div class="min-w-[0px]">
            <p
              class="text-[13px] font-[700] leading-[1.28] tracking-[0.03em] text-[var(--app-text-soft)]">
              推播狀態</p>
            <p
              class="text-[18px] font-[700] leading-[1.3] tracking-[-0.01em] text-[var(--app-text-strong)] mt-[8px]">
              {{ pushStatusLabel }}</p>
            <p class="text-[15px] leading-[1.58] text-[var(--app-text-soft)] mt-[8px]">
              瀏覽器權限：{{ pushPermissionLabel }}
            </p>
          </div>

          <span :class="[
            'inline-flex min-h-[2rem] items-center gap-[4px] rounded-full border border-[var(--app-border)] bg-[rgba(255,255,255,0.78)] px-[12px] py-[8px] text-[13px] font-[600] leading-[1.2] text-[var(--app-text-muted)]',
            pushState.isCurrentDeviceEnabled
              ? 'border-transparent bg-[var(--app-success-soft)] text-[var(--app-success-text)]'
              : 'text-[var(--app-text-strong)]',
          ]">
            {{ pushState.isCurrentDeviceEnabled ? "已啟用" : "未啟用" }}
          </span>
        </div>

        <div class="grid gap-[16px] sm:grid-cols-2 mt-[20px]">
          <article
            class="rounded-[var(--app-radius-xl)] border border-[var(--app-card-muted-border)] bg-[image:var(--app-card-muted-bg)] backdrop-blur-[10px] p-[16px]">
            <p
              class="text-[13px] font-[700] leading-[1.28] tracking-[0.03em] text-[var(--app-text-soft)]">
              這台裝置</p>
            <p class="text-[16px] font-[700] leading-[1.4] text-[var(--app-text-strong)] mt-[8px]">
              {{
                pushState.isCurrentDeviceEnabled ? "已在這台裝置啟用" : "尚未在這台裝置啟用"
              }}
            </p>
          </article>

          <article
            class="rounded-[var(--app-radius-xl)] border border-[var(--app-card-muted-border)] bg-[image:var(--app-card-muted-bg)] backdrop-blur-[10px] p-[16px]">
            <p
              class="text-[13px] font-[700] leading-[1.28] tracking-[0.03em] text-[var(--app-text-soft)]">
              推播憑證</p>
            <p class="text-[16px] font-[700] leading-[1.4] text-[var(--app-text-strong)] mt-[8px]">
              {{ pushState.vapidReady ? "已設定" : "尚未設定" }}
            </p>
          </article>
        </div>

        <p class="text-[15px] leading-[1.58] text-[var(--app-text-soft)] mt-[16px]">
          開啟後，待辦與獎勵提醒會透過這台裝置通知你。
        </p>

        <div class="flex flex-wrap gap-[12px] mt-[20px]">
          <button
            class="inline-flex items-center justify-center gap-[8px] rounded-full border border-[var(--app-button-secondary-border)] bg-[var(--app-button-secondary-bg)] px-[16px] py-[12px] text-[15px] font-[700] text-[var(--app-text)] shadow-[var(--app-shadow-chip)] transition-[transform,box-shadow,background-color,border-color,color] duration-[180ms] hover:enabled:-translate-y-[1px] focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--app-input-focus-ring),var(--app-shadow-chip)] disabled:cursor-not-allowed disabled:shadow-none disabled:opacity-55"
            type="button" :disabled="pushState.isSubmitting || pushState.isCurrentDeviceEnabled
              " @click="handleEnablePush">
            {{ pushState.isSubmitting ? "啟用中..." : "開啟推播" }}
          </button>

          <button
            class="inline-flex items-center justify-center gap-[8px] rounded-full border border-[var(--app-button-ghost-border)] bg-[var(--app-button-ghost-bg)] px-[16px] py-[12px] text-[15px] font-[700] text-[var(--app-button-ghost-text)] transition-[transform,box-shadow,background-color,border-color,color] duration-[180ms] hover:enabled:-translate-y-[1px] focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--app-input-focus-ring),var(--app-shadow-chip)] disabled:cursor-not-allowed disabled:shadow-none disabled:opacity-55"
            type="button" :disabled="pushState.isSubmitting || !pushState.isCurrentDeviceEnabled
              " @click="handleDisablePush">
            關閉推播
          </button>
        </div>

        <p v-if="pushState.isLoading"
          class="text-[15px] leading-[1.58] text-[var(--app-text-soft)] mt-[16px]">
          正在讀取推播狀態...
        </p>
      </section>

      <section
        class="rounded-[var(--app-radius-xl)] border border-[var(--app-border)] bg-[var(--app-surface)] shadow-[var(--app-shadow-card)] backdrop-blur-[14px] p-[20px]">
        <div class="flex items-start justify-between gap-[12px]">
          <div class="min-w-[0px]">
            <div>
              <p
                class="text-[18px] font-[700] leading-[1.3] tracking-[-0.01em] text-[var(--app-text-strong)]">
                通知列表</p>
              <p class="text-[15px] leading-[1.58] text-[var(--app-text-soft)] mt-[8px]">
                未讀提醒會優先顯示在這裡。</p>
            </div>
          </div>

          <button
            class="inline-flex min-h-[40px] shrink-0 items-center justify-center gap-[8px] rounded-full border border-[var(--app-button-secondary-border)] bg-[var(--app-button-secondary-bg)] px-[12px] py-[8px] text-[13px] font-[700] leading-[1.1] text-[var(--app-text)] shadow-[var(--app-shadow-chip)] transition-[transform,box-shadow,background-color,border-color,color] duration-[180ms] hover:enabled:-translate-y-[1px] focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--app-input-focus-ring),var(--app-shadow-chip)] disabled:cursor-not-allowed disabled:shadow-none disabled:opacity-55"
            type="button" :disabled="!notificationsStore.getUnreadCount ||
              notificationsStore.isSubmitting
              " @click="handleReadAll">
            全部標為已讀
          </button>
        </div>

        <div class="grid gap-[16px] mt-[20px]">
          <NotificationListCard v-for="notification in notificationsStore.notifications" :key="notification.id"
            :is-submitting="notificationsStore.isSubmitting" :notification="notification"
            @read="handleReadNotification" />

          <AppEmptyState v-if="!notificationsStore.notifications.length" title="目前沒有通知"
            description="新的任務與系統提醒會顯示在這裡。" />
        </div>
      </section>
    </section>
  </MobileAppShell>
</template>
