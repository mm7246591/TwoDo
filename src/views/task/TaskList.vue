<script setup lang="ts">
import { computed, ref } from "vue";
import { RouterLink } from "vue-router";
import AppEmptyState from "@/components/common/AppEmptyState.vue";
import TaskListCard from "@/components/task/TaskListCard.vue";
import MobileAppShell from "@/components/common/MobileAppShell.vue";
import { useTasksDashboard } from "./composables/useTasksDashboard";
import type { Task } from "@/views/task/types/interface";

type TaskTab = "active" | "confirm" | "done";

const getStartOfWeek = (date: Date) => {
  const start = new Date(date);
  const day = start.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;

  start.setDate(start.getDate() + diffToMonday);
  start.setHours(0, 0, 0, 0);

  return start;
};

const getEndOfWeek = (date: Date) => {
  const end = getStartOfWeek(date);

  end.setDate(end.getDate() + 7);

  return end;
};

const getTaskWeekDate = (task: Task) => task.dueDate ?? task.createdAt;

const getIsThisWeekTask = (task: Task) => {
  const taskDate = getTaskWeekDate(task);
  const startOfWeek = getStartOfWeek(new Date());
  const endOfWeek = getEndOfWeek(new Date());

  return taskDate >= startOfWeek && taskDate < endOfWeek;
};

const {
  assigneeLabel,
  cancelledTasks,
  canUseTasks,
  confirmedTasks,
  currentUid,
  handleCancelTask,
  handleCompleteTask,
  handleConfirmTask,
  isSubmitting,
  myAssignedTasks,
  waitingConfirmTasks,
  waitingOtherTasks,
} = useTasksDashboard();

const activeTab = ref<TaskTab>("active");

const activeTasks = computed(() => {
  const taskMap = new Map<string, Task>();

  [...myAssignedTasks.value, ...waitingOtherTasks.value].forEach((task) => {
    taskMap.set(task.id, task);
  });

  return [...taskMap.values()];
});

const visibleTasks = computed(() => {
  if (activeTab.value === "confirm") {
    return waitingConfirmTasks.value;
  }

  if (activeTab.value === "done") {
    return confirmedTasks.value;
  }

  return activeTasks.value;
});

const taskTabs = computed(() => [
  {
    count: activeTasks.value.length,
    key: "active" as const,
    label: "進行中",
  },
  {
    count: waitingConfirmTasks.value.length,
    key: "confirm" as const,
    label: "待確認",
  },
  {
    count: confirmedTasks.value.length,
    key: "done" as const,
    label: "已完成",
  },
]);

const weeklyTrackedTasks = computed(() => {
  const taskMap = new Map<string, Task>();

  [
    ...activeTasks.value,
    ...waitingConfirmTasks.value,
    ...confirmedTasks.value,
    ...cancelledTasks.value,
  ].forEach((task) => {
    if (getIsThisWeekTask(task)) {
      taskMap.set(task.id, task);
    }
  });

  return [...taskMap.values()];
});
const finishedCount = computed(
  () => weeklyTrackedTasks.value.filter((task) => task.status === "confirmed").length,
);
const totalTrackedCount = computed(() => weeklyTrackedTasks.value.length);
const progressPercent = computed(() => {
  if (!totalTrackedCount.value) {
    return 0;
  }

  return Math.round((finishedCount.value / totalTrackedCount.value) * 100);
});
const progressStyle = computed(() => ({
  width: `${progressPercent.value}%`,
}));
const emptyTitle = computed(() => {
  if (activeTab.value === "confirm") {
    return "目前沒有等待確認的任務";
  }

  if (activeTab.value === "done") {
    return "目前沒有完成紀錄";
  }

  return "目前沒有進行中的任務";
});
</script>

