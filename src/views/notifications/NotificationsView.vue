<script setup lang="ts">
import { computed, watch } from "vue";
import { useRouter } from "vue-router";
import NotificationListCard from "@/components/notification/NotificationListCard.vue";
import MobileAppShell from "@/components/MobileAppShell.vue";
import { useNotificationsStore } from "@/pinia/notifications";
import { useUserStore } from "@/pinia/user";
import type { NotificationItem } from "@/views/notifications/types/interface";

const router = useRouter();
const userStore = useUserStore();
const notificationsStore = useNotificationsStore();

const canUseNotifications = computed(() =>
  Boolean(userStore.profile?.uid && userStore.profile?.coupleId),
);

const goHome = async () => {
  await router.push({ name: "home" });
};

const handleReadNotification = async (notification: NotificationItem) => {
  try {
    await notificationsStore.markOneAsRead(notification.id);
  } catch {
    // The store already exposes a user-facing error message.
  }
};

const handleReadAll = async () => {
  try {
    await notificationsStore.markAllAsRead();
  } catch {
    // The store already exposes a user-facing error message.
  }
};

watch(
  () => ({
    coupleId: userStore.profile?.coupleId ?? "",
    uid: userStore.profile?.uid ?? "",
  }),
  ({ coupleId, uid }) => {
    if (!coupleId || !uid) {
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
      class="space-y-[20px] px-[20px] pb-[24px] pt-[32px] sm:px-[28px] sm:pt-[40px]"
    >
      <div class="flex items-start justify-between gap-[12px]">
        <div class="min-w-0">
          <div class="app-chip">Notifications MVP</div>
          <h1
            class="app-text-strong mt-[16px] max-w-[12ch] text-[34px] font-semibold leading-[1.04] tracking-[-0.045em]"
          >
            站內通知
          </h1>
        </div>

        <button
          class="app-ghost-button shrink-0 px-[16px] py-[12px] text-[14px]"
          type="button"
          @click="goHome"
        >
          返回首頁
        </button>
      </div>

      <p class="app-text-muted max-w-[34ch] text-[14px] leading-[24px]">
        這一版先做 `notifications`
        collection，同步顯示新任務、待確認、已加分與獎勵兌換的站內通知。
      </p>
    </header>

    <section class="flex-1 space-y-[16px] px-[20px] pb-[24px] sm:px-[28px]">
      <section v-if="!canUseNotifications" class="app-card px-[20px] py-[20px]">
        <p class="app-label">目前狀態</p>
        <p
          class="app-text-strong mt-[12px] text-[24px] font-semibold tracking-[-0.04em]"
        >
          還不能查看通知
        </p>
        <p class="app-text-muted mt-[12px] text-[14px] leading-[24px]">
          需要先登入並完成配對，通知才會綁到你目前的 `coupleId`。
        </p>
      </section>

      <section v-else class="grid grid-cols-2 gap-[16px]">
        <article class="app-card px-[16px] py-[16px]">
          <p class="app-label">全部通知</p>
          <p class="app-text-strong mt-[8px] text-[30px] font-semibold">
            {{ notificationsStore.notifications.length }}
          </p>
        </article>

        <article class="app-card-muted px-[16px] py-[16px]">
          <p class="app-label">未讀</p>
          <p class="app-text-strong mt-[8px] text-[30px] font-semibold">
            {{ notificationsStore.getUnreadCount }}
          </p>
        </article>
      </section>

      <section class="app-card px-[20px] py-[20px]">
        <div class="flex items-center justify-between gap-[12px]">
          <div>
            <p class="app-label">通知列表</p>
            <p
              class="app-text-strong mt-[8px] text-[24px] font-semibold tracking-[-0.04em]"
            >
              最近動態
            </p>
          </div>

          <div class="flex items-center gap-[12px]">
            <div class="app-accent-panel px-[12px] py-[8px] text-right">
              <p class="app-kicker">同步狀態</p>
              <p class="app-text-strong mt-[4px] text-[14px] font-semibold">
                {{ notificationsStore.isLoading ? "讀取中" : "已同步" }}
              </p>
            </div>

            <button
              class="app-secondary-button px-[16px] py-[12px] text-[14px]"
              type="button"
              :disabled="
                !notificationsStore.getUnreadCount ||
                notificationsStore.isSubmitting
              "
              @click="handleReadAll"
            >
              全部已讀
            </button>
          </div>
        </div>

        <div class="mt-[20px] space-y-[16px]">
          <NotificationListCard
            v-for="notification in notificationsStore.notifications"
            :key="notification.id"
            :is-submitting="notificationsStore.isSubmitting"
            :notification="notification"
            @read="handleReadNotification"
          />

          <p
            v-if="!notificationsStore.notifications.length"
            class="app-text-muted text-[14px] leading-[24px]"
          >
            目前還沒有通知。先建立任務或兌換一個獎勵，這裡就會開始累積動態。
          </p>
        </div>
      </section>

      <p
        v-if="notificationsStore.errorMessage"
        class="app-banner-danger app-text-danger px-[16px] py-[12px] text-[14px]"
      >
        {{ notificationsStore.errorMessage }}
      </p>
    </section>
  </MobileAppShell>
</template>
