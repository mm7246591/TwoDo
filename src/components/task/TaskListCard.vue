<script setup lang="ts">
import { computed } from 'vue'
import type { Task } from '@/views/tasks/types/interface'

const props = defineProps<{
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

const formatDateTime = (value: Date | null | undefined) => value
  ? new Intl.DateTimeFormat('zh-TW', { dateStyle: 'medium', timeStyle: 'short' }).format(value)
  : '尚未記錄'

const getStatusLabel = computed(() => {
  if (props.task.status === 'pending') {
    return '待處理'
  }

  if (props.task.status === 'completed_pending_confirm') {
    return '已完成待確認'
  }

  if (props.task.status === 'confirmed') {
    return '已確認完成'
  }

  if (props.task.status === 'cancelled') {
    return '已取消'
  }

  return '已退回'
})

const getRoleText = computed(() => {
  if (props.task.createdBy === props.currentUid && props.task.assignedTo === props.currentUid) {
    return '自己建立並執行'
  }

  if (props.task.createdBy === props.currentUid) {
    return '我指派出去的'
  }

  if (props.task.assignedTo === props.currentUid) {
    return '指派給我的'
  }

  return '另一半的任務'
})

const getTimelineText = computed(() => {
  if (props.task.confirmedAt) {
    return `確認時間：${formatDateTime(props.task.confirmedAt)}`
  }

  if (props.task.completedAt) {
    return `完成時間：${formatDateTime(props.task.completedAt)}`
  }

  return `建立時間：${formatDateTime(props.task.createdAt)}`
})
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
      <p class="app-text-soft">狀態：{{ getStatusLabel }}</p>
      <p class="app-text-soft">截止：{{ formatDate(task.dueDate) }}</p>
    </div>

    <div class="mt-[8px] grid grid-cols-2 gap-[12px] text-[14px]">
      <p class="app-text-soft">角色：{{ getRoleText }}</p>
      <p class="app-text-soft">{{ getTimelineText }}</p>
    </div>

    <div class="mt-[16px] flex flex-wrap gap-[12px]">
      <button
        v-if="task.assignedTo === currentUid && task.status === 'pending'"
        class="app-secondary-button px-[16px] py-[12px] text-[14px]"
        type="button"
        :disabled="props.isSubmitting"
        @click="emit('complete', task)"
      >
        完成任務
      </button>

      <button
        v-if="task.createdBy === currentUid && task.status === 'completed_pending_confirm'"
        class="app-primary-button px-[16px] py-[12px] text-[14px]"
        type="button"
        :disabled="props.isSubmitting"
        @click="emit('confirm', task)"
      >
        確認完成
      </button>

      <button
        v-if="task.createdBy === currentUid && ['pending', 'completed_pending_confirm'].includes(task.status)"
        class="app-ghost-button px-[16px] py-[12px] text-[14px]"
        type="button"
        :disabled="props.isSubmitting"
        @click="emit('cancel', task)"
      >
        取消任務
      </button>
    </div>
  </article>
</template>