<template>
  <MobileAppShell>
    <section class="grid content-start gap-[24px] px-[20px] pt-[28px] pb-[calc(40px+5.75rem)] sm:px-[28px]">
      <header class="flex items-center justify-between gap-[16px]">
        <h1 class="m-[0px] text-[32px] font-[800] leading-[1.18] tracking-[0px] text-[var(--app-text-strong)]">任務清單</h1>
      </header>

      <section v-if="!canUseTasks" class="flex items-start gap-[20px] rounded-[2rem] bg-[var(--app-surface-strong)] p-[24px] shadow-[var(--app-shadow-card)] max-[420px]:flex-col max-[420px]:items-stretch">
        <span class="material-symbols-outlined inline-grid h-[48px] w-[48px] flex-none place-items-center rounded-full bg-[var(--app-accent-soft)] text-[var(--app-accent)]" aria-hidden="true">favorite</span>
        <div>
          <h2 class="m-[0px] text-[20px] font-[800] leading-[1.28] text-[var(--app-text-strong)]">共同生活需要兩個人一起開始</h2>
          <p class="m-[0px] mt-[12px] text-[13px] font-[600] leading-[1.5] text-[var(--app-text-muted)]">完成配對後，就能同步任務、確認進度與累積點數。</p>
        </div>
        <RouterLink
          class="inline-flex min-h-[40px] flex-none items-center justify-center rounded-full bg-[var(--app-accent)] px-[16px] text-[13px] font-[800] text-white no-underline max-[420px]:w-full"
          :to="{ name: 'pairing' }"
        >
          前往配對
        </RouterLink>
      </section>

      <template v-else>
        <div class="grid grid-cols-3 gap-[8px] rounded-2xl bg-[var(--auth-surface-container-low)] p-[6px]" role="tablist" aria-label="任務狀態">
          <button
            v-for="tab in taskTabs"
            :key="tab.key"
            class="inline-flex min-h-[44px] min-w-[0px] items-center justify-center gap-[4px] rounded-xl border-0 bg-transparent text-[13px] font-[800] leading-[1.2] text-[var(--app-text-muted)] transition-[background-color,color,box-shadow] duration-[180ms]"
            :class="{ 'bg-[var(--auth-primary-container)] text-white shadow-[0_8px_18px_rgba(148,72,53,0.12)]': activeTab === tab.key }"
            type="button"
            role="tab"
            :aria-selected="activeTab === tab.key"
            @click="activeTab = tab.key"
          >
            <span>{{ tab.label }}</span>
            <span class="text-[12px] opacity-[0.82]">{{ tab.count }}</span>
          </button>
        </div>

        <section class="grid gap-[16px]" aria-live="polite">
          <TaskListCard
            v-for="task in visibleTasks"
            :key="task.id"
            :current-uid="currentUid"
            :is-submitting="isSubmitting"
            :partner-name="assigneeLabel"
            :task="task"
            @cancel="handleCancelTask"
            @complete="handleCompleteTask"
            @confirm="handleConfirmTask"
          />

          <AppEmptyState v-if="!visibleTasks.length" :title="emptyTitle" description="新增一個任務，讓今天更有節奏。" />

          <RouterLink
            class="flex min-h-[112px] flex-col items-center justify-center gap-[8px] rounded-[1.5rem] border-2 border-dashed border-[rgba(148,72,53,0.2)] bg-[rgba(255,255,255,0.5)] text-[15px] font-[800] text-[rgba(148,72,53,0.66)] no-underline transition-[border-color,color,transform] duration-[180ms] hover:border-[rgba(148,72,53,0.34)] hover:text-[var(--app-accent)] active:scale-[0.98] [&_.material-symbols-outlined]:text-[2rem]"
            :to="{ name: 'create-task' }"
          >
            <span class="material-symbols-outlined" aria-hidden="true">add_circle</span>
            <span>新增共同任務</span>
          </RouterLink>
        </section>

        <section class="flex items-center gap-[20px] rounded-[2rem] bg-[var(--auth-surface-container-high)] p-[24px] max-[420px]:flex-col max-[420px]:items-stretch" aria-label="本週進度">
          <div class="min-w-[0px] flex-auto">
            <h2 class="m-[0px] text-[20px] font-[800] leading-[1.28] text-[var(--app-text-strong)]">本週進度</h2>
            <div class="mt-[12px] h-[16px] overflow-hidden rounded-full bg-[rgba(255,255,255,0.92)]">
              <div class="h-full rounded-[inherit] bg-[var(--auth-secondary-fixed-dim)] transition-[width] duration-[240ms]" :style="progressStyle" />
            </div>
            <p class="m-[0px] mt-[12px] text-[13px] font-[600] leading-[1.5] text-[var(--app-text-muted)]">我們已經完成了 {{ finishedCount }} 個任務！加油！</p>
          </div>
          <div class="grid h-[80px] w-[80px] flex-none content-center place-items-center rounded-2xl bg-[var(--auth-primary-container)] text-white max-[420px]:h-[64px] max-[420px]:w-full max-[420px]:auto-cols-max max-[420px]:grid-flow-col max-[420px]:gap-[8px]">
            <strong class="text-[24px] leading-none">{{ progressPercent }}%</strong>
            <span class="text-[0.625rem] font-[800]">已達成</span>
          </div>
        </section>
      </template>
    </section>
  </MobileAppShell>
</template>
