<script setup lang="ts">
import { computed, watch } from "vue";
import { useRouter } from "vue-router";
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

const router = useRouter();
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

const goHome = async () => {
  await router.push({ name: "home" });
};

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
          <div class="app-chip">Rewards MVP</div>
          <h1
            class="app-text-strong mt-[16px] max-w-[12ch] text-[34px] font-semibold leading-[1.04] tracking-[-0.045em]"
          >
            共享獎勵清單
          </h1>
        </div>

        <button
          class="app-ghost-button shrink-0 px-[16px] py-[12px] text-[14px]"
          type="button"
          @click="goHome"
        >
          返回首頁
        </button>
      </div>

      <p class="app-text-muted max-w-[34ch] text-[14px] leading-[24px]">
        這一版把 `rewards`、`redemptions`
        接起來，除了建立與兌換，也補上建立者後續管理獎勵啟用狀態的能力。
      </p>
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
          需要先完成配對，獎勵才知道要屬於哪一組 `coupleId`。
        </p>
      </section>

      <RewardComposerCard
        v-else
        :is-submitting="rewardsStore.isSubmitting"
        @submit="handleCreateReward"
      />

      <section class="grid grid-cols-3 gap-[16px]">
        <article class="app-card px-[16px] py-[16px]">
          <p class="app-label">可兌換</p>
          <p class="app-text-strong mt-[8px] text-[30px] font-semibold">
            {{ redeemableRewards.length }}
          </p>
        </article>

        <article class="app-card-muted px-[16px] py-[16px]">
          <p class="app-label">我建立的</p>
          <p class="app-text-strong mt-[8px] text-[30px] font-semibold">
            {{ myCreatedRewards.length }}
          </p>
        </article>

        <article class="app-card px-[16px] py-[16px]">
          <p class="app-label">我已兌換</p>
          <p class="app-text-strong mt-[8px] text-[30px] font-semibold">
            {{ myRedeemedRewards.length }}
          </p>
        </article>
      </section>

      <section class="app-card px-[20px] py-[20px]">
        <div class="flex items-center justify-between gap-[12px]">
          <div>
            <p class="app-label">獎勵列表</p>
            <p
              class="app-text-strong mt-[8px] text-[24px] font-semibold tracking-[-0.04em]"
            >
              本輪同步中的獎勵
            </p>
          </div>

          <div class="app-accent-panel px-[12px] py-[8px] text-right">
            <p class="app-kicker">同步狀態</p>
            <p class="app-text-strong mt-[4px] text-[14px] font-semibold">
              {{ rewardsStore.isLoading ? "讀取中" : "已同步" }}
            </p>
          </div>
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

          <p
            v-if="!rewardsStore.rewards.length"
            class="app-text-muted text-[14px] leading-[24px]"
          >
            目前還沒有獎勵，先建立第一個可以兌換的回報吧。
          </p>
        </div>
      </section>

      <section class="app-card px-[20px] py-[20px]">
        <div class="flex items-center justify-between gap-[12px]">
          <div>
            <p class="app-label">兌換紀錄</p>
            <p
              class="app-text-strong mt-[8px] text-[24px] font-semibold tracking-[-0.04em]"
            >
              最近完成的 redemptions
            </p>
          </div>

          <div class="app-accent-panel px-[12px] py-[8px] text-right">
            <p class="app-kicker">累積筆數</p>
            <p class="app-text-strong mt-[4px] text-[14px] font-semibold">
              {{ rewardsStore.redemptions.length }}
            </p>
          </div>
        </div>

        <div class="mt-[20px] space-y-[16px]">
          <RedemptionHistoryCard
            v-for="redemption in rewardsStore.getRecentRedemptions"
            :key="redemption.id"
            :current-uid="currentUid"
            :redemption="redemption"
          />

          <p
            v-if="!rewardsStore.redemptions.length"
            class="app-text-muted text-[14px] leading-[24px]"
          >
            還沒有任何兌換紀錄，等有人第一次使用點數後，這裡就會開始累積歷史。
          </p>
        </div>
      </section>
    </section>
  </MobileAppShell>
</template>
