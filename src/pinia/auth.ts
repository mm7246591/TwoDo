import { computed, ref } from 'vue'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth'
import { defineStore } from 'pinia'
import { firebaseAuth, googleProvider } from '@/services/firebase/auth'
import { useUserStore } from '@/pinia/user'

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/account-exists-with-different-credential': '這個 Email 已綁定其他登入方式，請改用原本方式登入。',
  'auth/cancelled-popup-request': 'Google 登入流程已取消，請再試一次。',
  'auth/email-already-in-use': '這個 Email 已註冊過，請直接登入。',
  'auth/invalid-credential': '帳號或密碼不正確，請重新確認。',
  'auth/invalid-email': 'Email 格式不正確。',
  'auth/network-request-failed': '網路連線失敗，請稍後再試。',
  'auth/operation-not-allowed': 'Firebase 尚未開啟這個登入方式。',
  'auth/popup-blocked': '瀏覽器擋住了登入視窗，請允許後再試。',
  'auth/popup-closed-by-user': '你已關閉 Google 登入視窗。',
  'auth/requires-recent-login': '這個操作需要重新登入後才能繼續。',
  'auth/too-many-requests': '嘗試次數過多，請稍後再試。',
  'auth/user-disabled': '這個帳號目前無法使用。',
  'auth/user-not-found': '找不到這個帳號，請先註冊。',
  'auth/weak-password': '密碼強度不足，至少需要 6 個字元。',
  'auth/wrong-password': '密碼不正確，請重新輸入。',
}

const getFirebaseErrorCode = (error: unknown) => {
  if (typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string') {
    return error.code
  }

  return ''
}

const normalizeAuthError = (error: unknown) => {
  const firebaseErrorCode = getFirebaseErrorCode(error)

  if (firebaseErrorCode) {
    return AUTH_ERROR_MESSAGES[firebaseErrorCode] ?? '登入流程發生錯誤，請稍後再試。'
  }

  if (error instanceof Error) {
    return error.message
  }

  return '登入流程發生錯誤，請稍後再試。'
}

let authReadyPromise: Promise<User | null> | null = null

const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<User | null>(null)
  const isReady = ref(false)
  const isSubmitting = ref(false)
  const errorMessage = ref('')

  const isLoggedIn = computed(() => currentUser.value !== null)
  const userEmail = computed(() => currentUser.value?.email ?? '')

  const clearError = () => {
    errorMessage.value = ''
  }

  const init = () => {
    if (authReadyPromise) {
      return authReadyPromise
    }

    authReadyPromise = new Promise((resolve) => {
      let hasResolved = false

      onAuthStateChanged(
        firebaseAuth,
        async (user) => {
          const userStore = useUserStore()
          currentUser.value = user
          clearError()

          try {
            if (user) {
              await userStore.syncProfileForSession(user)
            } else {
              userStore.reset()
            }
          } catch (error) {
            errorMessage.value = normalizeAuthError(error)
          } finally {
            isReady.value = true

            if (!hasResolved) {
              hasResolved = true
              resolve(user)
            }
          }
        },
        (error) => {
          errorMessage.value = normalizeAuthError(error)
          isReady.value = true

          if (!hasResolved) {
            hasResolved = true
            resolve(null)
          }
        },
      )
    })

    return authReadyPromise
  }

  const signUp = async (email: string, password: string, displayName = '') => {
    isSubmitting.value = true
    clearError()

    try {
      const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password)

      if (displayName.trim()) {
        await updateProfile(credential.user, { displayName: displayName.trim() })
      }
    } catch (error) {
      errorMessage.value = normalizeAuthError(error)
      throw error
    } finally {
      isSubmitting.value = false
    }
  }

  const signIn = async (email: string, password: string) => {
    isSubmitting.value = true
    clearError()

    try {
      await signInWithEmailAndPassword(firebaseAuth, email, password)
    } catch (error) {
      errorMessage.value = normalizeAuthError(error)
      throw error
    } finally {
      isSubmitting.value = false
    }
  }

  const signInWithGoogle = async () => {
    isSubmitting.value = true
    clearError()

    try {
      await signInWithPopup(firebaseAuth, googleProvider)
    } catch (error) {
      errorMessage.value = normalizeAuthError(error)
      throw error
    } finally {
      isSubmitting.value = false
    }
  }

  const signOutUser = async () => {
    isSubmitting.value = true
    clearError()

    try {
      await signOut(firebaseAuth)
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

export { useAuthStore }
