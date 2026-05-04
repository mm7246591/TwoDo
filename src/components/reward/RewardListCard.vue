<script setup lang="ts">
import { computed } from "vue";
import { Switch } from "vant";
import type { Reward } from "@/views/reward/types/interface";

const emit = defineEmits<{
  redeem: [reward: Reward];
  toggleAvailability: [reward: Reward, isActive: boolean];
}>();
const props = defineProps<{
  currentPoints: number;
  currentUid: string;
  isSubmitting: boolean;
  reward: Reward;
}>();

const getCanRedeem = computed(() => {
  if (!props.reward.isActive) {
    return false;
  }

  if (props.reward.createdBy === props.currentUid) {
    return false;
  }

  return props.currentPoints >= props.reward.cost;
});
const getCanManage = computed(
  () => props.reward.createdBy === props.currentUid,
);
const getRedeemHint = computed(() => {
  if (!props.reward.isActive) {
    return "已停用";
  }

  if (props.currentPoints < props.reward.cost) {
    return "點數不足";
  }

  return "可兌換";
});
</script>

<template>
  <article class="rounded-[24px] border border-[var(--app-border)] bg-[var(--app-surface)] p-[18px] shadow-[var(--app-shadow-card)] backdrop-blur-[14px]">
    <div class="flex items-start justify-between gap-[12px]">
      <div class="min-w-[0px]">
        <div class="flex flex-wrap items-center gap-[6px]">
          <span
            v-if="getCanManage"
            class="inline-flex min-h-[22px] items-center rounded-full bg-[var(--app-accent-soft)] px-[8px] py-[3px] text-[11px] font-[700] leading-[1.2] text-[var(--app-accent-strong)]"
          >
            我建立
          </span>
          <span
            v-if="!reward.isActive"
            class="inline-flex min-h-[22px] items-center rounded-full bg-[var(--app-button-secondary-bg)] px-[8px] py-[3px] text-[11px] font-[700] leading-[1.2] text-[var(--app-text-muted)]"
          >
            已停用
          </span>
        </div>
        <p class="m-[0px] mt-[6px] text-[18px] font-[800] leading-[1.3] tracking-[0px] text-[var(--app-text-strong)]">
          {{ reward.title }}
        </p>
        <p v-if="reward.description" class="m-[0px] mt-[5px] text-[14px] font-[600] leading-[1.55] text-[var(--app-text-muted)]">
          {{ reward.description }}
        </p>
      </div>
    </div>

    <div class="mt-[16px] flex items-center justify-between gap-[10px]">
      <span class="inline-flex items-center gap-[5px] rounded-full border border-transparent bg-[var(--app-accent-soft)] px-[12px] py-[7px] text-[14px] font-[800] leading-[1.2] text-[var(--app-accent-strong)] [font-variant-numeric:tabular-nums]">
        <span class="material-symbols-outlined fill text-[16px]" aria-hidden="true">star</span>
        {{ reward.cost }} pts
      </span>

      <div v-if="getCanManage" class="flex items-center gap-[10px]">
        <span class="text-[13px] font-[600] text-[var(--app-text-soft)]">
          {{ reward.isActive ? "開放兌換" : "暫停兌換" }}
        </span>
        <Switch
          :model-value="reward.isActive"
          size="22px"
          active-color="var(--app-accent-strong)"
          inactive-color="var(--color-neutral-300)"
          :loading="isSubmitting"
          @update:model-value="emit('toggleAvailability', reward, $event)"
        />
      </div>

      <button
        v-else
        :class="[
          'inline-flex min-h-[38px] items-center justify-center gap-[6px] rounded-full px-[18px] py-[8px] text-[14px] font-[800] leading-[1.2] transition-[transform,box-shadow,background-color,opacity] duration-[180ms] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
          getCanRedeem
            ? 'bg-[linear-gradient(135deg,var(--app-accent)_0%,var(--app-accent-strong)_100%)] text-[var(--app-text-on-accent)] shadow-[var(--app-button-primary-shadow)] hover:enabled:-translate-y-[1px] hover:enabled:shadow-[var(--app-button-primary-shadow-hover)]'
            : 'border border-[var(--app-border)] bg-[var(--app-button-secondary-bg)] text-[var(--app-text-muted)]',
        ]"
        type="button"
        :disabled="isSubmitting || !getCanRedeem"
        @click="emit('redeem', reward)"
      >
        {{ getCanRedeem ? "兌換" : getRedeemHint }}
      </button>
    </div>
  </article>
</template>

<spec lang="md">
#### 1. 說明

- 顯示單一獎勵卡片，支援兌換對方獎勵與管理自己建立的獎勵上架狀態。

#### 2. 功能需求

- 1) 卡片顯示獎勵名稱、說明，以及底部「星號 + pts」格式的點數 badge。
- 2) 若獎勵由目前使用者建立，底部顯示上架狀態文字與切換 Switch；不顯示兌換按鈕。
- 3) 若獎勵由對方建立，底部顯示兌換按鈕。點數足夠且啟用時使用 coral 漸層主按鈕；否則使用灰色次要樣式並顯示停用原因。
- 4) 送出期間或條件不符時，兌換按鈕進入 disabled 狀態。

#### 3. 對接口

- props：reward：獎勵資料；current-points：目前使用者點數；current-uid：目前使用者識別；is-submitting：送出狀態。
- emit：redeem(reward)：要求兌換獎勵；toggleAvailability(reward, isActive)：要求切換獎勵上架狀態。
- defineModel：無。
</spec>



