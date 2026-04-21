<script setup lang="ts">
import { computed, watch } from "vue";
import { useRouter } from "vue-router";
import AppEmptyState from "@/components/common/AppEmptyState.vue";
import { useErrorToast } from "@/composables/useErrorToast";
import DashboardIcon from "@/components/common/DashboardIcon.vue";
import MobileAppShell from "@/components/MobileAppShell.vue";
import { useAuthStore } from "@/pinia/auth";
import { useCoupleStore } from "@/pinia/couple";
import { useNotificationsStore } from "@/pinia/notifications";
import { usePointsStore } from "@/pinia/points";
import { useRewardsStore } from "@/pinia/rewards";
import { useTasksStore } from "@/pinia/tasks";
import { useUserStore } from "@/pinia/user";
import type { NotificationType } from "@/views/notifications/types/interface";
import type { PointLogType } from "@/views/points/types/interface";
import type { RedemptionStatus } from "@/views/rewards/types/interface";
import type { Task } from "@/views/tasks/types/interface";

type DashboardRouteName =
  | "notifications"
  | "pairing"
  | "points"
  | "rewards"
  | "settings"
  | "tasks";

type DashboardIconName =
  | "activity"
  | "add"
  | "bell"
  | "gift"
  | "heart-link"
  | "points"
  | "settings"
  | "shield-check"
  | "tasks";

type QuickAction = {
  icon: DashboardIconName;
  label: string;
  routeName: DashboardRouteName;
};

type ActivityItem = {
  createdAt: Date;
  description: string;
  icon: DashboardIconName;
  id: string;
  label: string;
};

const authStore = useAuthStore();
const coupleStore = useCoupleStore();
const notificationsStore = useNotificationsStore();
const pointsStore = usePointsStore();
const rewardsStore = useRewardsStore();
const tasksStore = useTasksStore();
const userStore = useUserStore();
const router = useRouter();

useErrorToast(() => authStore.errorMessage);
useErrorToast(() => notificationsStore.errorMessage);
useErrorToast(() => pointsStore.errorMessage);
useErrorToast(() => rewardsStore.errorMessage);
useErrorToast(() => tasksStore.errorMessage);

const getUserName = computed(
  () => userStore.profile?.displayName || "TwoDo User",
);
const currentUid = computed(() => userStore.profile?.uid ?? "");
const currentPoints = computed(() => userStore.profile?.points ?? 0);
const pendingAssignedTasks = computed(() =>
  tasksStore.tasks.filter(
    (task) => task.assignedTo === currentUid.value && task.status === "pending",
  ),
);
const waitingConfirmTasks = computed(() =>
  tasksStore.tasks.filter(
    (task) =>
      task.createdBy === currentUid.value &&
      task.status === "completed_pending_confirm",
  ),
);
const redeemableRewardsCount = computed(
  () =>
    rewardsStore.rewards.filter((reward) => {
      if (!reward.isActive) {
        return false;
      }

      if (reward.createdBy === currentUid.value) {
        return false;
      }

      return currentPoints.value >= reward.cost;
    }).length,
);
const recentAssignedTasks = computed(() =>
  pendingAssignedTasks.value.slice(0, 3),
);
const recentWaitingConfirmTasks = computed(() =>
  waitingConfirmTasks.value.slice(0, 3),
);
const getUnreadNotificationsText = computed(() =>
  String(notificationsStore.getUnreadCount),
);
const getCoupleDescription = computed(() => {
  if (coupleStore.getIsPaired) {
    return "已完成配對，可查看待辦、積分與活動。";
  }

  if (coupleStore.currentCoupleId) {
    return "配對資料同步中，完成後會顯示任務與獎勵。";
  }

  return "完成配對後，任務、獎勵、通知與點數會集中在這裡。";
});
const getHeroTitle = computed(() => {
  if (!coupleStore.getIsPaired) {
    return "先完成配對，開始共享任務";
  }

  if (waitingConfirmTasks.value.length) {
    return `有 ${waitingConfirmTasks.value.length} 件任務等你確認`;
  }

  if (pendingAssignedTasks.value.length) {
    return `今天有 ${pendingAssignedTasks.value.length} 件待辦`;
  }

  return "今天沒有待處理任務";
});

