<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { useErrorToast } from "@/composables/useErrorToast";
import { showSuccessMessage } from "@/composables/useMessage";
import { useAuthStore } from "@/pinia/auth";
import { useEmailField } from "@/views/user/composables/useEmailField";

const authStore = useAuthStore();

useErrorToast(() => authStore.errorMessage);

const isSubmitting = ref(false);
const isViewActive = ref(true);
const isSent = ref(false);
const hasSubmitted = ref(false);

const {
  email,
  trimmedEmail,
  emailErrorMessage,
  hasEmailBlurred,
  shouldShowEmailError,
  resetEmail,
} = useEmailField(hasSubmitted);

const canSubmit = computed(() => !emailErrorMessage.value);

const handleSubmit = async () => {
  if (isSubmitting.value) return;

  hasSubmitted.value = true;

  if (!canSubmit.value) return;

  try {
    isSubmitting.value = true;
    await authStore.sendPasswordReset(trimmedEmail.value);
    isSent.value = true;
    showSuccessMessage("重置連結已寄出");
  } catch {
    if (!isViewActive.value) {
      authStore.clearError();
    }
  } finally {
    isSubmitting.value = false;
  }
};

const initForm = () => {
  isSent.value = false;
  hasSubmitted.value = false;
  resetEmail();
};

onMounted(() => {
  isViewActive.value = true;
  initForm();
  authStore.clearError();
});

onBeforeUnmount(() => {
  isViewActive.value = false;
  isSubmitting.value = false;
  authStore.clearError();
});
</script>

