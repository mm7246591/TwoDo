<script setup lang="ts">
import { useRouter } from 'vue-router'
import MobileAppShell from '@/components/MobileAppShell.vue'
import { useAuthStore } from '@/pinia/auth'
import { useCounterStore } from '@/pinia/counter'

const authStore = useAuthStore()
const counterStore = useCounterStore()
const router = useRouter()

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
  <MobileAppShell
    shell-class="bg-[linear-gradient(180deg,_#020617_0%,_#0f172a_100%)] text-slate-50"
    frame-class="border border-slate-800 bg-slate-950 shadow-[0_24px_80px_rgba(2,6,23,0.55)]"
  >
      <header class="space-y-5 px-5 pb-6 pt-8 sm:px-7 sm:pt-10">
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="text-[11px] uppercase tracking-[0.28em] text-slate-500">TwoDo</p>
            <h1 class="mt-2 text-[1.9rem] font-semibold leading-tight text-white">
              今天一起完成一點點，也很好。
            </h1>
          </div>
          <button
            class="rounded-full border border-slate-700 px-4 py-2 text-xs font-medium text-slate-200 transition hover:border-slate-500 hover:bg-slate-900"
            type="button"
            @click="handleSignOut"
          >
            Sign out
          </button>
        </div>

        <p class="text-sm leading-6 text-slate-400">
          先把首頁整理成手機 app 的節奏。接下來可以逐步換成你們真正的任務、配對與獎勵資料。
        </p>
      </header>

      <section class="flex-1 space-y-4 px-5 pb-6 sm:px-7">
        <div class="rounded-[1.75rem] bg-[linear-gradient(135deg,_#38bdf8_0%,_#2563eb_100%)] p-5 text-slate-950">
          <p class="text-xs font-semibold uppercase tracking-[0.25em] text-sky-950/70">Shared Space</p>
          <p class="mt-3 text-2xl font-semibold leading-tight">
            和另一半一起管理待辦、目標和小小的獎勵。
          </p>
          <p class="mt-3 text-sm leading-6 text-sky-950/80">
            目前先以登入狀態與首頁骨架為主，下一步就能開始接配對與任務資料。
          </p>
        </div>

        <section class="rounded-[1.75rem] border border-slate-800 bg-slate-900/80 p-5">
          <p class="text-xs uppercase tracking-[0.25em] text-emerald-300">Your Account</p>
          <p class="mt-3 break-all text-xl font-semibold text-white">
            {{ authStore.userEmail || 'Signed in user' }}
          </p>
          <p class="mt-3 text-sm leading-6 text-slate-400">
            這張卡之後可以換成配對狀態、邀請碼或今天的共享摘要。
          </p>
        </section>

        <section class="rounded-[1.75rem] bg-white p-5 text-slate-900">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-xs uppercase tracking-[0.25em] text-slate-500">Daily Streak</p>
              <p class="mt-3 text-4xl font-semibold">{{ counterStore.count }}</p>
            </div>
            <div class="rounded-2xl bg-slate-100 px-3 py-2 text-right">
              <p class="text-[11px] uppercase tracking-[0.2em] text-slate-400">Next</p>
              <p class="mt-1 text-sm font-medium text-slate-700">Tasks / Rewards</p>
            </div>
          </div>

          <p class="mt-3 text-sm leading-6 text-slate-500">
            先把這個區塊當成首頁的數據卡。之後可以換成連續完成天數、共同點數或本週目標。
          </p>

          <button
            class="mt-6 w-full rounded-full bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            type="button"
            @click="counterStore.increment"
          >
            Add one
          </button>
        </section>
      </section>
  </MobileAppShell>
</template>
