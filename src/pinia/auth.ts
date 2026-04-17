import { computed, ref } from 'vue'
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth'
import { defineStore } from 'pinia'
import { auth } from '@/lib/firebase'

function normalizeAuthError(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return 'Authentication failed. Please try again.'
}

let authReadyPromise: Promise<User | null> | null = null
const googleProvider = new GoogleAuthProvider()

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<User | null>(null)
  const isReady = ref(false)
  const isSubmitting = ref(false)
  const errorMessage = ref('')

  const isLoggedIn = computed(() => currentUser.value !== null)
  const userEmail = computed(() => currentUser.value?.email ?? '')

  function clearError() {
    errorMessage.value = ''
  }

  function init() {
    if (authReadyPromise) {
      return authReadyPromise
    }

    authReadyPromise = new Promise((resolve) => {
      onAuthStateChanged(
        auth,
        (user) => {
          currentUser.value = user
          isReady.value = true
          resolve(user)
        },
        (error) => {
          errorMessage.value = normalizeAuthError(error)
          isReady.value = true
          resolve(null)
        },
      )
    })

    return authReadyPromise
  }

  async function signUp(email: string, password: string) {
    isSubmitting.value = true
    clearError()

    try {
      await createUserWithEmailAndPassword(auth, email, password)
    } catch (error) {
      errorMessage.value = normalizeAuthError(error)
      throw error
    } finally {
      isSubmitting.value = false
    }
  }

  async function signIn(email: string, password: string) {
    isSubmitting.value = true
    clearError()

    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      errorMessage.value = normalizeAuthError(error)
      throw error
    } finally {
      isSubmitting.value = false
    }
  }

  async function signInWithGoogle() {
    isSubmitting.value = true
    clearError()

    try {
      await signInWithPopup(auth, googleProvider)
    } catch (error) {
      errorMessage.value = normalizeAuthError(error)
      throw error
    } finally {
      isSubmitting.value = false
    }
  }

  async function signOutUser() {
    isSubmitting.value = true
    clearError()

    try {
      await signOut(auth)
    } catch (error) {
      errorMessage.value = normalizeAuthError(error)
      throw error
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    clearError,
    currentUser,
    errorMessage,
    init,
    isLoggedIn,
    isReady,
    isSubmitting,
    signIn,
    signInWithGoogle,
    signOutUser,
    signUp,
    userEmail,
  }
})
