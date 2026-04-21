<script setup lang="ts">
import { computed } from "vue";
import { SwipeCell } from "vant";
import type { Reward } from "@/views/rewards/types/interface";

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

const getOwnerText = computed(() =>
  props.reward.createdBy === props.currentUid ? "我建立的" : "另一半建立的",
);
const getStatusText = computed(() =>
  props.reward.isActive ? "可兌換" : "未啟用",
);
const getCanRedeem = computed(() => {
  if (!props.reward.isActive) {
    return false;
  }

  if (props.reward.createdBy === props.currentUid) {
    return false;
  }

  return props.currentPoints >= props.reward.cost;
});
const getCanManage = computed(() => props.reward.createdBy === props.currentUid);
const getHasSwipeActions = computed(() => getCanRedeem.value || getCanManage.value);

const getRedeemHint = computed(() => {
  if (!props.reward.isActive) {
    return "這個獎勵目前是停用狀態。";
  }

  if (props.reward.createdBy === props.currentUid) {
    return "自己建立的獎勵會顯示在列表中，但不能由自己兌換。";
  }

  if (props.currentPoints < props.reward.cost) {
    return "目前點數不足，先去完成更多任務吧。";
  }

  return "可以直接兌換，系統會同步扣分並寫入 redemption 紀錄。";
});

const getManageHint = computed(() => {
  if (props.reward.createdBy !== props.currentUid) {
    return "";
  }

  if (props.reward.isActive) {
    return "你可以先停用這個獎勵，避免另一半繼續兌換。";
  }

  return "停用中的獎勵不會被兌換；準備好後可以再重新啟用。";
});
</script>

<template>
  <SwipeCell class="app-swipe-cell" :disabled="!getHasSwipeActions">
    <article class="app-card-muted px-[16px] py-[16px]">
    <div class="flex items-start justify-between gap-[16px]">
      <div class="min-w-0">
        <p class="app-text-strong text-[18px] font-semibold">
          {{ reward.title }}
        </p>
        <p class="app-text-muted mt-[8px] text-[14px] leading-[24px]">
          {{ reward.description || "沒有補充說明。" }}
        </p>
      </div>

      <div class="app-accent-panel shrink-0 px-[12px] py-[8px] text-right">
        <p class="app-kicker">Cost</p>
        <p class="app-text-strong mt-[4px] text-[16px] font-semibold">
          {{ reward.cost }}
        </p>
      </div>
    </div>

    <div class="mt-[16px] grid grid-cols-2 gap-[12px] text-[14px]">
      <p class="app-text-soft">建立者：{{ getOwnerText }}</p>
      <p class="app-text-soft">狀態：{{ getStatusText }}</p>
    </div>

    <p class="app-text-muted mt-[12px] text-[14px] leading-[24px]">
      {{ getRedeemHint }}
    </p>

    <p
      v-if="getManageHint"
      class="app-text-soft mt-[8px] text-[14px] leading-[24px]"
    >
      {{ getManageHint }}
    </p>
  </article>

    <template #right>
      <div class="app-swipe-actions">
        <button
          v-if="getCanRedeem"
          class="app-swipe-action app-swipe-action-primary"
          type="button"
          :disabled="isSubmitting"
          @click="emit('redeem', reward)"
        >
          兌換
        </button>

        <button
          v-if="getCanManage"
          class="app-swipe-action app-swipe-action-secondary"
          type="button"
          :disabled="isSubmitting"
          @click="emit('toggleAvailability', reward, !reward.isActive)"
        >
          {{ reward.isActive ? "停用" : "啟用" }}
        </button>
      </div>
    </template>
  </SwipeCell>
</template>
