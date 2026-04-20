import type { Unsubscribe } from 'firebase/firestore'
import { computed, ref, toRefs } from 'vue'
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
  const state = ref<TasksStoreState>({
    currentCoupleId: null,
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
    state.value.errorMessage = ''
  }

  const stopSync = () => {
    unsubscribeTasks?.()
    unsubscribeTasks = null
  }

  const syncTasks = async (coupleId: string) => {
    if (state.value.currentCoupleId === coupleId && unsubscribeTasks) {
      return
    }

    stopSync()
    clearError()
    state.value.currentCoupleId = coupleId
    state.value.isLoading = true

    unsubscribeTasks = subscribeToTasks(coupleId, (nextTasks) => {
      tasks.value = nextTasks
      state.value.isLoading = false
    })
  }

  const createNewTask = async (input: CreateTaskInput) => {
    state.value.isSubmitting = true
    clearError()

    try {
      await createTask(input)
    } catch (error) {
      state.value.errorMessage = normalizeErrorMessage(error)
      throw error
    } finally {
      state.value.isSubmitting = false
    }
  }

  const markTaskCompleted = async (task: Task, actorUid: string) => {
    state.value.isSubmitting = true
    clearError()

    try {
      await completeTask(task, actorUid)
    } catch (error) {
      state.value.errorMessage = normalizeErrorMessage(error)
      throw error
    } finally {
      state.value.isSubmitting = false
    }
  }

  const confirmTaskCompletion = async (task: Task, actorUid: string) => {
    state.value.isSubmitting = true
    clearError()

    try {
      await confirmTask(task, actorUid)
    } catch (error) {
      state.value.errorMessage = normalizeErrorMessage(error)
      throw error
    } finally {
      state.value.isSubmitting = false
    }
  }

  const cancelExistingTask = async (task: Task, actorUid: string) => {
    state.value.isSubmitting = true
    clearError()

    try {
      await cancelTask(task, actorUid)
    } catch (error) {
      state.value.errorMessage = normalizeErrorMessage(error)
      throw error
    } finally {
      state.value.isSubmitting = false
    }
  }

  const reset = () => {
    stopSync()
    tasks.value = []
    state.value.currentCoupleId = null
    state.value.errorMessage = ''
    state.value.isLoading = false
    state.value.isSubmitting = false
  }

  return {
    ...toRefs(state.value),
    cancelExistingTask,
    clearError,
    confirmTaskCompletion,
    createNewTask,
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
