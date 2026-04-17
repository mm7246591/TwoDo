<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import AuthScreenShell from '@/components/AuthScreenShell.vue'
import { useAuthStore } from '@/pinia/auth'

const authStore = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')

const trimmedEmail = computed(() => email.value.trim())
const trimmedPassword = computed(() => password.value.trim())
const isEmailReady = computed(() => trimmedEmail.value !== '')
const isPasswordReady = computed(() => trimmedPassword.value.length >= 6)
const canUseEmailAuth = computed(() => isEmailReady.value && isPasswordReady.value)

async function handleSignIn() {
  if (!canUseEmailAuth.value) {
    return
  }

  try {
    await authStore.signIn(trimmedEmail.value, trimmedPassword.value)
    await router.push({ name: 'home' })
  } catch {
    // The store already exposes a user-facing error message.
  }
}

async function handleGoogleSignIn() {
  try {
    await authStore.signInWithGoogle()
    await router.push({ name: 'home' })
  } catch {
    // The store already exposes a user-facing error message.
  }
}
</script>

<template>
  <AuthScreenShell
    shell-class="bg-[linear-gradient(180deg,_#dbeafe_0%,_#eff6ff_28%,_#f8fafc_100%)]"
    title="回到你們的日常節奏。"
    description="登入後就能接續共享清單、任務安排和兩人的小目標，不用重新整理彼此的步調。"
    card-title="Sign In"
    card-description="用你常用的方式回到共享空間。"
  >
    <div class="space-y-4">
      <button
        class="flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-5 py-3.5 text-sm font-medium text-slate-800 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:bg-slate-300"
        type="button"
        :disabled="authStore.isSubmitting"
        @click="handleGoogleSignIn"
      >
        <svg aria-hidden="true" class="h-5 w-5" viewBox="0 0 24 24">
          <path
            d="M21.35 11.1h-9.18v2.98h5.27c-.23 1.51-1.14 2.79-2.43 3.65v2.43h3.13c1.83-1.69 2.88-4.18 2.88-7.11 0-.66-.06-1.3-.17-1.92Z"
            fill="#4285F4"
          />
          <path
            d="M12.17 21c2.61 0 4.8-.86 6.4-2.34l-3.13-2.43c-.87.58-1.98.92-3.27.92-2.51 0-4.64-1.69-5.4-3.97H3.53v2.51A9.67 9.67 0 0 0 12.17 21Z"
            fill="#34A853"
          />
          <path
            d="M6.77 13.18a5.82 5.82 0 0 1 0-3.71V6.96H3.53a9.67 9.67 0 0 0 0 8.73l3.24-2.51Z"
            fill="#FBBC05"
          />
          <path
            d="M12.17 5.5c1.42 0 2.69.49 3.69 1.44l2.77-2.77C16.96 2.63 14.78 1.8 12.17 1.8A9.67 9.67 0 0 0 3.53 6.96l3.24 2.51c.76-2.28 2.89-3.97 5.4-3.97Z"
            fill="#EA4335"
          />
        </svg>
        <span>{{ authStore.isSubmitting ? 'Opening Google...' : 'Continue with Google' }}</span>
      </button>

      <div class="flex items-center gap-3">
        <div class="h-px flex-1 bg-slate-800" />
        <span class="text-[11px] font-medium uppercase tracking-[0.25em] text-slate-400">Email</span>
        <div class="h-px flex-1 bg-slate-800" />
      </div>
    </div>

    <form class="mt-5 space-y-4" @submit.prevent="handleSignIn">
      <label class="block space-y-2">
        <span class="text-sm font-medium text-slate-200">Email</span>
        <input
          v-model="email"
          class="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400"
          type="email"
          autocomplete="email"
          placeholder="you@example.com"
        />
      </label>

      <label class="block space-y-2">
        <span class="text-sm font-medium text-slate-200">Password</span>
        <input
          v-model="password"
          class="w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400"
          type="password"
          autocomplete="current-password"
          placeholder="至少 6 碼"
        />
      </label>

      <p class="text-xs leading-5 text-slate-400">
        使用你已建立過的帳號登入。密碼至少需要 6 碼。
      </p>

      <p v-if="authStore.errorMessage" class="rounded-2xl bg-rose-500/15 px-4 py-3 text-sm text-rose-200">
        {{ authStore.errorMessage }}
      </p>

      <button
        class="w-full rounded-full bg-sky-400 px-5 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
        type="submit"
        :disabled="authStore.isSubmitting || !canUseEmailAuth"
      >
        {{ authStore.isSubmitting ? 'Submitting...' : 'Sign in with Email' }}
      </button>

      <p class="pt-1 text-center text-sm text-slate-400">
        還沒有帳號？
        <RouterLink class="font-medium text-white underline decoration-slate-600 underline-offset-4" :to="{ name: 'register' }">
          建立帳號
        </RouterLink>
      </p>
    </form>
  </AuthScreenShell>
</template>
