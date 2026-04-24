<script setup lang="ts">
import { applyActionCode } from "firebase/auth";
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useAuthStore } from "@/pinia/auth";
import { emitEmailVerificationSignal } from "@/services/emailVerificationSignal";
import { firebaseAuth } from "@/services/firebase/auth";
import { showSuccessMessage } from "@/services/uiFeedback";

type ActionStatus = "processing" | "success" | "error";

const authStore = useAuthStore();
const route = useRoute();

const status = ref<ActionStatus>("processing");
const feedbackMessage = ref("正在確認你的信箱驗證狀態...");

const isProcessing = computed(() => status.value === "processing");
const isSuccessful = computed(() => status.value === "success");
const cardTitle = computed(() => {
  if (status.value === "success") {
    return "信箱驗證完成";
  }

  if (status.value === "error") {
    return "驗證連結無法使用";
  }

  return "正在驗證信箱";
});
const cardEyebrow = computed(() => {
  if (status.value === "success") {
    return "完成設定";
  }

  if (status.value === "error") {
    return "需要重新確認";
  }

  return "驗證中";
});
const iconName = computed(() => {
  if (status.value === "success") {
    return "verified";
  }

  if (status.value === "error") {
    return "mark_email_unread";
  }

  return "hourglass_top";
});

const handleEmailVerification = async (actionCode: string) => {
  try {
    await applyActionCode(firebaseAuth, actionCode);
    await authStore.refreshCurrentUser();
    emitEmailVerificationSignal();
    showSuccessMessage("信箱驗證完成");
    status.value = "success";
    feedbackMessage.value = "信箱已完成驗證。請回到原畫面繼續使用 App。";
  } catch {
    status.value = "error";
    feedbackMessage.value =
      "這個驗證連結可能已過期、已被使用，或不是有效的驗證網址。請重新登入後再寄送一次驗證信。";
  }
};

onMounted(async () => {
  authStore.clearError();

  const mode = typeof route.query.mode === "string" ? route.query.mode : "";
  const actionCode =
    typeof route.query.oobCode === "string" ? route.query.oobCode : "";

  if (mode !== "verifyEmail" || !actionCode) {
    status.value = "error";
    feedbackMessage.value =
      "驗證連結缺少必要的驗證資訊，請回到 App 重新寄送驗證信。";
    return;
  }

  await handleEmailVerification(actionCode);
});

onBeforeUnmount(() => {
  authStore.clearError();
});
</script>

<template>
  <main
    class="relative flex min-h-[max(884px,100dvh)] items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_16%_14%,rgba(255,219,210,0.72)_0_8rem,transparent_8.25rem),radial-gradient(circle_at_84%_82%,rgba(179,239,216,0.54)_0_8rem,transparent_8.25rem),linear-gradient(180deg,var(--auth-surface-bright)_0%,var(--auth-surface-container-low)_100%)] px-[20px] pb-[max(2rem,calc(var(--safe-bottom)+1.25rem))] pt-[max(2rem,calc(var(--safe-top)+1.25rem))] font-['Plus_Jakarta_Sans','Noto_Sans_TC',sans-serif] text-[var(--auth-on-surface)] sm:px-[max(3rem,calc(var(--safe-left)+2rem))] sm:pb-[max(3rem,calc(var(--safe-bottom)+2rem))] sm:pt-[max(3rem,calc(var(--safe-top)+2rem))] sm:[padding-right:max(3rem,calc(var(--safe-right)+2rem))]"
  >
    <section
      class="relative z-[1] flex w-full max-w-[28.75rem] flex-col gap-[32px] rounded-[32px] border border-[color:color-mix(in_srgb,var(--auth-primary-fixed)_58%,transparent)] bg-[rgba(255,255,255,0.94)] px-[24px] py-[36px] text-center shadow-[0_20px_56px_rgba(118,69,52,0.12),inset_0_1px_0_rgba(255,255,255,0.82)] sm:p-[56px]"
      aria-labelledby="email-action-title"
    >
      <header class="flex flex-col items-center gap-[16px]">
        <div
          class="grid h-[72px] w-[72px] flex-none place-items-center rounded-full bg-[radial-gradient(circle_at_32%_24%,rgba(255,255,255,0.82),transparent_42%),linear-gradient(135deg,var(--auth-primary-fixed),var(--auth-primary-container))] text-[var(--auth-primary)] shadow-[0_16px_34px_rgba(148,72,53,0.18),inset_0_1px_0_rgba(255,255,255,0.72)]"
          :class="{
            'bg-[radial-gradient(circle_at_32%_24%,rgba(255,255,255,0.82),transparent_42%),linear-gradient(135deg,var(--auth-secondary-fixed),var(--auth-secondary-container))] text-[#125040]':
              isSuccessful,
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
            class="mb-[8px] mt-[0px] text-[14px] font-bold leading-[20px] tracking-[0.01em] text-[var(--auth-primary)]"
          >
            {{ cardEyebrow }}
          </p>
          <h1
            id="email-action-title"
            class="m-0 text-[32px] font-extrabold leading-[40px] tracking-[-0.02em] text-[var(--auth-on-surface)]"
          >
            {{ cardTitle }}
          </h1>
        </div>
      </header>

      <div class="flex flex-col gap-[16px]">
        <p
          class="m-0 text-[16px] font-normal leading-[1.55] text-[var(--auth-on-surface-variant)]"
        >
          {{ feedbackMessage }}
        </p>

        <div
          v-if="isProcessing"
          class="h-[8px] overflow-hidden rounded-full bg-[color:color-mix(in_srgb,var(--auth-primary-fixed)_68%,white)]"
          aria-hidden="true"
        >
          <span
            class="block h-full w-[38%] animate-pulse rounded-full bg-[linear-gradient(90deg,var(--auth-primary),var(--auth-primary-container))]"
          />
        </div>
      </div>
    </section>
  </main>
</template>
