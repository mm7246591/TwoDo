<script setup lang="ts">
import AppEmptyState from "@/components/common/AppEmptyState.vue";
import TaskComposerCard from "@/components/task/TaskComposerCard.vue";
import TaskListCard from "@/components/task/TaskListCard.vue";
import MobileAppShell from "@/components/MobileAppShell.vue";
import { useTasksDashboard } from "./composables/useTasksDashboard";

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
</script>

<template>
  <MobileAppShell>
    <header class="app-page-header">
      <div class="app-page-header-row">
        <div class="min-w-[0px]">
          <div class="app-chip">待辦</div>
          <h1 class="app-page-title mt-[12px] max-w-[11ch]">一起分擔</h1>
        </div>
      </div>

      <p class="app-page-summary">家裡的小事，一起分！</p>
    </header>

    <section class="app-page-content app-section-stack flex-1">
      <section v-if="!canUseTasks" class="app-card app-card-section">
        <p class="app-label">目前狀態</p>
        <p class="app-status-title mt-[12px]">還不能新增待辦</p>
        <p class="app-card-caption mt-[12px]">完成配對後，就能開始一起分擔。</p>
      </section>

      <TaskComposerCard
        v-else
        :assignee-label="assigneeLabel"
        :default-assigned-to="defaultAssignedTo"
        :is-submitting="isSubmitting"
        @submit="handleCreateTask"
      />

      <section class="app-metric-grid">
        <article class="app-card app-card-section-sm">
          <p class="app-label">交給我的</p>
          <p class="app-metric-value mt-[8px]">{{ myAssignedTasks.length }}</p>
        </article>

        <article class="app-card-muted app-card-section-sm">
          <p class="app-label">待我確認</p>
          <p class="app-metric-value mt-[8px]">
            {{ waitingConfirmTasks.length }}
          </p>
        </article>
      </section>

      <section class="app-card app-card-section">
        <div class="app-card-header-split">
          <div class="min-w-[0px]">
            <p class="app-card-title">待完成</p>
          </div>
        </div>

        <div class="app-card-list mt-[20px]">
          <TaskListCard
            v-for="task in myAssignedTasks"
            :key="task.id"
            :current-uid="currentUid"
            :is-submitting="isSubmitting"
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
          <div class="min-w-[0px]">
            <p class="app-card-title">待確認</p>
          </div>
        </div>

        <div class="app-card-list mt-[20px]">
          <TaskListCard
            v-for="task in waitingConfirmTasks"
            :key="task.id"
            :current-uid="currentUid"
            :is-submitting="isSubmitting"
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
          <div class="min-w-[0px]">
            <p class="app-card-title">等另一半完成</p>
          </div>
        </div>

        <div class="app-card-list mt-[20px]">
          <TaskListCard
            v-for="task in waitingOtherTasks"
            :key="task.id"
            :current-uid="currentUid"
            :is-submitting="isSubmitting"
            :partner-name="assigneeLabel"
            :task="task"
            @cancel="handleCancelTask"
            @complete="handleCompleteTask"
            @confirm="handleConfirmTask"
          />

          <AppEmptyState v-if="!waitingOtherTasks.length" />
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
          <p class="app-card-title">已完成的事</p>
        </div>

        <div class="app-card-list mt-[20px]">
          <TaskListCard
            v-for="task in confirmedTasks"
            :key="task.id"
            :current-uid="currentUid"
            :is-submitting="isSubmitting"
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

        <div class="app-card-list mt-[20px]">
          <TaskListCard
            v-for="task in cancelledTasks"
            :key="task.id"
            :current-uid="currentUid"
            :is-submitting="isSubmitting"
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
