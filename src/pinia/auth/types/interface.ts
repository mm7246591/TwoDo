interface AuthErrorLike {
  code: string
}

interface AuthErrorMessages {
  [key: string]: string
}

interface AuthSession {
  displayName: string
  email: string
  emailVerified: boolean
  requiresEmailVerification: boolean
  photoURL: string
  uid: string
}

interface AuthStoreState {
  errorMessage: string
  isReady: boolean
  isSubmitting: boolean
}

export type { AuthErrorLike, AuthErrorMessages, AuthSession, AuthStoreState }
