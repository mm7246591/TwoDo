import type { Timestamp } from 'firebase/firestore'
import type { RedemptionStatus } from '@/views/reward/types/interface'

interface FirestoreRedemption {
  coupleId: string
  rewardId: string
  redeemedBy: string
  cost: number
  status: RedemptionStatus
  createdAt?: Timestamp | null
  updatedAt?: Timestamp | null
}

export type { FirestoreRedemption }
