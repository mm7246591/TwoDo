interface CreateRewardInput {
  coupleId: string
  title: string
  description: string
  cost: number
  createdBy: string
  isActive: boolean
}

interface RewardsStoreState {
  currentCoupleId: string | null
  errorMessage: string
  isLoading: boolean
  isSubmitting: boolean
}

export type { CreateRewardInput, RewardsStoreState }
