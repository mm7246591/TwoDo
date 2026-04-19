import type { Unsubscribe } from 'firebase/firestore'
import { computed, reactive, ref, toRefs } from 'vue'
import { defineStore } from 'pinia'
import type { CreateTaskInput, TasksStoreState } from '@/pinia/tasks/types/interface'
import {
  cancelTask,
  completeTask,
  confirmTask,
  createTask,
  subscribeToTasks,
} from '@/services/taskService'
import type { Task } from '@/views/tasks/types/interface'

const normalizeErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message
  }

  return '任務流程發生未預期錯誤，請稍後再試。'
}

const useTasksStore = defineStore('tasks', () => {
  const tasks = ref<Task[]>([])
  const currentCoupleId = ref<string | null>(null)
  const state = reactive<TasksStoreState>({
    errorMessage: '',
    isLoading: false,
    isSubmitting: false,
  })
  let unsubscribeTasks: Unsubscribe | null = null

  const getPendingTasks = computed(() => tasks.value.filter((task) => task.status === 'pending'))
  const getCompletedPendingConfirmTasks = computed(() => tasks.value.filter((task) => task.status === 'completed_pending_confirm'))
  const getConfirmedTasks = computed(() => tasks.value.filter((task) => task.status === 'confirmed'))
  const getCancelledTasks = computed(() => tasks.value.filter((task) => task.status === 'cancelled'))

  const clearError = () => {
    state.errorMessage = ''
  }

  const stopSync = () => {
    unsubscribeTasks?.()
    unsubscribeTasks = null
  }

  const syncTasks = async (coupleId: string) => {
    if (currentCoupleId.value === coupleId && unsubscribeTasks) {
      return
    }

    stopSync()
    clearError()
    currentCoupleId.value = coupleId
    state.isLoading = true

    unsubscribeTasks = subscribeToTasks(coupleId, (nextTasks) => {
      tasks.value = nextTasks
      state.isLoading = false
    })
  }

  const createNewTask = async (input: CreateTaskInput) => {
    state.isSubmitting = true
    clearError()

    try {
      await createTask(input)
    } catch (error) {
      state.errorMessage = normalizeErrorMessage(error)
      throw error
    } finally {
      state.isSubmitting = false
    }
  }

  const markTaskCompleted = async (task: Task, actorUid: string) => {
    state.isSubmitting = true
    clearError()

    try {
      await completeTask(task, actorUid)
    } catch (error) {
      state.errorMessage = normalizeErrorMessage(error)
      throw error
    } finally {
      state.isSubmitting = false
    }
  }

  const confirmTaskCompletion = async (task: Task, actorUid: string) => {
    state.isSubmitting = true
    clearError()

    try {
      await confirmTask(task, actorUid)
    } catch (error) {
      state.errorMessage = normalizeErrorMessage(error)
      throw error
    } finally {
      state.isSubmitting = false
    }
  }

  const cancelExistingTask = async (task: Task, actorUid: string) => {
    state.isSubmitting = true
    clearError()

    try {
      await cancelTask(task, actorUid)
    } catch (error) {
      state.errorMessage = normalizeErrorMessage(error)
      throw error
    } finally {
      state.isSubmitting = false
    }
  }

  const reset = () => {
    stopSync()
    tasks.value = []
    currentCoupleId.value = null
    state.errorMessage = ''
    state.isLoading = false
    state.isSubmitting = false
  }

  return {
    ...toRefs(state),
    cancelExistingTask,
    clearError,
    confirmTaskCompletion,
    createNewTask,
    currentCoupleId,
    getCancelledTasks,
    getCompletedPendingConfirmTasks,
    getConfirmedTasks,
    getPendingTasks,
    markTaskCompleted,
    reset,
    syncTasks,
    tasks,
  }
})

export { useTasksStore }
