<script setup lang="ts">
import { computed } from "vue";
import type { NotificationItem } from "@/views/notifications/types/interface";

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
    return "已加分";
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
  <article class="app-card-muted px-[16px] py-[16px]">
    <div class="flex items-start gap-[12px]">
      <div class="min-w-0">
        <div class="flex flex-wrap items-center gap-[8px]">
          <p class="app-text-strong text-[17px] font-semibold leading-[1.35]">
            {{ notification.title }}
          </p>
          <span class="app-meta-pill">{{ getTypeLabel }}</span>
          <span
            :class="[
              'app-meta-pill',
              notification.isRead ? 'app-meta-pill-strong' : 'app-meta-pill-danger',
            ]"
          >
            {{ getReadStateLabel }}
          </span>
        </div>

        <p class="app-text-muted mt-[10px] text-[14px] leading-[22px]">
          {{ notification.message }}
        </p>

        <p class="app-text-soft mt-[10px] text-[13px] leading-[20px]">
          {{ formatDateTime(notification.createdAt) }}
        </p>
      </div>
    </div>

    <div
      v-if="!notification.isRead"
      class="mt-[16px] flex flex-wrap gap-[12px]"
    >
      <button
        class="app-secondary-button px-[16px] py-[12px] text-[14px]"
        type="button"
        :disabled="isSubmitting"
        @click="emit('read', notification)"
      >
        標記已讀
      </button>
    </div>
  </article>
</template>
