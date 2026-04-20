<script setup lang="ts">
import { computed, watch } from "vue";
import { useRouter } from "vue-router";
import RewardComposerCard from "@/components/reward/RewardComposerCard.vue";
import RewardListCard from "@/components/reward/RewardListCard.vue";
import MobileAppShell from "@/components/MobileAppShell.vue";
import { useRewardsStore } from "@/pinia/rewards";
import { useUserStore } from "@/pinia/user";
import type { CreateRewardInput } from "@/pinia/rewards/types/interface";
import type { Reward } from "@/views/rewards/types/interface";

const router = useRouter();
const userStore = useUserStore();
const rewardsStore = useRewardsStore();

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
    // The store already exposes a user-facing error message.
  }
};

const handleRedeemReward = async (reward: Reward) => {
  if (!userStore.profile?.uid) {
    return;
  }

  try {
    await rewardsStore.redeemExistingReward(reward, userStore.profile.uid);
  } catch {
    // The store already exposes a user-facing error message.
  }
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
    // The store already exposes a user-facing error message.
  }
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
          <p class="app-label">未啟用</p>
          <p class="app-text-strong mt-[8px] text-[30px] font-semibold">
            {{ rewardsStore.getInactiveRewards.length }}
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

      <p
        v-if="rewardsStore.errorMessage"
        class="app-banner-danger app-text-danger px-[16px] py-[12px] text-[14px]"
      >
        {{ rewardsStore.errorMessage }}
      </p>
    </section>
  </MobileAppShell>
</template>
