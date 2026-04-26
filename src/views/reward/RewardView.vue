<script setup lang="ts">
import { computed, watch } from "vue";
import AppEmptyState from "@/components/common/AppEmptyState.vue";
import { useErrorToast } from "@/composables/useErrorToast";
import RewardComposerCard from "@/components/reward/RewardComposerCard.vue";
import RedemptionHistoryCard from "@/components/reward/RedemptionHistoryCard.vue";
import RewardListCard from "@/components/reward/RewardListCard.vue";
import MobileAppShell from "@/components/common/MobileAppShell.vue";
import { useRewardsStore } from "@/pinia/rewards";
import { useUserStore } from "@/pinia/user";
import { showSuccessMessage } from "@/services/uiFeedback";
import type { CreateRewardInput } from "@/pinia/rewards/types/interface";
import type { Reward } from "@/views/reward/types/interface";

const userStore = useUserStore();
const rewardsStore = useRewardsStore();

useErrorToast(() => rewardsStore.errorMessage);

const canUseRewards = computed(() =>
  Boolean(userStore.profile?.coupleId && userStore.profile?.uid),
);
const currentUid = computed(() => userStore.profile?.uid ?? "");
const currentPoints = computed(() => userStore.profile?.points ?? 0);
const myCreatedRewards = computed(() =>
  rewardsStore.rewards.filter(
    (reward: Reward) => reward.createdBy === currentUid.value,
  ),
);
const myRedeemedRewards = computed(() =>
  rewardsStore.redemptions.filter(
    (redemption) => redemption.redeemedBy === currentUid.value,
  ),
);
const redeemableRewards = computed(() =>
  rewardsStore.rewards.filter((reward) => {
    if (!reward.isActive) {
      return false;
    }

    if (reward.createdBy === currentUid.value) {
      return false;
    }

    return currentPoints.value >= reward.cost;
  }),
);

const handleCreateReward = async (
  payload: Omit<CreateRewardInput, "coupleId" | "createdBy">,
) => {
  if (!userStore.profile?.uid || !userStore.profile?.coupleId) {
    return;
  }

  try {
    await rewardsStore.createNewReward({
      ...payload,
      coupleId: userStore.profile.coupleId,
      createdBy: userStore.profile.uid,
    });
  } catch {
    return;
  }

  showSuccessMessage("獎勵已建立");
};

const handleRedeemReward = async (reward: Reward) => {
  if (!userStore.profile?.uid) {
    return;
  }

  try {
    await rewardsStore.redeemExistingReward(reward, userStore.profile.uid);
  } catch {
    return;
  }

  showSuccessMessage("獎勵已兌換");
};

const handleToggleRewardAvailability = async (
  reward: Reward,
  isActive: boolean,
) => {
  if (!userStore.profile?.uid) {
    return;
  }

  try {
    await rewardsStore.toggleRewardAvailability(
      reward,
      userStore.profile.uid,
      isActive,
    );
  } catch {
    return;
  }

  showSuccessMessage(isActive ? "獎勵已啟用" : "獎勵已停用");
};

watch(
  () => userStore.profile?.coupleId,
  (coupleId) => {
    if (!coupleId) {
      rewardsStore.reset();
      return;
    }

    void rewardsStore.syncRewards(coupleId);
  },
  { immediate: true },
);
</script>

