type TaskStatus =
  | 'pending'
  | 'completed_pending_confirm'
  | 'confirmed'
  | 'cancelled'
  | 'rejected'

interface Task {
  id: string
  coupleId: string
  title: string
  description?: string
  points: number
  status: TaskStatus
  assignedTo: string
  createdBy: string
  dueDate?: Date | null
  completedAt?: Date | null
  confirmedAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

export type { Task, TaskStatus }
