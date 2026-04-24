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

  showSuccessMessage("獎勵已新增");
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

  showSuccessMessage(isActive ? "獎勵已開放兌換" : "獎勵已暫停兌換");
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
    <header class="app-page-header">
      <div class="app-page-header-row">
        <div class="min-w-[0px]">
          <div class="app-chip">獎勵</div>
          <h1 class="app-page-title mt-[12px] max-w-[11ch]">兩人的獎勵</h1>
        </div>
      </div>

      <p class="app-page-summary">用點數換你們說好的小獎勵。</p>
    </header>

    <section class="app-page-content app-section-stack flex-1">
      <section v-if="!canUseRewards" class="app-card app-card-section">
        <p class="app-label">目前狀態</p>
        <p class="app-status-title mt-[12px]">
          還不能新增獎勵
        </p>
        <p class="app-card-caption mt-[12px]">
          完成配對後，就能約定小獎勵。
        </p>
      </section>

      <RewardComposerCard
        v-else
        :is-submitting="rewardsStore.isSubmitting"
        @submit="handleCreateReward"
      />

      <section class="app-section-grid grid-cols-2 sm:grid-cols-3">
        <article class="app-card app-card-section-sm">
          <p class="app-label">可兌換獎勵</p>
          <p class="app-metric-value mt-[8px]">
            {{ redeemableRewards.length }}
          </p>
        </article>

        <article class="app-card-muted app-card-section-sm">
          <p class="app-label">我準備的獎勵</p>
          <p class="app-metric-value mt-[8px]">
            {{ myCreatedRewards.length }}
          </p>
        </article>

        <article class="app-card app-card-section-sm col-span-2 sm:col-span-1">
          <p class="app-label">已兌換獎勵</p>
          <p class="app-metric-value mt-[8px]">
            {{ myRedeemedRewards.length }}
          </p>
        </article>
      </section>

      <section class="app-card app-card-section">
        <div class="app-card-header-split">
          <div class="min-w-[0px]">
            <p class="app-label">獎勵列表</p>
          </div>
        </div>

        <div class="app-card-list mt-[20px]">
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

          <AppEmptyState v-if="!rewardsStore.rewards.length" />
        </div>
      </section>

      <section class="app-card app-card-section">
        <div class="app-card-header-split">
          <div class="min-w-[0px]">
            <p class="app-label">兌換紀錄</p>
          </div>

          <span class="app-meta-pill app-meta-pill-strong">
            {{ rewardsStore.redemptions.length }} 筆紀錄
          </span>
        </div>

        <div class="app-card-list mt-[20px]">
          <RedemptionHistoryCard
            v-for="redemption in rewardsStore.getRecentRedemptions"
            :key="redemption.id"
            :current-uid="currentUid"
            :redemption="redemption"
          />

          <AppEmptyState
            v-if="!rewardsStore.redemptions.length"
            title="還沒有兌換紀錄"
            description="換過的獎勵會保留紀錄。"
          />
        </div>
      </section>
    </section>
  </MobileAppShell>
</template>