<template>
  <MobileAppShell>
    <header class="grid gap-[20px] px-[20px] pb-[24px] pt-[32px] sm:px-[28px] sm:pt-[40px]">
      <div class="flex items-start justify-between gap-[12px]">
        <div class="min-w-[0px]">
          <div class="inline-flex items-center gap-[8px] rounded-full border border-[var(--app-chip-border)] bg-[var(--app-chip-bg)] px-[12px] py-[8px] text-[13px] font-[700] leading-[1.2] tracking-[0.045em] text-[var(--app-chip-text)] shadow-[var(--app-shadow-chip)] backdrop-blur-[12px]">獎勵</div>
          <h1 class="text-[32px] font-[700] leading-[1.04] tracking-[-0.03em] text-[var(--app-text-strong)] mt-[12px] max-w-[11ch]">願望商店</h1>
        </div>
      </div>

      <p class="max-w-[34ch] text-[16px] leading-[1.65] text-[var(--app-text-muted)]">建立彼此想要的小獎勵，用點數兌換生活裡的甜。</p>
    </header>

    <section class="px-[20px] pb-[24px] sm:px-[28px] grid gap-[16px] flex-1">
      <section v-if="!canUseRewards" class="rounded-[var(--app-radius-xl)] border border-[var(--app-border)] bg-[var(--app-surface)] shadow-[var(--app-shadow-card)] backdrop-blur-[14px] p-[20px]">
        <p class="text-[13px] font-[700] leading-[1.28] tracking-[0.03em] text-[var(--app-text-soft)]">目前狀態</p>
        <p class="text-[20px] font-[700] leading-[1.24] tracking-[-0.02em] text-[var(--app-text-strong)] mt-[12px]">
          還不能使用獎勵
        </p>
        <p class="text-[15px] leading-[1.58] text-[var(--app-text-soft)] mt-[12px]">
          完成配對後，就能一起建立與兌換獎勵。
        </p>
      </section>

      <RewardComposerCard v-else :is-submitting="rewardsStore.isSubmitting" @submit="handleCreateReward" />

      <section class="grid gap-[16px] grid-cols-2 sm:grid-cols-3">
        <article class="rounded-[var(--app-radius-xl)] border border-[var(--app-border)] bg-[var(--app-surface)] shadow-[var(--app-shadow-card)] backdrop-blur-[14px] p-[16px]">
          <p class="text-[13px] font-[700] leading-[1.28] tracking-[0.03em] text-[var(--app-text-soft)]">可兌換</p>
          <p class="text-[28px] font-[700] leading-[1.02] tracking-[-0.03em] text-[var(--app-text-strong)] [font-variant-numeric:tabular-nums] mt-[8px]">
            {{ redeemableRewards.length }}
          </p>
        </article>

        <article class="rounded-[var(--app-radius-xl)] border border-[var(--app-card-muted-border)] bg-[image:var(--app-card-muted-bg)] backdrop-blur-[10px] p-[16px]">
          <p class="text-[13px] font-[700] leading-[1.28] tracking-[0.03em] text-[var(--app-text-soft)]">我建立的獎勵</p>
          <p class="text-[28px] font-[700] leading-[1.02] tracking-[-0.03em] text-[var(--app-text-strong)] [font-variant-numeric:tabular-nums] mt-[8px]">
            {{ myCreatedRewards.length }}
          </p>
        </article>

        <article class="rounded-[var(--app-radius-xl)] border border-[var(--app-border)] bg-[var(--app-surface)] shadow-[var(--app-shadow-card)] backdrop-blur-[14px] p-[16px] col-span-2 sm:col-span-1">
          <p class="text-[13px] font-[700] leading-[1.28] tracking-[0.03em] text-[var(--app-text-soft)]">已兌換</p>
          <p class="text-[28px] font-[700] leading-[1.02] tracking-[-0.03em] text-[var(--app-text-strong)] [font-variant-numeric:tabular-nums] mt-[8px]">
            {{ myRedeemedRewards.length }}
          </p>
        </article>
      </section>

      <section class="rounded-[var(--app-radius-xl)] border border-[var(--app-border)] bg-[var(--app-surface)] shadow-[var(--app-shadow-card)] backdrop-blur-[14px] p-[20px]">
        <div class="flex flex-col gap-[16px] sm:flex-row sm:items-start sm:justify-between">
          <div class="min-w-[0px]">
            <p class="text-[13px] font-[700] leading-[1.28] tracking-[0.03em] text-[var(--app-text-soft)]">獎勵清單</p>
          </div>
        </div>

        <div class="grid gap-[16px] mt-[20px]">
          <RewardListCard v-for="reward in rewardsStore.rewards" :key="reward.id" :current-points="currentPoints"
            :current-uid="currentUid" :is-submitting="rewardsStore.isSubmitting" :reward="reward"
            @redeem="handleRedeemReward" @toggle-availability="handleToggleRewardAvailability" />

          <AppEmptyState v-if="!rewardsStore.rewards.length" />
        </div>
      </section>

      <section class="rounded-[var(--app-radius-xl)] border border-[var(--app-border)] bg-[var(--app-surface)] shadow-[var(--app-shadow-card)] backdrop-blur-[14px] p-[20px]">
        <div class="flex flex-col gap-[16px] sm:flex-row sm:items-start sm:justify-between">
          <div class="min-w-[0px]">
            <p class="text-[13px] font-[700] leading-[1.28] tracking-[0.03em] text-[var(--app-text-soft)]">兌換紀錄</p>
          </div>

          <span class="inline-flex min-h-[2rem] items-center gap-[4px] rounded-full border border-[var(--app-border)] bg-[rgba(255,255,255,0.78)] px-[12px] py-[8px] text-[13px] font-[600] leading-[1.2] text-[var(--app-text-muted)] text-[var(--app-text-strong)]">
            {{ rewardsStore.redemptions.length }} 筆
          </span>
        </div>

        <div class="grid gap-[16px] mt-[20px]">
          <RedemptionHistoryCard v-for="redemption in rewardsStore.getRecentRedemptions" :key="redemption.id"
            :current-uid="currentUid" :redemption="redemption" />

          <AppEmptyState v-if="!rewardsStore.redemptions.length" title="目前沒有兌換紀錄" description="兌換獎勵後，紀錄會出現在這裡。" />
        </div>
      </section>
    </section>
  </MobileAppShell>
</template>





