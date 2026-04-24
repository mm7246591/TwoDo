import type { TaskAssignmentType } from '@/views/tasks/types/interface'

interface CreateTaskInput {
  assignedTo: string | null
  assignmentType: TaskAssignmentType
  coupleId: string
  createdBy: string
  description: string
  dueDate: Date | null
  points: number
  title: string
}

interface TasksStoreState {
  currentCoupleId: string | null
  errorMessage: string
  isLoading: boolean
  isSubmitting: boolean
}

export type { CreateTaskInput, TasksStoreState }
