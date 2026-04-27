<script setup lang="ts">
import { Loading } from "vant";
import { onBeforeUnmount, ref, watch } from "vue";
import { useGlobalLoadingStore } from "@/pinia/loading";

const loadingStore = useGlobalLoadingStore();
const isVisible = ref(false);
let showTimer: ReturnType<typeof window.setTimeout> | null = null;
let hideTimer: ReturnType<typeof window.setTimeout> | null = null;
let shownAt = 0;

const clearShowTimer = () => {
  if (!showTimer) {
    return;
  }

  window.clearTimeout(showTimer);
  showTimer = null;
};

const clearHideTimer = () => {
  if (!hideTimer) {
    return;
  }

  window.clearTimeout(hideTimer);
  hideTimer = null;
};

watch(
  () => loadingStore.isLoading,
  (isLoading) => {
    if (isLoading) {
      clearHideTimer();

      if (isVisible.value || showTimer) {
        return;
      }

      showTimer = window.setTimeout(() => {
        shownAt = Date.now();
        isVisible.value = true;
        showTimer = null;
      }, 180);
      return;
    }

    clearShowTimer();

    if (!isVisible.value) {
      return;
    }

    const visibleDuration = Date.now() - shownAt;
    const remainingDuration = Math.max(0, 320 - visibleDuration);

    clearHideTimer();
    hideTimer = window.setTimeout(() => {
      isVisible.value = false;
      hideTimer = null;
    }, remainingDuration);
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  clearShowTimer();
  clearHideTimer();
});
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-[180ms] ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-[180ms] ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isVisible"
        class="fixed inset-[0px] z-[1200] grid place-items-center bg-[rgba(32,29,30,0.24)] px-[20px] backdrop-blur-[10px]"
        role="status"
        aria-live="polite"
        aria-label="正在處理"
      >
        <div
          class="grid min-h-[132px] w-[min(100%,184px)] place-items-center rounded-[24px] border border-[var(--app-border-contrast)] bg-[rgba(255,255,255,0.92)] px-[24px] py-[24px] text-[var(--app-accent-strong)] shadow-[0_24px_64px_rgba(118,69,52,0.18)]"
        >
          <Loading
            class="[&_.van-loading__spinner]:text-[var(--app-accent)] [&_.van-loading__text]:mt-[12px] [&_.van-loading__text]:text-[14px] [&_.van-loading__text]:font-[700] [&_.van-loading__text]:leading-[20px] [&_.van-loading__text]:text-[var(--app-accent-strong)]"
            color="var(--app-accent)"
            size="36px"
            type="spinner"
            vertical
          >
            處理中
          </Loading>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
