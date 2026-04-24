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
    return "待辦已完成";
  }

  if (pointLog.type === "reward_redeem") {
    return "獎勵兌換";
  }

  return "手動調整";
};

const resolvePointLogDescription = (pointLog: PointLog) => {
  if (pointLog.taskId) {
    return pointLog.taskTitle
      ? `來自待辦：${pointLog.taskTitle}`
      : `待辦編號：${pointLog.taskId}`;
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
    <header class="app-page-header">
      <div class="app-page-header-row">
        <div class="min-w-[0px]">
          <div class="app-chip">點數</div>
          <h1 class="app-page-title mt-[12px] max-w-[11ch]">點數紀錄</h1>
        </div>
      </div>

      <p class="app-page-summary">你們的加分、扣點與來源都會保留。</p>
    </header>

    <section class="app-page-content app-section-stack flex-1">
      <section v-if="!canUsePoints" class="app-card app-card-section">
        <p class="app-label">目前狀態</p>
        <p class="app-status-title mt-[12px]">尚未開始累積點數</p>
        <p class="app-card-caption mt-[12px]">
          確認另一半完成後會開始累積點數。
        </p>
      </section>

      <section v-else class="app-metric-grid">
        <article class="app-card app-card-section-sm">
          <p class="app-label">目前總分</p>
          <p class="app-metric-value mt-[8px]">
            {{ currentPoints }}
          </p>
        </article>

        <article class="app-card-muted app-card-section-sm">
          <p class="app-label">累積獲得</p>
          <p class="app-metric-value mt-[8px]">
            {{ pointsStore.getEarnedPoints }}
          </p>
        </article>
      </section>

      <section class="app-card app-card-section">
        <div class="app-card-header-split">
          <div class="min-w-[0px]">
            <p class="app-card-title">最近變動</p>
          </div>
        </div>

        <div class="app-card-list mt-[20px]">
          <article
            v-for="pointLog in pointsStore.pointLogs"
            :key="pointLog.id"
            class="app-card-muted app-card-section-sm"
          >
            <div class="flex items-start gap-[12px]">
              <div class="min-w-[0px]">
                <div class="flex flex-wrap items-center gap-[8px]">
                  <p class="app-list-title">
                    {{ resolvePointLogTitle(pointLog) }}
                  </p>
                  <span class="app-number-pill">
                    {{ getPointPrefix(pointLog.points) }}{{ pointLog.points }}
                  </span>
                </div>
                <p class="app-list-body mt-[8px]">
                  {{ resolvePointLogDescription(pointLog) }}
                </p>
                <p class="app-meta-caption mt-[8px]">
                  {{ formatDateTime(pointLog.createdAt) }}
                </p>
              </div>
            </div>
          </article>

          <AppEmptyState
            v-if="!pointsStore.pointLogs.length"
            title="還沒有點數變動"
            description="完成待辦或兌換獎勵後會出現紀錄。"
          />
        </div>
      </section>
    </section>
  </MobileAppShell>
</template>
