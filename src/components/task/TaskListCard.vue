<script setup lang="ts">
import type { Task } from '@/views/tasks/types/interface'

defineProps<{
  currentUid: string
  isSubmitting: boolean
  task: Task
}>()

const emit = defineEmits<{
  cancel: [task: Task]
  complete: [task: Task]
  confirm: [task: Task]
}>()

const formatDate = (value: Date | null | undefined) => value
  ? new Intl.DateTimeFormat('zh-TW', { dateStyle: 'medium' }).format(value)
  : '未設定'
</script>

<template>
  <article class="app-card-muted px-[16px] py-[16px]">
    <div class="flex items-start justify-between gap-[16px]">
      <div class="min-w-0">
        <p class="app-text-strong text-[18px] font-semibold">{{ task.title }}</p>
        <p class="app-text-muted mt-[8px] text-[14px] leading-[24px]">
          {{ task.description || '沒有補充說明。' }}
        </p>
      </div>

      <div class="app-accent-panel shrink-0 px-[12px] py-[8px] text-right">
        <p class="app-kicker">Points</p>
        <p class="app-text-strong mt-[4px] text-[16px] font-semibold">{{ task.points }}</p>
      </div>
    </div>

    <div class="mt-[16px] grid grid-cols-2 gap-[12px] text-[14px]">
      <p class="app-text-soft">狀態：{{ task.status }}</p>
      <p class="app-text-soft">截止：{{ formatDate(task.dueDate) }}</p>
    </div>

    <div class="mt-[16px] flex flex-wrap gap-[12px]">
      <button
        v-if="task.assignedTo === currentUid && task.status === 'pending'"
        class="app-secondary-button px-[16px] py-[12px] text-[14px]"
        type="button"
        :disabled="isSubmitting"
        @click="emit('complete', task)"
      >
        完成任務
      </button>

      <button
        v-if="task.createdBy === currentUid && task.status === 'completed_pending_confirm'"
        class="app-primary-button px-[16px] py-[12px] text-[14px]"
        type="button"
        :disabled="isSubmitting"
        @click="emit('confirm', task)"
      >
        確認完成
      </button>

      <button
        v-if="task.createdBy === currentUid && ['pending', 'completed_pending_confirm'].includes(task.status)"
        class="app-ghost-button px-[16px] py-[12px] text-[14px]"
        type="button"
        :disabled="isSubmitting"
        @click="emit('cancel', task)"
      >
        取消任務
      </button>
    </div>
  </article>
</template>
