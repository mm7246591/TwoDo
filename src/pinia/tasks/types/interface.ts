interface CreateTaskInput {
  assignedTo: string
  coupleId: string
  createdBy: string
  description: string
  dueDate: Date | null
  points: number
  title: string
}

interface TasksStoreState {
  errorMessage: string
  isLoading: boolean
  isSubmitting: boolean
}

export type { CreateTaskInput, TasksStoreState }
