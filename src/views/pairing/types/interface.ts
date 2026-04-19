type CoupleStatus = 'waiting_partner' | 'paired'

interface Couple {
  id: string
  memberUids: string[]
  inviteCode: string
  status: CoupleStatus
  createdBy: string
  createdAt: Date | null
  updatedAt: Date | null
}

export type { Couple, CoupleStatus }
