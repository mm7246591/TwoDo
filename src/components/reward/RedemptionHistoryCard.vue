<script setup lang="ts">
import { computed } from "vue";
import type { Redemption } from "@/views/reward/types/interface";

const props = defineProps<{
  currentUid: string;
  redemption: Redemption;
}>();

const formatDateTime = (value: Date) =>
  new Intl.DateTimeFormat("zh-TW", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);

const getRewardTitle = computed(
  () => props.redemption.rewardTitle || `獎勵 ${props.redemption.rewardId}`,
);
const getRedeemerText = computed(() =>
  props.redemption.redeemedBy === props.currentUid ? "我換的" : "另一半換的",
);
const getStatusText = computed(() => {
  if (props.redemption.status === "completed") {
    return "已完成";
  }

  if (props.redemption.status === "cancelled") {
    return "已取消";
  }

  return "待確認";
});
</script>

<template>
  <article class="app-card-muted app-card-section-sm">
    <div class="flex items-start gap-[12px]">
      <div class="min-w-[0px]">
        <div class="flex flex-wrap items-center gap-[8px]">
          <p class="app-list-title">
            {{ getRewardTitle }}
          </p>
          <span
            :class="[
              'app-meta-pill',
              redemption.status === 'completed'
                ? 'app-meta-pill-success'
                : redemption.status === 'cancelled'
                  ? 'app-meta-pill-danger'
                  : 'app-meta-pill-strong',
            ]"
          >
            {{ getStatusText }}
          </span>
        </div>
        <p class="app-list-body mt-[8px]">
          {{ getRedeemerText }}，用了 {{ redemption.cost }} 點。
        </p>
        <p class="app-meta-caption mt-[8px]">
          兌換：{{ formatDateTime(redemption.createdAt) }}
        </p>
      </div>
    </div>
  </article>
</template>
