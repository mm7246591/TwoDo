<script setup lang="ts">
import { computed, watch } from "vue";
import AppEmptyState from "@/components/common/AppEmptyState.vue";
import { useErrorToast } from "@/composables/useErrorToast";
import MobileAppShell from "@/components/MobileAppShell.vue";
import { usePointsStore } from "@/pinia/points";
import { useUserStore } from "@/pinia/user";
import type { PointLog } from "@/views/points/types/interface";

const userStore = useUserStore();
const pointsStore = usePointsStore();

useErrorToast(() => pointsStore.errorMessage);

const canUsePoints = computed(() =>
  Boolean(userStore.profile?.uid && userStore.profile?.coupleId),
);
const currentPoints = computed(() => userStore.profile?.points ?? 0);

const formatDateTime = (value: Date) =>
  new Intl.DateTimeFormat("zh-TW", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);

const getPointPrefix = (points: number) => (points >= 0 ? "+" : "");

const resolvePointLogTitle = (pointLog: PointLog) => {
  if (pointLog.type === "task_reward") {
    return "任務確認完成";
  }

  if (pointLog.type === "reward_redeem") {
    return "獎勵兌換";
  }

  return "手動調整";
};

const resolvePointLogDescription = (pointLog: PointLog) => {
  if (pointLog.taskId) {
    return pointLog.taskTitle
      ? `來自任務：${pointLog.taskTitle}`
      : `任務編號：${pointLog.taskId}`;
  }

  if (pointLog.rewardId) {
    return pointLog.rewardTitle
      ? `兌換獎勵：${pointLog.rewardTitle}`
      : `獎勵編號：${pointLog.rewardId}`;
  }

  return `來源：${pointLog.source}`;
};

watch(
  () => ({
    coupleId: userStore.profile?.coupleId ?? "",
    uid: userStore.profile?.uid ?? "",
  }),
  ({ coupleId, uid }) => {
    if (!coupleId || !uid) {
      pointsStore.reset();
      return;
    }

    void pointsStore.syncPointLogs(uid, coupleId);
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
          <div class="app-chip">積分紀錄</div>
          <h1 class="app-page-title mt-[14px] max-w-[11ch]">
            點數紀錄
          </h1>
        </div>
      </div>

      <p class="app-page-summary">每次加分、扣點和來源都會保留在這裡。</p>
    </header>

    <section class="flex-1 space-y-[16px] px-[20px] pb-[24px] sm:px-[28px]">
      <section v-if="!canUsePoints" class="app-card px-[20px] py-[20px]">
        <p class="app-label">目前狀態</p>
        <p
          class="app-text-strong mt-[12px] text-[24px] font-semibold tracking-[-0.04em]"
        >
          還不能查看積分
        </p>
        <p class="app-text-muted mt-[12px] text-[14px] leading-[24px]">
          先完成配對，才會開始累積點數紀錄。
        </p>
      </section>

      <section v-else class="grid grid-cols-2 gap-[16px]">
        <article class="app-card px-[16px] py-[16px]">
          <p class="app-label">目前總分</p>
          <p class="app-metric-value mt-[8px]">
            {{ currentPoints }}
          </p>
        </article>

        <article class="app-card-muted px-[16px] py-[16px]">
          <p class="app-label">累積獲得</p>
          <p class="app-metric-value mt-[8px]">
            {{ pointsStore.getEarnedPoints }}
          </p>
        </article>
      </section>

      <section class="app-card px-[20px] py-[20px]">
        <div class="flex flex-col gap-[14px] sm:flex-row sm:items-start sm:justify-between">
          <div class="min-w-0">
            <p class="app-label">點數明細</p>
            <p class="app-card-title mt-[8px]">最近點數變動</p>
            <p class="app-card-caption mt-[8px]">
              新的變動會依時間排序在最上面。
            </p>
          </div>

          <span
            :class="[
              'app-meta-pill',
              pointsStore.isLoading ? 'app-meta-pill-accent' : 'app-meta-pill-success',
            ]"
          >
            {{ pointsStore.isLoading ? "資料同步中" : "資料已同步" }}
          </span>
        </div>

        <div class="mt-[20px] space-y-[16px]">
          <article
            v-for="pointLog in pointsStore.pointLogs"
            :key="pointLog.id"
            class="app-card-muted px-[16px] py-[16px]"
          >
            <div class="flex items-start gap-[12px]">
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-[8px]">
                  <p class="app-text-strong text-[17px] font-semibold leading-[1.35]">
                    {{ resolvePointLogTitle(pointLog) }}
                  </p>
                  <span class="app-number-pill">
                    {{ getPointPrefix(pointLog.points) }}{{ pointLog.points }}
                  </span>
                </div>
                <p class="app-text-muted mt-[10px] text-[14px] leading-[22px]">
                  {{ resolvePointLogDescription(pointLog) }}
                </p>
                <p class="app-text-soft mt-[10px] text-[13px] leading-[20px]">
                  {{ formatDateTime(pointLog.createdAt) }}
                </p>
              </div>
            </div>
          </article>

          <AppEmptyState
            v-if="!pointsStore.pointLogs.length"
            title="還沒有點數變動"
            description="確認任務後，加分紀錄會出現在這裡。"
          />
        </div>
      </section>
    </section>
  </MobileAppShell>
</template>
