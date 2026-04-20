<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import NotificationListCard from '@/components/notification/NotificationListCard.vue'
import MobileAppShell from '@/components/MobileAppShell.vue'
import { useNotificationsStore } from '@/pinia/notifications'
import { useUserStore } from '@/pinia/user'
import {
  disablePushNotifications,
  enablePushNotifications,
  getPushNotificationStatus,
} from '@/services/pushNotificationService'
import type { NotificationItem } from '@/views/notifications/types/interface'

const router = useRouter()
const userStore = useUserStore()
const notificationsStore = useNotificationsStore()

const pushState = reactive({
  errorMessage: '',
  isCurrentDeviceEnabled: false,
  isLoading: false,
  isSupported: false,
  isSubmitting: false,
  permission: 'unsupported' as NotificationPermission | 'unsupported',
  token: '',
  vapidReady: false,
})

const canUseNotifications = computed(() =>
  Boolean(userStore.profile?.uid && userStore.profile?.coupleId),
)

const pushPermissionLabel = computed(() => {
  if (pushState.permission === 'granted') {
    return '已允許'
  }

  if (pushState.permission === 'denied') {
    return '已封鎖'
  }

  if (pushState.permission === 'default') {
    return '尚未決定'
  }

  return '不支援'
})

const pushStatusLabel = computed(() => {
  if (!pushState.isSupported) {
    return '目前瀏覽器不支援'
  }

  if (!pushState.vapidReady) {
    return '缺少 Web Push 憑證'
  }

  if (pushState.isCurrentDeviceEnabled) {
    return '這台裝置已啟用'
  }

  if (pushState.permission === 'denied') {
    return '需要到瀏覽器設定重新開權限'
  }

  return '尚未啟用'
})

const goHome = async () => {
  await router.push({ name: 'home' })
}

const syncPushStatus = async () => {
  const storedTokens = userStore.profile?.fcmTokens ?? []

  pushState.isLoading = true
  pushState.errorMessage = ''

  try {
    const status = await getPushNotificationStatus(storedTokens)

    pushState.isSupported = status.isSupported
    pushState.isCurrentDeviceEnabled = status.isCurrentDeviceEnabled
    pushState.permission = status.permission
    pushState.token = status.token ?? ''
    pushState.vapidReady = status.hasVapidKey
  } catch (error) {
    pushState.errorMessage = error instanceof Error ? error.message : '推播狀態同步失敗，請稍後再試。'
  } finally {
    pushState.isLoading = false
  }
}

const handleEnablePush = async () => {
  const uid = userStore.profile?.uid

  if (!uid) {
    return
  }

  pushState.isSubmitting = true
  pushState.errorMessage = ''

  try {
    await enablePushNotifications(uid)
    await syncPushStatus()
  } catch (error) {
    pushState.errorMessage = error instanceof Error ? error.message : '開啟推播失敗，請稍後再試。'
  } finally {
    pushState.isSubmitting = false
  }
}

const handleDisablePush = async () => {
  const uid = userStore.profile?.uid

  if (!uid) {
    return
  }

  pushState.isSubmitting = true
  pushState.errorMessage = ''

  try {
    await disablePushNotifications(uid)
    await syncPushStatus()
  } catch (error) {
    pushState.errorMessage = error instanceof Error ? error.message : '關閉推播失敗，請稍後再試。'
  } finally {
    pushState.isSubmitting = false
  }
}

const handleReadNotification = async (notification: NotificationItem) => {
  try {
    await notificationsStore.markOneAsRead(notification.id)
  } catch {
    // The store already exposes a user-facing error message.
  }
}

const handleReadAll = async () => {
  try {
    await notificationsStore.markAllAsRead()
  } catch {
    // The store already exposes a user-facing error message.
  }
}

watch(
  () => ({
    coupleId: userStore.profile?.coupleId ?? '',
    tokensKey: (userStore.profile?.fcmTokens ?? []).join('|'),
    uid: userStore.profile?.uid ?? '',
  }),
  ({ coupleId, uid }) => {
    if (!uid) {
      notificationsStore.reset()
      pushState.errorMessage = ''
      pushState.isCurrentDeviceEnabled = false
      pushState.isLoading = false
      pushState.isSupported = false
      pushState.permission = 'unsupported'
      pushState.token = ''
      pushState.vapidReady = false
      return
    }

    void syncPushStatus()

    if (!coupleId) {
      notificationsStore.reset()
      return
    }

    void notificationsStore.syncNotifications(uid, coupleId)
  },
  { immediate: true },
)
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
            站內通知與推播
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
        這一版除了 `notifications` collection，也把 Web FCM 接上，讓新任務、待確認、已加分與獎勵兌換可以送到這台裝置。
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

      <section v-if="userStore.profile?.uid" class="app-card px-[20px] py-[20px]">
        <div class="flex items-center justify-between gap-[12px]">
          <div>
            <p class="app-label">推播狀態</p>
            <p class="app-text-strong mt-[8px] text-[24px] font-semibold tracking-[-0.04em]">
              {{ pushStatusLabel }}
            </p>
          </div>

          <div class="app-accent-panel px-[12px] py-[8px] text-right">
            <p class="app-kicker">權限</p>
            <p class="app-text-strong mt-[4px] text-[14px] font-semibold">
              {{ pushPermissionLabel }}
            </p>
          </div>
        </div>

        <div class="mt-[20px] grid grid-cols-2 gap-[16px]">
          <article class="app-card-muted px-[16px] py-[16px]">
            <p class="app-label">這台裝置</p>
            <p class="app-text-strong mt-[8px] text-[18px] font-semibold">
              {{ pushState.isCurrentDeviceEnabled ? '已綁定 FCM token' : '尚未綁定' }}
            </p>
          </article>

          <article class="app-card-muted px-[16px] py-[16px]">
            <p class="app-label">Web Push 憑證</p>
            <p class="app-text-strong mt-[8px] text-[18px] font-semibold">
              {{ pushState.vapidReady ? '已設定' : '尚未設定' }}
            </p>
          </article>
        </div>

        <p class="app-text-muted mt-[16px] text-[14px] leading-[24px]">
          開啟後，後端在建立通知時會同步送 FCM 到這台裝置。若你先前封鎖過通知，需到瀏覽器網站設定重新允許。
        </p>

        <div class="mt-[20px] flex flex-wrap gap-[12px]">
          <button
            class="app-secondary-button px-[16px] py-[12px] text-[14px]"
            type="button"
            :disabled="pushState.isSubmitting || pushState.isCurrentDeviceEnabled"
            @click="handleEnablePush"
          >
            {{ pushState.isSubmitting ? '處理中...' : '開啟這台裝置的推播' }}
          </button>

          <button
            class="app-ghost-button px-[16px] py-[12px] text-[14px]"
            type="button"
            :disabled="pushState.isSubmitting || !pushState.isCurrentDeviceEnabled"
            @click="handleDisablePush"
          >
            關閉這台裝置的推播
          </button>
        </div>

        <p
          v-if="pushState.errorMessage"
          class="app-banner-danger app-text-danger mt-[16px] px-[16px] py-[12px] text-[14px]"
        >
          {{ pushState.errorMessage }}
        </p>

        <p
          v-else-if="pushState.isLoading"
          class="app-text-soft mt-[16px] text-[14px] leading-[24px]"
        >
          正在同步這台裝置的推播狀態...
        </p>
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
