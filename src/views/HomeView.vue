<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import MobileAppShell from '@/components/MobileAppShell.vue'
import { useAuthStore } from '@/pinia/auth'
import { useCoupleStore } from '@/pinia/couple'
import { useUserStore } from '@/pinia/user'

const authStore = useAuthStore()
const userStore = useUserStore()
const coupleStore = useCoupleStore()
const router = useRouter()

const userName = computed(() => userStore.profile?.displayName || 'TwoDo User')
const pointsText = computed(() => String(userStore.profile?.points ?? 0))
const coupleStatus = computed(() => {
  if (coupleStore.isPaired) {
    return '已配對成功'
  }

  if (coupleStore.currentCoupleId) {
    return '等待另一半加入'
  }

  return '尚未配對'
})

const coupleDescription = computed(() => {
  if (coupleStore.isPaired) {
    return '你們已經綁定到同一組 couple，下一步可以開始接任務與積分流程。'
  }

  if (coupleStore.currentCoupleId) {
    return `目前邀請碼是 ${coupleStore.currentCoupleId}，分享給另一半後就能完成配對。`
  }

  return '先前往配對頁建立邀請碼，這樣後面的 tasks、rewards 和 notifications 才能有共同 coupleId。'
})

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
</script>

<template>
  <MobileAppShell>
    <header class="space-y-5 px-5 pb-6 pt-8 sm:px-7 sm:pt-10">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <div class="app-chip">TwoDo MVP</div>
          <h1 class="app-text-strong mt-4 max-w-[12ch] text-[2.15rem] font-semibold leading-[1.04] tracking-[-0.045em]">
            {{ userName }} 的共享任務首頁
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
        這一版先把帳號、`users` 文件、`couples` 文件與配對流程接穩，後面再往任務與積分擴充。
      </p>
    </header>

    <section class="flex-1 space-y-4 px-5 pb-6 sm:px-7">
      <section class="app-hero-card p-5">
        <div class="flex items-center justify-between gap-3">
          <p class="app-hero-kicker">Schema Status</p>
          <div class="app-hero-pill">
            Phase 1
          </div>
        </div>

        <p class="app-text-strong mt-4 max-w-[14ch] text-[1.9rem] font-semibold leading-[1.08] tracking-[-0.04em]">
          `users` 與 `couples` 已經開始連動
        </p>

        <p class="app-hero-body mt-3 max-w-[34ch] text-sm leading-6">
          {{ coupleDescription }}
        </p>

        <div class="mt-5 grid grid-cols-2 gap-3">
          <div class="app-hero-stat px-4 py-4">
            <p class="app-label">目前積分</p>
            <p class="app-text-strong mt-2 text-3xl font-semibold">{{ pointsText }}</p>
          </div>

          <div class="app-hero-stat px-4 py-4">
            <p class="app-label">配對狀態</p>
            <p class="app-text-strong mt-2 text-base font-semibold">{{ coupleStatus }}</p>
          </div>
        </div>
      </section>

      <section class="grid grid-cols-2 gap-4">
        <article class="app-card px-4 py-4">
          <p class="app-label">Email</p>
          <p class="app-text-strong mt-3 break-all text-base font-semibold leading-6">
            {{ authStore.userEmail || '尚未取得 Email' }}
          </p>
          <p class="app-text-soft mt-3 text-sm leading-6">
            這會同步到 `users.email`。
          </p>
        </article>

        <article class="app-card-muted px-4 py-4">
          <p class="app-label">coupleId</p>
          <p class="app-text-strong mt-3 text-xl font-semibold tracking-[-0.03em]">
            {{ userStore.profile?.coupleId || '尚未建立' }}
          </p>
        </article>
      </section>

      <section class="app-card px-5 py-5">
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="app-label">下一步</p>
            <p class="app-text-strong mt-2 text-2xl font-semibold tracking-[-0.04em]">
              完成雙人配對
            </p>
          </div>

          <div class="app-accent-panel px-3 py-2 text-right">
            <p class="app-kicker">MVP</p>
            <p class="app-text-strong mt-1 text-sm font-semibold">配對頁</p>
          </div>
        </div>

        <p class="app-text-muted mt-4 text-sm leading-6">
          你可以建立邀請碼，或輸入另一半給你的邀請碼。配對成功後，兩位使用者都會指向同一個 `coupleId`。
        </p>

        <button
          class="app-primary-button mt-6 w-full"
          type="button"
          @click="goToPairing"
        >
          前往配對頁
        </button>
      </section>
    </section>
  </MobileAppShell>
</template>
