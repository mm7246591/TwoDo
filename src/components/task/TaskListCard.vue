<script setup lang="ts">
import { computed } from "vue";
import { SwipeCell } from "vant";
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
const shouldShowDescription = computed(
  () =>
    Boolean(getDescriptionText.value) &&
    getDescriptionText.value !== props.task.title.trim(),
);

const getCanComplete = computed(
  () =>
    props.task.assignedTo === props.currentUid &&
    props.task.status === "pending",
);
const getCanConfirm = computed(
  () =>
    props.task.createdBy === props.currentUid &&
    props.task.status === "completed_pending_confirm",
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
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0 flex-1">
          <p class="app-list-title">
            {{ task.title }}
          </p>
          <p v-if="shouldShowDescription" class="app-list-body mt-2">
            {{ getDescriptionText }}
          </p>
        </div>

        <span class="app-number-pill shrink-0">{{ task.points }} 點</span>
      </div>

      <p class="app-card-caption mt-3">{{ getTimelineText }}</p>
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
