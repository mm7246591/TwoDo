<script setup lang="ts">
import { computed } from "vue";
import {
  canCompleteTask,
  canConfirmTask,
  isCoupleTask,
} from "@/services/taskWorkflow";
import type { Task } from "@/views/task/types/interface";

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

const iconMap = [
  { icon: "delete", keywords: ["垃圾", "倒垃圾", "trash"] },
  { icon: "local_laundry_service", keywords: ["洗衣", "衣服", "laundry"] },
  { icon: "restaurant", keywords: ["晚餐", "餐", "吃", "restaurant"] },
  { icon: "shopping_basket", keywords: ["買", "採買", "購物", "shopping"] },
  { icon: "cleaning_services", keywords: ["掃", "拖", "清潔", "打掃"] },
  { icon: "pets", keywords: ["寵物", "貓", "狗"] },
];

const getTaskIcon = computed(() => {
  const text = `${props.task.title} ${props.task.description ?? ""}`.toLowerCase();
  const matched = iconMap.find((item) =>
    item.keywords.some((keyword) => text.includes(keyword.toLowerCase())),
  );

  return matched?.icon ?? "task_alt";
});

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
const getIsWaitingConfirm = computed(
  () => props.task.status === "completed_pending_confirm",
);
const getIsDone = computed(() => props.task.status === "confirmed");
const getIsCancelled = computed(() => props.task.status === "cancelled");
const getAssignmentLabel = computed(() => {
  if (isCoupleTask(props.task)) {
    return "兩個人";
  }

  if (props.task.assignedTo === props.currentUid) {
    return "我";
  }

  return props.partnerName || "你";
});
const getMetaText = computed(() => {
  if (getIsDone.value) {
    return "已完成";
  }

  if (getIsCancelled.value) {
    return "已取消";
  }

  if (getIsWaitingConfirm.value) {
    return "待確認";
  }

  return "進行中";
});
</script>

<template>
  <article
    class="relative flex items-center gap-[16px] overflow-hidden rounded-[1.5rem] bg-white p-[20px] shadow-[0_10px_40px_rgba(148,72,53,0.06)] transition-[transform,box-shadow] duration-[180ms] active:scale-[0.98] max-[360px]:items-start max-[360px]:p-[16px]"
    :class="{
      'before:absolute before:inset-y-[0px] before:left-[0px] before:w-[0.375rem] before:bg-[var(--app-danger)]': getIsWaitingConfirm,
      'bg-[rgba(255,255,255,0.74)]': getIsDone,
      'opacity-[0.68]': getIsCancelled,
    }"
  >
    <div
      class="inline-grid h-[48px] w-[48px] flex-none place-items-center rounded-full border-2 border-[var(--auth-primary-container)] text-[var(--auth-primary-container)] max-[360px]:h-[44px] max-[360px]:w-[44px] [&_.material-symbols-outlined]:text-[1.55rem]"
      :class="{
        'border-transparent bg-[var(--auth-error-container)] text-[var(--auth-error)]': getIsWaitingConfirm,
        'border-transparent bg-[var(--app-success-soft)] text-[var(--app-success-text)]': getIsDone,
      }"
      aria-hidden="true"
    >
      <span class="material-symbols-outlined">{{ getTaskIcon }}</span>
    </div>

    <div class="min-w-[0px] flex-auto">
      <div class="flex min-w-[0px] items-center gap-[8px]">
        <h2 class="m-[0px] overflow-hidden text-ellipsis whitespace-nowrap text-[18px] font-[800] leading-[1.35] text-[var(--app-text-strong)]">{{ task.title }}</h2>
        <span
          v-if="getIsWaitingConfirm"
          class="inline-flex flex-none rounded-full bg-[var(--app-danger)] px-[8px] py-[2px] text-[0.625rem] font-[800] leading-[1.2rem] text-white"
        >
          待確認
        </span>
      </div>

      <p
        v-if="task.description"
        class="m-[0px] mt-[4px] overflow-hidden text-[13px] font-[600] leading-[1.5] text-[var(--app-text-muted)] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]"
      >
        {{ task.description }}
      </p>

      <div class="mt-[8px] flex flex-wrap items-center gap-[8px]">
        <span class="inline-flex min-h-[24px] items-center rounded-full bg-[var(--auth-secondary-container)] px-[12px] text-[0.625rem] font-[800] leading-6 tracking-[0.06em] text-[var(--auth-on-secondary-container)]">{{ getAssignmentLabel }}</span>
        <span class="text-[13px] font-[800] text-[var(--app-accent)]">+{{ task.points }} Pts</span>
        <span class="text-[12px] font-[700] text-[var(--app-text-soft)]">{{ getMetaText }}</span>
      </div>
    </div>

    <div class="inline-flex flex-none items-center">
      <button
        v-if="getCanComplete"
        class="inline-grid h-[32px] min-h-[32px] w-[32px] min-w-[32px] place-items-center rounded-full border-2 border-[rgba(148,72,53,0.2)] bg-transparent p-[0px] text-transparent transition-[border-color,color,transform] duration-[180ms] hover:border-[var(--app-accent)] hover:text-[var(--app-accent)] active:scale-[0.94] disabled:cursor-not-allowed disabled:opacity-50"
        type="button"
        aria-label="標記完成"
        :disabled="isSubmitting"
        @click="emit('complete', task)"
      >
        <span class="material-symbols-outlined fill" aria-hidden="true">
          heart_check
        </span>
      </button>

      <button
        v-else-if="getCanConfirm"
        class="inline-grid h-[32px] min-h-[32px] w-[32px] min-w-[32px] place-items-center rounded-full border-2 border-[var(--app-accent)] bg-transparent p-[0px] text-[var(--app-accent)] transition-[border-color,color,transform] duration-[180ms] active:scale-[0.94] disabled:cursor-not-allowed disabled:opacity-50"
        type="button"
        aria-label="確認完成"
        :disabled="isSubmitting"
        @click="emit('confirm', task)"
      >
        <span class="material-symbols-outlined fill" aria-hidden="true">
          check
        </span>
      </button>

      <span v-else-if="getIsWaitingConfirm" class="material-symbols-outlined text-2xl text-[var(--app-danger)]" aria-hidden="true">
        error_outline
      </span>

      <button
        v-else-if="getCanCancel"
        class="inline-grid h-[32px] min-h-[32px] w-[32px] min-w-[32px] place-items-center rounded-full border-2 border-transparent bg-transparent p-[0px] text-[var(--app-text-soft)] transition-[border-color,color,transform] duration-[180ms] active:scale-[0.94] disabled:cursor-not-allowed disabled:opacity-50"
        type="button"
        aria-label="取消任務"
        :disabled="isSubmitting"
        @click="emit('cancel', task)"
      >
        <span class="material-symbols-outlined" aria-hidden="true">close</span>
      </button>
    </div>
  </article>
</template>
