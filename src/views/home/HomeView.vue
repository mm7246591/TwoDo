<script setup lang="ts">
import { computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useErrorToast } from "@/composables/useErrorToast";
import MobileAppShell from "@/components/MobileAppShell.vue";
import { useNotificationsStore } from "@/pinia/notifications";
import { usePointsStore } from "@/pinia/points";
import { useRewardsStore } from "@/pinia/rewards";
import { useTasksStore } from "@/pinia/tasks";
import { useUserStore } from "@/pinia/user";
import { showSuccessMessage } from "@/services/uiFeedback";
import type { Task } from "@/views/tasks/types/interface";
import type {
  HomeDashboardRouteName,
  HomePanelAction,
  HomeTaskItem,
} from "./type/interface";

import Header from "@/components/home/Header.vue";
import PointCard from "@/components/home/PointCard.vue";
import TaskPanel from "@/components/home/TaskPanel.vue";

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
const pendingCreatedTasks = computed(() =>
  tasksStore.tasks.filter(
    (task) => task.createdBy === currentUid.value && task.status === "pending",
  ),
);
const waitingConfirmTasks = computed(() =>
  tasksStore.tasks.filter(
    (task) =>
      task.createdBy === currentUid.value &&
      task.status === "completed_pending_confirm",
  ),
);
const todayFocusTasks = computed(() =>
  [
    ...pendingAssignedTasks.value,
    ...pendingCreatedTasks.value.filter(
      (task) => task.assignedTo !== currentUid.value,
    ),
  ]
    .sort(
      (leftTask, rightTask) =>
        rightTask.updatedAt.getTime() - leftTask.updatedAt.getTime(),
    )
    .slice(0, 3),
);
const recentWaitingConfirmTasks = computed(() =>
  waitingConfirmTasks.value.slice(0, 1),
);
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

const findTaskById = (taskId: string) =>
  tasksStore.tasks.find((task) => task.id === taskId);

const handleCompleteTask = async (taskId: string) => {
  const task = findTaskById(taskId);

  if (!task || !currentUid.value) {
    return;
  }

  try {
    await tasksStore.markTaskCompleted(task, currentUid.value);
  } catch {
    return;
  }

  showSuccessMessage("已標記完成");
};

const handleConfirmTask = async (taskId: string) => {
  const task = findTaskById(taskId);

  if (!task || !currentUid.value) {
    return;
  }

  try {
    await tasksStore.confirmTaskCompletion(task, currentUid.value);
  } catch {
    return;
  }

  showSuccessMessage("已確認並加點數");
};

const handleRemindTask = (taskId: string) => {
  if (!findTaskById(taskId)) {
    return;
  }

  showSuccessMessage("會先保留在待確認清單");
};

const getTaskOwnerBadge = (task: Task) => {
  if (task.assignedTo === currentUid.value) {
    return "我";
  }

  if (task.assignedTo === userStore.profile?.partnerUid) {
    return "你";
  }

  return "我們";
};

const focusTaskItems = computed<HomeTaskItem[]>(() =>
  todayFocusTasks.value.map((task) => ({
    badge: getTaskOwnerBadge(task),
    badgeTone: task.assignedTo === currentUid.value ? "accent" : "neutral",
    canComplete: task.assignedTo === currentUid.value,
    description: task.description || resolveTaskMeta(task),
    id: task.id,
    title: task.title,
  })),
);

const waitingConfirmTaskItems = computed<HomeTaskItem[]>(() =>
  recentWaitingConfirmTasks.value.map((task) => ({
    badge: "待確認",
    badgeTone: "success",
    canConfirm: true,
    description: task.completedAt
      ? `完成於 ${formatDateTime(task.completedAt)}`
      : "等你確認",
    id: task.id,
    title: task.title,
  })),
);

const tasksPanelAction: HomePanelAction = {
  icon: "tasks",
  label: "查看全部",
  routeName: "tasks",
};

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
    <Header
      :photo-url="userStore.profile?.photoURL"
      summary="今天也是美好的一天，一起加油。"
      :unread-count="notificationsStore.getUnreadCount"
      :user-name="userName"
      @notifications="goTo('notifications')"
    />

    <section class="app-page-content grid flex-1 gap-[var(--app-space-24)]">
      <PointCard
        :current-points="currentPoints"
        :user-name="userName"
        :user-photo-url="userStore.profile?.photoURL"
        @redeem="goTo('rewards')"
      />

      <section class="grid gap-[var(--app-space-24)]">
        <TaskPanel
          :action="tasksPanelAction"
          :empty-state="{
            title: '現在很輕鬆',
            description: '要不要為夥伴建立一個小驚喜？',
          }"
          empty-variant="focus"
          :is-submitting="tasksStore.isSubmitting"
          :items="focusTaskItems"
          icon="tasks"
          title="今日焦點"
          @complete="handleCompleteTask"
          @confirm="handleConfirmTask"
          @navigate="goTo"
          @remind="handleRemindTask"
        />

        <TaskPanel
          :empty-state="{
            description: '夥伴還在努力中，等他完成任務後再來給個大大的擁抱吧！',
          }"
          empty-variant="confirmation"
          :is-submitting="tasksStore.isSubmitting"
          :items="waitingConfirmTaskItems"
          icon="shield-check"
          title="需要你的肯定"
          @complete="handleCompleteTask"
          @confirm="handleConfirmTask"
          @navigate="goTo"
          @remind="handleRemindTask"
        />
      </section>
    </section>
  </MobileAppShell>
</template>
