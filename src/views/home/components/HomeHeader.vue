<script setup lang="ts">
defineProps<{
  summary: string
  userName: string
}>()
</script>

<template>
  <header class="app-page-header">
    <div class="app-page-header-row">
      <div class="min-w-0">
        <div class="app-chip">首頁</div>
        <h1 class="app-page-title mt-3 max-w-[11ch]">
          嗨，{{ userName }}
        </h1>
      </div>
    </div>

    <p class="app-page-summary">{{ summary }}</p>
  </header>
</template>
