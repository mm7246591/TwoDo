<script setup lang="ts">
import { computed } from 'vue'
import { useKeyboardInset } from '@/composables/useKeyboardInset'

const { keyboardInset } = useKeyboardInset()

const shellStyle = computed(() => ({
  '--keyboard-inset': `${keyboardInset.value}px`,
}))
</script>

<template>
  <main class="app-shell app-stage mobile-page-scroll mobile-safe-shell flex flex-col" :style="shellStyle">
    <div
      class="app-shell-orb app-shell-orb-primary pointer-events-none absolute inset-x-0 top-0 z-0 mx-auto h-64 w-full max-w-md rounded-b-[3rem] blur-3xl sm:h-80 sm:max-w-lg" />
    <div
      class="app-shell-orb app-shell-orb-secondary pointer-events-none absolute bottom-10 left-1/2 z-0 h-48 w-48 -translate-x-1/2 rounded-full blur-3xl" />

    <div
      class="app-frame mx-auto flex w-full max-w-md min-h-full flex-col rounded-[2rem] sm:min-h-[780px] sm:rounded-[2.5rem]">
      <div class="app-frame-gloss pointer-events-none absolute inset-x-0 top-0 h-28" />
      <slot />
    </div>
  </main>
</template>
