<script setup lang="ts">
import { Empty } from "vant";
</script>

<template>
  <div class="rounded-[24px] bg-[rgba(255,255,255,0.58)]">
    <Empty image="search" image-size="88"> </Empty>
  </div>
</template>

<style scoped>
:deep(.van-empty) {
  padding: 22px 12px;
}

:deep(.van-empty__description) {
  color: var(--app-text-strong);
  font-size: var(--app-type-15);
  font-weight: 700;
  line-height: 1.5;
}
</style>
