<script setup lang="ts">
import { computed } from "vue";
import type { NotificationItem } from "@/views/notification/types/interface";

const emit = defineEmits<{
  read: [notification: NotificationItem];
}>();
const props = defineProps<{
  isSubmitting: boolean;
  notification: NotificationItem;
}>();

const getTypeLabel = computed(() => {
  if (props.notification.type === "new_task") {
    return "新任務";
  }

  if (props.notification.type === "task_completed_pending_confirm") {
    return "待確認";
  }

  if (props.notification.type === "task_confirmed") {
    return "已完成";
  }

  return "獎勵兌換";
});

const formatDateTime = (value: Date) =>
  new Intl.DateTimeFormat("zh-TW", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);

const getReadStateLabel = computed(() =>
  props.notification.isRead ? "已讀" : "未讀",
);
</script>

<template>
  <article class="rounded-[var(--app-radius-xl)] border border-[var(--app-card-muted-border)] bg-[image:var(--app-card-muted-bg)] backdrop-blur-[10px] p-[16px]">
    <div class="flex items-start gap-[12px]">
      <div class="min-w-[0px]">
        <div class="flex flex-wrap items-center gap-[8px]">
          <p class="text-[16px] font-[700] leading-[1.42] text-[var(--app-text-strong)]">
            {{ notification.title }}
          </p>
          <span class="inline-flex min-h-[2rem] items-center gap-[4px] rounded-full border border-[var(--app-border)] bg-[rgba(255,255,255,0.78)] px-[12px] py-[8px] text-[13px] font-[600] leading-[1.2] text-[var(--app-text-muted)]">{{ getTypeLabel }}</span>
          <span :class="[
            'inline-flex min-h-[2rem] items-center gap-[4px] rounded-full border border-[var(--app-border)] bg-[rgba(255,255,255,0.78)] px-[12px] py-[8px] text-[13px] font-[600] leading-[1.2] text-[var(--app-text-muted)]',
            notification.isRead ? 'text-[var(--app-text-strong)]' : 'border-transparent bg-[var(--app-danger-soft)] text-[var(--app-danger-text)]',
          ]">
            {{ getReadStateLabel }}
          </span>
        </div>

        <p class="text-[15px] leading-[1.58] text-[var(--app-text-muted)] mt-[8px]">
          {{ notification.message }}
        </p>

        <p class="text-[13px] leading-[1.5] text-[var(--app-text-soft)] mt-[8px]">
          {{ formatDateTime(notification.createdAt) }}
        </p>
      </div>
    </div>

    <div v-if="!notification.isRead" class="mt-[16px] flex flex-wrap gap-[12px]">
      <button class="inline-flex items-center justify-center gap-[8px] rounded-full border border-[var(--app-button-secondary-border)] bg-[var(--app-button-secondary-bg)] px-[16px] py-[12px] text-[15px] font-[700] text-[var(--app-text)] shadow-[var(--app-shadow-chip)] transition-[transform,box-shadow,background-color,border-color,color] duration-[180ms] hover:enabled:-translate-y-[1px] focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--app-input-focus-ring),var(--app-shadow-chip)] disabled:cursor-not-allowed disabled:shadow-none disabled:opacity-55" type="button" :disabled="isSubmitting"
        @click="emit('read', notification)">
        標記已讀
      </button>
    </div>
  </article>
</template>



