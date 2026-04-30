<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useErrorToast } from "@/composables/useErrorToast";
import { useAuthStore } from "@/pinia/auth";
import { useUserStore } from "@/pinia/user";
import { resolvePostAuthRouteName } from "@/router/authNavigation";
import { subscribeEmailVerificationSignal } from "@/composables/useEmailVerificationSignal";
import { showErrorMessage, showSuccessMessage } from "@/composables/useMessage";

const authStore = useAuthStore();
const userStore = useUserStore();
const router = useRouter();

useErrorToast(() => authStore.errorMessage);

const isChecking = ref(false);
const isResending = ref(false);
const isLeaving = ref(false);
const isViewActive = ref(true);
let unsubscribeEmailVerificationSignal: (() => void) | null = null;

const userEmail = computed(() => authStore.getUserEmail || "你的信箱");
const isActionPending = computed(
  () => isChecking.value || isResending.value || isLeaving.value,
);

const syncVerificationStatus = async ({ silent = false } = {}) => {
  if (isActionPending.value) {
    return false;
  }

  try {
    isChecking.value = true;
    const session = await authStore.refreshCurrentUser();

    if (!session) {
      await router.replace({ name: "login" });
      return true;
    }

    if (session.requiresEmailVerification) {
      if (!silent) {
        showErrorMessage("尚未完成驗證，請先到信箱點擊驗證連結。");
      }

      return false;
    }

    showSuccessMessage("信箱驗證完成");
    await router.replace({
      name: await resolvePostAuthRouteName(
        authStore.getUserUid,
        userStore.profile,
      ),
    });
    return true;
  } catch {
    if (!isViewActive.value) {
      authStore.clearError();
    }

    return false;
  } finally {
    isChecking.value = false;
  }
};

const handleWindowFocus = () => {
  void syncVerificationStatus({ silent: true });
};

const handleVisibilityChange = () => {
  if (document.visibilityState === "visible") {
    void syncVerificationStatus({ silent: true });
  }
};

onMounted(() => {
  isViewActive.value = true;
  authStore.clearError();
  window.addEventListener("focus", handleWindowFocus);
  document.addEventListener("visibilitychange", handleVisibilityChange);
  unsubscribeEmailVerificationSignal = subscribeEmailVerificationSignal(() => {
    void syncVerificationStatus({ silent: true });
  });
  void syncVerificationStatus({ silent: true });
});

onBeforeUnmount(() => {
  isViewActive.value = false;
  isChecking.value = false;
  isResending.value = false;
  isLeaving.value = false;
  window.removeEventListener("focus", handleWindowFocus);
  document.removeEventListener("visibilitychange", handleVisibilityChange);
  unsubscribeEmailVerificationSignal?.();
  unsubscribeEmailVerificationSignal = null;
  authStore.clearError();
});

const handleResendVerification = async () => {
  if (isActionPending.value) {
    return;
  }

  try {
    isResending.value = true;
    const result = await authStore.resendVerificationEmail();

    if (result === "already-verified") {
      await syncVerificationStatus({ silent: true });
      return;
    }

    showSuccessMessage("驗證信已重新寄出");
  } catch {
    if (!isViewActive.value) {
      authStore.clearError();
    }
  } finally {
    isResending.value = false;
  }
};

const handleBackToLogin = async () => {
  if (isActionPending.value) {
    return;
  }

  try {
    isLeaving.value = true;
    await authStore.signOutUser();
    await router.replace({ name: "login" });
  } catch {
    if (!isViewActive.value) {
      authStore.clearError();
    }
  } finally {
    isLeaving.value = false;
  }
};
</script>

