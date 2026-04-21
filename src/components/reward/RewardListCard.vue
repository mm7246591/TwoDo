<script setup lang="ts">
import { computed } from "vue";
import { Switch } from "vant";
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
  <article class="app-card-muted px-[16px] py-[16px]">
    <div class="flex items-start justify-between gap-[12px]">
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-[8px]">
          <p class="app-text-strong text-[17px] font-semibold leading-[1.35]">
            {{ reward.title }}
          </p>
          <span class="app-number-pill">{{ reward.cost }} 點</span>
        </div>
        <p class="app-text-muted mt-[10px] text-[14px] leading-[22px]">
          {{ reward.description || "沒有補充說明。" }}
        </p>
      </div>
    </div>

    <div class="app-meta-list mt-[14px]">
      <span class="app-meta-pill">建立者：{{ getOwnerText }}</span>
      <span
        :class="[
          'app-meta-pill',
          reward.isActive ? 'app-meta-pill-success' : 'app-meta-pill-strong',
        ]"
      >
        狀態：{{ getStatusText }}
      </span>
      <span
        :class="[
          'app-meta-pill',
          getCanRedeem ? 'app-meta-pill-accent' : 'app-meta-pill-strong',
        ]"
      >
        {{ getRedeemHint }}
      </span>
    </div>

    <div
      v-if="getCanManage || props.reward.createdBy !== props.currentUid"
      class="mt-[16px] rounded-[1.15rem] border border-[var(--app-border)] bg-white/70 px-[14px] py-[12px]"
    >
      <div
        v-if="getCanManage"
        class="flex flex-col gap-[10px] sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="min-w-0">
          <p class="app-text-strong text-[14px] font-semibold">開放兌換</p>
          <p class="app-card-caption mt-[4px]">
            關閉後另一半暫時看得到但不能兌換。
          </p>
        </div>

        <div class="self-end shrink-0">
          <Switch
            :model-value="reward.isActive"
            size="24px"
            active-color="#0d6adf"
            inactive-color="#cbd5e1"
            :loading="isSubmitting"
            @update:model-value="emit('toggleAvailability', reward, $event)"
          />
        </div>
      </div>

      <div v-else class="flex flex-wrap items-center justify-between gap-[12px]">
        <p class="app-card-caption">
          {{ reward.isActive ? "可直接兌換這個獎勵。" : "建立者目前暫停開放兌換。" }}
        </p>

        <button
          class="app-secondary-button px-[16px] py-[10px] text-[14px]"
          type="button"
          :disabled="isSubmitting || !getCanRedeem"
          @click="emit('redeem', reward)"
        >
          {{ getCanRedeem ? "立即兌換" : getRedeemHint }}
        </button>
      </div>
    </div>
  </article>
</template>
