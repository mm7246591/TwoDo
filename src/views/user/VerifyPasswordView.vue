<script setup lang="ts">
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { firebaseAuth } from "@/services/firebase/auth";
import { withGlobalLoading } from "@/composables/useGlobalLoading";
import { showSuccessMessage } from "@/composables/useMessage";

/**
 * 新密碼需要符合的最短長度，與表單驗證訊息共用同一個限制。
 */
const PASSWORD_MIN_LENGTH = 8;

type ResetStatus = "processing" | "form" | "submitting" | "success" | "error";

const route = useRoute();

const status = ref<ResetStatus>("processing");
const oobCode = ref("");

const newPassword = ref("");
const confirmPassword = ref("");
const hasFormSubmitted = ref(false);
const hasPasswordBlurred = ref(false);
const hasConfirmPasswordBlurred = ref(false);

const isFormActive = computed(
  () => status.value === "form" || status.value === "submitting",
);

const trimmedNewPassword = computed(() => newPassword.value.trim());
const trimmedConfirmPassword = computed(() => confirmPassword.value.trim());

const passwordErrorMessage = computed(() => {
  if (!trimmedNewPassword.value) return "請輸入新密碼";
  if (trimmedNewPassword.value.length < PASSWORD_MIN_LENGTH)
    return `密碼至少需要 ${PASSWORD_MIN_LENGTH} 個字元`;
  return "";
});
const confirmPasswordErrorMessage = computed(() => {
  if (!trimmedConfirmPassword.value) return "請再次輸入新密碼";
  if (trimmedConfirmPassword.value !== trimmedNewPassword.value)
    return "兩次輸入的密碼不相符";
  return "";
});
const canSubmit = computed(
  () => !passwordErrorMessage.value && !confirmPasswordErrorMessage.value,
);
const shouldShowPasswordError = computed(
  () =>
    Boolean(passwordErrorMessage.value) &&
    (hasFormSubmitted.value || hasPasswordBlurred.value),
);
const shouldShowConfirmPasswordError = computed(
  () =>
    Boolean(confirmPasswordErrorMessage.value) &&
    (hasFormSubmitted.value || hasConfirmPasswordBlurred.value),
);

const cardTitle = computed(() => {
  if (status.value === "success") return "密碼重設成功";
  if (status.value === "error") return "連結無法使用";
  if (isFormActive.value) return "設定新密碼";
  return "驗證中";
});

const cardEyebrow = computed(() => {
  if (status.value === "success") return "完成設定";
  if (status.value === "error") return "需要重新確認";
  if (isFormActive.value) return "重設密碼";
  return "驗證中";
});

const iconName = computed(() => {
  if (status.value === "success") return "verified";
  if (status.value === "error") return "lock_open";
  if (isFormActive.value) return "lock_reset";
  return "hourglass_top";
});

const feedbackMessage = computed(() => {
  if (status.value === "success")
    return "密碼已完成重設，請回到 App 繼續使用。";
  if (status.value === "error")
    return "這個重設密碼連結已過期或無效，請重新申請密碼重設信。";
  if (status.value === "processing") return "正在驗證重設連結...";
  return "";
});

const handleSubmit = async () => {
  if (status.value === "submitting") return;

  hasFormSubmitted.value = true;

  if (!canSubmit.value) return;

  try {
    status.value = "submitting";
    await confirmPasswordReset(
      firebaseAuth,
      oobCode.value,
      trimmedNewPassword.value,
    );
    showSuccessMessage("密碼重設成功");
    status.value = "success";
  } catch {
    status.value = "error";
  }
};

onMounted(async () => {
  hasFormSubmitted.value = false;
  hasPasswordBlurred.value = false;
  hasConfirmPasswordBlurred.value = false;

  const rawCode =
    typeof route.query.oobCode === "string" ? route.query.oobCode : "";

  if (!rawCode) {
    status.value = "error";
    return;
  }

  oobCode.value = rawCode;

  try {
    await withGlobalLoading(() =>
      verifyPasswordResetCode(firebaseAuth, rawCode),
    );
    status.value = "form";
  } catch {
    status.value = "error";
  }
});

onBeforeUnmount(() => {
  status.value = "processing";
});
</script>

