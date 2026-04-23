<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useErrorToast } from "@/composables/useErrorToast";
import { useAuthStore } from "@/pinia/auth";
import { useUserStore } from "@/pinia/user";
import { showErrorMessage, showSuccessMessage } from "@/services/uiFeedback";
import { getUserProfile } from "@/services/userService";

const authStore = useAuthStore();
const userStore = useUserStore();
const router = useRouter();

useErrorToast(() => authStore.errorMessage);

const isChecking = ref(false);
const isResending = ref(false);
const isLeaving = ref(false);
const isViewActive = ref(true);

const userEmail = computed(() => authStore.getUserEmail || "你的信箱");
const isActionPending = computed(
  () => isChecking.value || isResending.value || isLeaving.value,
);

onMounted(() => {
  isViewActive.value = true;
  authStore.clearError();
});

onBeforeUnmount(() => {
  isViewActive.value = false;
  isChecking.value = false;
  isResending.value = false;
  isLeaving.value = false;
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

const handleCheckVerification = async () => {
  if (isActionPending.value) {
    return;
  }

  try {
    isChecking.value = true;
    const session = await authStore.refreshCurrentUser();

    if (!session) {
      await router.replace({ name: "login" });
      return;
    }

    if (session.requiresEmailVerification) {
      showErrorMessage("還沒有完成驗證，請先點擊信箱中的驗證連結。");
      return;
    }

    showSuccessMessage("信箱驗證完成");
    await router.replace({ name: await getPostAuthRouteName() });
  } catch {
    if (!isViewActive.value) {
      authStore.clearError();
    }
  } finally {
    isChecking.value = false;
  }
};

const handleResendVerification = async () => {
  if (isActionPending.value) {
    return;
  }

  try {
    isResending.value = true;
    await authStore.resendVerificationEmail();
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
  <main class="verify-email-page">
    <section
      class="verify-email-card"
      aria-labelledby="verify-email-title"
    >
      <header class="verify-email-card__header">
        <div class="verify-email-card__icon" aria-hidden="true">
          <span class="material-symbols-outlined fill">
            mark_email_read
          </span>
        </div>

        <div class="verify-email-card__title-group">
          <p class="verify-email-card__eyebrow">
            差最後一步
          </p>
          <h1 id="verify-email-title" class="verify-email-card__title">
            請驗證你的信箱
          </h1>
        </div>
      </header>

      <div class="verify-email-card__body">
        <p class="verify-email-card__message">
          我們已經將驗證信寄到
          <span>
            {{ userEmail }}
          </span>
          。請先點擊信件中的驗證連結，再回到這裡繼續。
        </p>

        <div class="verify-email-card__hint">
          <span
            class="material-symbols-outlined"
            aria-hidden="true"
            >tips_and_updates</span
          >
          <p>
            如果沒有看到信件，請先檢查垃圾郵件或促銷分類，再重新寄送驗證信。
          </p>
        </div>
      </div>

      <div class="verify-email-card__actions">
        <button
          class="verify-email-card__button verify-email-card__button--primary"
          type="button"
          :disabled="isActionPending"
          @click="handleCheckVerification"
        >
          {{ isChecking ? "確認中..." : "我已完成驗證" }}
        </button>

        <button
          class="verify-email-card__button verify-email-card__button--secondary"
          type="button"
          :disabled="isActionPending"
          @click="handleResendVerification"
        >
          {{ isResending ? "寄送中..." : "重新寄送驗證信" }}
        </button>

        <button
          class="verify-email-card__button verify-email-card__button--ghost"
          type="button"
          :disabled="isActionPending"
          @click="handleBackToLogin"
        >
          {{ isLeaving ? "返回中..." : "回到登入頁" }}
        </button>
      </div>
    </section>
  </main>
</template>

<style scoped>
.verify-email-page {
  position: relative;
  display: flex;
  min-height: max(884px, 100dvh);
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: max(2rem, calc(var(--safe-top) + 1.25rem)) 1.25rem max(2rem, calc(var(--safe-bottom) + 1.25rem));
  background:
    radial-gradient(circle at 18% 12%, rgba(255, 219, 210, 0.7) 0 7.5rem, transparent 7.75rem),
    radial-gradient(circle at 88% 86%, rgba(179, 239, 216, 0.5) 0 8.5rem, transparent 8.75rem),
    linear-gradient(180deg, var(--auth-surface-bright) 0%, var(--auth-surface-container-low) 100%);
  color: var(--auth-on-surface);
  font-family: "Plus Jakarta Sans", "Noto Sans TC", sans-serif;
}

.verify-email-card {
  position: relative;
  z-index: 1;
  display: flex;
  width: min(100%, 28.75rem);
  flex-direction: column;
  gap: 2rem;
  border: 1px solid color-mix(in srgb, var(--auth-primary-fixed) 58%, transparent);
  border-radius: 2rem;
  background: rgba(255, 255, 255, 0.92);
  padding: 2.25rem 1.5rem;
  box-shadow:
    0 20px 56px rgba(118, 69, 52, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.82);
  text-align: center;
}

.verify-email-card__header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.verify-email-card__icon {
  display: grid;
  width: 4.5rem;
  height: 4.5rem;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 999px;
  background:
    radial-gradient(circle at 32% 24%, rgba(255, 255, 255, 0.82), transparent 42%),
    linear-gradient(135deg, var(--auth-primary-fixed), var(--auth-primary-container));
  box-shadow:
    0 16px 34px rgba(148, 72, 53, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.72);
  color: var(--auth-primary);
}

.verify-email-card__icon .material-symbols-outlined {
  font-size: 2.25rem;
  font-variation-settings: "FILL" 1, "wght" 500, "GRAD" 0, "opsz" 24;
}

.verify-email-card__title-group {
  min-width: 0;
}

.verify-email-card__eyebrow {
  margin: 0 0 0.5rem;
  color: var(--auth-primary);
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  line-height: 1.25rem;
}

.verify-email-card__title {
  margin: 0;
  color: var(--auth-on-surface);
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 2.5rem;
}

.verify-email-card__body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.verify-email-card__message {
  margin: 0;
  color: var(--auth-on-surface-variant);
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.55rem;
}

.verify-email-card__message span {
  color: var(--auth-on-surface);
  font-weight: 700;
  overflow-wrap: anywhere;
}

.verify-email-card__hint {
  display: flex;
  gap: 0.75rem;
  border: 1px solid color-mix(in srgb, var(--auth-outline-variant) 72%, transparent);
  border-radius: 1.35rem;
  background: var(--auth-surface-container-low);
  padding: 1rem;
  text-align: left;
}

.verify-email-card__hint .material-symbols-outlined {
  margin-top: 0.1rem;
  flex: 0 0 auto;
  color: var(--auth-primary);
  font-size: 1.25rem;
}

.verify-email-card__hint p {
  margin: 0;
  color: var(--auth-on-surface-variant);
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1.35rem;
}

.verify-email-card__actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.verify-email-card__button {
  display: inline-flex;
  width: 100%;
  min-height: 3.25rem;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 999px;
  padding: 0 1.25rem;
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: 0.01em;
  line-height: 1.25rem;
  transition: transform 180ms ease, opacity 180ms ease;
}

.verify-email-card__button:active:not(:disabled) {
  transform: scale(0.98);
}

.verify-email-card__button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.verify-email-card__button--primary {
  background: var(--auth-primary);
  color: var(--auth-on-primary);
  box-shadow: 0 8px 24px -6px rgba(148, 72, 53, 0.3);
}

.verify-email-card__button--secondary {
  background: var(--auth-surface-container);
  color: var(--auth-primary);
}

.verify-email-card__button--ghost {
  border: 1px solid color-mix(in srgb, var(--auth-outline-variant) 74%, transparent);
  background: var(--auth-surface-container-lowest);
  color: var(--auth-on-surface-variant);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.78);
}

@media (min-width: 640px) {
  .verify-email-page {
    padding: max(3rem, calc(var(--safe-top) + 2rem)) max(3rem, calc(var(--safe-right) + 2rem)) max(3rem, calc(var(--safe-bottom) + 2rem)) max(3rem, calc(var(--safe-left) + 2rem));
  }

  .verify-email-card {
    padding: 3.5rem;
  }
}
</style>
