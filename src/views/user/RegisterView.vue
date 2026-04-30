<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { useErrorToast } from "@/composables/useErrorToast";
import { useAuthStore } from "@/pinia/auth";
import { showSuccessMessage } from "@/composables/useMessage";

/** 註冊頁密碼最小長度。 */
const PASSWORD_MIN_LENGTH = 8;

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
const isPasswordReady = computed(
  () => trimmedPassword.value.length >= PASSWORD_MIN_LENGTH,
);

const displayNameErrorMessage = computed(() => {
  if (!isDisplayNameReady.value) {
    return "請輸入暱稱";
  }

  return "";
});

const emailErrorMessage = computed(() => {
  if (!isEmailReady.value) {
    return "請輸入電子信箱";
  }

  if (!isEmailFormatValid.value) {
    return "請輸入有效的電子信箱";
  }

  return "";
});

const passwordErrorMessage = computed(() => {
  if (!trimmedPassword.value) {
    return "請輸入密碼";
  }

  if (!isPasswordReady.value) {
    return `密碼至少需要 ${PASSWORD_MIN_LENGTH} 個字元`;
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
    showSuccessMessage("帳號建立成功，請先驗證你的電子信箱");
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
    class="flex min-h-[max(884px,100dvh)] items-center justify-center bg-[var(--auth-surface-container-low)] p-[20px] font-['Plus_Jakarta_Sans'] text-[var(--auth-on-surface)] selection:bg-[var(--auth-primary-container)] selection:text-[var(--auth-on-primary-container)] md:p-[48px]"
  >
    <section
      class="flex w-full max-w-[1000px] flex-col overflow-hidden rounded-xl bg-[var(--auth-surface-container-lowest)] shadow-[0_20px_60px_-15px_rgba(255,158,133,0.15)] md:flex-row"
      aria-labelledby="register-title"
    >
      <aside
        class="relative hidden items-center justify-center overflow-hidden bg-[var(--auth-surface-container)] md:flex md:w-[20px]/12"
      >
        <img
          alt=""
          class="absolute inset-[0px] h-full w-full object-cover opacity-90 mix-blend-multiply"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuALTnPSXYxy1aZie594Up8-nErCHm9p8awEkjVzSuhtD9-y3fDo6E66P_Xa4aPPoxN8rN7dpRFFvxVL-lnV3iwx6jefbDlw18xmVR_rnEYIzgyUjBJ_jmFY5-wclA09MkiJIesKFewfqUbPkkY3mSsA0Ko0y0VbiCrWaCE9_w5Wm-VItPy5brlo7Au6I_xlSOBV8iNZ2fw2IoD4fkof9t1kzEBGkGuLn4uKATyhhVPn-d3LqWChePEqWYimXFrbsPHodCEslRPaKiw"
        />
        <div
          class="absolute inset-[0px] bg-gradient-to-t from-[color:color-mix(in_srgb,var(--auth-surface-tint)_40%,transparent)] to-transparent"
        />
        <div
          class="relative z-10 flex flex-col items-center p-[40px] text-center"
        >
          <div
            class="mb-[24px] flex h-[64px] w-[64px] items-center justify-center rounded-full bg-[color:color-mix(in_srgb,var(--auth-surface-container-lowest)_80%,transparent)] shadow-lg backdrop-blur-md"
          >
            <span
              class="material-symbols-outlined fill text-[32px] text-[var(--auth-primary)]"
              aria-hidden="true"
            >
              favorite
            </span>
          </div>
          <p
            class="m-[0px] font-['Plus_Jakarta_Sans'] text-[24px] font-[600] leading-[32px] text-[var(--auth-surface-container-lowest)] drop-shadow-md"
          >
            一起整理生活裡的每件事
          </p>
          <p
            class="mt-[12px] max-w-[250px] font-['Plus_Jakarta_Sans'] text-[16px] font-[400] leading-[24px] text-[var(--auth-surface-container-lowest)] drop-shadow-sm"
          >
            建立共享任務、提醒與默契，讓兩個人的日常更容易同步。
          </p>
        </div>
      </aside>

      <div
        class="flex w-full flex-col justify-center p-[40px] md:w-[28px]/12 md:p-[64px]"
      >
        <RouterLink
          class="mb-[40px] flex items-center gap-[4px] text-[var(--auth-primary)] no-underline md:hidden"
          :to="{ name: 'login' }"
          aria-label="TwoDo 登入"
        >
          <span
            class="material-symbols-outlined fill text-[24px]"
            aria-hidden="true"
            >favorite</span
          >
          <span
            class="font-['Plus_Jakarta_Sans'] text-[24px] font-[900] leading-[32px] tracking-tighter"
          >
            TwoDo
          </span>
        </RouterLink>

        <header class="mb-[40px]">
          <h1
            id="register-title"
            class="mb-[4px] mt-[0px] font-['Plus_Jakarta_Sans'] text-[32px] font-[700] leading-[40px] text-[var(--auth-on-surface)]"
          >
            建立 TwoDo 帳號
          </h1>
          <p
            class="m-[0px] font-['Plus_Jakarta_Sans'] text-[18px] font-[400] leading-[28px] text-[var(--auth-on-surface-variant)]"
          >
            開始管理你們的任務與生活安排。
          </p>
        </header>

        <form
          class="flex flex-col gap-[24px]"
          novalidate
          @submit.prevent="handleSignUp"
        >
          <div class="flex flex-col gap-[16px]">
            <label class="flex flex-col gap-[4px]">
              <span
                class="px-[4px] font-['Plus_Jakarta_Sans'] text-[12px] font-[500] leading-[16px] text-[var(--auth-on-surface-variant)]"
              >
                暱稱
              </span>
              <input
                v-model="displayName"
                class="w-full rounded-lg border border-transparent bg-[var(--auth-surface-container)] px-[24px] py-[12px] font-['Plus_Jakarta_Sans'] text-[16px] font-[400] leading-[24px] text-[var(--auth-on-surface)] outline-none ring-[0px] transition-[background-color,box-shadow] duration-200 placeholder:text-[color:color-mix(in_srgb,var(--auth-outline)_60%,transparent)] focus:border-transparent focus:bg-[var(--auth-surface-container-lowest)] focus:shadow-[0_4px_12px_rgba(255,158,133,0.15)] focus:outline-none focus:ring-[2px] focus:ring-[var(--auth-primary-container)] focus:ring-offset-[0px] focus-visible:outline-none"
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
              <Transition
                enter-active-class="overflow-hidden transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]"
                enter-from-class="max-h-[0px] -translate-y-[4px] opacity-0"
                enter-to-class="max-h-[40px] translate-y-[0px] opacity-100"
                leave-active-class="overflow-hidden transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]"
                leave-from-class="max-h-[40px] translate-y-[0px] opacity-100"
                leave-to-class="max-h-[0px] -translate-y-[4px] opacity-0"
              >
                <p
                  v-if="shouldShowDisplayNameError"
                  id="register-display-name-error"
                  class="m-[0px] px-[4px] font-['Plus_Jakarta_Sans'] text-[12px] font-[500] leading-[16px] text-[var(--auth-error)]"
                >
                  {{ displayNameErrorMessage }}
                </p>
              </Transition>
            </label>

            <label class="flex flex-col gap-[4px]">
              <span
                class="px-[4px] font-['Plus_Jakarta_Sans'] text-[12px] font-[500] leading-[16px] text-[var(--auth-on-surface-variant)]"
              >
                電子信箱
              </span>
              <input
                v-model="email"
                class="w-full rounded-lg border border-transparent bg-[var(--auth-surface-container)] px-[24px] py-[12px] font-['Plus_Jakarta_Sans'] text-[16px] font-[400] leading-[24px] text-[var(--auth-on-surface)] outline-none ring-[0px] transition-[background-color,box-shadow] duration-200 placeholder:text-[color:color-mix(in_srgb,var(--auth-outline)_60%,transparent)] focus:border-transparent focus:bg-[var(--auth-surface-container-lowest)] focus:shadow-[0_4px_12px_rgba(255,158,133,0.15)] focus:outline-none focus:ring-[2px] focus:ring-[var(--auth-primary-container)] focus:ring-offset-[0px] focus-visible:outline-none"
                :class="{
                  'border-[var(--auth-error)] focus:ring-[var(--auth-error)]':
                    shouldShowEmailError,
                }"
                :aria-describedby="
                  shouldShowEmailError ? 'register-email-error' : undefined
                "
                :aria-invalid="shouldShowEmailError"
                autocomplete="email"
                placeholder="請輸入電子信箱"
                type="email"
                @blur="hasEmailBlurred = true"
              />
              <Transition
                enter-active-class="overflow-hidden transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]"
                enter-from-class="max-h-[0px] -translate-y-[4px] opacity-0"
                enter-to-class="max-h-[40px] translate-y-[0px] opacity-100"
                leave-active-class="overflow-hidden transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]"
                leave-from-class="max-h-[40px] translate-y-[0px] opacity-100"
                leave-to-class="max-h-[0px] -translate-y-[4px] opacity-0"
              >
                <p
                  v-if="shouldShowEmailError"
                  id="register-email-error"
                  class="m-[0px] px-[4px] font-['Plus_Jakarta_Sans'] text-[12px] font-[500] leading-[16px] text-[var(--auth-error)]"
                >
                  {{ emailErrorMessage }}
                </p>
              </Transition>
            </label>

            <label class="flex flex-col gap-[4px]">
              <span
                class="px-[4px] font-['Plus_Jakarta_Sans'] text-[12px] font-[500] leading-[16px] text-[var(--auth-on-surface-variant)]"
              >
                密碼
              </span>
              <input
                v-model="password"
                class="w-full rounded-lg border border-transparent bg-[var(--auth-surface-container)] px-[24px] py-[12px] font-['Plus_Jakarta_Sans'] text-[16px] font-[400] leading-[24px] text-[var(--auth-on-surface)] outline-none ring-[0px] transition-[background-color,box-shadow] duration-200 placeholder:text-[color:color-mix(in_srgb,var(--auth-outline)_60%,transparent)] focus:border-transparent focus:bg-[var(--auth-surface-container-lowest)] focus:shadow-[0_4px_12px_rgba(255,158,133,0.15)] focus:outline-none focus:ring-[2px] focus:ring-[var(--auth-primary-container)] focus:ring-offset-[0px] focus-visible:outline-none"
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
                :placeholder="`請輸入密碼，至少 ${PASSWORD_MIN_LENGTH} 個字元`"
                type="password"
                @blur="hasPasswordBlurred = true"
              />
              <Transition
                enter-active-class="overflow-hidden transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]"
                enter-from-class="max-h-[0px] -translate-y-[4px] opacity-0"
                enter-to-class="max-h-[40px] translate-y-[0px] opacity-100"
                leave-active-class="overflow-hidden transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]"
                leave-from-class="max-h-[40px] translate-y-[0px] opacity-100"
                leave-to-class="max-h-[0px] -translate-y-[4px] opacity-0"
              >
                <p
                  v-if="shouldShowPasswordError"
                  id="register-password-error"
                  class="m-[0px] px-[4px] font-['Plus_Jakarta_Sans'] text-[12px] font-[500] leading-[16px] text-[var(--auth-error)]"
                >
                  {{ passwordErrorMessage }}
                </p>
              </Transition>
            </label>
          </div>

          <div class="mt-[24px] flex flex-col items-center gap-[24px]">
            <button
              class="flex h-[56px] w-full items-center justify-center rounded-xl bg-[var(--auth-primary)] text-[14px] font-[600] leading-[20px] tracking-[0.01em] text-[var(--auth-on-primary)] shadow-[0_8px_24px_-6px_rgba(148,72,53,0.3)] transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
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

            <p
              class="m-[0px] font-['Plus_Jakarta_Sans'] text-[16px] font-[400] leading-[24px] text-[var(--auth-on-surface-variant)]"
            >
              已經有帳號了？
              <RouterLink
                class="font-['Plus_Jakarta_Sans'] text-[14px] font-[600] leading-[20px] tracking-[0.01em] text-[var(--auth-primary)] no-underline transition-colors"
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
