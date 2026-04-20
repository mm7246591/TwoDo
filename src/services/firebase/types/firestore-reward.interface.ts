import type { Timestamp } from 'firebase/firestore'

interface FirestoreReward {
  coupleId: string
  title: string
  description?: string
  cost: number
  createdBy: string
  isActive: boolean
  createdAt?: Timestamp | null
  updatedAt?: Timestamp | null
}

interface CreateRewardPayload {
  coupleId: string
  title: string
  description: string
  cost: number
  createdBy: string
  isActive: boolean
}

export type { CreateRewardPayload, FirestoreReward }
