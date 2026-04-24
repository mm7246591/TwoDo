<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppBottomDock from '@/components/common/AppBottomDock.vue'
import { useKeyboardInset } from '@/composables/useKeyboardInset'

const { keyboardInset } = useKeyboardInset()
const route = useRoute()

const showDock = computed(() => Boolean(route.meta.requiresAuth))

const shellStyle = computed(() => ({
  '--keyboard-inset': `${keyboardInset.value}px`,
}))
</script>

<template>
  <main class="app-shell app-stage mobile-page-scroll mobile-safe-shell flex flex-col" :style="shellStyle">
    <div
      class="app-frame mx-auto flex w-full max-w-md min-h-full flex-col rounded-[2rem] sm:min-h-[780px] sm:rounded-[2.5rem]">
      <div class="app-frame-gloss pointer-events-none absolute inset-x-[0px] top-[0px] h-[112px]" />
      <slot />
      <AppBottomDock v-if="showDock" />
    </div>
  </main>
</template>
