interface UserProfile {
  uid: string
  email: string
  displayName: string
  photoURL: string
  coupleId: string | null
  partnerUid: string | null
  points: number
  createdAt: Date | null
  updatedAt: Date | null
  fcmTokens: string[]
}

export type { UserProfile }
