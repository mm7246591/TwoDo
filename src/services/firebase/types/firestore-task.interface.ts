import type { Timestamp } from 'firebase/firestore'
import type { TaskAssignmentType, TaskStatus } from '@/views/task/types/interface'

interface FirestoreTask {
  assignedTo?: string | null
  assignmentType?: TaskAssignmentType
  participantUids?: string[]
  completedByUids?: string[]
  confirmedByUids?: string[]
  completedAt?: Timestamp | null
  confirmedAt?: Timestamp | null
  coupleId: string
  createdAt?: Timestamp | null
  createdBy: string
  description?: string
  dueDate?: Timestamp | null
  points: number
  status: TaskStatus
  title: string
  updatedAt?: Timestamp | null
}

interface CreateTaskPayload {
  assignedTo: string | null
  assignmentType: TaskAssignmentType
  coupleId: string
  createdBy: string
  description: string
  dueDate: Date | null
  points: number
  title: string
}

export type { CreateTaskPayload, FirestoreTask }
