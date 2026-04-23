<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { useErrorToast } from "@/composables/useErrorToast";
import { useAuthStore } from "@/pinia/auth";
import { useUserStore } from "@/pinia/user";
import { showSuccessMessage } from "@/services/uiFeedback";
import { getUserProfile } from "@/services/userService";

const authStore = useAuthStore();
const userStore = useUserStore();
const router = useRouter();

useErrorToast(() => authStore.errorMessage);

const email = ref("");
const password = ref("");
const isEmailSubmitting = ref(false);
const isGoogleSubmitting = ref(false);
const isViewActive = ref(true);
const hasSubmitted = ref(false);
const hasEmailBlurred = ref(false);
const hasPasswordBlurred = ref(false);

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const trimmedEmail = computed(() => email.value.trim());
const trimmedPassword = computed(() => password.value.trim());
const isEmailReady = computed(() => trimmedEmail.value !== "");
const isEmailFormatValid = computed(() => emailPattern.test(trimmedEmail.value));
const isPasswordReady = computed(() => trimmedPassword.value.length >= 6);
const emailErrorMessage = computed(() => {
  if (!isEmailReady.value) {
    return "請輸入電子郵件";
  }

  if (!isEmailFormatValid.value) {
    return "請輸入有效的電子郵件格式";
  }

  return "";
});
const passwordErrorMessage = computed(() => {
  if (!trimmedPassword.value) {
    return "請輸入密碼";
  }

  if (!isPasswordReady.value) {
    return "密碼至少需要 6 個字元";
  }

  return "";
});
const canUseEmailAuth = computed(
  () => !emailErrorMessage.value && !passwordErrorMessage.value,
);
const isAuthActionPending = computed(
  () => isEmailSubmitting.value || isGoogleSubmitting.value,
);
const shouldShowEmailError = computed(
  () => Boolean(emailErrorMessage.value) && (hasSubmitted.value || hasEmailBlurred.value),
);
const shouldShowPasswordError = computed(
  () => Boolean(passwordErrorMessage.value) && (hasSubmitted.value || hasPasswordBlurred.value),
);

onMounted(() => {
  isViewActive.value = true;
  hasSubmitted.value = false;
  hasEmailBlurred.value = false;
  hasPasswordBlurred.value = false;
  authStore.clearError();
});

onBeforeUnmount(() => {
  isViewActive.value = false;
  isEmailSubmitting.value = false;
  isGoogleSubmitting.value = false;
  authStore.clearError();
});

const getPostAuthRouteName = async () => {
  const uid = authStore.getUserUid;

  if (!uid) {
    return "pairing";
  }

  try {
    const profile =
      userStore.profile?.uid === uid
        ? userStore.profile
        : await getUserProfile(uid);

    return profile?.partnerUid ? "home" : "pairing";
  } catch {
    return "pairing";
  }
};

const goToPostAuthRoute = async () => {
  await router.push({ name: await getPostAuthRouteName() });
};

const handleSignIn = async () => {
  if (isAuthActionPending.value) {
    return;
  }

  hasSubmitted.value = true;

  if (!canUseEmailAuth.value) {
    return;
  }

  try {
    isEmailSubmitting.value = true;
    await authStore.signIn(trimmedEmail.value, trimmedPassword.value);
    if (authStore.getRequiresEmailVerification) {
      showSuccessMessage("請先到信箱完成驗證。");
      await router.push({ name: "verify-email" });
      return;
    }

    showSuccessMessage("歡迎回來");
    await goToPostAuthRoute();
  } catch {
    if (!isViewActive.value) {
      authStore.clearError();
    }
  } finally {
    isEmailSubmitting.value = false;
  }
};

const handleGoogleSignIn = async () => {
  if (isAuthActionPending.value) {
    return;
  }

  try {
    isGoogleSubmitting.value = true;
    await authStore.signInWithGoogle();
    showSuccessMessage("歡迎回來");
    await goToPostAuthRoute();
  } catch {
    if (!isViewActive.value) {
      authStore.clearError();
    }
  } finally {
    isGoogleSubmitting.value = false;
  }
};

