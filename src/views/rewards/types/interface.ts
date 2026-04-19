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

export type { Reward }
