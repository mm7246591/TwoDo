<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/common/AppHeader.vue'
import AppBottomDock from '@/components/common/AppBottomDock.vue'
import { useKeyboardInset } from '@/composables/useKeyboardInset'

const {
  keyboardInset,
  startKeyboardInsetTracking,
  stopKeyboardInsetTracking,
} = useKeyboardInset()
const route = useRoute()

/** 是否顯示登入後主要頁面的頂部列與底部導覽。 */
const showAppChrome = computed(
  () => Boolean(route.meta.requiresAuth) && !route.meta.hideAppChrome,
)

/** 提供給 shell 樣式使用的鍵盤底部位移 CSS 變數。 */
const shellStyle = computed(() => ({
  '--keyboard-inset': `${keyboardInset.value}px`,
}))

onMounted(() => {
  startKeyboardInsetTracking()
})

onBeforeUnmount(() => {
  stopKeyboardInsetTracking()
})
</script>

<template>
  <main class="bg-[var(--app-shell-bg)] relative isolate w-full mobile-page-scroll flex min-h-dvh flex-col"
    :style="shellStyle">
    <div class="relative overflow-hidden shrink-0 mx-auto flex w-full max-w-md min-h-full flex-1 flex-col">
      <div
        class="bg-[var(--relative overflow-hidden shrink-0 min-h-full-gloss)] pointer-events-none absolute inset-x-[0px] top-[0px] h-[112px]" />
      <AppHeader v-if="showAppChrome" />
      <slot />
      <AppBottomDock v-if="showAppChrome" />
    </div>
  </main>
</template>

<spec lang="md">
## 1. 說明

- MobileAppShell 提供登入後頁面的共用行動版外框。
- 依路由 meta 決定是否顯示 AppHeader 與 AppBottomDock。

## 2. 功能需求

- 1. 需要 app chrome 的路由顯示頂部列、頁面內容與底部導覽。
- 2. 隱藏 app chrome 的路由只保留 shell 與頁面內容。
- 3. 元件掛載時開始同步行動裝置鍵盤底部位移，卸載前停止同步。
- 4. 鍵盤底部位移以 CSS 變數提供給 shell 內部版面使用。

## 3. 對接口

- props：無。
- emit：無。
- defineModel：無。

## 4. 實作方式

- 使用 useRoute 讀取 route meta 判斷主要 chrome 顯示狀態。
- 使用 useKeyboardInset 取得鍵盤位移狀態與監聽控制方法。
- 生命週期由元件負責呼叫鍵盤位移監聽的開始與停止。
</spec>
