<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
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

const router = useRouter()
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
    return '需要到瀏覽器設定重新開權限'
  }

  return '尚未啟用'
})

const goHome = async () => {
  await router.push({ name: 'home' })
}

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
        新任務、待確認、已加分和獎勵兌換都會集中在這裡，也可以管理這台裝置的推播。
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
          需要先登入並完成配對，通知才會開始同步到你的帳號。
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
          開啟後，新任務、確認提醒與獎勵兌換會傳到這台裝置。若你先前封鎖過通知，需到瀏覽器網站設定重新允許。
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
          v-if="pushState.isLoading"
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

          <AppEmptyState
            v-if="!notificationsStore.notifications.length"
            title="目前沒有通知"
            description="建立任務、完成待確認或兌換獎勵後，這裡會開始累積動態。"
          />
        </div>
      </section>
    </section>
  </MobileAppShell>
</template>