<template>
  <main
    class="relative flex min-h-[max(884px,100dvh)] items-center justify-center overflow-hidden bg-[var(--auth-background)] px-[20px] py-[40px] text-[var(--auth-on-background,var(--auth-on-surface))] antialiased md:p-[48px]"
  >
    <div class="absolute inset-[0px] z-0">
      <div
        class="h-full w-full bg-[image:var(--auth-login-bg-image)] bg-cover bg-center opacity-30"
        aria-hidden="true"
      />
      <div
        class="absolute inset-[0px] bg-gradient-to-tr from-[rgb(255_248_246_/_0.9)] via-[rgb(255_248_246_/_0.7)] to-[rgb(255_241_236_/_0.8)] mix-blend-overlay"
      />
      <div
        class="absolute inset-[0px] bg-[rgb(255_248_246_/_0.6)] backdrop-blur-[60px]"
      />
    </div>

    <section
      class="relative z-10 flex w-full max-w-[460px] flex-col gap-[40px] rounded-[32px] border border-[rgb(255_241_236_/_0.5)] bg-[var(--auth-surface-container-lowest)] p-[40px] shadow-[0_16px_60px_-15px_rgba(148,72,53,0.1)] md:p-[64px]"
      aria-labelledby="reset-password-title"
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
            class="material-symbols-outlined fill text-[24px] text-[var(--auth-primary-container)]"
            aria-hidden="true"
            >favorite</span
          >
          <span class="text-[24px] font-[600] leading-[32px] tracking-tight"
            >TwoDo</span
          >
        </RouterLink>

        <h1
          id="reset-password-title"
          class="m-[0px] text-[32px] font-[700] leading-[40px] tracking-[-0.01em] text-[var(--auth-on-surface)]"
        >
          {{ isSent ? "請查看你的信箱" : "忘記密碼" }}
        </h1>
        <p
          v-if="!isSent"
          class="m-[0px] text-[16px] font-[400] leading-[24px] text-[var(--auth-on-surface-variant)]"
        >
          輸入你的電子信箱，我們會寄一封重設連結給你。
        </p>
      </header>

      <template v-if="!isSent">
        <form
          class="flex flex-col gap-[16px]"
          novalidate
          @submit.prevent="handleSubmit"
        >
          <label class="flex flex-col gap-[8px]">
            <span
              class="pl-[4px] text-[12px] font-[500] leading-[16px] text-[var(--auth-on-surface-variant)]"
              >電子信箱</span
            >
            <input
              v-model="email"
              class="h-[56px] rounded-xl border border-transparent bg-[var(--auth-surface-container)] px-[24px] text-[16px] font-[400] leading-[24px] text-[var(--auth-on-surface)] outline-none ring-[0px] transition-[background-color,box-shadow] duration-200 placeholder:text-[rgb(84_67_62_/_0.5)] focus:border-transparent focus:bg-[var(--auth-surface-container-lowest)] focus:shadow-[0_4px_12px_rgba(255,158,133,0.15)] focus:outline-none focus:ring-[2px] focus:ring-[var(--auth-primary-container)] focus:ring-offset-[0px] focus-visible:outline-none"
              :class="{
                'border-[var(--auth-error)] focus:ring-[var(--auth-error)]':
                  shouldShowEmailError,
              }"
              :aria-describedby="
                shouldShowEmailError ? 'forgot-email-error' : undefined
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
                id="forgot-email-error"
                class="m-[0px] px-[4px] text-[12px] font-[500] leading-[16px] text-[var(--auth-error)]"
              >
                {{ emailErrorMessage }}
              </p>
            </Transition>
          </label>

          <button
            class="mt-[8px] flex h-[56px] w-full items-center justify-center rounded-xl bg-[var(--auth-primary)] text-[14px] font-[600] leading-[20px] tracking-[0.01em] text-[var(--auth-on-primary)] shadow-[0_8px_24px_-6px_rgba(148,72,53,0.3)] transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? "寄送中..." : "寄送重設連結" }}
          </button>
        </form>
      </template>

      <template v-else>
        <div class="flex flex-col gap-[16px]">
          <p
            class="m-[0px] text-[16px] font-[400] leading-[1.55] text-[var(--auth-on-surface-variant)]"
          >
            我們已經將重設密碼連結寄到
            <span
              class="break-words font-[700] text-[var(--auth-on-surface)]"
              >{{ trimmedEmail }}</span
            >
            。請點擊信件中的連結來設定新密碼。
          </p>
          <div
            class="flex gap-[12px] rounded-[1.35rem] border border-[color:color-mix(in_srgb,var(--auth-outline-variant)_72%,transparent)] bg-[var(--auth-surface-container-low)] p-[16px] text-left"
          >
            <span
              class="material-symbols-outlined mt-[0.1rem] flex-none text-[20px] text-[var(--auth-primary)]"
              aria-hidden="true"
              >tips_and_updates</span
            >
            <p
              class="m-[0px] text-[14px] font-[600] leading-[1.35rem] text-[var(--auth-on-surface-variant)]"
            >
              如果沒有看到信件，請先檢查垃圾郵件或促銷分類。
            </p>
          </div>
        </div>
      </template>

      <div class="pt-[4px]">
        <RouterLink
          class="flex items-center justify-center gap-[6px] text-[14px] font-[600] leading-[20px] tracking-[0.01em] text-[var(--auth-primary)] no-underline"
          :to="{ name: 'login' }"
        >
          <span class="material-symbols-outlined text-[18px]" aria-hidden="true"
            >arrow_back</span
          >
          返回登入
        </RouterLink>
      </div>
    </section>
  </main>
</template>

<spec lang="md">
## 1. 說明

- 提供忘記密碼申請頁，讓使用者輸入電子信箱並接收重設密碼連結。
- 送出成功後顯示寄送完成狀態與提示。

## 2. 功能需求

- 1. 使用者輸入電子信箱並送出表單。
- 2. 若電子信箱為空或格式不正確，顯示欄位錯誤並不送出申請。
- 3. 欄位驗證通過後呼叫密碼重設信寄送流程。
- 4. 寄送成功後切換為完成畫面，顯示已寄送的電子信箱與檢查垃圾郵件提示。
- A1：提交中時停用送出按鈕並顯示寄送中狀態。
- A2：使用者可透過返回登入連結回到登入頁。

## 3. 對接口

- props：無。
- emit：無。
- defineModel：無。
- 外部依賴：auth store 提供密碼重設信寄送、錯誤訊息與錯誤清理；訊息工具顯示寄送成功提示。
</spec>
