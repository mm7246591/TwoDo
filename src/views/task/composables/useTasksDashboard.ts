import { computed, ref, watch } from "vue";
import { useErrorToast } from "@/composables/useErrorToast";
import { useTasksStore } from "@/pinia/tasks";
import { useUserStore } from "@/pinia/user";
import {
  canCompleteTask,
  canConfirmTask,
  isWaitingForOtherParticipant,
} from "@/views/task/utils/taskWorkflow";
import { getUserProfile } from "@/services/userService";
import { showSuccessMessage } from "@/composables/useMessage";
import type { CreateTaskInput } from "@/pinia/tasks/types/interface";
import type { Task } from "@/views/task/types/interface";

const useTasksDashboard = () => {
  const userStore = useUserStore();
  const tasksStore = useTasksStore();
  const partnerDisplayName = ref("");

  useErrorToast(() => tasksStore.errorMessage);

  const canUseTasks = computed(() =>
    Boolean(
      userStore.profile?.coupleId &&
        userStore.profile?.partnerUid &&
        userStore.profile?.uid,
    ),
  );
  const currentUid = computed(() => userStore.profile?.uid ?? "");
  const defaultAssignedTo = computed(() => userStore.profile?.partnerUid ?? "");
  const isSubmitting = computed(() => tasksStore.isSubmitting);
  const myAssignedTasks = computed(() =>
    tasksStore.tasks.filter((task) => canCompleteTask(task, currentUid.value)),
  );
  const myCreatedTasks = computed(() =>
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
  const waitingOtherTasks = computed(() => [
    ...myCreatedTasks.value,
    ...waitingOtherCompletionTasks.value,
  ]);
  const waitingConfirmTasks = computed(() =>
    tasksStore.getCompletedPendingConfirmTasks.filter((task) =>
      canConfirmTask(task, currentUid.value),
    ),
  );
  const confirmedTasks = computed(() => tasksStore.getConfirmedTasks);
  const cancelledTasks = computed(() => tasksStore.getCancelledTasks);
  const assigneeLabel = computed(() => partnerDisplayName.value || "另一半");

  watch(
    () => userStore.profile?.coupleId,
    (coupleId) => {
      if (!coupleId) {
        tasksStore.reset();
        return;
      }

      void tasksStore.syncTasks(coupleId);
    },
    { immediate: true },
  );

  watch(
    () => userStore.profile?.partnerUid ?? "",
    async (partnerUid) => {
      partnerDisplayName.value = "";

      if (!partnerUid) {
        return;
      }

      try {
        const partnerProfile = await getUserProfile(partnerUid);
        partnerDisplayName.value = partnerProfile?.displayName?.trim() || "";
      } catch {
        partnerDisplayName.value = "";
      }
    },
    { immediate: true },
  );

  const handleCreateTask = async (
    payload: Omit<CreateTaskInput, "coupleId" | "createdBy">,
  ) => {
    if (!userStore.profile?.uid || !userStore.profile?.coupleId) {
      return;
    }

    try {
      await tasksStore.createNewTask({
        ...payload,
        coupleId: userStore.profile.coupleId,
        createdBy: userStore.profile.uid,
      });
    } catch {
      return;
    }

    showSuccessMessage("待辦已新增");
  };

  const handleCompleteTask = async (task: Task) => {
    if (!userStore.profile?.uid) {
      return;
    }

    try {
      await tasksStore.markTaskCompleted(task, userStore.profile.uid);
    } catch {
      return;
    }

    showSuccessMessage("已標記完成");
  };

  const handleConfirmTask = async (task: Task) => {
    if (!userStore.profile?.uid) {
      return;
    }

    try {
      await tasksStore.confirmTaskCompletion(task, userStore.profile.uid);
    } catch {
      return;
    }

    showSuccessMessage("已確認並加點數");
  };

  const handleCancelTask = async (task: Task) => {
    if (!userStore.profile?.uid) {
      return;
    }

    try {
      await tasksStore.cancelExistingTask(task, userStore.profile.uid);
    } catch {
      return;
    }

    showSuccessMessage("待辦已取消");
  };

  return {
    assigneeLabel,
    cancelledTasks,
    canUseTasks,
    confirmedTasks,
    currentUid,
    defaultAssignedTo,
    handleCancelTask,
    handleCompleteTask,
    handleConfirmTask,
    handleCreateTask,
    isSubmitting,
    myAssignedTasks,
    waitingConfirmTasks,
    waitingOtherTasks,
  };
};

export { useTasksDashboard };
