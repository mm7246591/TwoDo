<script setup lang="ts">
withDefaults(defineProps<{
  title?: string;
}>(), {
  title: "設定",
});

defineEmits<{
  back: [];
}>();
</script>

<template>
  <header
    class="sticky top-[0px] z-[40] flex min-h-[64px] items-center justify-between bg-[rgba(255,248,246,0.82)] px-[20px] py-[12px] backdrop-blur-[18px] sm:px-[28px]"
  >
    <button
      class="ml-[-8px] inline-flex h-[44px] min-h-[44px] w-[44px] min-w-[44px] items-center justify-center rounded-full text-[var(--app-text)] transition-[background-color,color,transform] duration-[180ms] hover:bg-[var(--app-surface-muted)] hover:text-[var(--app-accent)] active:scale-[0.96] focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--app-input-focus-ring)]"
      type="button"
      aria-label="返回上一頁"
      @click="$emit('back')"
    >
      <span class="material-symbols-outlined text-[24px]" aria-hidden="true">
        arrow_back
      </span>
    </button>

    <h1 class="text-[24px] font-[700] leading-[32px] tracking-[0] text-[var(--app-text-strong)]">
      {{ title }}
    </h1>

    <span class="h-[44px] w-[44px]" aria-hidden="true" />
  </header>
</template>

<spec lang="md">
## 1. 說明
- 顯示設定相關頁面的頂部列，提供返回操作與頁面標題。

## 2. 功能需求
- 1) 使用者點擊返回按鈕時，向上送出返回事件。
- 2) 元件顯示傳入標題；未傳入時顯示「設定」。

## 3. 對接口
- props：title：頂部列標題。
- emit：back：要求返回上一頁。
- defineModel：無。
</spec>
