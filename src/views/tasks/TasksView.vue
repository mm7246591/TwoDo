<script setup lang="ts">
import { computed, ref, watch } from "vue";
import AppEmptyState from "@/components/common/AppEmptyState.vue";
import TaskComposerCard from "@/components/task/TaskComposerCard.vue";
import TaskListCard from "@/components/task/TaskListCard.vue";
import { useErrorToast } from "@/composables/useErrorToast";
import MobileAppShell from "@/components/MobileAppShell.vue";
import { useTasksStore } from "@/pinia/tasks";
import { useUserStore } from "@/pinia/user";
import { getUserProfile } from "@/services/userService";
import { showSuccessMessage } from "@/services/uiFeedback";
import type { CreateTaskInput } from "@/pinia/tasks/types/interface";
import type { Task } from "@/views/tasks/types/interface";

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
const myAssignedTasks = computed(() =>
  tasksStore.tasks.filter(
    (task) => task.assignedTo === currentUid.value && task.status === "pending",
  ),
);
const myCreatedTasks = computed(() =>
  tasksStore.tasks.filter(
    (task) => task.createdBy === currentUid.value && task.status === "pending",
  ),
);
const waitingConfirmTasks = computed(() =>
  tasksStore.getCompletedPendingConfirmTasks.filter(
    (task) => task.createdBy === currentUid.value,
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
</script>

<template>
  <MobileAppShell>
    <header class="app-page-header">
      <div class="app-page-header-row">
        <div class="min-w-0">
          <div class="app-chip">待辦</div>
          <h1 class="app-page-title mt-3 max-w-[11ch]">一起分擔</h1>
        </div>
      </div>

      <p class="app-page-summary">家裡的小事，一起分！</p>
    </header>

    <section class="app-page-content app-section-stack flex-1">
      <section v-if="!canUseTasks" class="app-card app-card-section">
        <p class="app-label">目前狀態</p>
        <p class="app-status-title mt-3">還不能新增待辦</p>
        <p class="app-card-caption mt-3">完成配對後，就能開始一起分擔。</p>
      </section>

      <TaskComposerCard
        v-else
        :assignee-label="assigneeLabel"
        :default-assigned-to="userStore.profile?.partnerUid ?? ''"
        :is-submitting="tasksStore.isSubmitting"
        @submit="handleCreateTask"
      />

      <section class="app-metric-grid">
        <article class="app-card app-card-section-sm">
          <p class="app-label">交給我的</p>
          <p class="app-metric-value mt-2">{{ myAssignedTasks.length }}</p>
        </article>

        <article class="app-card-muted app-card-section-sm">
          <p class="app-label">待我確認</p>
          <p class="app-metric-value mt-2">
            {{ waitingConfirmTasks.length }}
          </p>
        </article>
      </section>

      <section class="app-card app-card-section">
        <div class="app-card-header-split">
          <div class="min-w-0">
            <p class="app-card-title">待完成</p>
          </div>
        </div>

        <div class="app-card-list mt-5">
          <TaskListCard
            v-for="task in myAssignedTasks"
            :key="task.id"
            :current-uid="currentUid"
            :is-submitting="tasksStore.isSubmitting"
            :partner-name="assigneeLabel"
            :task="task"
            @cancel="handleCancelTask"
            @complete="handleCompleteTask"
            @confirm="handleConfirmTask"
          />

          <AppEmptyState v-if="!myAssignedTasks.length" />
        </div>
      </section>

      <section class="app-card app-card-section">
        <div class="app-card-header-split">
          <div class="min-w-0">
            <p class="app-card-title">待確認</p>
          </div>
        </div>

        <div class="app-card-list mt-5">
          <TaskListCard
            v-for="task in waitingConfirmTasks"
            :key="task.id"
            :current-uid="currentUid"
            :is-submitting="tasksStore.isSubmitting"
            :partner-name="assigneeLabel"
            :task="task"
            @cancel="handleCancelTask"
            @complete="handleCompleteTask"
            @confirm="handleConfirmTask"
          />

          <AppEmptyState v-if="!waitingConfirmTasks.length" />
        </div>
      </section>

      <section class="app-card app-card-section">
        <div class="app-card-header-split">
          <div class="min-w-0">
            <p class="app-card-title">等另一半完成</p>
          </div>
        </div>

        <div class="app-card-list mt-5">
          <TaskListCard
            v-for="task in myCreatedTasks"
            :key="task.id"
            :current-uid="currentUid"
            :is-submitting="tasksStore.isSubmitting"
            :partner-name="assigneeLabel"
            :task="task"
            @cancel="handleCancelTask"
            @complete="handleCompleteTask"
            @confirm="handleConfirmTask"
          />

          <AppEmptyState v-if="!myCreatedTasks.length" />
        </div>
      </section>

      <section class="app-metric-grid">
        <article class="app-card app-card-section-sm">
          <p class="app-label">已完成</p>
          <p class="app-metric-value mt-2">{{ confirmedTasks.length }}</p>
        </article>

        <article class="app-card-muted app-card-section-sm">
          <p class="app-label">已取消</p>
          <p class="app-metric-value mt-2">{{ cancelledTasks.length }}</p>
        </article>
      </section>

      <section class="app-card app-card-section">
        <div class="app-card-header-split">
          <p class="app-card-title">已完成的事</p>
        </div>

        <div class="app-card-list mt-5">
          <TaskListCard
            v-for="task in confirmedTasks"
            :key="task.id"
            :current-uid="currentUid"
            :is-submitting="tasksStore.isSubmitting"
            :partner-name="assigneeLabel"
            :task="task"
            @cancel="handleCancelTask"
            @complete="handleCompleteTask"
            @confirm="handleConfirmTask"
          />

          <AppEmptyState v-if="!confirmedTasks.length" />
        </div>
      </section>

      <section class="app-card app-card-section">
        <div class="app-card-header-split">
          <p class="app-card-title">已取消的事</p>
        </div>

        <div class="app-card-list mt-5">
          <TaskListCard
            v-for="task in cancelledTasks"
            :key="task.id"
            :current-uid="currentUid"
            :is-submitting="tasksStore.isSubmitting"
            :partner-name="assigneeLabel"
            :task="task"
            @cancel="handleCancelTask"
            @complete="handleCompleteTask"
            @confirm="handleConfirmTask"
          />

          <AppEmptyState v-if="!cancelledTasks.length" />
        </div>
      </section>
    </section>
  </MobileAppShell>
</template>
