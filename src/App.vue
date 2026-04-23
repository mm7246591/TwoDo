<script setup lang="ts">
import { computed, onBeforeUnmount, watch } from "vue";
import type { MessagePayload } from "firebase/messaging";
import { useRouter } from "vue-router";
import { useUserStore } from "@/pinia/user";
import { hideAppToast, showAppToast, useAppToastState } from "@/services/appToast";
import {
  showForegroundPushNotification,
  subscribeToForegroundPushMessages,
  syncCurrentDevicePushToken,
} from "@/services/pushNotificationService";

const userStore = useUserStore();
const router = useRouter();
const appToast = useAppToastState();

let stopForegroundPushSync: (() => void) | null = null;

const appToastRole = computed(() => (appToast.value?.link ? "button" : "status"));
const appToastTabindex = computed(() => (appToast.value?.link ? 0 : undefined));

const getPayloadTitle = (payload: MessagePayload) =>
  payload.notification?.title?.trim() || payload.data?.title?.trim() || "TwoDo 通知";

const getPayloadMessage = (payload: MessagePayload) =>
  payload.notification?.body?.trim() || payload.data?.message?.trim() || "";

const getPayloadLink = (payload: MessagePayload) =>
  payload.data?.link?.trim() || "/notifications";

const getPayloadType = (payload: MessagePayload) =>
  payload.data?.type?.trim() || "";

const getPayloadIcon = (payload: MessagePayload) => {
  const type = getPayloadType(payload);

  if (type === "task_completed_pending_confirm") {
    return "task_alt";
  }

  if (type === "reward_redeemed") {
    return "redeem";
  }

  return "notifications";
};

const shouldShowInAppToast = () =>
  typeof document !== "undefined" &&
  document.visibilityState === "visible" &&
  typeof document.hasFocus === "function" &&
  document.hasFocus();

const showInAppForegroundToast = (payload: MessagePayload) => {
  const message = getPayloadMessage(payload);

  if (!message) {
    showForegroundPushNotification(payload);
    return;
  }

  showAppToast({
    icon: getPayloadIcon(payload),
    link: getPayloadLink(payload),
    message,
    title: getPayloadTitle(payload),
    variant: "notification",
  });
};

const handleForegroundPushMessage = (payload: MessagePayload) => {
  if (shouldShowInAppToast()) {
    showInAppForegroundToast(payload);
    return;
  }

  showForegroundPushNotification(payload);
};

const openAppToastLink = async () => {
  const link = appToast.value?.link;

  if (!link) {
    return;
  }

  hideAppToast();

  if (/^https?:\/\//.test(link)) {
    window.location.assign(link);
    return;
  }

  await router.push(link);
};

onBeforeUnmount(() => {
  stopForegroundPushSync?.();
  stopForegroundPushSync = null;
});

watch(
  () => ({
    tokensKey: (userStore.profile?.fcmTokens ?? []).join("|"),
    uid: userStore.profile?.uid ?? "",
  }),
  async ({ uid }) => {
    if (!uid) {
      stopForegroundPushSync?.();
      stopForegroundPushSync = null;
      return;
    }

    try {
      await syncCurrentDevicePushToken(uid, userStore.profile?.fcmTokens ?? []);
    } catch (error) {
      console.error("Failed to sync current device push token:", error);
    }

    if (stopForegroundPushSync) {
      return;
    }

    stopForegroundPushSync = await subscribeToForegroundPushMessages(
      (payload) => {
        handleForegroundPushMessage(payload);
      },
    );
  },
  { immediate: true },
);
</script>

<template>
  <Transition name="app-toast">
    <div
      v-if="appToast"
      :key="appToast.id"
      class="app-toast-shell"
    >
      <div
        class="app-toast"
        :class="`app-toast--${appToast.variant}`"
        :role="appToastRole"
        :tabindex="appToastTabindex"
        aria-live="polite"
        @click="openAppToastLink"
        @keydown.enter.prevent="openAppToastLink"
        @keydown.space.prevent="openAppToastLink"
      >
        <div class="app-toast__visual" aria-hidden="true">
          <span class="material-symbols-outlined app-toast__icon">
            {{ appToast.icon }}
          </span>
          <span class="app-toast__badge">
            <span class="material-symbols-outlined app-toast__badge-icon">favorite</span>
          </span>
        </div>

        <div class="app-toast__content">
          <p v-if="appToast.title" class="app-toast__eyebrow">
            {{ appToast.title }}
          </p>
          <p class="app-toast__message">
            {{ appToast.message }}
          </p>
        </div>

        <button
          v-if="appToast.dismissible"
          class="app-toast__close"
          type="button"
          aria-label="關閉通知"
          @click.stop="hideAppToast"
        >
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
    </div>
  </Transition>

  <RouterView />
</template>

<style scoped>
.app-toast-shell {
  position: fixed;
  inset: 0 0 auto;
  z-index: 1000;
  display: flex;
  justify-content: center;
  padding: calc(env(safe-area-inset-top, 0px) + 1rem) 1rem 0;
  pointer-events: none;
}

