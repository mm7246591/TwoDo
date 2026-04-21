type PointLogType = 'task_reward' | 'reward_redeem' | 'manual_adjust'

interface PointLog {
  id: string
  coupleId: string
  userUid: string
  type: PointLogType
  points: number
  taskId: string | null
  rewardId: string | null
  taskTitle: string | null
  rewardTitle: string | null
  source: string
  createdAt: Date
}

export type { PointLog, PointLogType }
