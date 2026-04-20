<script setup lang="ts">
import { ref, watch } from 'vue'
import type { CreateTaskInput } from '@/pinia/tasks/types/interface'

interface TaskComposerForm {
  assignedTo: string
  description: string
  dueDate: string
  points: number
  title: string
}

const props = defineProps<{
  defaultAssignedTo: string
  isSubmitting: boolean
}>()

const emit = defineEmits<{
  submit: [payload: Omit<CreateTaskInput, 'coupleId' | 'createdBy'>]
}>()

const form = ref<TaskComposerForm>({
  assignedTo: props.defaultAssignedTo,
  description: '',
  dueDate: '',
  points: 10,
  title: '',
})

watch(
  () => props.defaultAssignedTo,
  (partnerUid) => {
    if (!form.value.assignedTo && partnerUid) {
      form.value.assignedTo = partnerUid
    }
  },
  { immediate: true },
)

const resetForm = () => {
  form.value.title = ''
  form.value.description = ''
  form.value.points = 10
  form.value.dueDate = ''
  form.value.assignedTo = props.defaultAssignedTo
}

const handleSubmit = () => {
  emit('submit', {
    assignedTo: form.value.assignedTo,
    description: form.value.description,
    dueDate: form.value.dueDate ? new Date(form.value.dueDate) : null,
    points: Number(form.value.points),
    title: form.value.title,
  })

  resetForm()
}
</script>

<template>
  <section class="app-card px-[20px] py-[20px]">
    <div class="flex items-center justify-between gap-[12px]">
      <div>
        <p class="app-label">新增任務</p>
        <p class="app-text-strong mt-[8px] text-[24px] font-semibold tracking-[-0.04em]">
          建一張可追蹤的待辦
        </p>
      </div>

      <div class="app-accent-panel px-[12px] py-[8px] text-right">
        <p class="app-kicker">Firestore</p>
        <p class="app-text-strong mt-[4px] text-[14px] font-semibold">tasks</p>
      </div>
    </div>

    <form class="mt-[20px] space-y-[16px]" @submit.prevent="handleSubmit">
      <label class="block space-y-[8px]">
        <span class="app-field-label">標題</span>
        <input v-model="form.title" class="app-input" type="text" placeholder="例如：倒垃圾" />
      </label>

      <label class="block space-y-[8px]">
        <span class="app-field-label">描述</span>
        <textarea
          v-model="form.description"
          class="app-input min-h-[96px] resize-none py-[16px]"
          placeholder="補充任務細節或截止提醒"
        />
      </label>

      <div class="grid grid-cols-2 gap-[16px]">
        <label class="block space-y-[8px]">
          <span class="app-field-label">點數</span>
          <input v-model="form.points" class="app-input" type="number" min="1" step="1" />
        </label>

        <label class="block space-y-[8px]">
          <span class="app-field-label">截止日</span>
          <input v-model="form.dueDate" class="app-input" type="date" />
        </label>
      </div>

      <label class="block space-y-[8px]">
        <span class="app-field-label">指派對象</span>
        <select v-model="form.assignedTo" class="app-input">
          <option value="">請選擇對象</option>
          <option :value="defaultAssignedTo">另一半</option>
        </select>
      </label>

      <button class="app-primary-button mt-[24px] w-full" type="submit" :disabled="isSubmitting">
        {{ isSubmitting ? '建立中...' : '建立任務' }}
      </button>
    </form>
  </section>
</template>
