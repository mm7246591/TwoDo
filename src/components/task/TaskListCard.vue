<script setup lang="ts">
import { computed } from 'vue'
import { SwipeCell } from 'vant'
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

const getCanComplete = computed(() =>
  props.task.assignedTo === props.currentUid && props.task.status === 'pending',
)
const getCanConfirm = computed(() =>
  props.task.createdBy === props.currentUid && props.task.status === 'completed_pending_confirm',
)
const getCanCancel = computed(() =>
  props.task.createdBy === props.currentUid && ['pending', 'completed_pending_confirm'].includes(props.task.status),
)
const getHasSwipeActions = computed(() =>
  getCanComplete.value || getCanConfirm.value || getCanCancel.value,
)
</script>

<template>
  <SwipeCell class="app-swipe-cell" :disabled="!getHasSwipeActions">
    <article class="app-card-muted px-[16px] py-[16px]">
      <div class="flex items-start justify-between gap-[12px]">
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-[8px]">
            <p class="app-text-strong text-[17px] font-semibold leading-[1.35]">
              {{ task.title }}
            </p>
            <span class="app-number-pill">{{ task.points }} 點</span>
          </div>
          <p class="app-text-muted mt-[10px] text-[14px] leading-[22px]">
            {{ task.description || '沒有補充說明。' }}
          </p>
        </div>
      </div>

      <div class="app-meta-list mt-[14px]">
        <span class="app-meta-pill app-meta-pill-strong">
          狀態：{{ getStatusLabel }}
        </span>
        <span class="app-meta-pill">截止：{{ formatDate(task.dueDate) }}</span>
        <span class="app-meta-pill">角色：{{ getRoleText }}</span>
      </div>

      <p class="app-card-caption mt-[12px]">{{ getTimelineText }}</p>
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
          確認
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