const formatDateTime = (value: Date) =>
  new Intl.DateTimeFormat("zh-TW", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);

const resolveTaskMeta = (task: Task) => {
  if (task.dueDate) {
    return `截止 ${formatDateTime(task.dueDate)}`;
  }

  return `${task.points} 點任務`;
};

const goTo = async (routeName: DashboardRouteName) => {
  await router.push({ name: routeName });
};

const handleSignOut = async () => {
  try {
    await authStore.signOutUser();
    await router.push({ name: "login" });
  } catch {
    // The store already exposes a user-facing error message.
  }
};

const quickActions = computed<QuickAction[]>(() => [
  {
    icon: "tasks",
    label: "任務",
    routeName: "tasks",
  },
  {
    icon: "gift",
    label: "獎勵",
    routeName: "rewards",
  },
  {
    icon: "points",
    label: "積分",
    routeName: "points",
  },
  {
    icon: "bell",
    label: "通知",
    routeName: "notifications",
  },
  {
    icon: "heart-link",
    label: "配對",
    routeName: "pairing",
  },
  {
    icon: "settings",
    label: "設定",
    routeName: "settings",
  },
]);

const notificationTypeIconMap: Record<NotificationType, DashboardIconName> = {
  new_task: "tasks",
  reward_redeemed: "gift",
  task_completed_pending_confirm: "shield-check",
  task_confirmed: "points",
};

const pointLogTypeIconMap: Record<PointLogType, DashboardIconName> = {
  manual_adjust: "activity",
  reward_redeem: "gift",
  task_reward: "points",
};

const redemptionStatusLabelMap: Record<RedemptionStatus, string> = {
  cancelled: "已取消",
  completed: "已完成",
  pending: "待處理",
};

const recentActivities = computed<ActivityItem[]>(() => {
  const notificationActivities = notificationsStore.notifications
    .slice(0, 4)
    .map((notification) => ({
      createdAt: notification.createdAt,
      description: notification.message,
      icon: notificationTypeIconMap[notification.type],
      id: `notification-${notification.id}`,
      label: notification.title,
    }));

  const pointActivities = pointsStore.pointLogs.slice(0, 4).map((pointLog) => ({
    createdAt: pointLog.createdAt,
    description: pointLog.taskTitle
      ? `任務「${pointLog.taskTitle}」已更新 ${pointLog.points > 0 ? "+" : ""}${pointLog.points} 點`
      : pointLog.rewardTitle
        ? `獎勵「${pointLog.rewardTitle}」已變動 ${pointLog.points > 0 ? "+" : ""}${pointLog.points} 點`
        : `點數變動 ${pointLog.points > 0 ? "+" : ""}${pointLog.points}`,
    icon: pointLogTypeIconMap[pointLog.type],
    id: `point-${pointLog.id}`,
    label:
      pointLog.type === "task_reward"
        ? "積分入帳"
        : pointLog.type === "reward_redeem"
          ? "獎勵扣點"
          : "手動調整",
  }));

  const redemptionActivities = rewardsStore.getRecentRedemptions
    .slice(0, 4)
    .map((redemption) => ({
      createdAt: redemption.createdAt,
      description: `${redemption.rewardTitle || "未命名獎勵"}，${redemption.cost} 點，${redemptionStatusLabelMap[redemption.status]}`,
      icon: "gift" as const,
      id: `redemption-${redemption.id}`,
      label:
        redemption.redeemedBy === currentUid.value
          ? "我兌換了獎勵"
          : "另一半兌換了獎勵",
    }));

  return [
    ...notificationActivities,
    ...pointActivities,
    ...redemptionActivities,
  ]
    .sort(
      (leftItem, rightItem) =>
        rightItem.createdAt.getTime() - leftItem.createdAt.getTime(),
    )
    .slice(0, 6);
});

