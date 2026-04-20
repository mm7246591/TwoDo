interface NotificationsStoreState {
  currentCoupleId: string | null
  currentUserUid: string | null
  errorMessage: string
  isLoading: boolean
  isSubmitting: boolean
}

export type { NotificationsStoreState }
