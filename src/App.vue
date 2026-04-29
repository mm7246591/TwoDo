<script setup lang="ts">
import { computed, onBeforeUnmount, watch } from "vue";
import { useRouter } from "vue-router";
import { hideAppToast, useAppToastState } from "@/services/appToast";
import { handleForegroundPushMessage } from "@/composables/usePushNotifications";
import { useUserStore } from "@/pinia/user";
import {
  subscribeToForegroundPushMessages,
  syncCurrentDevicePushToken,
} from "@/services/pushNotificationService";
import AppGlobalLoading from "@/components/common/AppGlobalLoading.vue";

const router = useRouter();
const appToast = useAppToastState();
const userStore = useUserStore();

let stopForegroundPushSync: (() => void) | null = null;

const appToastRole = computed(() =>
  appToast.value?.link ? "button" : "status",
);
const appToastTabindex = computed(() => (appToast.value?.link ? 0 : undefined));
const appToastClass = computed(() => [
  "pointer-events-auto flex min-h-[80px] w-[min(100%,27rem)] items-center gap-[0.95rem] rounded-[1.5rem] border border-[color-mix(in_srgb,var(--auth-primary-fixed)_72%,transparent)] bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(255,248,246,0.94)),var(--auth-surface-container-lowest)] py-[0.9rem] pr-[0.9rem] pl-[16px] text-[var(--auth-on-surface)] shadow-[0_18px_48px_rgba(118,69,52,0.16),inset_0_1px_0_rgba(255,255,255,0.82)] [-webkit-tap-highlight-color:transparent] focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_rgba(255,158,133,0.28),0_18px_48px_rgba(118,69,52,0.16),inset_0_1px_0_rgba(255,255,255,0.82)]",
  appToast.value?.link ? "cursor-pointer" : "",
  appToast.value?.variant === "error"
    ? "border-[color-mix(in_srgb,var(--auth-error-container)_78%,transparent)] bg-[linear-gradient(135deg,rgba(255,255,255,0.97),rgba(255,246,244,0.95)),var(--auth-error-container)]"
    : "",
]);
const appToastVisualClass = computed(() => [
  "relative grid h-[3.1rem] w-[3.1rem] flex-none place-items-center rounded-full border-2 border-[var(--auth-surface-container-lowest)] bg-[radial-gradient(circle_at_32%_24%,rgba(255,255,255,0.82),transparent_42%),linear-gradient(135deg,var(--auth-primary-fixed),var(--auth-primary-container))] text-[var(--auth-primary)] shadow-[0_8px_20px_rgba(148,72,53,0.16)]",
  appToast.value?.variant === "success"
    ? "bg-[radial-gradient(circle_at_32%_24%,rgba(255,255,255,0.84),transparent_42%),linear-gradient(135deg,var(--auth-secondary-container),var(--auth-secondary-fixed-dim))] text-[var(--auth-secondary)]"
    : "",
  appToast.value?.variant === "error"
    ? "bg-[radial-gradient(circle_at_32%_24%,rgba(255,255,255,0.84),transparent_42%),linear-gradient(135deg,var(--auth-error-container),#ffece8)] text-[var(--auth-error)]"
    : "",
]);
const appToastBadgeClass = computed(() => [
  "absolute right-[-0.2rem] bottom-[-0.2rem] grid h-[20px] w-[20px] place-items-center rounded-full border-2 border-[var(--auth-surface-container-lowest)] bg-[var(--auth-surface-container-lowest)] text-[var(--auth-primary)] shadow-[0_4px_10px_rgba(118,69,52,0.16)]",
  appToast.value?.variant === "success" ? "text-[var(--auth-secondary)]" : "",
  appToast.value?.variant === "error" ? "text-[var(--auth-error)]" : "",
  appToast.value?.variant === "loading" ? "hidden" : "",
]);

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
  <Transition
    enter-active-class="transition-[opacity,transform] duration-[260ms] ease-[cubic-bezier(0.2,0.8,0.2,1)]"
    enter-from-class="-translate-y-4 scale-[0.98] opacity-0"
    enter-to-class="translate-y-0 scale-100 opacity-100"
    leave-active-class="transition-[opacity,transform] duration-[260ms] ease-[cubic-bezier(0.2,0.8,0.2,1)]"
    leave-from-class="translate-y-0 scale-100 opacity-100"
    leave-to-class="-translate-y-4 scale-[0.98] opacity-0"
  >
    <div
      v-if="appToast"
      :key="appToast.id"
      class="pointer-events-none fixed inset-x-[0px] top-[0px] z-[1000] flex justify-center px-[16px] pt-[calc(env(safe-area-inset-top,0px)+1rem)]"
    >
      <div
        :class="appToastClass"
        :role="appToastRole"
        :tabindex="appToastTabindex"
        aria-live="polite"
        @click="openAppToastLink"
        @keydown.enter.prevent="openAppToastLink"
        @keydown.space.prevent="openAppToastLink"
      >
        <div :class="appToastVisualClass" aria-hidden="true">
          <span
            class="material-symbols-outlined text-[1.75rem] [font-variation-settings:'FILL'_1,'wght'_500,'GRAD'_0,'opsz'_24]"
            :class="{ 'animate-spin': appToast.variant === 'loading' }"
          >
            {{ appToast.icon }}
          </span>
          <span :class="appToastBadgeClass">
            <span
              class="material-symbols-outlined text-[0.78rem] [font-variation-settings:'FILL'_1,'wght'_500,'GRAD'_0,'opsz'_20]"
              >favorite</span
            >
          </span>
        </div>

        <div class="min-w-[0px] flex-auto">
          <p
            v-if="appToast.title"
            class="m-[0px] mb-[0.15rem] overflow-hidden text-ellipsis whitespace-nowrap text-[0.72rem] font-[700] leading-4 tracking-[0.04em] text-[var(--auth-primary)]"
          >
            {{ appToast.title }}
          </p>
          <p
            class="m-[0px] overflow-hidden text-[0.92rem] font-[600] leading-[1.32rem] tracking-[0.005em] text-[var(--auth-on-surface-variant)] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]"
          >
            {{ appToast.message }}
          </p>
        </div>

        <button
          v-if="appToast.dismissible"
          class="grid h-[44px] min-h-[44px] w-[44px] min-w-[44px] flex-none place-items-center rounded-full border-0 bg-[color-mix(in_srgb,var(--auth-surface-variant)_52%,transparent)] p-[0px] text-[var(--auth-on-surface-variant)] [&_.material-symbols-outlined]:text-xl"
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
  <AppGlobalLoading />
</template>
