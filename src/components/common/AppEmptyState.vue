<script setup lang="ts">
import { Empty } from "vant";

defineProps<{
  description: string;
  title: string;
}>();
</script>

<template>
  <div class="rounded-[24px] bg-[rgba(255,255,255,0.58)]">
    <Empty image="search" image-size="88" :description="title">
      <p
        class="mx-auto mt-1 max-w-[24ch] text-center text-[13px] leading-[21px] text-[color:var(--app-text-muted)]"
      >
        {{ description }}
      </p>
    </Empty>
  </div>
</template>

<style scoped>
:deep(.van-empty) {
  padding: 22px 12px;
}

:deep(.van-empty__description) {
  color: var(--app-text-strong);
  font-size: 15px;
  font-weight: 700;
  line-height: 22px;
}
</style>
