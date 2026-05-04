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
  <article class="rounded-[24px] border border-[var(--app-card-muted-border)] bg-[image:var(--app-card-muted-bg)] p-[16px] backdrop-blur-[10px]">
    <div class="flex flex-col gap-[12px] sm:flex-row sm:items-start sm:justify-between">
      <div class="min-w-[0px]">
        <div class="flex flex-wrap items-center gap-[8px]">
          <p class="m-[0px] text-[16px] font-[800] leading-[1.42] tracking-[0px] text-[var(--app-text-strong)]">
            {{ getRewardTitle }}
          </p>
          <span
            :class="[
              'inline-flex min-h-[30px] items-center gap-[4px] rounded-full border border-[var(--app-border)] bg-[var(--app-button-secondary-bg)] px-[10px] py-[7px] text-[13px] font-[700] leading-[1.2] text-[var(--app-text-muted)]',
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
        <p class="m-[0px] mt-[8px] text-[14px] font-[600] leading-[1.55] text-[var(--app-text-muted)]">
          {{ getRedeemerText }}，花費 {{ redemption.cost }} 點
        </p>
        <p class="m-[0px] mt-[8px] text-[13px] font-[600] leading-[1.5] text-[var(--app-text-soft)]">
          兌換：{{ formatDateTime(redemption.createdAt) }}
        </p>
      </div>

      <span class="inline-flex min-h-[32px] shrink-0 items-center justify-center rounded-full border border-transparent bg-[var(--app-accent-soft)] px-[12px] py-[8px] text-[15px] font-[800] leading-[1.2] text-[var(--app-accent-strong)] [font-variant-numeric:tabular-nums]">
        -{{ redemption.cost }}
      </span>
    </div>
  </article>
</template>

<spec lang="md">
#### 1. 說明

- 顯示單筆獎勵兌換紀錄，協助使用者快速辨識兌換項目、狀態、花費與時間。

#### 2. 功能需求

- 1) 顯示獎勵標題；若標題不存在，改以獎勵識別文字呈現。
- 2) 顯示兌換者是目前使用者或對方。
- 3) 顯示兌換狀態、花費點數與兌換時間。
- 4) 不同兌換狀態需以不同語意色彩呈現。

#### 3. 對接口

- props：redemption：兌換紀錄資料；current-uid：目前使用者識別。
- emit：無。
- defineModel：無。
</spec>

