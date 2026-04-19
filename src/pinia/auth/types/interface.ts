interface AuthErrorLike {
  code: string
}

interface AuthErrorMessages {
  [key: string]: string
}

interface AuthStoreState {
  errorMessage: string
  isReady: boolean
  isSubmitting: boolean
}

export type { AuthErrorLike, AuthErrorMessages, AuthStoreState }
