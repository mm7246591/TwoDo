import type { Timestamp } from 'firebase/firestore'
import type { PointLogType } from '@/views/point/types/interface'

interface FirestorePointLog {
  coupleId: string
  userUid: string
  type: PointLogType
  points: number
  taskId: string | null
  rewardId: string | null
  source: string
  createdAt?: Timestamp | null
}

export type { FirestorePointLog }
