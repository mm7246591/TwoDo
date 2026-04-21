<script setup lang="ts">
import { computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useErrorToast } from "@/composables/useErrorToast";
import MobileAppShell from "@/components/MobileAppShell.vue";
import { usePointsStore } from "@/pinia/points";
import { useUserStore } from "@/pinia/user";
import type { PointLog } from "@/views/points/types/interface";

const router = useRouter();
const userStore = useUserStore();
const pointsStore = usePointsStore();

useErrorToast(() => pointsStore.errorMessage);

const canUsePoints = computed(() =>
  Boolean(userStore.profile?.uid && userStore.profile?.coupleId),
);
const currentPoints = computed(() => userStore.profile?.points ?? 0);

const goHome = async () => {
  await router.push({ name: "home" });
};

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
          <div class="app-chip">Points MVP</div>
          <h1
            class="app-text-strong mt-[16px] max-w-[12ch] text-[34px] font-semibold leading-[1.04] tracking-[-0.045em]"
          >
            積分與流水紀錄
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
        這一版把 `task confirmed -> users.points + pointLogs`
        接起來，先驗證積分主流程有正確落到 Firestore。
      </p>
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
          需要先登入並完成配對，積分流水才會綁到你目前的 `coupleId`。
        </p>
      </section>

      <section v-else class="grid grid-cols-2 gap-[16px]">
        <article class="app-card px-[16px] py-[16px]">
          <p class="app-label">目前總分</p>
          <p class="app-text-strong mt-[8px] text-[30px] font-semibold">
            {{ currentPoints }}
          </p>
        </article>

        <article class="app-card-muted px-[16px] py-[16px]">
          <p class="app-label">累積獲得</p>
          <p class="app-text-strong mt-[8px] text-[30px] font-semibold">
            {{ pointsStore.getEarnedPoints }}
          </p>
        </article>
      </section>

      <section class="app-card px-[20px] py-[20px]">
        <div class="flex items-center justify-between gap-[12px]">
          <div>
            <p class="app-label">積分流水</p>
            <p
              class="app-text-strong mt-[8px] text-[24px] font-semibold tracking-[-0.04em]"
            >
              最近變動
            </p>
          </div>

          <div class="app-accent-panel px-[12px] py-[8px] text-right">
            <p class="app-kicker">同步狀態</p>
            <p class="app-text-strong mt-[4px] text-[14px] font-semibold">
              {{ pointsStore.isLoading ? "讀取中" : "已同步" }}
            </p>
          </div>
        </div>

        <div class="mt-[20px] space-y-[16px]">
          <article
            v-for="pointLog in pointsStore.pointLogs"
            :key="pointLog.id"
            class="app-card-muted px-[16px] py-[16px]"
          >
            <div class="flex items-start justify-between gap-[12px]">
              <div class="min-w-0">
                <p class="app-text-strong text-[18px] font-semibold">
                  {{ resolvePointLogTitle(pointLog) }}
                </p>
                <p class="app-text-muted mt-[8px] text-[14px] leading-[24px]">
                  {{ resolvePointLogDescription(pointLog) }}
                </p>
                <p class="app-text-soft mt-[8px] text-[13px] leading-[20px]">
                  {{ formatDateTime(pointLog.createdAt) }}
                </p>
              </div>

              <div
                class="app-accent-panel shrink-0 px-[12px] py-[8px] text-right"
              >
                <p class="app-kicker">Points</p>
                <p class="app-text-strong mt-[4px] text-[16px] font-semibold">
                  {{ getPointPrefix(pointLog.points) }}{{ pointLog.points }}
                </p>
              </div>
            </div>
          </article>

          <p
            v-if="!pointsStore.pointLogs.length"
            class="app-text-muted text-[14px] leading-[24px]"
          >
            還沒有積分流水。先去任務頁完成一筆待辦並由建立者確認完成，這裡就會出現第一筆紀錄。
          </p>
        </div>
      </section>
    </section>
  </MobileAppShell>
</template>
