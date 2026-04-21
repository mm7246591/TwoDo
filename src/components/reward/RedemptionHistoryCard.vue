<script setup lang="ts">
import { computed } from "vue";
import type { Redemption } from "@/views/rewards/types/interface";

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
  props.redemption.redeemedBy === props.currentUid ? "我兌換的" : "另一半兌換的",
);
const getStatusText = computed(() => {
  if (props.redemption.status === "completed") {
    return "已完成";
  }

  if (props.redemption.status === "cancelled") {
    return "已取消";
  }

  return "待處理";
});
</script>

<template>
  <article class="app-card-muted px-[16px] py-[16px]">
    <div class="flex items-start justify-between gap-[16px]">
      <div class="min-w-0">
        <p class="app-text-strong text-[18px] font-semibold">
          {{ getRewardTitle }}
        </p>
        <p class="app-text-muted mt-[8px] text-[14px] leading-[24px]">
          {{ getRedeemerText }}，花費 {{ redemption.cost }} 點。
        </p>
      </div>

      <div class="app-accent-panel shrink-0 px-[12px] py-[8px] text-right">
        <p class="app-kicker">狀態</p>
        <p class="app-text-strong mt-[4px] text-[14px] font-semibold">
          {{ getStatusText }}
        </p>
      </div>
    </div>

    <p class="app-text-soft mt-[12px] text-[14px]">
      兌換時間：{{ formatDateTime(redemption.createdAt) }}
    </p>
  </article>
</template>
