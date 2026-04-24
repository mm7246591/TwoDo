type TaskStatus =
  | 'pending'
  | 'completed_pending_confirm'
  | 'confirmed'
  | 'cancelled'
  | 'rejected'

type TaskAssignmentType = 'user' | 'couple'

interface Task {
  id: string
  coupleId: string
  title: string
  description?: string
  points: number
  status: TaskStatus
  assignmentType: TaskAssignmentType
  assignedTo: string | null
  participantUids: string[]
  completedByUids: string[]
  confirmedByUids: string[]
  createdBy: string
  dueDate?: Date | null
  completedAt?: Date | null
  confirmedAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

interface TaskComposerForm {
  assignedTo: string | null;
  assignmentType: TaskAssignmentType;
  description: string;
  dueDate: string;
  points: number;
  title: string;
}

export type { Task, TaskAssignmentType, TaskStatus, TaskComposerForm }
