<script setup lang="ts">
import { Empty } from "vant";

withDefaults(defineProps<{
  description?: string;
  title?: string;
}>(), {
  description: "",
  title: "目前沒有項目",
});
</script>

<template>
  <div class="rounded-[24px] bg-[rgba(255,255,255,0.58)]">
    <Empty image="search" image-size="88">
      <template #description>
        <div class="app-empty-state__copy">
          <p class="app-empty-state__title">{{ title }}</p>
          <p v-if="description" class="app-empty-state__description">
            {{ description }}
          </p>
        </div>
      </template>
    </Empty>
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

.app-empty-state__copy {
  display: grid;
  gap: 0.25rem;
  text-align: center;
}

.app-empty-state__title,
.app-empty-state__description {
  margin: 0;
}

.app-empty-state__title {
  color: var(--app-text-strong);
  font-size: var(--app-type-15);
  font-weight: 800;
}

.app-empty-state__description {
  color: var(--app-text-muted);
  font-size: var(--app-type-13);
  font-weight: 600;
  line-height: 1.5;
}
</style>
