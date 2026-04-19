<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import AuthScreenShell from '@/components/AuthScreenShell.vue'
import { useAuthStore } from '@/pinia/auth'

const authStore = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const isEmailSubmitting = ref(false)
const isGoogleSubmitting = ref(false)
const isViewActive = ref(true)

const trimmedEmail = computed(() => email.value.trim())
const trimmedPassword = computed(() => password.value.trim())
const isEmailReady = computed(() => trimmedEmail.value !== '')
const isPasswordReady = computed(() => trimmedPassword.value.length >= 6)
const canUseEmailAuth = computed(() => isEmailReady.value && isPasswordReady.value)
const isAuthActionPending = computed(() => isEmailSubmitting.value || isGoogleSubmitting.value)

onMounted(() => {
  isViewActive.value = true
  authStore.clearError()
})

onBeforeUnmount(() => {
  isViewActive.value = false
  isEmailSubmitting.value = false
  isGoogleSubmitting.value = false
  authStore.clearError()
})

const handleSignIn = async () => {
  if (!canUseEmailAuth.value || isAuthActionPending.value) {
    return
  }

  try {
    isEmailSubmitting.value = true
    await authStore.signIn(trimmedEmail.value, trimmedPassword.value)
    await router.push({ name: 'home' })
  } catch {
    if (!isViewActive.value) {
      authStore.clearError()
    }

    // The store already exposes a user-facing error message.
  } finally {
    isEmailSubmitting.value = false
  }
}

const handleGoogleSignIn = async () => {
  if (isAuthActionPending.value) {
    return
  }

  try {
    isGoogleSubmitting.value = true
    await authStore.signInWithGoogle()
    await router.push({ name: 'home' })
  } catch {
    if (!isViewActive.value) {
      authStore.clearError()
    }

    // The store already exposes a user-facing error message.
  } finally {
    isGoogleSubmitting.value = false
  }
}
</script>

<template>
  <AuthScreenShell title="登入開始你的專注節奏" description="延續你的任務與習慣進度，快速回到 TwoDo 的每日安排。" card-title="登入 TwoDo"
    card-description="你可以使用 Google 或 Email 登入，接著繼續整理今天的重要事項。">
    <div class="space-y-4">
      <button class="app-secondary-button w-full justify-center" type="button" :disabled="isAuthActionPending"
        @click="handleGoogleSignIn">
        <svg aria-hidden="true" class="h-5 w-5" viewBox="0 0 24 24">
          <path
            d="M21.35 11.1h-9.18v2.98h5.27c-.23 1.51-1.14 2.79-2.43 3.65v2.43h3.13c1.83-1.69 2.88-4.18 2.88-7.11 0-.66-.06-1.3-.17-1.92Z"
            fill="#4285F4" />
          <path
            d="M12.17 21c2.61 0 4.8-.86 6.4-2.34l-3.13-2.43c-.87.58-1.98.92-3.27.92-2.51 0-4.64-1.69-5.4-3.97H3.53v2.51A9.67 9.67 0 0 0 12.17 21Z"
            fill="#34A853" />
          <path d="M6.77 13.18a5.82 5.82 0 0 1 0-3.71V6.96H3.53a9.67 9.67 0 0 0 0 8.73l3.24-2.51Z" fill="#FBBC05" />
          <path
            d="M12.17 5.5c1.42 0 2.69.49 3.69 1.44l2.77-2.77C16.96 2.63 14.78 1.8 12.17 1.8A9.67 9.67 0 0 0 3.53 6.96l3.24 2.51c.76-2.28 2.89-3.97 5.4-3.97Z"
            fill="#EA4335" />
        </svg>
        <span>{{ isGoogleSubmitting ? '正在開啟 Google...' : '使用 Google 登入' }}</span>
      </button>

      <div class="app-divider-label">或使用 Email</div>
    </div>

    <form class="mt-5 space-y-4" @submit.prevent="handleSignIn">
      <label class="block space-y-2">
        <span class="app-field-label">Email</span>
        <input v-model="email" class="app-input" type="email" autocomplete="email" placeholder="輸入你的 Email" />
      </label>

      <label class="block space-y-2">
        <span class="app-field-label">密碼</span>
        <input v-model="password" class="app-input" type="password" autocomplete="current-password"
          placeholder="輸入你的密碼" />
      </label>

      <p class="app-banner-info app-text-muted min-h-[4.5rem] px-4 py-3 text-xs leading-5">
        登入後可以接續你的任務清單、專注紀錄與目前進度，快速回到今天的安排。
      </p>

      <p v-if="authStore.errorMessage" class="app-banner-danger app-text-danger px-4 py-3 text-sm">
        {{ authStore.errorMessage }}
      </p>

      <button class="app-primary-button w-full" type="submit" :disabled="isAuthActionPending || !canUseEmailAuth">
        {{ isEmailSubmitting ? '登入中...' : '登入 TwoDo' }}
      </button>

      <p class="app-text-soft pt-1 text-center text-sm">
        還沒有 TwoDo 帳號？
        <RouterLink class="app-link font-semibold" :to="{ name: 'register' }">
          立即建立帳號
        </RouterLink>
      </p>
    </form>
  </AuthScreenShell>
</template>
