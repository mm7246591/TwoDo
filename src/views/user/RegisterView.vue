<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { useErrorToast } from "@/composables/useErrorToast";
import { useAuthStore } from "@/pinia/auth";
import { showSuccessMessage } from "@/services/uiFeedback";

const authStore = useAuthStore();
const router = useRouter();

useErrorToast(() => authStore.errorMessage);

const displayName = ref("");
const email = ref("");
const password = ref("");
const isEmailSubmitting = ref(false);
const isViewActive = ref(true);
const hasSubmitted = ref(false);
const hasDisplayNameBlurred = ref(false);
const hasEmailBlurred = ref(false);
const hasPasswordBlurred = ref(false);

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const trimmedDisplayName = computed(() => displayName.value.trim());
const trimmedEmail = computed(() => email.value.trim());
const trimmedPassword = computed(() => password.value.trim());
const isDisplayNameReady = computed(() => trimmedDisplayName.value !== "");
const isEmailReady = computed(() => trimmedEmail.value !== "");
const isEmailFormatValid = computed(() =>
  emailPattern.test(trimmedEmail.value),
);
const isPasswordReady = computed(() => trimmedPassword.value.length >= 8);
const displayNameErrorMessage = computed(() => {
  if (!isDisplayNameReady.value) {
    return "請輸入暱稱";
  }

  return "";
});
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
    return "密碼至少需要 8 個字元";
  }

  return "";
});
const canCreateAccount = computed(
  () =>
    !displayNameErrorMessage.value &&
    !emailErrorMessage.value &&
    !passwordErrorMessage.value,
);
const shouldShowDisplayNameError = computed(
  () =>
    Boolean(displayNameErrorMessage.value) &&
    (hasSubmitted.value || hasDisplayNameBlurred.value),
);
const shouldShowEmailError = computed(
  () =>
    Boolean(emailErrorMessage.value) &&
    (hasSubmitted.value || hasEmailBlurred.value),
);
const shouldShowPasswordError = computed(
  () =>
    Boolean(passwordErrorMessage.value) &&
    (hasSubmitted.value || hasPasswordBlurred.value),
);

onMounted(() => {
  isViewActive.value = true;
  hasSubmitted.value = false;
  hasDisplayNameBlurred.value = false;
  hasEmailBlurred.value = false;
  hasPasswordBlurred.value = false;
  authStore.clearError();
});

onBeforeUnmount(() => {
  isViewActive.value = false;
  isEmailSubmitting.value = false;
  authStore.clearError();
});

const handleSignUp = async () => {
  if (isEmailSubmitting.value) {
    return;
  }

  hasSubmitted.value = true;

  if (!canCreateAccount.value) {
    return;
  }

  try {
    isEmailSubmitting.value = true;
    await authStore.signUp(
      trimmedEmail.value,
      trimmedPassword.value,
      trimmedDisplayName.value,
    );
    showSuccessMessage("驗證信已寄出，請先到信箱完成驗證。");
    await router.push({ name: "verify-email" });
  } catch {
    if (!isViewActive.value) {
      authStore.clearError();
    }
  } finally {
    isEmailSubmitting.value = false;
  }
};
</script>