watch(
  () => ({
    coupleId: userStore.profile?.coupleId ?? "",
    uid: userStore.profile?.uid ?? "",
  }),
  ({ coupleId, uid }) => {
    if (!coupleId || !uid) {
      notificationsStore.reset();
      pointsStore.reset();
      rewardsStore.reset();
      tasksStore.reset();
      return;
    }

    void notificationsStore.syncNotifications(uid, coupleId);
    void pointsStore.syncPointLogs(uid, coupleId);
    void rewardsStore.syncRewards(coupleId);
    void tasksStore.syncTasks(coupleId);
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
          <div class="app-chip">今日總覽</div>
          <h1
            class="app-text-strong mt-[16px] max-w-[12ch] text-[34px] font-semibold leading-[1.04] tracking-[-0.045em]"
          >
            嗨，{{ getUserName }}
          </h1>
        </div>

        <button
          class="app-ghost-button shrink-0 px-[16px] py-[12px] text-[14px]"
          type="button"
          @click="handleSignOut"
        >
          登出
        </button>
      </div>

      <p class="app-text-muted max-w-[36ch] text-[14px] leading-[24px]">
        待辦、確認、點數與通知都在這裡。
      </p>
    </header>

    <section class="flex-1 space-y-[16px] px-[20px] pb-[24px] sm:px-[28px]">
      <section class="app-hero-card dashboard-hero p-[20px]">
        <div class="flex items-start justify-between gap-[16px]">
          <div>
            <p class="app-hero-kicker">今天狀態</p>
            <p
              class="app-text-strong mt-[16px] max-w-[14ch] text-[30px] font-semibold leading-[1.08] tracking-[-0.04em]"
            >
              {{ getHeroTitle }}
            </p>
            <p
              class="app-hero-body mt-[12px] max-w-[36ch] text-[14px] leading-[24px]"
            >
              {{ getCoupleDescription }}
            </p>
          </div>

          <div class="dashboard-icon-orb">
            <DashboardIcon name="heart-link" :size="28" />
          </div>
        </div>

        <div class="mt-[20px] grid grid-cols-2 gap-[12px] sm:grid-cols-4">
          <article class="app-hero-stat dashboard-stat px-[16px] py-[16px]">
            <div class="dashboard-stat-icon">
              <DashboardIcon name="points" :size="18" />
            </div>
            <p class="app-label mt-[12px]">目前點數</p>
            <p class="app-text-strong mt-[8px] text-[28px] font-semibold">
              {{ currentPoints }}
            </p>
          </article>

          <article class="app-hero-stat dashboard-stat px-[16px] py-[16px]">
            <div class="dashboard-stat-icon">
              <DashboardIcon name="tasks" :size="18" />
            </div>
            <p class="app-label mt-[12px]">指派給我</p>
            <p class="app-text-strong mt-[8px] text-[28px] font-semibold">
              {{ pendingAssignedTasks.length }}
            </p>
          </article>

          <article class="app-hero-stat dashboard-stat px-[16px] py-[16px]">
            <div class="dashboard-stat-icon">
              <DashboardIcon name="shield-check" :size="18" />
            </div>
            <p class="app-label mt-[12px]">待我確認</p>
            <p class="app-text-strong mt-[8px] text-[28px] font-semibold">
              {{ waitingConfirmTasks.length }}
            </p>
          </article>

          <article class="app-hero-stat dashboard-stat px-[16px] py-[16px]">
            <div class="dashboard-stat-icon">
              <DashboardIcon name="bell" :size="18" />
            </div>
            <p class="app-label mt-[12px]">未讀通知</p>
            <p class="app-text-strong mt-[8px] text-[28px] font-semibold">
              {{ getUnreadNotificationsText }}
            </p>
          </article>
        </div>
      </section>

      <section class="app-card px-[20px] py-[20px]">
        <div class="flex items-center justify-between gap-[12px]">
          <div>
            <p class="app-label">快速入口</p>
            <p
              class="app-text-strong mt-[8px] text-[24px] font-semibold tracking-[-0.04em]"
            >
              常用功能
            </p>
          </div>

          <div class="app-accent-panel px-[12px] py-[8px] text-right">
            <p class="app-kicker">入口數</p>
            <p class="app-text-strong mt-[4px] text-[14px] font-semibold">
              {{ quickActions.length }}
            </p>
          </div>
        </div>

        <div class="mt-[20px] grid grid-cols-2 gap-[12px]">
          <button
            v-for="action in quickActions"
            :key="action.routeName"
            class="dashboard-action-card"
            type="button"
            :aria-label="`前往${action.label}`"
            @click="goTo(action.routeName)"
          >
            <span class="dashboard-action-icon">
              <DashboardIcon :name="action.icon" :size="22" />
            </span>

            <span class="app-text-strong block text-[16px] font-semibold">
              {{ action.label }}
            </span>
          </button>
        </div>
      </section>

      <section class="grid gap-[16px] lg:grid-cols-2">
        <section class="app-card px-[20px] py-[20px]">
          <div class="flex items-center justify-between gap-[12px]">
            <div>
              <p class="app-label">今日待辦</p>
              <p
                class="app-text-strong mt-[8px] text-[24px] font-semibold tracking-[-0.04em]"
              >
                指派給我的任務
              </p>
            </div>

            <div class="dashboard-icon-badge">
              <DashboardIcon name="tasks" :size="18" />
            </div>
          </div>

          <div class="mt-[20px] space-y-[12px]">
            <article
              v-for="task in recentAssignedTasks"
              :key="task.id"
              class="dashboard-task-item"
            >
              <div class="min-w-0">
                <p class="app-text-strong truncate text-[16px] font-semibold">
                  {{ task.title }}
                </p>
                <p class="app-text-muted mt-[6px] text-[13px] leading-[20px]">
                  {{ task.description || resolveTaskMeta(task) }}
                </p>
              </div>

              <div class="dashboard-task-pill">{{ task.points }} 點</div>
            </article>

            <AppEmptyState
              v-if="!recentAssignedTasks.length"
              title="今天沒有待辦"
              description="對方指派的任務會在這裡。"
            />
          </div>

          <button
            class="app-secondary-button mt-[20px] w-full"
            type="button"
            @click="goTo('tasks')"
          >
            <span class="inline-flex items-center justify-center gap-[10px]">
              <DashboardIcon name="add" :size="18" />
              前往任務頁
            </span>
          </button>
        </section>

        <section class="app-card px-[20px] py-[20px]">
          <div class="flex items-center justify-between gap-[12px]">
            <div>
              <p class="app-label">待我確認</p>
              <p
                class="app-text-strong mt-[8px] text-[24px] font-semibold tracking-[-0.04em]"
              >
                已完成待確認
              </p>
            </div>

            <div class="dashboard-icon-badge">
              <DashboardIcon name="shield-check" :size="18" />
            </div>
          </div>

          <div class="mt-[20px] space-y-[12px]">
            <article
              v-for="task in recentWaitingConfirmTasks"
              :key="task.id"
              class="dashboard-task-item"
            >
              <div class="min-w-0">
                <p class="app-text-strong truncate text-[16px] font-semibold">
                  {{ task.title }}
                </p>
                <p class="app-text-muted mt-[6px] text-[13px] leading-[20px]">
                  {{
                    task.completedAt
                      ? `完成於 ${formatDateTime(task.completedAt)}`
                      : "等待確認"
                  }}
                </p>
              </div>

              <div class="dashboard-task-pill dashboard-task-pill-accent">
                確認
              </div>
            </article>

            <AppEmptyState
              v-if="!recentWaitingConfirmTasks.length"
              title="沒有待確認項目"
              description="對方完成後會提醒你確認。"
            />
          </div>

          <div class="mt-[20px] grid grid-cols-2 gap-[12px]">
            <article class="dashboard-mini-stat">
              <p class="app-label">可兌換獎勵</p>
              <p class="app-text-strong mt-[8px] text-[24px] font-semibold">
                {{ redeemableRewardsCount }}
              </p>
            </article>

            <article class="dashboard-mini-stat">
              <p class="app-label">最近兌換</p>
              <p class="app-text-strong mt-[8px] text-[24px] font-semibold">
                {{ rewardsStore.getRecentRedemptions.length }}
              </p>
            </article>
          </div>
        </section>
      </section>

      <section class="app-card px-[20px] py-[20px]">
        <div class="flex items-center justify-between gap-[12px]">
          <div>
            <p class="app-label">最近活動</p>
            <p
              class="app-text-strong mt-[8px] text-[24px] font-semibold tracking-[-0.04em]"
            >
              通知、積分與兌換摘要
            </p>
          </div>

          <div class="dashboard-icon-badge">
            <DashboardIcon name="activity" :size="18" />
          </div>
        </div>

        <div class="mt-[20px] space-y-[12px]">
          <article
            v-for="activity in recentActivities"
            :key="activity.id"
            class="dashboard-activity-item"
          >
            <span class="dashboard-activity-icon">
              <DashboardIcon :name="activity.icon" :size="18" />
            </span>

            <div class="min-w-0">
              <p class="app-text-strong text-[15px] font-semibold">
                {{ activity.label }}
              </p>
              <p class="app-text-muted mt-[6px] text-[13px] leading-[20px]">
                {{ activity.description }}
              </p>
            </div>

            <time class="dashboard-activity-time">
              {{ formatDateTime(activity.createdAt) }}
            </time>
          </article>

          <AppEmptyState
            v-if="!recentActivities.length"
            title="還沒有最近活動"
            description="任務、加分與兌換會出現在這裡。"
          />
        </div>
      </section>
    </section>
  </MobileAppShell>
</template>

<style scoped>
.dashboard-hero {
  position: relative;
  overflow: hidden;
}

.dashboard-icon-orb {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  color: var(--app-accent-strong);
  box-shadow: 0 16px 36px rgba(13, 106, 223, 0.14);
}

.dashboard-stat,
.dashboard-mini-stat {
  border: 1px solid rgba(255, 255, 255, 0.65);
  border-radius: 1.4rem;
  background: rgba(255, 255, 255, 0.68);
  backdrop-filter: blur(12px);
}

.dashboard-stat-icon,
.dashboard-icon-badge,
.dashboard-activity-icon,
.dashboard-action-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  color: var(--app-accent-strong);
  background: var(--app-accent-soft);
}

.dashboard-stat-icon,
.dashboard-icon-badge {
  width: 2.25rem;
  height: 2.25rem;
}

.dashboard-action-card {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  min-height: 5.75rem;
  border: 1px solid var(--app-border);
  border-radius: 1.4rem;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.86) 0%,
    rgba(244, 248, 255, 0.92) 100%
  );
  padding: 1rem;
  text-align: center;
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    border-color 180ms ease;
}

