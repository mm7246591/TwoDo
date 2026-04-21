<script setup lang="ts">
import { computed, watch } from "vue";
import AppEmptyState from "@/components/common/AppEmptyState.vue";
import { useErrorToast } from "@/composables/useErrorToast";
import RewardComposerCard from "@/components/reward/RewardComposerCard.vue";
import RedemptionHistoryCard from "@/components/reward/RedemptionHistoryCard.vue";
import RewardListCard from "@/components/reward/RewardListCard.vue";
import MobileAppShell from "@/components/MobileAppShell.vue";
import { useRewardsStore } from "@/pinia/rewards";
import { useUserStore } from "@/pinia/user";
import { showSuccessMessage } from "@/services/uiFeedback";
import type { CreateRewardInput } from "@/pinia/rewards/types/interface";
import type { Reward } from "@/views/rewards/types/interface";

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
    (reward) => reward.createdBy === currentUid.value,
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

  showSuccessMessage(isActive ? "獎勵已重新啟用" : "獎勵已停用");
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
    <header
      class="space-y-[20px] px-[20px] pb-[24px] pt-[32px] sm:px-[28px] sm:pt-[40px]"
    >
      <div class="flex items-start justify-between gap-[12px]">
        <div class="min-w-0">
          <div class="app-chip">獎勵中心</div>
          <h1 class="app-page-title mt-[14px] max-w-[11ch]">
            獎勵清單
          </h1>
        </div>
      </div>

      <p class="app-page-summary">建立共享獎勵，也可以直接用點數兌換。</p>
    </header>

    <section class="flex-1 space-y-[16px] px-[20px] pb-[24px] sm:px-[28px]">
      <section v-if="!canUseRewards" class="app-card px-[20px] py-[20px]">
        <p class="app-label">目前狀態</p>
        <p
          class="app-text-strong mt-[12px] text-[24px] font-semibold tracking-[-0.04em]"
        >
          還不能使用獎勵系統
        </p>
        <p class="app-text-muted mt-[12px] text-[14px] leading-[24px]">
          先完成配對，才能建立與兌換共享獎勵。
        </p>
      </section>

      <RewardComposerCard
        v-else
        :is-submitting="rewardsStore.isSubmitting"
        @submit="handleCreateReward"
      />

      <section class="grid grid-cols-2 gap-[16px] sm:grid-cols-3">
        <article class="app-card px-[16px] py-[16px]">
          <p class="app-label">可兌換</p>
          <p class="app-metric-value mt-[8px]">
            {{ redeemableRewards.length }}
          </p>
        </article>

        <article class="app-card-muted px-[16px] py-[16px]">
          <p class="app-label">我建立的</p>
          <p class="app-metric-value mt-[8px]">
            {{ myCreatedRewards.length }}
          </p>
        </article>

        <article class="app-card px-[16px] py-[16px] col-span-2 sm:col-span-1">
          <p class="app-label">我已兌換</p>
          <p class="app-metric-value mt-[8px]">
            {{ myRedeemedRewards.length }}
          </p>
        </article>
      </section>

      <section class="app-card px-[20px] py-[20px]">
        <div class="flex flex-col gap-[14px] sm:flex-row sm:items-start sm:justify-between">
          <div class="min-w-0">
            <p class="app-label">獎勵列表</p>
            <p class="app-card-title mt-[8px]">目前可查看的獎勵</p>
            <p class="app-card-caption mt-[8px]">
              建立者可直接切換開放狀態，另一半可直接兌換。
            </p>
          </div>

          <span
            :class="[
              'app-meta-pill',
              rewardsStore.isLoading ? 'app-meta-pill-accent' : 'app-meta-pill-success',
            ]"
          >
            {{ rewardsStore.isLoading ? "資料同步中" : "資料已同步" }}
          </span>
        </div>

        <div class="mt-[20px] space-y-[16px]">
          <RewardListCard
            v-for="reward in rewardsStore.rewards"
            :key="reward.id"
            :current-points="currentPoints"
            :current-uid="currentUid"
            :is-submitting="rewardsStore.isSubmitting"
            :reward="reward"
            @redeem="handleRedeemReward"
            @toggle-availability="handleToggleRewardAvailability"
          />

          <AppEmptyState
            v-if="!rewardsStore.rewards.length"
            title="還沒有獎勵"
            description="先建立一個可兌換回報。"
          />
        </div>
      </section>

      <section class="app-card px-[20px] py-[20px]">
        <div class="flex flex-col gap-[14px] sm:flex-row sm:items-start sm:justify-between">
          <div class="min-w-0">
            <p class="app-label">兌換紀錄</p>
            <p class="app-card-title mt-[8px]">最近完成的兌換</p>
          </div>

          <span class="app-meta-pill app-meta-pill-strong">
            {{ rewardsStore.redemptions.length }} 筆紀錄
          </span>
        </div>

        <div class="mt-[20px] space-y-[16px]">
          <RedemptionHistoryCard
            v-for="redemption in rewardsStore.getRecentRedemptions"
            :key="redemption.id"
            :current-uid="currentUid"
            :redemption="redemption"
          />

          <AppEmptyState
            v-if="!rewardsStore.redemptions.length"
            title="還沒有兌換紀錄"
            description="第一次兌換後會出現在這裡。"
          />
        </div>
      </section>
    </section>
  </MobileAppShell>
</template>