<template>
  <main
    class="flex min-h-[max(884px,100dvh)] items-center justify-center bg-surface-container-low p-margin-mobile font-['Plus_Jakarta_Sans'] text-on-surface selection:bg-primary-container selection:text-on-primary-container md:p-margin-desktop"
  >
    <section
      class="flex w-full max-w-[1000px] flex-col overflow-hidden rounded-xl bg-surface-container-lowest shadow-[0_20px_60px_-15px_rgba(255,158,133,0.15)] md:flex-row"
      aria-labelledby="register-title"
    >
      <aside
        class="relative hidden items-center justify-center overflow-hidden bg-surface-container md:flex md:w-5/12"
      >
        <img
          alt=""
          class="absolute inset-0 h-full w-full object-cover opacity-90 mix-blend-multiply"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuALTnPSXYxy1aZie594Up8-nErCHm9p8awEkjVzSuhtD9-y3fDo6E66P_Xa4aPPoxN8rN7dpRFFvxVL-lnV3iwx6jefbDlw18xmVR_rnEYIzgyUjBJ_jmFY5-wclA09MkiJIesKFewfqUbPkkY3mSsA0Ko0y0VbiCrWaCE9_w5Wm-VItPy5brlo7Au6I_xlSOBV8iNZ2fw2IoD4fkof9t1kzEBGkGuLn4uKATyhhVPn-d3LqWChePEqWYimXFrbsPHodCEslRPaKiw"
        />
        <div
          class="absolute inset-0 bg-gradient-to-t from-surface-tint/40 to-transparent"
        />
        <div class="relative z-10 flex flex-col items-center p-lg text-center">
          <div
            class="mb-md flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-lowest/80 shadow-lg backdrop-blur-md"
          >
            <span
              class="material-symbols-outlined fill text-[32px] text-primary"
              aria-hidden="true"
              >favorite</span
            >
          </div>
          <p
            class="m-0 font-headline-md text-headline-md text-surface-container-lowest drop-shadow-md"
          >
            兩個人的數位小屋
          </p>
          <p
            class="mt-sm max-w-[250px] font-body-md text-body-md text-surface-container-lowest drop-shadow-sm"
          >
            一起整理生活瑣事，少一點摩擦，多一點默契。
          </p>
        </div>
      </aside>

      <div class="flex w-full flex-col justify-center p-lg md:w-7/12 md:p-xl">
        <RouterLink
          class="mb-lg flex items-center gap-xs text-primary no-underline md:hidden"
          :to="{ name: 'login' }"
          aria-label="TwoDo 登入"
        >
          <span class="material-symbols-outlined fill" aria-hidden="true"
            >favorite</span
          >
          <span
            class="font-headline-md text-headline-md font-black tracking-tighter"
            >TwoDo</span
          >
        </RouterLink>

        <header class="mb-lg">
          <h1
            id="register-title"
            class="mb-xs mt-0 font-headline-xl text-headline-lg text-on-surface"
          >
            開始你們的旅程
          </h1>
          <p class="m-0 font-body-lg text-body-lg text-on-surface-variant">
            一起生活，從完成一件小事開始。
          </p>
        </header>

        <form
          class="flex flex-col gap-md"
          novalidate
          @submit.prevent="handleSignUp"
        >
          <div class="flex flex-col gap-gutter">
            <label class="flex flex-col gap-xs">
              <span
                class="px-xs font-label-sm text-label-sm text-on-surface-variant"
                >暱稱</span
              >
              <input
                v-model="displayName"
                class="w-full rounded-lg border border-transparent bg-surface-container px-md py-sm font-body-md text-body-md text-on-surface outline-none ring-0 transition-[background-color,box-shadow] duration-200 placeholder:text-outline/60 focus:border-transparent focus:bg-surface-container-lowest focus:shadow-[0_4px_12px_rgba(255,158,133,0.15)] focus:outline-none focus:ring-2 focus:ring-primary-container focus:ring-offset-0 focus-visible:outline-none"
                :class="{
                  'border-[var(--auth-error)] focus:ring-[var(--auth-error)]':
                    shouldShowDisplayNameError,
                }"
                :aria-describedby="
                  shouldShowDisplayNameError
                    ? 'register-display-name-error'
                    : undefined
                "
                :aria-invalid="shouldShowDisplayNameError"
                autocomplete="nickname"
                placeholder="請輸入暱稱"
                type="text"
                @blur="hasDisplayNameBlurred = true"
              />
              <Transition name="auth-field-error">
                <p
                  v-if="shouldShowDisplayNameError"
                  id="register-display-name-error"
                  class="m-0 px-xs font-label-sm text-label-sm text-[var(--auth-error)]"
                >
                  {{ displayNameErrorMessage }}
                </p>
              </Transition>
            </label>

            <label class="flex flex-col gap-xs">
              <span
                class="px-xs font-label-sm text-label-sm text-on-surface-variant"
                >電子郵件</span
              >
              <input
                v-model="email"
                class="w-full rounded-lg border border-transparent bg-surface-container px-md py-sm font-body-md text-body-md text-on-surface outline-none ring-0 transition-[background-color,box-shadow] duration-200 placeholder:text-outline/60 focus:border-transparent focus:bg-surface-container-lowest focus:shadow-[0_4px_12px_rgba(255,158,133,0.15)] focus:outline-none focus:ring-2 focus:ring-primary-container focus:ring-offset-0 focus-visible:outline-none"
                :class="{
                  'border-[var(--auth-error)] focus:ring-[var(--auth-error)]':
                    shouldShowEmailError,
                }"
                :aria-describedby="
                  shouldShowEmailError ? 'register-email-error' : undefined
                "
                :aria-invalid="shouldShowEmailError"
                autocomplete="email"
                placeholder="請輸入電子郵件"
                type="email"
                @blur="hasEmailBlurred = true"
              />
              <Transition name="auth-field-error">
                <p
                  v-if="shouldShowEmailError"
                  id="register-email-error"
                  class="m-0 px-xs font-label-sm text-label-sm text-[var(--auth-error)]"
                >
                  {{ emailErrorMessage }}
                </p>
              </Transition>
            </label>

            <label class="flex flex-col gap-xs">
              <span
                class="px-xs font-label-sm text-label-sm text-on-surface-variant"
                >密碼</span
              >
              <input
                v-model="password"
                class="w-full rounded-lg border border-transparent bg-surface-container px-md py-sm font-body-md text-body-md text-on-surface outline-none ring-0 transition-[background-color,box-shadow] duration-200 placeholder:text-outline/60 focus:border-transparent focus:bg-surface-container-lowest focus:shadow-[0_4px_12px_rgba(255,158,133,0.15)] focus:outline-none focus:ring-2 focus:ring-primary-container focus:ring-offset-0 focus-visible:outline-none"
                :class="{
                  'border-[var(--auth-error)] focus:ring-[var(--auth-error)]':
                    shouldShowPasswordError,
                }"
                :aria-describedby="
                  shouldShowPasswordError
                    ? 'register-password-error'
                    : undefined
                "
                :aria-invalid="shouldShowPasswordError"
                autocomplete="new-password"
                placeholder="請輸入密碼（至少 8 字元）"
                type="password"
                @blur="hasPasswordBlurred = true"
              />
              <Transition name="auth-field-error">
                <p
                  v-if="shouldShowPasswordError"
                  id="register-password-error"
                  class="m-0 px-xs font-label-sm text-label-sm text-[var(--auth-error)]"
                >
                  {{ passwordErrorMessage }}
                </p>
              </Transition>
            </label>
          </div>

          <div class="mt-md flex flex-col items-center gap-md">
            <button
              class="mt-[8px] flex h-14 w-full items-center justify-center rounded-xl bg-[var(--auth-primary)] text-[14px] font-semibold leading-[20px] tracking-[0.01em] text-[var(--auth-on-primary)] shadow-[0_8px_24px_-6px_rgba(148,72,53,0.3)] transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              type="submit"
              :disabled="isEmailSubmitting"
            >
              {{ isEmailSubmitting ? "建立中..." : "建立帳號" }}
              <span
                class="material-symbols-outlined text-[20px]"
                aria-hidden="true"
                >arrow_forward</span
              >
            </button>

            <p class="m-0 font-body-md text-body-md text-on-surface-variant">
              已經有帳號了？
              <RouterLink
                class="font-label-md text-label-md text-primary no-underline transition-colors"
                :to="{ name: 'login' }"
              >
                登入
              </RouterLink>
            </p>
          </div>
        </form>
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
