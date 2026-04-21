<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AppEmptyState from '@/components/common/AppEmptyState.vue'
import NotificationListCard from '@/components/notification/NotificationListCard.vue'
import MobileAppShell from '@/components/MobileAppShell.vue'
import { useErrorToast } from '@/composables/useErrorToast'
import { useNotificationsStore } from '@/pinia/notifications'
import { useUserStore } from '@/pinia/user'
import {
  disablePushNotifications,
  enablePushNotifications,
  getPushNotificationStatus,
} from '@/services/pushNotificationService'
import { showSuccessMessage } from '@/services/uiFeedback'
import type { NotificationItem } from '@/views/notifications/types/interface'

const userStore = useUserStore()
const notificationsStore = useNotificationsStore()

const pushState = ref({
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

useErrorToast(() => notificationsStore.errorMessage)
useErrorToast(() => pushState.value.errorMessage)

const pushPermissionLabel = computed(() => {
  if (pushState.value.permission === 'granted') {
    return '已允許'
  }

  if (pushState.value.permission === 'denied') {
    return '已封鎖'
  }

  if (pushState.value.permission === 'default') {
    return '尚未決定'
  }

  return '不支援'
})

const pushStatusLabel = computed(() => {
  if (!pushState.value.isSupported) {
    return '目前瀏覽器不支援'
  }

  if (!pushState.value.vapidReady) {
    return '缺少推播憑證'
  }

  if (pushState.value.isCurrentDeviceEnabled) {
    return '這台裝置已啟用'
  }

  if (pushState.value.permission === 'denied') {
    return '瀏覽器已封鎖'
  }

  return '尚未啟用'
})

const syncPushStatus = async () => {
  const storedTokens = userStore.profile?.fcmTokens ?? []

  pushState.value.isLoading = true
  pushState.value.errorMessage = ''

  try {
    const status = await getPushNotificationStatus(storedTokens)

    pushState.value.isSupported = status.isSupported
    pushState.value.isCurrentDeviceEnabled = status.isCurrentDeviceEnabled
    pushState.value.permission = status.permission
    pushState.value.token = status.token ?? ''
    pushState.value.vapidReady = status.hasVapidKey
  } catch (error) {
    pushState.value.errorMessage = error instanceof Error ? error.message : '推播狀態同步失敗，請稍後再試。'
  } finally {
    pushState.value.isLoading = false
  }
}

const handleEnablePush = async () => {
  const uid = userStore.profile?.uid

  if (!uid) {
    return
  }

  pushState.value.isSubmitting = true
  pushState.value.errorMessage = ''

  try {
    await enablePushNotifications(uid)
    await syncPushStatus()
  } catch (error) {
    pushState.value.errorMessage = error instanceof Error ? error.message : '開啟推播失敗，請稍後再試。'
    return
  } finally {
    pushState.value.isSubmitting = false
  }

  showSuccessMessage('這台裝置已開啟推播')
}

const handleDisablePush = async () => {
  const uid = userStore.profile?.uid

  if (!uid) {
    return
  }

  pushState.value.isSubmitting = true
  pushState.value.errorMessage = ''

  try {
    await disablePushNotifications(uid)
    await syncPushStatus()
  } catch (error) {
    pushState.value.errorMessage = error instanceof Error ? error.message : '關閉推播失敗，請稍後再試。'
    return
  } finally {
    pushState.value.isSubmitting = false
  }

  showSuccessMessage('這台裝置已關閉推播')
}

const handleReadNotification = async (notification: NotificationItem) => {
  try {
    await notificationsStore.markOneAsRead(notification.id)
  } catch {}
}

const handleReadAll = async () => {
  try {
    await notificationsStore.markAllAsRead()
  } catch {
    return
  }

  showSuccessMessage('通知已全部標記為已讀')
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
      pushState.value.errorMessage = ''
      pushState.value.isCurrentDeviceEnabled = false
      pushState.value.isLoading = false
      pushState.value.isSupported = false
      pushState.value.permission = 'unsupported'
      pushState.value.token = ''
      pushState.value.vapidReady = false
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
          <div class="app-chip">通知中心</div>
          <h1 class="app-page-title mt-[14px] max-w-[11ch]">
            通知與提醒
          </h1>
        </div>
      </div>

      <p class="app-page-summary">任務提醒、已讀狀態和推播設定都集中在這裡。</p>
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
          完成配對後開始同步通知。
        </p>
      </section>

      <section v-else class="grid grid-cols-2 gap-[16px]">
        <article class="app-card px-[16px] py-[16px]">
          <p class="app-label">全部通知</p>
          <p class="app-metric-value mt-[8px]">
            {{ notificationsStore.notifications.length }}
          </p>
        </article>

        <article class="app-card-muted px-[16px] py-[16px]">
          <p class="app-label">未讀</p>
          <p class="app-metric-value mt-[8px]">
            {{ notificationsStore.getUnreadCount }}
          </p>
        </article>
      </section>

      <section v-if="userStore.profile?.uid" class="app-card px-[20px] py-[20px]">
        <div class="flex flex-col gap-[14px] sm:flex-row sm:items-start sm:justify-between">
          <div class="min-w-0">
            <p class="app-label">推播狀態</p>
            <p class="app-card-title mt-[8px]">{{ pushStatusLabel }}</p>
            <p class="app-card-caption mt-[8px]">權限：{{ pushPermissionLabel }}</p>
          </div>

          <span
            :class="[
              'app-meta-pill',
              pushState.isCurrentDeviceEnabled ? 'app-meta-pill-success' : 'app-meta-pill-strong',
            ]"
          >
            {{ pushState.isCurrentDeviceEnabled ? '這台裝置已開啟' : '這台裝置尚未開啟' }}
          </span>
        </div>

        <div class="mt-[20px] grid gap-[16px] sm:grid-cols-2">
          <article class="app-card-muted px-[16px] py-[16px]">
            <p class="app-label">這台裝置</p>
            <p class="app-text-strong mt-[8px] text-[18px] font-semibold">
              {{ pushState.isCurrentDeviceEnabled ? '已開啟推播' : '尚未開啟' }}
            </p>
          </article>

          <article class="app-card-muted px-[16px] py-[16px]">
            <p class="app-label">推播憑證</p>
            <p class="app-text-strong mt-[8px] text-[18px] font-semibold">
              {{ pushState.vapidReady ? '已設定' : '尚未設定' }}
            </p>
          </article>
        </div>

        <p class="app-text-muted mt-[16px] text-[14px] leading-[24px]">
          開啟後提醒會傳到這台裝置。
        </p>

        <div class="mt-[20px] flex flex-wrap gap-[12px]">
          <button
            class="app-secondary-button px-[16px] py-[12px] text-[14px]"
            type="button"
            :disabled="pushState.isSubmitting || pushState.isCurrentDeviceEnabled"
            @click="handleEnablePush"
          >
            {{ pushState.isSubmitting ? '處理中...' : '開啟推播' }}
          </button>

          <button
            class="app-ghost-button px-[16px] py-[12px] text-[14px]"
            type="button"
            :disabled="pushState.isSubmitting || !pushState.isCurrentDeviceEnabled"
            @click="handleDisablePush"
          >
            關閉推播
          </button>
        </div>

        <p
          v-if="pushState.isLoading"
          class="app-text-soft mt-[16px] text-[14px] leading-[24px]"
        >
          同步推播狀態...
        </p>
      </section>

      <section class="app-card px-[20px] py-[20px]">
        <div class="flex flex-col gap-[14px] sm:flex-row sm:items-start sm:justify-between">
          <div class="min-w-0">
            <p class="app-label">通知列表</p>
            <p class="app-card-title mt-[8px]">最近動態</p>
            <p class="app-card-caption mt-[8px]">
              新通知預設會顯示在最上面。
            </p>
          </div>

          <div class="flex w-full flex-wrap items-center justify-between gap-[12px] sm:w-auto sm:justify-end">
            <span
              :class="[
                'app-meta-pill',
                notificationsStore.isLoading ? 'app-meta-pill-accent' : 'app-meta-pill-success',
              ]"
            >
              {{ notificationsStore.isLoading ? "資料同步中" : "資料已同步" }}
            </span>

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

          <AppEmptyState
            v-if="!notificationsStore.notifications.length"
            title="目前沒有通知"
            description="有新任務或兌換時會出現在這裡。"
          />
        </div>
      </section>
    </section>
  </MobileAppShell>
</template>
