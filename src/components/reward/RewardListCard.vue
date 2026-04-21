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
    return "停用中";
  }

  if (props.reward.createdBy === props.currentUid) {
    return "自己建立";
  }

  if (props.currentPoints < props.reward.cost) {
    return "點數不足";
  }

  return "可兌換";
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
        <p class="app-kicker">點數</p>
        <p class="app-text-strong mt-[4px] text-[16px] font-semibold">
          {{ reward.cost }}
        </p>
      </div>
    </div>

    <div class="mt-[16px] grid grid-cols-2 gap-[12px] text-[14px]">
      <p class="app-text-soft">建立者：{{ getOwnerText }}</p>
      <p class="app-text-soft">狀態：{{ getStatusText }}</p>
    </div>

    <p class="app-text-muted mt-[12px] text-[14px] leading-[22px]">
      兌換：{{ getRedeemHint }}
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
