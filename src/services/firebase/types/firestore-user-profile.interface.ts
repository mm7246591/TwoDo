import type { Timestamp } from 'firebase/firestore'

interface FirestoreUserProfile {
  uid: string
  email: string
  displayName: string
  photoURL: string
  inviteCode: string
  coupleId: string | null
  partnerUid: string | null
  points: number
  createdAt?: Timestamp
  updatedAt?: Timestamp
  fcmTokens?: string[]
  hasSeenPairingOnboarding?: boolean
}

export type { FirestoreUserProfile }
