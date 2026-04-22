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

const getStatusText = computed(() =>
  props.reward.isActive ? "可兌換" : "暫不開放",
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
const getCanManage = computed(
  () => props.reward.createdBy === props.currentUid,
);
const getRedeemHint = computed(() => {
  if (!props.reward.isActive) {
    return "暫不開放";
  }

  if (props.currentPoints < props.reward.cost) {
    return "點數不足";
  }

  return "可兌換";
});
</script>

<template>
  <article class="app-card-muted">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <p class="app-list-title">
            {{ reward.title }}
          </p>
          <span class="app-number-pill">{{ reward.cost }} 點</span>
        </div>
      </div>
    </div>

    <div class="app-meta-list mt-3">
      <span
        :class="[
          'app-meta-pill',
          reward.isActive ? 'app-meta-pill-success' : 'app-meta-pill-strong',
        ]"
      >
        狀態：{{ getStatusText }}
      </span>
    </div>

    <div
      v-if="getCanManage || props.reward.createdBy !== props.currentUid"
      class="mt-4 rounded-[1.15rem] border border-[var(--app-border)] bg-white/70 px-4 py-3"
    >
      <div
        v-if="getCanManage"
        class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="min-w-0">
          <p class="app-inline-title">開放兌換</p>
          <p class="app-card-caption mt-1">關閉後另一半暫時不能換。</p>
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

      <div
        v-else
        class="flex flex-wrap items-center justify-between gap-3"
      >
        <p class="app-card-caption">
          {{ reward.isActive ? "現在可以換。" : "目前先不開放。" }}
        </p>

        <button
          class="app-secondary-button px-4 py-3"
          type="button"
          :disabled="isSubmitting || !getCanRedeem"
          @click="emit('redeem', reward)"
        >
          {{ getCanRedeem ? "現在兌換" : getRedeemHint }}
        </button>
      </div>
    </div>
  </article>
</template>
