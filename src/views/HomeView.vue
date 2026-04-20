<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import MobileAppShell from '@/components/MobileAppShell.vue'
import { useAuthStore } from '@/pinia/auth'
import { useCoupleStore } from '@/pinia/couple'
import { useNotificationsStore } from '@/pinia/notifications'
import { useUserStore } from '@/pinia/user'

const authStore = useAuthStore()
const userStore = useUserStore()
const coupleStore = useCoupleStore()
const notificationsStore = useNotificationsStore()
const router = useRouter()

const getUserName = computed(() => userStore.profile?.displayName || 'TwoDo User')
const getPointsText = computed(() => String(userStore.profile?.points ?? 0))
const getUnreadNotificationsText = computed(() => String(notificationsStore.getUnreadCount))
const getCoupleStatus = computed(() => {
  if (coupleStore.getIsPaired) {
    return '已完成配對'
  }

  if (coupleStore.currentCoupleId) {
    return '等待同步'
  }

  return '尚未配對'
})

const getCoupleDescription = computed(() => {
  if (coupleStore.getIsPaired) {
    return '你們已經綁定在同一組 couple，接下來可以開始建立任務、累積積分與兌換獎勵。'
  }

  if (coupleStore.currentCoupleId) {
    return `目前已進入配對流程，coupleId 為 ${coupleStore.currentCoupleId}。接下來可以直接往任務頁測試資料流。`
  }

  return '每位使用者都有自己的邀請碼。先完成配對，之後 tasks、rewards、notifications 等主資料都會依附在同一個 coupleId 下面。'
})

watch(
  () => ({
    coupleId: userStore.profile?.coupleId ?? '',
    uid: userStore.profile?.uid ?? '',
  }),
  ({ coupleId, uid }) => {
    if (!coupleId || !uid) {
      notificationsStore.reset()
      return
    }

    void notificationsStore.syncNotifications(uid, coupleId)
  },
  { immediate: true },
)

const handleSignOut = async () => {
  try {
    await authStore.signOutUser()
    await router.push({ name: 'login' })
  } catch {
    // The store already exposes a user-facing error message.
  }
}

const goToPairing = async () => {
  await router.push({ name: 'pairing' })
}

const goToTasks = async () => {
  await router.push({ name: 'tasks' })
}

const goToPoints = async () => {
  await router.push({ name: 'points' })
}

const goToRewards = async () => {
  await router.push({ name: 'rewards' })
}

const goToNotifications = async () => {
  await router.push({ name: 'notifications' })
}
</script>

<template>
  <MobileAppShell>
    <header class="space-y-[20px] px-[20px] pb-[24px] pt-[32px] sm:px-[28px] sm:pt-[40px]">
      <div class="flex items-start justify-between gap-[12px]">
        <div class="min-w-0">
          <div class="app-chip">TwoDo MVP</div>
          <h1 class="app-text-strong mt-[16px] max-w-[12ch] text-[34px] font-semibold leading-[1.04] tracking-[-0.045em]">
            {{ getUserName }} 的共享面板
          </h1>
        </div>

        <button
          class="app-ghost-button shrink-0 px-[16px] py-[12px] text-[14px]"
          type="button"
          @click="handleSignOut"
        >
          登出
        </button>
      </div>

      <p class="app-text-muted max-w-[34ch] text-[14px] leading-[24px]">
        目前首頁先讓你檢查 `users`、`couples`、`tasks` 的 schema 狀態，再往下接積分與獎勵流程。
      </p>
    </header>

    <section class="flex-1 space-y-[16px] px-[20px] pb-[24px] sm:px-[28px]">
      <section class="app-hero-card p-[20px]">
        <div class="flex items-center justify-between gap-[12px]">
          <p class="app-hero-kicker">Schema Status</p>
          <div class="app-hero-pill">
            Phase 7
          </div>
        </div>

        <p class="app-text-strong mt-[16px] max-w-[14ch] text-[30px] font-semibold leading-[1.08] tracking-[-0.04em]">
          `users`、`couples`、`tasks`、`pointLogs`、`rewards`、`notifications` 已接上流程
        </p>

        <p class="app-hero-body mt-[12px] max-w-[34ch] text-[14px] leading-[24px]">
          {{ getCoupleDescription }}
        </p>

        <div class="mt-[20px] grid grid-cols-3 gap-[12px]">
          <div class="app-hero-stat px-[16px] py-[16px]">
            <p class="app-label">目前點數</p>
            <p class="app-text-strong mt-[8px] text-[30px] font-semibold">{{ getPointsText }}</p>
          </div>

          <div class="app-hero-stat px-[16px] py-[16px]">
            <p class="app-label">配對狀態</p>
            <p class="app-text-strong mt-[8px] text-[16px] font-semibold">{{ getCoupleStatus }}</p>
          </div>

          <div class="app-hero-stat px-[16px] py-[16px]">
            <p class="app-label">未讀通知</p>
            <p class="app-text-strong mt-[8px] text-[30px] font-semibold">{{ getUnreadNotificationsText }}</p>
          </div>
        </div>
      </section>

      <section class="grid grid-cols-2 gap-[16px]">
        <article class="app-card px-[16px] py-[16px]">
          <p class="app-label">Email</p>
          <p class="app-text-strong mt-[12px] break-all text-[16px] font-semibold leading-[24px]">
            {{ authStore.getUserEmail || '尚未取得 Email' }}
          </p>
          <p class="app-text-soft mt-[12px] text-[14px] leading-[24px]">
            這筆資料會同步到 `users.email`
          </p>
        </article>

        <article class="app-card-muted px-[16px] py-[16px]">
          <p class="app-label">我的邀請碼</p>
          <p class="app-text-strong mt-[12px] text-[20px] font-semibold tracking-[-0.03em]">
            {{ userStore.profile?.inviteCode || '尚未建立' }}
          </p>
        </article>
      </section>

      <section class="app-card px-[20px] py-[20px]">
        <div class="flex items-center justify-between gap-[12px]">
          <div>
            <p class="app-label">目前進度</p>
            <p class="app-text-strong mt-[8px] text-[24px] font-semibold tracking-[-0.04em]">
              配對、任務、獎勵與通知主流程
            </p>
          </div>

          <div class="app-accent-panel px-[12px] py-[8px] text-right">
            <p class="app-kicker">MVP</p>
            <p class="app-text-strong mt-[4px] text-[14px] font-semibold">Step by step</p>
          </div>
        </div>

        <p class="app-text-muted mt-[16px] text-[14px] leading-[24px]">
          你現在可以先完成配對、建立任務累積點數、建立獎勵並測試兌換，最後到通知頁確認每個關鍵事件都有正確寫進站內通知。
        </p>

        <button
          class="app-primary-button mt-[24px] w-full"
          type="button"
          @click="goToPairing"
        >
          前往配對
        </button>

        <button
          class="app-secondary-button mt-[12px] w-full"
          type="button"
          @click="goToTasks"
        >
          前往任務
        </button>

        <button
          class="app-ghost-button mt-[12px] w-full"
          type="button"
          @click="goToPoints"
        >
          前往積分
        </button>

        <button
          class="app-ghost-button mt-[12px] w-full"
          type="button"
          @click="goToRewards"
        >
          前往獎勵
        </button>

        <button
          class="app-ghost-button mt-[12px] w-full"
          type="button"
          @click="goToNotifications"
        >
          前往通知
        </button>
      </section>
    </section>
  </MobileAppShell>
</template>