<template>
  <main
    class="relative flex min-h-[max(884px,100dvh)] items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_18%_12%,rgba(255,219,210,0.7)_0_7.5rem,transparent_7.75rem),radial-gradient(circle_at_88%_86%,rgba(179,239,216,0.5)_0_8.5rem,transparent_8.75rem),linear-gradient(180deg,var(--auth-surface-bright)_0%,var(--auth-surface-container-low)_100%)] px-[20px] pb-[max(2rem,calc(env(safe-area-inset-bottom,0px)+1.25rem))] pt-[max(2rem,calc(env(safe-area-inset-top,0px)+1.25rem))] font-['Plus_Jakarta_Sans','Noto_Sans_TC',sans-serif] text-[var(--auth-on-surface)] sm:px-[max(3rem,calc(env(safe-area-inset-left,0px)+2rem))] sm:pb-[max(3rem,calc(env(safe-area-inset-bottom,0px)+2rem))] sm:pt-[max(3rem,calc(env(safe-area-inset-top,0px)+2rem))] sm:[padding-right:max(3rem,calc(env(safe-area-inset-right,0px)+2rem))]"
  >
    <section
      class="relative z-[1] flex w-full max-w-[28.75rem] flex-col gap-[32px] rounded-[32px] border border-[color:color-mix(in_srgb,var(--auth-primary-fixed)_58%,transparent)] bg-[rgba(255,255,255,0.92)] px-[24px] py-[36px] text-center shadow-[0_20px_56px_rgba(118,69,52,0.12),inset_0_1px_0_rgba(255,255,255,0.82)] sm:p-[56px]"
      aria-labelledby="verify-email-title"
    >
      <header class="flex flex-col items-center gap-[16px]">
        <div
          class="grid h-[72px] w-[72px] flex-none place-items-center rounded-full bg-[radial-gradient(circle_at_32%_24%,rgba(255,255,255,0.82),transparent_42%),linear-gradient(135deg,var(--auth-primary-fixed),var(--auth-primary-container))] text-[var(--auth-primary)] shadow-[0_16px_34px_rgba(148,72,53,0.18),inset_0_1px_0_rgba(255,255,255,0.72)]"
          aria-hidden="true"
        >
          <span
            class="material-symbols-outlined fill text-[36px] [font-variation-settings:'FILL'_1,'wght'_500,'GRAD'_0,'opsz'_24]"
          >
            mark_email_read
          </span>
        </div>

        <div class="min-w-[0px]">
          <p
            class="mb-[8px] mt-[0px] text-[14px] font-[700] leading-[20px] tracking-[0.01em] text-[var(--auth-primary)]"
          >
            差最後一步
          </p>
          <h1
            id="verify-email-title"
            class="m-[0px] text-[32px] font-[800] leading-[40px] tracking-[-0.02em] text-[var(--auth-on-surface)]"
          >
            請驗證你的信箱
          </h1>
        </div>
      </header>

      <div class="flex flex-col gap-[16px]">
        <p
          class="m-[0px] text-[16px] font-[400] leading-[1.55] text-[var(--auth-on-surface-variant)]"
        >
          我們已經將驗證信寄到
          <span class="break-words font-[700] text-[var(--auth-on-surface)]">
            {{ userEmail }}
          </span>
          。請先點擊信件中的驗證連結，再回到這裡繼續。
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
            如果沒有看到信件，請先檢查垃圾郵件或促銷分類，再重新寄送驗證信。
          </p>
        </div>

        <p
          class="m-[0px] text-[14px] font-[700] leading-[1.35rem] text-[var(--auth-primary)]"
        >
          {{ isChecking ? "正在重新檢查..." : "完成驗證後，點這裡重新檢查。" }}
        </p>
      </div>

      <div class="flex flex-col gap-[12px]">
        <button
          class="inline-flex min-h-[52px] w-full items-center justify-center rounded-full bg-[var(--auth-surface-container)] px-[20px] text-[14px] font-[700] leading-[20px] tracking-[0.01em] text-[var(--auth-primary)] transition-[transform,opacity] duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          type="button"
          :disabled="isActionPending"
          @click="handleResendVerification"
        >
          {{ isResending ? "重新寄送中..." : "重新寄送驗證信" }}
        </button>

        <button
          class="inline-flex min-h-[52px] w-full items-center justify-center rounded-full border border-[color:color-mix(in_srgb,var(--auth-outline-variant)_74%,transparent)] bg-[var(--auth-surface-container-lowest)] px-[20px] text-[14px] font-[700] leading-[20px] tracking-[0.01em] text-[var(--auth-on-surface-variant)] shadow-[inset_0_1px_0_rgba(255,255,255,0.78)] transition-[transform,opacity] duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          type="button"
          :disabled="isActionPending"
          @click="handleBackToLogin"
        >
          {{ isLeaving ? "返回中..." : "回到登入" }}
        </button>
      </div>
    </section>
  </main>
</template>
