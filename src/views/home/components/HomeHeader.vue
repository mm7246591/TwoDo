<script setup lang="ts">
defineProps<{
  summary: string
  userName: string
}>()

const emit = defineEmits<{
  signOut: []
}>()
</script>

<template>
  <header class="space-y-[20px] px-[20px] pb-[24px] pt-[32px] sm:px-[28px] sm:pt-[40px]">
    <div class="flex items-start justify-between gap-[12px]">
      <div class="min-w-0">
        <div class="app-chip">今日總覽</div>
        <h1 class="app-page-title mt-[14px] max-w-[11ch]">
          嗨，{{ userName }}
        </h1>
      </div>

      <button
        class="app-ghost-button shrink-0 px-[16px] py-[12px] text-[14px]"
        type="button"
        @click="emit('signOut')"
      >
        登出
      </button>
    </div>

    <p class="app-page-summary">{{ summary }}</p>
  </header>
</template>
