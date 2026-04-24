<script setup lang="ts">
import { computed } from "vue";
import { SwipeCell } from "vant";
import {
  canCompleteTask,
  canConfirmTask,
  isCoupleTask,
} from "@/services/taskWorkflow";
import type { Task } from "@/views/tasks/types/interface";

const props = defineProps<{
  currentUid: string;
  isSubmitting: boolean;
  partnerName?: string;
  task: Task;
}>();

const emit = defineEmits<{
  cancel: [task: Task];
  complete: [task: Task];
  confirm: [task: Task];
}>();

const formatDateTime = (value: Date | null | undefined) =>
  value
    ? `${formatDateParts(value).date} ${formatDateParts(value).time}`
    : "尚未記錄";

const formatDateParts = (value: Date) => {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  const hours = String(value.getHours()).padStart(2, "0");
  const minutes = String(value.getMinutes()).padStart(2, "0");

  return {
    date: `${year}/${month}/${day}`,
    time: `${hours}:${minutes}`,
  };
};

const getTimelineText = computed(() => {
  if (props.task.confirmedAt) {
    return `確認於 ${formatDateTime(props.task.confirmedAt)}`;
  }

  if (props.task.completedAt) {
    return `完成於 ${formatDateTime(props.task.completedAt)}`;
  }

  return `新增於 ${formatDateTime(props.task.createdAt)}`;
});

const getDescriptionText = computed(() => props.task.description?.trim() ?? "");
const getParticipantCount = computed(() =>
  Math.max(
    props.task.participantUids.length,
    props.task.assignmentType === "couple" ? 2 : 1,
  ),
);
const getAssignmentLabel = computed(() => {
  if (isCoupleTask(props.task)) {
    const completedCount = props.task.completedByUids.length;
    const confirmedCount = props.task.confirmedByUids.length;
    const participantCount = getParticipantCount.value;

    return `我們 · 完成 ${completedCount}/${participantCount} · 確認 ${confirmedCount}/${participantCount}`;
  }

  return props.task.assignedTo === props.currentUid
    ? "交給我"
    : `交給 ${props.partnerName || "另一半"}`;
});
const shouldShowDescription = computed(
  () =>
    Boolean(getDescriptionText.value) &&
    getDescriptionText.value !== props.task.title.trim(),
);

const getCanComplete = computed(() =>
  canCompleteTask(props.task, props.currentUid),
);
const getCanConfirm = computed(() =>
  canConfirmTask(props.task, props.currentUid),
);
const getCanCancel = computed(
  () =>
    props.task.createdBy === props.currentUid &&
    ["pending", "completed_pending_confirm"].includes(props.task.status),
);
const getHasSwipeActions = computed(
  () => getCanComplete.value || getCanConfirm.value || getCanCancel.value,
);
</script>

<template>
  <SwipeCell class="app-swipe-cell" :disabled="!getHasSwipeActions">
    <article class="app-card-muted app-card-section-sm">
      <div class="flex items-start justify-between gap-[12px]">
        <div class="min-w-[0px] flex-1">
          <p class="app-list-title">
            {{ task.title }}
          </p>
          <p v-if="shouldShowDescription" class="app-list-body mt-[8px]">
            {{ getDescriptionText }}
          </p>
        </div>

        <span class="app-number-pill shrink-0">{{ task.points }} 點</span>
      </div>

      <p class="app-card-caption mt-[12px]">{{ getTimelineText }}</p>
      <p class="app-card-caption mt-[4px]">{{ getAssignmentLabel }}</p>
    </article>

    <template #right>
      <div class="app-swipe-actions">
        <button
          v-if="getCanComplete"
          class="app-swipe-action app-swipe-action-primary"
          type="button"
          :disabled="props.isSubmitting"
          @click="emit('complete', task)"
        >
          完成
        </button>

        <button
          v-if="getCanConfirm"
          class="app-swipe-action app-swipe-action-primary"
          type="button"
          :disabled="props.isSubmitting"
          @click="emit('confirm', task)"
        >
          確認完成
        </button>

        <button
          v-if="getCanCancel"
          class="app-swipe-action app-swipe-action-danger"
          type="button"
          :disabled="props.isSubmitting"
          @click="emit('cancel', task)"
        >
          取消
        </button>
      </div>
    </template>
  </SwipeCell>
</template>