<template>
  <main
    class="relative flex min-h-[max(884px,100dvh)] items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_16%_14%,rgba(255,219,210,0.72)_0_8rem,transparent_8.25rem),radial-gradient(circle_at_84%_82%,rgba(179,239,216,0.54)_0_8rem,transparent_8.25rem),linear-gradient(180deg,var(--auth-surface-bright)_0%,var(--auth-surface-container-low)_100%)] px-[20px] pb-[max(2rem,calc(env(safe-area-inset-bottom,0px)+1.25rem))] pt-[max(2rem,calc(env(safe-area-inset-top,0px)+1.25rem))] font-['Plus_Jakarta_Sans','Noto_Sans_TC',sans-serif] text-[var(--auth-on-surface)] sm:px-[max(3rem,calc(env(safe-area-inset-left,0px)+2rem))] sm:pb-[max(3rem,calc(env(safe-area-inset-bottom,0px)+2rem))] sm:pt-[max(3rem,calc(env(safe-area-inset-top,0px)+2rem))] sm:[padding-right:max(3rem,calc(env(safe-area-inset-right,0px)+2rem))]"
  >
    <section
      class="relative z-[1] flex w-full max-w-[28.75rem] flex-col gap-[32px] rounded-[32px] border border-[color:color-mix(in_srgb,var(--auth-primary-fixed)_58%,transparent)] bg-[rgba(255,255,255,0.94)] px-[24px] py-[36px] text-center shadow-[0_20px_56px_rgba(118,69,52,0.12),inset_0_1px_0_rgba(255,255,255,0.82)] sm:p-[56px]"
      aria-labelledby="reset-password-title"
    >
      <header class="flex flex-col items-center gap-[16px]">
        <div
          class="grid h-[72px] w-[72px] flex-none place-items-center rounded-full bg-[radial-gradient(circle_at_32%_24%,rgba(255,255,255,0.82),transparent_42%),linear-gradient(135deg,var(--auth-primary-fixed),var(--auth-primary-container))] text-[var(--auth-primary)] shadow-[0_16px_34px_rgba(148,72,53,0.18),inset_0_1px_0_rgba(255,255,255,0.72)]"
          :class="{
            'bg-[radial-gradient(circle_at_32%_24%,rgba(255,255,255,0.82),transparent_42%),linear-gradient(135deg,var(--auth-secondary-fixed),var(--auth-secondary-container))] text-[#125040]':
              status === 'success',
            'bg-[radial-gradient(circle_at_32%_24%,rgba(255,255,255,0.82),transparent_42%),linear-gradient(135deg,#ffe0da,var(--auth-error-container))] text-[var(--auth-error)]':
              status === 'error',
          }"
          aria-hidden="true"
        >
          <span
            class="material-symbols-outlined fill text-[36px] [font-variation-settings:'FILL'_1,'wght'_500,'GRAD'_0,'opsz'_24]"
          >
            {{ iconName }}
          </span>
        </div>

        <div class="min-w-[0px]">
          <p
            class="mb-[8px] mt-[0px] text-[14px] font-[700] leading-[20px] tracking-[0.01em] text-[var(--auth-primary)]"
          >
            {{ cardEyebrow }}
          </p>
          <h1
            id="reset-password-title"
            class="m-[0px] text-[32px] font-[800] leading-[40px] tracking-[-0.02em] text-[var(--auth-on-surface)]"
          >
            {{ cardTitle }}
          </h1>
        </div>
      </header>

      <!-- 新密碼表單 -->
      <template v-if="isFormActive">
        <form
          class="flex flex-col gap-[16px] text-left"
          novalidate
          @submit.prevent="handleSubmit"
        >
          <label class="flex flex-col gap-[8px]">
            <span
              class="pl-[4px] text-[12px] font-[500] leading-[16px] text-[var(--auth-on-surface-variant)]"
              >新密碼</span
            >
            <input
              v-model="newPassword"
              class="h-[56px] rounded-xl border border-transparent bg-[color:color-mix(in_srgb,var(--auth-primary-fixed)_10%,white)] px-[24px] text-[16px] font-[400] leading-[24px] text-[var(--auth-on-surface)] outline-none ring-[0px] transition-[background-color,box-shadow] duration-200 placeholder:text-[rgb(84_67_62_/_0.5)] focus:border-transparent focus:bg-[rgba(255,255,255,0.94)] focus:shadow-[0_4px_12px_rgba(255,158,133,0.15)] focus:outline-none focus:ring-[2px] focus:ring-[var(--auth-primary-container)] focus:ring-offset-[0px] focus-visible:outline-none"
              :class="{
                'border-[var(--auth-error)] focus:ring-[var(--auth-error)]':
                  shouldShowPasswordError,
              }"
              :aria-describedby="
                shouldShowPasswordError ? 'new-password-error' : undefined
              "
              :aria-invalid="shouldShowPasswordError"
              :placeholder="`請輸入新密碼，至少 ${PASSWORD_MIN_LENGTH} 個字元`"
              autocomplete="new-password"
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
                id="new-password-error"
                class="m-[0px] px-[4px] text-[12px] font-[500] leading-[16px] text-[var(--auth-error)]"
              >
                {{ passwordErrorMessage }}
              </p>
            </Transition>
          </label>

          <label class="flex flex-col gap-[8px]">
            <span
              class="pl-[4px] text-[12px] font-[500] leading-[16px] text-[var(--auth-on-surface-variant)]"
              >確認新密碼</span
            >
            <input
              v-model="confirmPassword"
              class="h-[56px] rounded-xl border border-transparent bg-[color:color-mix(in_srgb,var(--auth-primary-fixed)_10%,white)] px-[24px] text-[16px] font-[400] leading-[24px] text-[var(--auth-on-surface)] outline-none ring-[0px] transition-[background-color,box-shadow] duration-200 placeholder:text-[rgb(84_67_62_/_0.5)] focus:border-transparent focus:bg-[rgba(255,255,255,0.94)] focus:shadow-[0_4px_12px_rgba(255,158,133,0.15)] focus:outline-none focus:ring-[2px] focus:ring-[var(--auth-primary-container)] focus:ring-offset-[0px] focus-visible:outline-none"
              :class="{
                'border-[var(--auth-error)] focus:ring-[var(--auth-error)]':
                  shouldShowConfirmPasswordError,
              }"
              :aria-describedby="
                shouldShowConfirmPasswordError
                  ? 'confirm-password-error'
                  : undefined
              "
              :aria-invalid="shouldShowConfirmPasswordError"
              autocomplete="new-password"
              placeholder="請再次輸入新密碼"
              type="password"
              @blur="hasConfirmPasswordBlurred = true"
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
                v-if="shouldShowConfirmPasswordError"
                id="confirm-password-error"
                class="m-[0px] px-[4px] text-[12px] font-[500] leading-[16px] text-[var(--auth-error)]"
              >
                {{ confirmPasswordErrorMessage }}
              </p>
            </Transition>
          </label>

          <button
            class="mt-[8px] flex h-[56px] w-full items-center justify-center rounded-xl bg-[var(--auth-primary)] text-[14px] font-[600] leading-[20px] tracking-[0.01em] text-[var(--auth-on-primary)] shadow-[0_8px_24px_-6px_rgba(148,72,53,0.3)] transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            :disabled="status === 'submitting'"
          >
            {{ status === "submitting" ? "設定中..." : "設定新密碼" }}
          </button>
        </form>
      </template>

      <!-- 完成 / 錯誤 / 處理中 -->
      <template v-else>
        <div class="flex flex-col gap-[16px]">
          <p
            class="m-[0px] text-[16px] font-[400] leading-[1.55] text-[var(--auth-on-surface-variant)]"
          >
            {{ feedbackMessage }}
          </p>

          <div
            v-if="status === 'processing'"
            class="h-[8px] overflow-hidden rounded-full bg-[color:color-mix(in_srgb,var(--auth-primary-fixed)_68%,white)]"
            aria-hidden="true"
          >
            <span
              class="block h-full w-[38%] animate-pulse rounded-full bg-[linear-gradient(90deg,var(--auth-primary),var(--auth-primary-container))]"
            />
          </div>
        </div>
      </template>
    </section>
  </main>
</template>

<spec lang="md">
## 1. 說明

- 處理 Firebase 密碼重設連結，驗證連結後讓使用者設定新密碼。
- 依連結與提交結果顯示驗證中、表單、成功或錯誤狀態。

## 2. 功能需求

- 1. 進入頁面時讀取路由查詢中的 oobCode 並驗證重設密碼連結。
- 2. 若 oobCode 缺漏、過期或無效，顯示連結無法使用狀態與重新申請提示。
- 3. 若連結有效，顯示新密碼與確認新密碼欄位。
- 4. 使用者送出時，密碼必須符合最小長度且兩次輸入一致。
- 5. 密碼重設成功後顯示成功訊息，完成頁不提供額外導頁按鈕。
- A1：提交中時停用送出按鈕並顯示設定中狀態。
- A2：處理中狀態顯示進度提示，避免使用者誤以為頁面停滯。

## 3. 對接口

- props：無。
- emit：無。
- defineModel：無。
- 外部依賴：Firebase Auth 驗證與確認重設密碼；全域 loading 包裝驗證流程；訊息工具顯示成功提示。
</spec>
