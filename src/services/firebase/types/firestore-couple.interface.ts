import type { Timestamp } from 'firebase/firestore'
import type { Couple } from '@/views/pairing/types/interface'

interface FirestoreCouple {
  id: string
  memberUids: string[]
  inviteCode: string
  status: Couple['status']
  createdBy: string
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

interface FirestoreUserState {
  coupleId?: string | null
  partnerUid?: string | null
}

export type { FirestoreCouple, FirestoreUserState }