.dashboard-action-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 18px 36px rgba(148, 163, 184, 0.16);
  border-color: rgba(29, 143, 242, 0.24);
}

.dashboard-action-card:focus-visible {
  outline: 2px solid rgba(29, 143, 242, 0.34);
  outline-offset: 3px;
}

.dashboard-action-icon,
.dashboard-activity-icon {
  flex-shrink: 0;
}

.dashboard-action-icon {
  width: 2.75rem;
  height: 2.75rem;
}

.dashboard-task-item,
.dashboard-activity-item {
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
  justify-content: space-between;
  border: 1px solid rgba(191, 206, 228, 0.64);
  border-radius: 1.25rem;
  background: rgba(249, 251, 255, 0.92);
  padding: 0.95rem 1rem;
}

.dashboard-task-pill {
  flex-shrink: 0;
  border-radius: 999px;
  background: rgba(29, 143, 242, 0.1);
  padding: 0.45rem 0.75rem;
  color: var(--app-accent-strong);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.06em;
}

.dashboard-task-pill-accent {
  background: rgba(20, 184, 166, 0.12);
  color: var(--color-support-700);
}

.dashboard-activity-icon {
  width: 2.25rem;
  height: 2.25rem;
}

.dashboard-activity-time {
  flex-shrink: 0;
  color: var(--app-text-soft);
  font-size: 0.75rem;
  line-height: 1.25rem;
  text-align: right;
}
</style>