const handleForgotPasswordPreview = () => {
  showSuccessMessage("重設密碼功能即將開放。");
};
</script>

<template>
  <main
    class="relative flex min-h-[max(884px,100dvh)] items-center justify-center overflow-hidden bg-[var(--auth-background)] px-[20px] py-[40px] text-[var(--auth-on-background,var(--auth-on-surface))] antialiased md:p-[48px]"
  >
    <div class="absolute inset-0 z-0">
      <div
        class="h-full w-full bg-[image:var(--auth-login-bg-image)] bg-cover bg-center opacity-30"
        aria-hidden="true"
      />
      <div
        class="absolute inset-0 bg-gradient-to-tr from-[rgb(255_248_246_/_0.9)] via-[rgb(255_248_246_/_0.7)] to-[rgb(255_241_236_/_0.8)] mix-blend-overlay"
      />
      <div
        class="absolute inset-0 bg-[rgb(255_248_246_/_0.6)] backdrop-blur-[60px]"
      />
    </div>

    <section
      class="relative z-10 flex w-full max-w-[460px] flex-col gap-[40px] rounded-[32px] border border-[rgb(255_241_236_/_0.5)] bg-[var(--auth-surface-container-lowest)] p-[40px] shadow-[0_16px_60px_-15px_rgba(148,72,53,0.1)] md:p-[64px]"
      aria-labelledby="login-title"
    >
      <header
        class="flex flex-col items-center gap-[12px] text-center md:items-start md:text-left"
      >
        <RouterLink
          class="mb-[12px] flex items-center gap-[8px] text-[var(--auth-primary)] no-underline"
          :to="{ name: 'login' }"
          aria-label="TwoDo 登入"
        >
          <span
            class="material-symbols-outlined fill text-[32px] text-[var(--auth-primary-container)]"
            aria-hidden="true"
            >favorite</span
          >
          <span class="text-[24px] font-semibold leading-[32px] tracking-tight"
            >TwoDo</span
          >
        </RouterLink>

        <h1
          id="login-title"
          class="m-0 text-[32px] font-bold leading-[40px] tracking-[-0.01em] text-[var(--auth-on-surface)]"
        >
          歡迎回來
        </h1>
        <p
          class="m-0 text-[16px] font-normal leading-[24px] text-[var(--auth-on-surface-variant)]"
        >
          回到你們的日常節奏。
        </p>
      </header>

      <div class="flex flex-col gap-[24px]">
        <button
          class="flex h-14 w-full items-center justify-center gap-[12px] rounded-xl border border-[var(--auth-outline-variant)] bg-[var(--auth-surface-container-lowest)] text-[var(--auth-on-surface)] transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          type="button"
          :disabled="isAuthActionPending"
          @click="handleGoogleSignIn"
        >
          <svg
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          <span
            class="text-[14px] font-semibold leading-[20px] tracking-[0.01em]"
          >
            {{ isGoogleSubmitting ? "連線中..." : "使用 Google 帳號繼續" }}
          </span>
        </button>

        <div class="flex items-center gap-[12px]">
          <div class="h-px flex-1 bg-[rgb(218_193_187_/_0.5)]" />
          <span
            class="text-[12px] font-medium uppercase leading-[16px] tracking-wider text-[var(--auth-on-surface-variant)]"
            >或</span
          >
          <div class="h-px flex-1 bg-[rgb(218_193_187_/_0.5)]" />
        </div>
      </div>

      <form class="flex flex-col gap-[16px]" novalidate @submit.prevent="handleSignIn">
        <label class="flex flex-col gap-[8px]">
          <span
            class="pl-[4px] text-[12px] font-medium leading-[16px] text-[var(--auth-on-surface-variant)]"
            >電子郵件</span
          >
          <input
            v-model="email"
            class="h-14 rounded-xl border border-transparent bg-[var(--auth-surface-container)] px-[24px] text-[16px] font-normal leading-[24px] text-[var(--auth-on-surface)] outline-none ring-0 transition-[background-color,box-shadow] duration-200 placeholder:text-[rgb(84_67_62_/_0.5)] focus:border-transparent focus:bg-[var(--auth-surface-container-lowest)] focus:shadow-[0_4px_12px_rgba(255,158,133,0.15)] focus:outline-none focus:ring-2 focus:ring-[var(--auth-primary-container)] focus:ring-offset-0 focus-visible:outline-none"
            :class="{
              'border-[var(--auth-error)] focus:ring-[var(--auth-error)]': shouldShowEmailError,
            }"
            :aria-describedby="shouldShowEmailError ? 'login-email-error' : undefined"
            :aria-invalid="shouldShowEmailError"
            autocomplete="email"
            placeholder="請輸入電子郵件"
            type="email"
            @blur="hasEmailBlurred = true"
          />
          <Transition name="auth-field-error">
            <p
              v-if="shouldShowEmailError"
              id="login-email-error"
              class="m-0 px-[4px] text-[12px] font-medium leading-[16px] text-[var(--auth-error)]"
            >
              {{ emailErrorMessage }}
            </p>
          </Transition>
        </label>

        <label class="flex flex-col gap-[8px]">
          <span
            class="text-[12px] font-medium leading-[16px] text-[var(--auth-on-surface-variant)]"
            >密碼</span
          >
          <input
            v-model="password"
            class="h-14 rounded-xl border border-transparent bg-[var(--auth-surface-container)] px-[24px] text-[16px] font-normal leading-[24px] text-[var(--auth-on-surface)] outline-none ring-0 transition-[background-color,box-shadow] duration-200 placeholder:text-[rgb(84_67_62_/_0.5)] focus:border-transparent focus:bg-[var(--auth-surface-container-lowest)] focus:shadow-[0_4px_12px_rgba(255,158,133,0.15)] focus:outline-none focus:ring-2 focus:ring-[var(--auth-primary-container)] focus:ring-offset-0 focus-visible:outline-none"
            :class="{
              'border-[var(--auth-error)] focus:ring-[var(--auth-error)]': shouldShowPasswordError,
            }"
            :aria-describedby="shouldShowPasswordError ? 'login-password-error' : undefined"
            :aria-invalid="shouldShowPasswordError"
            autocomplete="current-password"
            placeholder="請輸入密碼"
            type="password"
            @blur="hasPasswordBlurred = true"
          />
          <Transition name="auth-field-error">
            <p
              v-if="shouldShowPasswordError"
              id="login-password-error"
              class="m-0 px-[4px] text-[12px] font-medium leading-[16px] text-[var(--auth-error)]"
            >
              {{ passwordErrorMessage }}
            </p>
          </Transition>
          <button
            class="flex min-h-0 items-center justify-end border-0 bg-transparent p-0 text-[12px] font-medium leading-[16px] text-[var(--auth-primary)] transition-colors"
            type="button"
            @click="handleForgotPasswordPreview"
          >
            忘記密碼
          </button>
        </label>

        <button
          class="mt-[8px] flex h-14 w-full items-center justify-center rounded-xl bg-[var(--auth-primary)] text-[14px] font-semibold leading-[20px] tracking-[0.01em] text-[var(--auth-on-primary)] shadow-[0_8px_24px_-6px_rgba(148,72,53,0.3)] transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
          :disabled="isAuthActionPending"
        >
          {{ isEmailSubmitting ? "登入中..." : "登入" }}
        </button>
      </form>

      <div class="pt-[4px]">
        <span
          class="flex justify-center items-center text-[14px] font-semibold leading-[20px] tracking-[0.01em] no-underline"
        >
          還沒有帳號？<RouterLink
            :to="{ name: 'register' }"
            class="flex justify-center items-center text-[var(--auth-primary)]"
            >立即註冊</RouterLink
          >
        </span>
      </div>
    </section>
  </main>
</template>

<style scoped>
.auth-field-error-enter-active,
.auth-field-error-leave-active {
  max-height: 40px;
  overflow: hidden;
  transition:
    max-height 180ms ease,
    opacity 160ms ease,
    transform 180ms ease;
}

.auth-field-error-enter-from,
.auth-field-error-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-4px);
}

.auth-field-error-enter-to,
.auth-field-error-leave-from {
  max-height: 40px;
  opacity: 1;
  transform: translateY(0);
}
</style>
