interface UserProfile {
  uid: string
  email: string
  displayName: string
  photoURL: string
  inviteCode: string
  coupleId: string | null
  partnerUid: string | null
  points: number
  createdAt: Date | null
  updatedAt: Date | null
  fcmTokens: string[]
  hasSeenPairingOnboarding: boolean
}

export type { UserProfile }
