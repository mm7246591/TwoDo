<script setup lang="ts">
import { computed, watch } from "vue";
import AppEmptyState from "@/components/common/AppEmptyState.vue";
import { useErrorToast } from "@/composables/useErrorToast";
import MobileAppShell from "@/components/common/MobileAppShell.vue";
import { usePointsStore } from "@/pinia/points";
import { useUserStore } from "@/pinia/user";
import type { PointLog } from "@/views/point/types/interface";

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
    return "任務完成";
  }

  if (pointLog.type === "reward_redeem") {
    return "獎勵兌換";
  }

  return "點數調整";
};

const resolvePointLogDescription = (pointLog: PointLog) => {
  if (pointLog.taskId) {
    return pointLog.taskTitle
      ? `任務：${pointLog.taskTitle}`
      : `任務 ID：${pointLog.taskId}`;
  }

  if (pointLog.rewardId) {
    return pointLog.rewardTitle
      ? `兌換獎勵：${pointLog.rewardTitle}`
      : `獎勵 ID：${pointLog.rewardId}`;
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
    <header class="grid gap-[20px] px-[20px] pb-[24px] pt-[32px] sm:px-[28px] sm:pt-[40px]">
      <div class="flex items-start justify-between gap-[12px]">
        <div class="min-w-[0px]">
          <div class="inline-flex items-center gap-[8px] rounded-full border border-[var(--app-chip-border)] bg-[var(--app-chip-bg)] px-[12px] py-[8px] text-[13px] font-[700] leading-[1.2] tracking-[0.045em] text-[var(--app-chip-text)] shadow-[var(--app-shadow-chip)] backdrop-blur-[12px]">點數</div>
          <h1 class="text-[32px] font-[700] leading-[1.04] tracking-[-0.03em] text-[var(--app-text-strong)] mt-[12px] max-w-[11ch]">點數紀錄</h1>
        </div>
      </div>

      <p class="max-w-[34ch] text-[16px] leading-[1.65] text-[var(--app-text-muted)]">查看任務完成與獎勵兌換帶來的點數變化。</p>
    </header>

    <section class="px-[20px] pb-[24px] sm:px-[28px] grid gap-[16px] flex-1">
      <section v-if="!canUsePoints" class="rounded-[var(--app-radius-xl)] border border-[var(--app-border)] bg-[var(--app-surface)] shadow-[var(--app-shadow-card)] backdrop-blur-[14px] p-[20px]">
        <p class="text-[13px] font-[700] leading-[1.28] tracking-[0.03em] text-[var(--app-text-soft)]">目前狀態</p>
        <p class="text-[20px] font-[700] leading-[1.24] tracking-[-0.02em] text-[var(--app-text-strong)] mt-[12px]">完成配對後開始累積點數</p>
        <p class="text-[15px] leading-[1.58] text-[var(--app-text-soft)] mt-[12px]">
          完成任務與兌換獎勵後，點數紀錄會顯示在這裡。
        </p>
      </section>

      <section v-else class="grid grid-cols-2 gap-[16px]">
        <article class="rounded-[var(--app-radius-xl)] border border-[var(--app-border)] bg-[var(--app-surface)] shadow-[var(--app-shadow-card)] backdrop-blur-[14px] p-[16px]">
          <p class="text-[13px] font-[700] leading-[1.28] tracking-[0.03em] text-[var(--app-text-soft)]">目前點數</p>
          <p class="text-[28px] font-[700] leading-[1.02] tracking-[-0.03em] text-[var(--app-text-strong)] [font-variant-numeric:tabular-nums] mt-[8px]">
            {{ currentPoints }}
          </p>
        </article>

        <article class="rounded-[var(--app-radius-xl)] border border-[var(--app-card-muted-border)] bg-[image:var(--app-card-muted-bg)] backdrop-blur-[10px] p-[16px]">
          <p class="text-[13px] font-[700] leading-[1.28] tracking-[0.03em] text-[var(--app-text-soft)]">累積獲得</p>
          <p class="text-[28px] font-[700] leading-[1.02] tracking-[-0.03em] text-[var(--app-text-strong)] [font-variant-numeric:tabular-nums] mt-[8px]">
            {{ pointsStore.getEarnedPoints }}
          </p>
        </article>
      </section>

      <section class="rounded-[var(--app-radius-xl)] border border-[var(--app-border)] bg-[var(--app-surface)] shadow-[var(--app-shadow-card)] backdrop-blur-[14px] p-[20px]">
        <div class="flex flex-col gap-[16px] sm:flex-row sm:items-start sm:justify-between">
          <div class="min-w-[0px]">
            <p class="text-[18px] font-[700] leading-[1.3] tracking-[-0.01em] text-[var(--app-text-strong)]">最近紀錄</p>
          </div>
        </div>

        <div class="grid gap-[16px] mt-[20px]">
          <article v-for="pointLog in pointsStore.pointLogs" :key="pointLog.id"
            class="rounded-[var(--app-radius-xl)] border border-[var(--app-card-muted-border)] bg-[image:var(--app-card-muted-bg)] backdrop-blur-[10px] p-[16px]">
            <div class="flex items-start gap-[12px]">
              <div class="min-w-[0px]">
                <div class="flex flex-wrap items-center gap-[8px]">
                  <p class="text-[16px] font-[700] leading-[1.42] text-[var(--app-text-strong)]">
                    {{ resolvePointLogTitle(pointLog) }}
                  </p>
                  <span class="inline-flex min-h-[2rem] items-center gap-[4px] rounded-full border border-transparent bg-[var(--app-accent-soft)] px-[12px] py-[8px] text-[15px] font-[700] leading-[1.2] text-[var(--app-accent-strong)] [font-variant-numeric:tabular-nums]">
                    {{ getPointPrefix(pointLog.points) }}{{ pointLog.points }}
                  </span>
                </div>
                <p class="text-[15px] leading-[1.58] text-[var(--app-text-muted)] mt-[8px]">
                  {{ resolvePointLogDescription(pointLog) }}
                </p>
                <p class="text-[13px] leading-[1.5] text-[var(--app-text-soft)] mt-[8px]">
                  {{ formatDateTime(pointLog.createdAt) }}
                </p>
              </div>
            </div>
          </article>

          <AppEmptyState v-if="!pointsStore.pointLogs.length" title="目前沒有點數紀錄" description="完成任務或兌換獎勵後，紀錄會出現在這裡。" />
        </div>
      </section>
    </section>
  </MobileAppShell>
</template>





