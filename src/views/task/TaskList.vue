<script setup lang="ts">
import { computed } from "vue";
import { RouterLink, useRoute } from "vue-router";
import AppEmptyState from "@/components/common/AppEmptyState.vue";
import TaskComposerCard from "@/components/task/TaskComposerCard.vue";
import TaskListCard from "@/components/task/TaskListCard.vue";
import MobileAppShell from "@/components/common/MobileAppShell.vue";
import { useTasksDashboard } from "./composables/useTasksDashboard";

const route = useRoute();

const {
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
} = useTasksDashboard();

const isCreateRoute = computed(() => route.name === "task-create");
</script>

<template>
  <MobileAppShell>
    <template v-if="isCreateRoute">
      <section class="app-page-content flex-1 tasks-create-page">
        <section v-if="!canUseTasks" class="app-card app-card-section">
          <p class="app-label">尚未配對</p>
          <p class="app-status-title mt-[12px]">先和另一半連線</p>
          <p class="app-card-caption mt-[12px]">
            配對後就能建立任務、分配點數，讓彼此一起完成生活裡的小挑戰。
          </p>
        </section>

        <TaskComposerCard v-else :assignee-label="assigneeLabel" :current-uid="currentUid"
          :default-assigned-to="defaultAssignedTo" :is-submitting="isSubmitting" @submit="handleCreateTask" />
      </section>
    </template>

    <template v-else>
      <header class="app-page-header tasks-page-header">
        <div class="app-page-header-row">
          <div class="min-w-[0px]">
            <div class="app-chip">任務</div>
            <h1 class="app-page-title mt-[12px] max-w-[11ch]">一起完成小冒險</h1>
          </div>
          <RouterLink class="app-primary-button app-button-compact tasks-create-link" :to="{ name: 'create-task' }"
            aria-label="建立任務">
            <span class="material-symbols-outlined fill text-[20px]" aria-hidden="true">
              add
            </span>
            建立
          </RouterLink>
        </div>

        <p class="app-page-summary">
          安排彼此的小任務，把日常變成可以一起收集的成就。
        </p>
      </header>

      <section class="app-page-content app-section-stack flex-1 tasks-page-content">
        <section v-if="!canUseTasks" class="app-card app-card-section">
          <p class="app-label">尚未配對</p>
          <p class="app-status-title mt-[12px]">先和另一半連線</p>
          <p class="app-card-caption mt-[12px]">
            配對後就能建立任務、分配點數，讓彼此一起完成生活裡的小挑戰。
          </p>
        </section>

        <section class="app-metric-grid">
          <article class="app-card app-card-section-sm">
            <p class="app-label">待完成</p>
            <p class="app-metric-value mt-[8px]">{{ myAssignedTasks.length }}</p>
          </article>

          <article class="app-card-muted app-card-section-sm">
            <p class="app-label">待確認</p>
            <p class="app-metric-value mt-[8px]">
              {{ waitingConfirmTasks.length }}
            </p>
          </article>
        </section>

        <section class="app-card app-card-section">
          <div class="app-card-header-split">
            <div class="min-w-[0px]">
              <p class="app-card-title">我的任務</p>
            </div>
          </div>

          <div class="app-card-list mt-[20px]">
            <TaskListCard v-for="task in myAssignedTasks" :key="task.id" :current-uid="currentUid"
              :is-submitting="isSubmitting" :partner-name="assigneeLabel" :task="task" @cancel="handleCancelTask"
              @complete="handleCompleteTask" @confirm="handleConfirmTask" />

            <AppEmptyState v-if="!myAssignedTasks.length" title="目前沒有待完成任務" />
          </div>
        </section>

        <section class="app-card app-card-section">
          <div class="app-card-header-split">
            <div class="min-w-[0px]">
              <p class="app-card-title">等待你確認</p>
            </div>
          </div>

          <div class="app-card-list mt-[20px]">
            <TaskListCard v-for="task in waitingConfirmTasks" :key="task.id" :current-uid="currentUid"
              :is-submitting="isSubmitting" :partner-name="assigneeLabel" :task="task" @cancel="handleCancelTask"
              @complete="handleCompleteTask" @confirm="handleConfirmTask" />

            <AppEmptyState v-if="!waitingConfirmTasks.length" title="目前沒有等待確認的任務" />
          </div>
        </section>

        <section class="app-card app-card-section">
          <div class="app-card-header-split">
            <div class="min-w-[0px]">
              <p class="app-card-title">等待對方完成</p>
            </div>
          </div>

          <div class="app-card-list mt-[20px]">
            <TaskListCard v-for="task in waitingOtherTasks" :key="task.id" :current-uid="currentUid"
              :is-submitting="isSubmitting" :partner-name="assigneeLabel" :task="task" @cancel="handleCancelTask"
              @complete="handleCompleteTask" @confirm="handleConfirmTask" />

            <AppEmptyState v-if="!waitingOtherTasks.length" title="目前沒有等待對方的任務" />
          </div>
        </section>

        <section class="app-metric-grid">
          <article class="app-card app-card-section-sm">
            <p class="app-label">已完成</p>
            <p class="app-metric-value mt-[8px]">{{ confirmedTasks.length }}</p>
          </article>

          <article class="app-card-muted app-card-section-sm">
            <p class="app-label">已取消</p>
            <p class="app-metric-value mt-[8px]">{{ cancelledTasks.length }}</p>
          </article>
        </section>

        <section class="app-card app-card-section">
          <div class="app-card-header-split">
            <p class="app-card-title">完成紀錄</p>
          </div>

          <div class="app-card-list mt-[20px]">
            <TaskListCard v-for="task in confirmedTasks" :key="task.id" :current-uid="currentUid"
              :is-submitting="isSubmitting" :partner-name="assigneeLabel" :task="task" @cancel="handleCancelTask"
              @complete="handleCompleteTask" @confirm="handleConfirmTask" />

            <AppEmptyState v-if="!confirmedTasks.length" title="目前沒有完成紀錄" />
          </div>
        </section>

        <section class="app-card app-card-section">
          <div class="app-card-header-split">
            <p class="app-card-title">取消紀錄</p>
          </div>

          <div class="app-card-list mt-[20px]">
            <TaskListCard v-for="task in cancelledTasks" :key="task.id" :current-uid="currentUid"
              :is-submitting="isSubmitting" :partner-name="assigneeLabel" :task="task" @cancel="handleCancelTask"
              @complete="handleCompleteTask" @confirm="handleConfirmTask" />

            <AppEmptyState v-if="!cancelledTasks.length" title="目前沒有取消紀錄" />
          </div>
        </section>
      </section>
    </template>
  </MobileAppShell>
</template>

<style scoped>
.tasks-page-header {
  padding-bottom: 1.25rem;
}

.tasks-create-link {
  flex: 0 0 auto;
  text-decoration: none;
  white-space: nowrap;
}

.tasks-page-content {
  gap: 1.5rem;
}

.tasks-create-page {
  display: grid;
  align-content: start;
  padding-top: 1.5rem;
  padding-bottom: 1.5rem;
}
</style>
