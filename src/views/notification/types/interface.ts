type NotificationType =
  | 'new_task'
  | 'task_completed_pending_confirm'
  | 'task_confirmed'
  | 'reward_redeemed'

interface NotificationItem {
  id: string
  userUid: string
  coupleId: string
  type: NotificationType
  title: string
  message: string
  isRead: boolean
  refId: string | null
  createdAt: Date
}

export type { NotificationItem, NotificationType }
