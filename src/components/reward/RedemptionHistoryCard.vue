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
  props.redemption.redeemedBy === props.currentUid ? "我兌換" : "對方兌換",
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
  <article class="rounded-[var(--app-radius-xl)] border border-[var(--app-card-muted-border)] bg-[image:var(--app-card-muted-bg)] p-[16px] backdrop-blur-[10px]">
    <div class="flex items-start gap-[12px]">
      <div class="min-w-[0px]">
        <div class="flex flex-wrap items-center gap-[8px]">
          <p class="text-[16px] font-[700] leading-[1.42] text-[var(--app-text-strong)]">
            {{ getRewardTitle }}
          </p>
          <span
            :class="[
              'inline-flex min-h-[2rem] items-center gap-[4px] rounded-full border border-[var(--app-border)] bg-[rgba(255,255,255,0.78)] px-[12px] py-[8px] text-[13px] font-[600] leading-[1.2] text-[var(--app-text-muted)]',
              redemption.status === 'completed'
                ? 'border-transparent bg-[var(--app-success-soft)] text-[var(--app-success-text)]'
                : redemption.status === 'cancelled'
                  ? 'border-transparent bg-[var(--app-danger-soft)] text-[var(--app-danger-text)]'
                  : 'text-[var(--app-text-strong)]',
            ]"
          >
            {{ getStatusText }}
          </span>
        </div>
        <p class="text-[15px] leading-[1.58] text-[var(--app-text-muted)] mt-[8px]">
          {{ getRedeemerText }}，花費 {{ redemption.cost }} 點
        </p>
        <p class="text-[13px] leading-[1.5] text-[var(--app-text-soft)] mt-[8px]">
          兌換：{{ formatDateTime(redemption.createdAt) }}
        </p>
      </div>
    </div>
  </article>
</template>


