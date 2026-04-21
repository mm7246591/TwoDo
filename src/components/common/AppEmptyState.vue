<script setup lang="ts">
import { Empty } from "vant";

defineProps<{
  description: string;
  title: string;
}>();
</script>

<template>
  <div class="app-empty-state">
    <Empty image="search" :description="title">
      <p class="app-empty-state__description">
        {{ description }}
      </p>
    </Empty>
  </div>
</template>

<style scoped>
.app-empty-state {
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.5);
}

.app-empty-state :deep(.van-empty) {
  padding: 24px 12px;
}

.app-empty-state :deep(.van-empty__description) {
  color: var(--app-text-strong);
  font-size: 16px;
  font-weight: 700;
  line-height: 24px;
}

.app-empty-state__description {
  max-width: 24ch;
  margin: 4px auto 0;
  color: var(--app-text-muted);
  font-size: 14px;
  line-height: 24px;
  text-align: center;
}
</style>
