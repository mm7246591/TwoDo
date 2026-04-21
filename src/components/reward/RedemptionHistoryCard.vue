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
    <div class="flex items-start gap-[12px]">
      <div class="min-w-0">
        <div class="flex flex-wrap items-center gap-[8px]">
          <p class="app-text-strong text-[17px] font-semibold leading-[1.35]">
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
        <p class="app-text-muted mt-[10px] text-[14px] leading-[22px]">
          {{ getRedeemerText }}，花費 {{ redemption.cost }} 點。
        </p>
        <p class="app-text-soft mt-[10px] text-[13px] leading-[20px]">
          兌換時間：{{ formatDateTime(redemption.createdAt) }}
        </p>
      </div>
    </div>
  </article>
</template>
