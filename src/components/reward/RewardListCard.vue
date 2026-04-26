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

const getStatusText = computed(() =>
  props.reward.isActive ? "可兌換" : "已停用",
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
    return "已停用";
  }

  if (props.currentPoints < props.reward.cost) {
    return "點數不足";
  }

  return "可兌換";
});
</script>

<template>
  <article class="rounded-[var(--app-radius-xl)] border border-[var(--app-card-muted-border)] bg-[image:var(--app-card-muted-bg)] backdrop-blur-[10px] p-[16px]">
    <div class="flex items-start justify-between gap-[12px]">
      <div class="min-w-[0px] flex-1">
        <div class="flex flex-wrap items-center justify-between gap-[8px]">
          <p class="text-[16px] font-[700] leading-[1.42] text-[var(--app-text-strong)]">
            {{ reward.title }}
          </p>
          <span class="inline-flex min-h-[2rem] items-center gap-[4px] rounded-full border border-transparent bg-[var(--app-accent-soft)] px-[12px] py-[8px] text-[15px] font-[700] leading-[1.2] text-[var(--app-accent-strong)] [font-variant-numeric:tabular-nums]">{{ reward.cost }} 點</span>
        </div>
      </div>
    </div>

    <div class="flex justify-end gap-[8px] mt-[12px]">
      <span
        :class="[
          'inline-flex min-h-[2rem] items-center gap-[4px] rounded-full border border-[var(--app-border)] bg-[rgba(255,255,255,0.78)] px-[12px] py-[8px] text-[13px] font-[600] leading-[1.2] text-[var(--app-text-muted)]',
          reward.isActive ? 'border-transparent bg-[var(--app-success-soft)] text-[var(--app-success-text)]' : 'text-[var(--app-text-strong)]',
        ]"
      >
        目前{{ getStatusText }}
      </span>
    </div>

    <div
      v-if="getCanManage || props.reward.createdBy !== props.currentUid"
      class="mt-[16px] rounded-[1.15rem] border border-[var(--app-border)] bg-white/70 px-[16px] py-[12px]"
    >
      <div
        v-if="getCanManage"
        class="flex flex-col gap-[12px] sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="min-w-[0px]">
          <p class="text-[16px] font-[700] leading-[1.4] text-[var(--app-text-strong)]">上架狀態</p>
          <p class="text-[15px] leading-[1.58] text-[var(--app-text-soft)] mt-[4px]">關閉後對方暫時不能兌換這個獎勵。</p>
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
        <p class="text-[15px] leading-[1.58] text-[var(--app-text-soft)]">
          {{ reward.isActive ? "可以兌換這個獎勵" : "這個獎勵目前停用" }}
        </p>

        <button
          class="inline-flex items-center justify-center gap-[8px] rounded-full border border-[var(--app-button-secondary-border)] bg-[var(--app-button-secondary-bg)] px-[16px] py-[12px] text-[15px] font-[700] text-[var(--app-text)] shadow-[var(--app-shadow-chip)] transition-[transform,box-shadow,background-color,border-color,color] duration-[180ms] hover:enabled:-translate-y-[1px] focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--app-input-focus-ring),var(--app-shadow-chip)] disabled:cursor-not-allowed disabled:shadow-none disabled:opacity-55"
          type="button"
          :disabled="isSubmitting || !getCanRedeem"
          @click="emit('redeem', reward)"
        >
          {{ getCanRedeem ? "兌換" : getRedeemHint }}
        </button>
      </div>
    </div>
  </article>
</template>