.app-toast {
  display: flex;
  align-items: center;
  width: min(100%, 27rem);
  min-height: 5rem;
  gap: 0.95rem;
  padding: 0.9rem 0.9rem 0.9rem 1rem;
  border: 1px solid color-mix(in srgb, var(--auth-primary-fixed) 72%, transparent);
  border-radius: 1.5rem;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.96), rgba(255, 248, 246, 0.94)),
    var(--auth-surface-container-lowest);
  box-shadow:
    0 18px 48px rgba(118, 69, 52, 0.16),
    inset 0 1px 0 rgba(255, 255, 255, 0.82);
  color: var(--auth-on-surface);
  pointer-events: auto;
  -webkit-tap-highlight-color: transparent;
}

.app-toast[role="button"] {
  cursor: pointer;
}

.app-toast:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 4px rgba(255, 158, 133, 0.28),
    0 18px 48px rgba(118, 69, 52, 0.16),
    inset 0 1px 0 rgba(255, 255, 255, 0.82);
}

.app-toast--error {
  border-color: color-mix(in srgb, var(--auth-error-container) 78%, transparent);
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.97), rgba(255, 246, 244, 0.95)),
    var(--auth-error-container);
}

.app-toast__visual {
  position: relative;
  display: grid;
  flex: 0 0 auto;
  width: 3.1rem;
  height: 3.1rem;
  place-items: center;
  border: 2px solid var(--auth-surface-container-lowest);
  border-radius: 999px;
  background:
    radial-gradient(circle at 32% 24%, rgba(255, 255, 255, 0.82), transparent 42%),
    linear-gradient(135deg, var(--auth-primary-fixed), var(--auth-primary-container));
  box-shadow: 0 8px 20px rgba(148, 72, 53, 0.16);
  color: var(--auth-primary);
}

.app-toast--success .app-toast__visual {
  background:
    radial-gradient(circle at 32% 24%, rgba(255, 255, 255, 0.84), transparent 42%),
    linear-gradient(135deg, var(--auth-secondary-container), var(--auth-secondary-fixed-dim));
  color: var(--auth-secondary);
}

.app-toast--error .app-toast__visual {
  background:
    radial-gradient(circle at 32% 24%, rgba(255, 255, 255, 0.84), transparent 42%),
    linear-gradient(135deg, var(--auth-error-container), #ffece8);
  color: var(--auth-error);
}

.app-toast__icon {
  font-size: 1.75rem;
  font-variation-settings: "FILL" 1, "wght" 500, "GRAD" 0, "opsz" 24;
}

.app-toast--loading .app-toast__icon {
  animation: app-toast-spin 900ms linear infinite;
}

.app-toast__badge {
  position: absolute;
  right: -0.2rem;
  bottom: -0.2rem;
  display: grid;
  width: 1.25rem;
  height: 1.25rem;
  place-items: center;
  border: 2px solid var(--auth-surface-container-lowest);
  border-radius: 999px;
  background: var(--auth-surface-container-lowest);
  color: var(--auth-primary);
  box-shadow: 0 4px 10px rgba(118, 69, 52, 0.16);
}

.app-toast--success .app-toast__badge {
  color: var(--auth-secondary);
}

.app-toast--error .app-toast__badge {
  color: var(--auth-error);
}

.app-toast--loading .app-toast__badge {
  display: none;
}

.app-toast__badge-icon {
  font-size: 0.78rem;
  font-variation-settings: "FILL" 1, "wght" 500, "GRAD" 0, "opsz" 20;
}

.app-toast__content {
  min-width: 0;
  flex: 1 1 auto;
}

.app-toast__eyebrow {
  margin: 0 0 0.15rem;
  overflow: hidden;
  color: var(--auth-primary);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  line-height: 1rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-toast__message {
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  color: var(--auth-on-surface-variant);
  font-size: 0.92rem;
  font-weight: 650;
  letter-spacing: 0.005em;
  line-height: 1.32rem;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.app-toast__close {
  display: grid;
  flex: 0 0 auto;
  width: 2.75rem;
  min-width: 2.75rem;
  height: 2.75rem;
  min-height: 2.75rem;
  place-items: center;
  border: 0;
  border-radius: 999px;
  background: color-mix(in srgb, var(--auth-surface-variant) 52%, transparent);
  color: var(--auth-on-surface-variant);
  padding: 0;
}

.app-toast__close .material-symbols-outlined {
  font-size: 1.25rem;
}

.app-toast-enter-active,
.app-toast-leave-active {
  transition:
    opacity 220ms ease,
    transform 260ms cubic-bezier(0.2, 0.8, 0.2, 1);
}

.app-toast-enter-from,
.app-toast-leave-to {
  opacity: 0;
  transform: translateY(-1rem) scale(0.98);
}

.app-toast-enter-to,
.app-toast-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

@keyframes app-toast-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
