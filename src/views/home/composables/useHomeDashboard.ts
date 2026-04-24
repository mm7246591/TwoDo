import { computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useErrorToast } from "@/composables/useErrorToast";
import { useNotificationsStore } from "@/pinia/notifications";
import { usePointsStore } from "@/pinia/points";
import { useRewardsStore } from "@/pinia/rewards";
import { useTasksStore } from "@/pinia/tasks";
import { useUserStore } from "@/pinia/user";
import {
  canCompleteTask,
  canConfirmTask,
  isCoupleTask,
  isWaitingForOtherParticipant,
} from "@/services/taskWorkflow";
import { showSuccessMessage } from "@/services/uiFeedback";
import type { Task } from "@/views/tasks/types/interface";
import type {
  HomeDashboardRouteName,
  HomePanelAction,
  HomeTaskItem,
} from "../type/interface";

const formatDateTime = (value: Date) =>
  new Intl.DateTimeFormat("zh-TW", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);

const useHomeDashboard = () => {
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

  const userName = computed(
    () => userStore.profile?.displayName || "TwoDo User",
  );
  const userPhotoUrl = computed(() => userStore.profile?.photoURL);
  const unreadCount = computed(() => notificationsStore.getUnreadCount);
  const currentUid = computed(() => userStore.profile?.uid ?? "");
  const currentPoints = computed(() => userStore.profile?.points ?? 0);
  const isSubmitting = computed(() => tasksStore.isSubmitting);
  const pendingAssignedTasks = computed(() =>
    tasksStore.tasks.filter((task) => canCompleteTask(task, currentUid.value)),
  );
  const pendingCreatedTasks = computed(() =>
    tasksStore.tasks.filter(
      (task) =>
        task.assignmentType === "user" &&
        task.createdBy === currentUid.value &&
        task.status === "pending",
    ),
  );
  const waitingOtherCompletionTasks = computed(() =>
    tasksStore.tasks.filter((task) =>
      isWaitingForOtherParticipant(task, currentUid.value),
    ),
  );
  const waitingConfirmTasks = computed(() =>
    tasksStore.tasks.filter((task) => canConfirmTask(task, currentUid.value)),
  );
  const todayFocusTasks = computed(() =>
    [
      ...pendingAssignedTasks.value,
      ...pendingCreatedTasks.value,
      ...waitingOtherCompletionTasks.value,
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
  const tasksPanelAction: HomePanelAction = {
    icon: "tasks",
    label: "查看全部",
    routeName: "tasks",
  };

  const resolveTaskMeta = (task: Task) => {
    if (task.dueDate) {
      return `截止 ${formatDateTime(task.dueDate)}`;
    }

    return `${task.points} 點`;
  };

  const getTaskOwnerBadge = (task: Task) => {
    if (isCoupleTask(task)) {
      return "我們";
    }

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
      badgeTone: canCompleteTask(task, currentUid.value)
        ? "accent"
        : "neutral",
      canComplete: canCompleteTask(task, currentUid.value),
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

  return {
    currentPoints,
    focusTaskItems,
    goTo,
    handleCompleteTask,
    handleConfirmTask,
    handleRemindTask,
    isSubmitting,
    tasksPanelAction,
    unreadCount,
    userName,
    userPhotoUrl,
    waitingConfirmTaskItems,
  };
};

export { useHomeDashboard };
