import type { ActionCodeSettings } from 'firebase/auth'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { firebaseApp } from '@/services/firebase/app'

const firebaseAuth = getAuth(firebaseApp)
const googleProvider = new GoogleAuthProvider()

const getAppBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin
  }

  return `https://${import.meta.env.VITE_FIREBASE_AUTH_DOMAIN}`
}

const createEmailVerificationActionSettings = (): ActionCodeSettings => ({
  handleCodeInApp: false,
  url: `${getAppBaseUrl()}/verify-email`,
})

export { createEmailVerificationActionSettings, firebaseAuth, googleProvider }
