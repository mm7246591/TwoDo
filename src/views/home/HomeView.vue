<script setup lang="ts">
import { computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useErrorToast } from "@/composables/useErrorToast";
import MobileAppShell from "@/components/MobileAppShell.vue";
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
import HomeActivityFeedCard from "./components/HomeActivityFeedCard.vue";
import HomeHeader from "./components/HomeHeader.vue";
import HomeHeroCard from "./components/HomeHeroCard.vue";
import HomeTaskPanel from "./components/HomeTaskPanel.vue";
import type {
  HomeActivityItem,
  HomeDashboardIconName,
  HomeDashboardRouteName,
  HomeHeroStatItem,
  HomePanelAction,
  HomePanelMetric,
  HomeTaskItem,
} from "./type/interface";

const coupleStore = useCoupleStore();
const notificationsStore = useNotificationsStore();
const pointsStore = usePointsStore();
const rewardsStore = useRewardsStore();
const tasksStore = useTasksStore();
const userStore = useUserStore();
const router = useRouter();

useErrorToast(() => notificationsStore.errorMessage);
useErrorToast(() => pointsStore.errorMessage);
useErrorToast(() => rewardsStore.errorMessage);
useErrorToast(() => tasksStore.errorMessage);

const userName = computed(() => userStore.profile?.displayName || "TwoDo User");
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
      if (!reward.isActive || reward.createdBy === currentUid.value) {
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
const heroMessage = computed(() => {
  if (!coupleStore.getIsPaired) {
    if (coupleStore.currentCoupleId) {
      return "正在同步配對資料，待辦、點數和獎勵很快就會出現。";
    }

    return "先完成配對，之後待辦、點數和獎勵就會一起同步。";
  }

  if (waitingConfirmTasks.value.length) {
    return `有 ${waitingConfirmTasks.value.length} 件事等你確認，確認後點數就會入帳。`;
  }

  if (pendingAssignedTasks.value.length) {
    if (pendingAssignedTasks.value.length === 1) {
      return "今天有 1 件待辦在等你，完成它，今天就會順很多。";
    }

    return `今天有 ${pendingAssignedTasks.value.length} 件待辦在等你，先完成最重要的一件就好。`;
  }

  return "今天暫時沒有待辦，剛好留點時間給自己，也陪陪彼此。";
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

  return `${task.points} 點`;
};

const goTo = async (routeName: HomeDashboardRouteName) => {
  await router.push({ name: routeName });
};

const notificationTypeIconMap: Record<NotificationType, HomeDashboardIconName> =
  {
    new_task: "tasks",
    reward_redeemed: "gift",
    task_completed_pending_confirm: "shield-check",
    task_confirmed: "points",
  };

const pointLogTypeIconMap: Record<PointLogType, HomeDashboardIconName> = {
  manual_adjust: "activity",
  reward_redeem: "gift",
  task_reward: "points",
};

const redemptionStatusLabelMap: Record<RedemptionStatus, string> = {
  cancelled: "已取消",
  completed: "已完成",
  pending: "待確認",
};

const heroStats = computed<HomeHeroStatItem[]>(() => [
  {
    icon: "points",
    label: "目前點數",
    value: currentPoints.value,
  },
  {
    icon: "tasks",
    label: "交給我的",
    value: pendingAssignedTasks.value.length,
  },
  {
    icon: "shield-check",
    label: "待確認",
    value: waitingConfirmTasks.value.length,
  },
  {
    icon: "bell",
    label: "未讀通知",
    value: notificationsStore.getUnreadCount,
  },
]);

const assignedTaskItems = computed<HomeTaskItem[]>(() =>
  recentAssignedTasks.value.map((task) => ({
    badge: `${task.points} 點`,
    badgeTone: "accent",
    description: task.description || resolveTaskMeta(task),
    id: task.id,
    title: task.title,
  })),
);

const waitingConfirmTaskItems = computed<HomeTaskItem[]>(() =>
  recentWaitingConfirmTasks.value.map((task) => ({
    badge: "待確認",
    badgeTone: "success",
    description: task.completedAt
      ? `完成於 ${formatDateTime(task.completedAt)}`
      : "等你確認",
    id: task.id,
    title: task.title,
  })),
);

const rewardMetrics = computed<HomePanelMetric[]>(() => [
  {
    label: "可兌換獎勵",
    value: redeemableRewardsCount.value,
  },
  {
    label: "最近兌換",
    value: rewardsStore.getRecentRedemptions.length,
  },
]);

const tasksPanelAction: HomePanelAction = {
  icon: "add",
  label: "查看待辦",
  routeName: "tasks",
};

const recentActivities = computed<HomeActivityItem[]>(() => {
  const notificationActivities = notificationsStore.notifications
    .slice(0, 4)
    .map((notification) => ({
      createdAt: notification.createdAt,
      description: notification.message,
      icon: notificationTypeIconMap[notification.type],
      id: `notification-${notification.id}`,
      label: notification.title,
      timestampLabel: formatDateTime(notification.createdAt),
    }));

  const pointActivities = pointsStore.pointLogs.slice(0, 4).map((pointLog) => ({
    createdAt: pointLog.createdAt,
    description: pointLog.taskTitle
      ? `待辦「${pointLog.taskTitle}」已更新 ${pointLog.points > 0 ? "+" : ""}${pointLog.points} 點`
      : pointLog.rewardTitle
        ? `獎勵「${pointLog.rewardTitle}」變動 ${pointLog.points > 0 ? "+" : ""}${pointLog.points} 點`
        : `點數變動 ${pointLog.points > 0 ? "+" : ""}${pointLog.points}`,
    icon: pointLogTypeIconMap[pointLog.type],
    id: `point-${pointLog.id}`,
    label:
      pointLog.type === "task_reward"
        ? "點數入帳"
        : pointLog.type === "reward_redeem"
          ? "獎勵扣點"
          : "手動調整",
    timestampLabel: formatDateTime(pointLog.createdAt),
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
      timestampLabel: formatDateTime(redemption.createdAt),
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
    <HomeHeader :user-name="userName" summary="今天你們的小事都整理好了。" />

    <section class="app-page-content app-section-stack flex-1">
      <HomeHeroCard :message="heroMessage" :stats="heroStats" />

      <section class="app-section-grid lg:grid-cols-2">
        <HomeTaskPanel
          :action="tasksPanelAction"
          :items="assignedTaskItems"
          icon="tasks"
          title="待完成"
          @navigate="goTo"
        />

        <HomeTaskPanel
          :items="waitingConfirmTaskItems"
          :metrics="rewardMetrics"
          :empty-state="{
            title: '沒有待確認項目',
            description: '另一半完成後，會在這裡等你確認。',
          }"
          icon="shield-check"
          title="待確認"
        />
      </section>

      <HomeActivityFeedCard :activities="recentActivities" />
    </section>
  </MobileAppShell>
</template>
