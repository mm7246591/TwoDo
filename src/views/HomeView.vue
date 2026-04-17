<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import MobileAppShell from '@/components/MobileAppShell.vue'
import { useAuthStore } from '@/pinia/auth'
import { useCounterStore } from '@/pinia/counter'

const authStore = useAuthStore()
const counterStore = useCounterStore()
const router = useRouter()

const streakProgress = computed(() => `${Math.min(counterStore.count * 12, 100)}%`)
const streakMessage = computed(() => {
  if (counterStore.count <= 0) {
    return '先完成一個小步驟，今天就算順利開始。'
  }

  if (counterStore.count < 5) {
    return '節奏正在形成，維持簡單就能更容易持續。'
  }

  return '你已經進入穩定節奏，保持現在的步調就很好。'
})

async function handleSignOut() {
  try {
    await authStore.signOutUser()
    await router.push({ name: 'login' })
  } catch {
    // The store already exposes a user-facing error message.
  }
}
</script>

<template>
  <MobileAppShell>
    <header class="space-y-5 px-5 pb-6 pt-8 sm:px-7 sm:pt-10">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <div class="app-chip">TwoDo</div>
          <h1 class="app-text-strong mt-4 max-w-[12ch] text-[2.15rem] font-semibold leading-[1.04] tracking-[-0.045em]">
            讓今天的節奏，一眼就能掌握。
          </h1>
        </div>

        <button
          class="app-ghost-button shrink-0 px-4 py-3 text-sm"
          type="button"
          @click="handleSignOut"
        >
          登出
        </button>
      </div>

      <p class="app-text-muted max-w-[34ch] text-sm leading-6">
        這個首頁現在更像真正的手機 app，留白更舒服、層次更柔和，重點操作也更清楚。
      </p>
    </header>

    <section class="flex-1 space-y-4 px-5 pb-6 sm:px-7">
      <section class="app-hero-card p-5">
        <div class="flex items-center justify-between gap-3">
          <p class="app-hero-kicker">今日重點</p>
          <div class="app-hero-pill">
            輕盈模式
          </div>
        </div>

        <p class="app-text-strong mt-4 max-w-[14ch] text-[1.9rem] font-semibold leading-[1.08] tracking-[-0.04em]">
          畫面更安定，小小進度也會更願意開始。
        </p>

        <p class="app-hero-body mt-3 max-w-[34ch] text-sm leading-6">
          這張主卡片會先把注意力帶到今天的狀態，但仍然保留 app 畫面該有的簡潔感。
        </p>

        <div class="mt-5 grid grid-cols-2 gap-3">
          <div class="app-hero-stat px-4 py-4">
            <p class="app-label">連續紀錄</p>
            <p class="app-text-strong mt-2 text-3xl font-semibold">{{ counterStore.count }}</p>
          </div>

          <div class="app-hero-stat px-4 py-4">
            <p class="app-label">狀態</p>
            <p class="app-text-strong mt-2 text-base font-semibold">準備開始</p>
          </div>
        </div>
      </section>

      <div class="grid grid-cols-2 gap-4">
        <section class="app-card px-4 py-4">
          <p class="app-label">帳號</p>
          <p class="app-text-strong mt-3 break-all text-base font-semibold leading-6">
            {{ authStore.userEmail || '目前登入使用者' }}
          </p>
          <p class="app-text-soft mt-3 text-sm leading-6">
            你的個人空間已同步完成。
          </p>
        </section>

        <section class="app-card-muted px-4 py-4">
          <p class="app-label">節奏</p>
          <p class="app-text-strong mt-3 text-xl font-semibold tracking-[-0.03em]">
            {{ streakMessage }}
          </p>
        </section>
      </div>

      <section class="app-card px-5 py-5">
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="app-label">今日累積</p>
            <p class="app-text-strong mt-2 text-4xl font-semibold tracking-[-0.05em]">
              {{ counterStore.count }}
            </p>
          </div>

          <div class="app-accent-panel px-3 py-2 text-right">
            <p class="app-kicker">進度</p>
            <p class="app-text-strong mt-1 text-sm font-semibold">習慣循環</p>
          </div>
        </div>

        <p class="app-text-muted mt-4 text-sm leading-6">
          計數功能本身很單純，但用更清楚的數字、進度條與主按鈕去呈現，整體會更像成熟的 app 首頁。
        </p>

        <div class="app-progress-track mt-4 h-3 rounded-full">
          <div
            class="app-progress-fill h-full rounded-full transition-[width] duration-300"
            :style="{ width: streakProgress }"
          />
        </div>

        <button
          class="app-primary-button mt-6 w-full"
          type="button"
          @click="counterStore.increment"
        >
          今天加一筆
        </button>
      </section>

      <section class="app-card-muted px-5 py-5">
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="app-label">下一步</p>
            <p class="app-text-strong mt-2 text-lg font-semibold tracking-[-0.03em]">
              可以繼續擴充任務、清單與獎勵功能。
            </p>
          </div>
          <div class="app-badge app-badge-success">
            即將加入
          </div>
        </div>

        <p class="app-text-muted mt-3 text-sm leading-6">
          這個區塊先幫首頁保留後續擴充空間，也讓整體版面更接近完整的手機 dashboard 節奏。
        </p>
      </section>
    </section>
  </MobileAppShell>
</template>
