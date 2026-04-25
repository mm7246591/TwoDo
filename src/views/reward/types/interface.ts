interface Reward {
  id: string
  coupleId: string
  title: string
  description?: string
  cost: number
  createdBy: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

type RedemptionStatus = 'pending' | 'completed' | 'cancelled'

interface Redemption {
  id: string
  coupleId: string
  rewardId: string
  rewardTitle: string | null
  redeemedBy: string
  cost: number
  status: RedemptionStatus
  createdAt: Date
  updatedAt: Date
}

interface RewardComposerForm {
  title: string
  description: string
  cost: number
  visibility: 'active' | 'inactive'
}

export type { Redemption, RedemptionStatus, Reward, RewardComposerForm }
