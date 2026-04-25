<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/common/AppHeader.vue'
import AppBottomDock from '@/components/common/AppBottomDock.vue'
import { useKeyboardInset } from '@/composables/useKeyboardInset'

const { keyboardInset } = useKeyboardInset()
const route = useRoute()

const showAppChrome = computed(() => Boolean(route.meta.requiresAuth))

const shellStyle = computed(() => ({
  '--keyboard-inset': `${keyboardInset.value}px`,
}))
</script>

<template>
  <main class="app-shell app-stage mobile-page-scroll flex min-h-dvh flex-col" :style="shellStyle">
    <div class="app-frame mx-auto flex w-full max-w-md min-h-full flex-1 flex-col">
      <div class="app-frame-gloss pointer-events-none absolute inset-x-[0px] top-[0px] h-[112px]" />
      <AppHeader v-if="showAppChrome" />
      <slot />
      <AppBottomDock v-if="showAppChrome" />
    </div>
  </main>
</template>
