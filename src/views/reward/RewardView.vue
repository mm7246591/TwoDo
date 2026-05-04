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
import { showSuccessMessage } from "@/composables/useMessage";
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
    <header class="grid gap-[4px] px-[20px] pb-[20px] pt-[32px] sm:px-[28px] sm:pt-[40px]">
      <div class="inline-flex items-center gap-[8px] rounded-full border border-[var(--app-chip-border)] bg-[var(--app-chip-bg)] px-[12px] py-[8px] text-[13px] font-[700] leading-[1.2] tracking-[0.045em] text-[var(--app-chip-text)] shadow-[var(--app-shadow-chip)] backdrop-blur-[12px] w-fit">
        獎勵
      </div>
      <h1 class="mt-[10px] text-[32px] font-[800] leading-[1.12] tracking-[0px] text-[var(--app-text-strong)]">
        獎勵商店
      </h1>
      <p class="mt-[6px] max-w-[34ch] text-[16px] leading-[1.65] text-[var(--app-text-muted)]">
        用你們累積的點數，換取生活中的小驚喜。
      </p>
    </header>

    <section class="px-[20px] pb-[24px] sm:px-[28px] grid gap-[16px] flex-1">
      <section
        v-if="!canUseRewards"
        class="rounded-[var(--app-radius-xl)] border border-[var(--app-border)] bg-[var(--app-surface)] shadow-[var(--app-shadow-card)] backdrop-blur-[14px] p-[20px]"
      >
        <p class="text-[13px] font-[700] leading-[1.28] tracking-[0.03em] text-[var(--app-text-soft)]">
          目前狀態
        </p>
        <p class="mt-[12px] text-[20px] font-[700] leading-[1.24] tracking-[0px] text-[var(--app-text-strong)]">
          還不能使用獎勵
        </p>
        <p class="text-[15px] leading-[1.58] text-[var(--app-text-soft)] mt-[12px]">
          完成配對後，就能一起建立與兌換獎勵。
        </p>
      </section>

      <section v-else class="grid gap-[12px]">
        <article class="relative overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,var(--app-accent)_0%,var(--app-accent-strong)_100%)] p-[24px] shadow-[var(--app-button-primary-shadow)]">
          <p class="m-[0px] text-[13px] font-[700] leading-[1.2] text-[rgba(255,255,255,0.72)]">
            目前點數
          </p>
          <div class="mt-[10px] flex items-center gap-[10px]">
            <span class="material-symbols-outlined fill text-[32px] text-[rgba(255,255,255,0.9)]" aria-hidden="true">
              star
            </span>
            <span class="text-[52px] font-[800] leading-[1] tracking-[-1px] text-white [font-variant-numeric:tabular-nums]">
              {{ currentPoints.toLocaleString() }}
            </span>
          </div>
        </article>

        <div class="grid grid-cols-3 gap-[10px]">
          <article class="rounded-[20px] border border-[var(--app-card-muted-border)] bg-[image:var(--app-card-muted-bg)] p-[14px] backdrop-blur-[10px]">
            <p class="m-[0px] text-[11px] font-[700] leading-[1.28] tracking-[0.03em] text-[var(--app-text-soft)]">可兌換</p>
            <p class="m-[0px] mt-[6px] text-[24px] font-[800] leading-[1] tracking-[0px] text-[var(--app-text-strong)] [font-variant-numeric:tabular-nums]">
              {{ redeemableRewards.length }}
            </p>
          </article>
          <article class="rounded-[20px] border border-[var(--app-card-muted-border)] bg-[image:var(--app-card-muted-bg)] p-[14px] backdrop-blur-[10px]">
            <p class="m-[0px] text-[11px] font-[700] leading-[1.28] tracking-[0.03em] text-[var(--app-text-soft)]">我建立</p>
            <p class="m-[0px] mt-[6px] text-[24px] font-[800] leading-[1] tracking-[0px] text-[var(--app-text-strong)] [font-variant-numeric:tabular-nums]">
              {{ myCreatedRewards.length }}
            </p>
          </article>
          <article class="rounded-[20px] border border-[var(--app-card-muted-border)] bg-[image:var(--app-card-muted-bg)] p-[14px] backdrop-blur-[10px]">
            <p class="m-[0px] text-[11px] font-[700] leading-[1.28] tracking-[0.03em] text-[var(--app-text-soft)]">已兌換</p>
            <p class="m-[0px] mt-[6px] text-[24px] font-[800] leading-[1] tracking-[0px] text-[var(--app-text-strong)] [font-variant-numeric:tabular-nums]">
              {{ myRedeemedRewards.length }}
            </p>
          </article>
        </div>
      </section>

      <RewardComposerCard
        v-if="canUseRewards"
        :is-submitting="rewardsStore.isSubmitting"
        @submit="handleCreateReward"
      />

      <section
        class="rounded-[var(--app-radius-xl)] border border-[var(--app-border)] bg-[var(--app-surface)] shadow-[var(--app-shadow-card)] backdrop-blur-[14px] p-[20px]"
      >
        <div
          class="flex flex-col gap-[16px] sm:flex-row sm:items-start sm:justify-between"
        >
          <div class="min-w-[0px]">
            <p class="text-[18px] font-[800] leading-[1.3] tracking-[0px] text-[var(--app-text-strong)]">
              獎勵清單
            </p>
            <p class="mt-[4px] text-[14px] font-[600] leading-[1.5] text-[var(--app-text-muted)]">
              管理自己建立的獎勵，或兌換對方開放的項目。
            </p>
          </div>
        </div>

        <div class="grid gap-[16px] mt-[20px]">
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
            title="目前沒有獎勵"
            description="新增一個願望，讓點數有更明確的期待。"
          />
        </div>
      </section>

      <section
        class="rounded-[var(--app-radius-xl)] border border-[var(--app-border)] bg-[var(--app-surface)] shadow-[var(--app-shadow-card)] backdrop-blur-[14px] p-[20px]"
      >
        <div
          class="flex flex-col gap-[16px] sm:flex-row sm:items-start sm:justify-between"
        >
          <div class="min-w-[0px]">
            <p class="text-[18px] font-[800] leading-[1.3] tracking-[0px] text-[var(--app-text-strong)]">
              兌換紀錄
            </p>
            <p class="mt-[4px] text-[14px] font-[600] leading-[1.5] text-[var(--app-text-muted)]">
              最近完成的願望會保留在這裡。
            </p>
          </div>

          <span
            class="inline-flex min-h-[32px] items-center gap-[4px] rounded-full border border-[var(--app-border)] bg-[var(--app-button-secondary-bg)] px-[12px] py-[8px] text-[13px] font-[700] leading-[1.2] text-[var(--app-text-strong)]"
          >
            {{ rewardsStore.redemptions.length }} 筆
          </span>
        </div>

        <div class="grid gap-[16px] mt-[20px]">
          <RedemptionHistoryCard
            v-for="redemption in rewardsStore.getRecentRedemptions"
            :key="redemption.id"
            :current-uid="currentUid"
            :redemption="redemption"
          />

          <AppEmptyState
            v-if="!rewardsStore.redemptions.length"
            title="目前沒有兌換紀錄"
            description="兌換獎勵後，紀錄會出現在這裡。"
          />
        </div>
      </section>
    </section>
  </MobileAppShell>
</template>

<spec lang="md">
#### 1. 說明

- 顯示伴侶共用的獎勵商店，讓使用者建立獎勵、兌換對方獎勵並查看兌換紀錄。

#### 2. 功能需求

- 1) 進入頁面後，若已配對且有使用者資料，以 coral 漸層英雄卡顯示目前點數，下方三格小卡顯示可兌換、我建立、已兌換數量。
- 2) 使用者可透過建立獎勵表單新增願望，送出成功後顯示成功訊息。
- 3) 獎勵清單顯示所有獎勵；自己建立的項目可切換上架狀態，對方建立且符合條件的項目可兌換。
- 4) 兌換紀錄顯示最近兌換結果，沒有資料時顯示空狀態。
- A1：尚未配對或缺少使用者資料時，顯示無法使用獎勵的狀態說明，不顯示建立表單。

#### 3. 對接口

- props：無。
- emit：無。
- defineModel：無。

#### 4. 實作方式

- 使用 rewards store 同步獎勵與兌換紀錄。
- 使用 user store 取得目前使用者、配對與點數狀態。
- 以 computed 分離目前點數、可兌換獎勵、我建立的獎勵與我兌換的紀錄。
</spec>
