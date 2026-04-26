<script setup lang="ts">
import { Empty } from "vant";

withDefaults(defineProps<{
  description?: string;
  title?: string;
}>(), {
  description: "",
  title: "目前沒有資料",
});
</script>

<template>
  <div class="rounded-[24px] bg-[rgba(255,255,255,0.58)]">
    <Empty
      class="px-[12px] py-[22px] [&_.van-empty__description]:text-[15px] [&_.van-empty__description]:font-[700] [&_.van-empty__description]:leading-[1.5] [&_.van-empty__description]:text-[var(--app-text-strong)]"
      image="search"
      image-size="88"
    >
      <template #description>
        <div class="grid gap-[4px] text-center">
          <p class="m-[0px] text-[15px] font-[800] text-[var(--app-text-strong)]">{{ title }}</p>
          <p v-if="description" class="m-[0px] text-[13px] font-[600] leading-[1.5] text-[var(--app-text-muted)]">
            {{ description }}
          </p>
        </div>
      </template>
    </Empty>
  </div>
</template>

