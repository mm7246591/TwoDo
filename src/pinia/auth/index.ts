import { computed, ref, toRefs } from 'vue'
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
import type {
  AuthErrorLike,
  AuthErrorMessages,
  AuthSession,
  AuthStoreState,
} from '@/pinia/auth/types/interface'

const AUTH_ERROR_MESSAGES: AuthErrorMessages = {
  'auth/account-exists-with-different-credential': '這個 Email 已經綁定其他登入方式，請改用原本的方法登入。',
  'auth/cancelled-popup-request': 'Google 登入流程被新的請求取代，請再試一次。',
  'auth/email-already-in-use': '這個 Email 已經被註冊過了。',
  'auth/invalid-credential': '登入資訊無效，請重新確認帳號或密碼。',
  'auth/invalid-email': 'Email 格式不正確。',
  'auth/network-request-failed': '網路連線失敗，請稍後再試。',
  'auth/operation-not-allowed': 'Firebase 尚未開啟這個登入方式。',
  'auth/popup-blocked': '瀏覽器擋住了 Google 登入視窗，請允許彈出視窗後再試一次。',
  'auth/popup-closed-by-user': '你已經關閉 Google 登入視窗。',
  'auth/requires-recent-login': '這個操作需要你重新登入後再試一次。',
  'auth/too-many-requests': '操作太頻繁了，請稍後再試。',
  'auth/user-disabled': '這個帳號目前已被停用。',
  'auth/user-not-found': '找不到這個帳號，請先註冊。',
  'auth/weak-password': '密碼強度不足，請至少輸入 6 個字元。',
  'auth/wrong-password': '密碼不正確，請重新輸入。',
}

const getFirebaseErrorCode = (error: unknown) => {
  if (
    typeof error === 'object'
    && error !== null
    && 'code' in error
    && typeof (error as AuthErrorLike).code === 'string'
  ) {
    return (error as AuthErrorLike).code
  }

  return ''
}

const normalizeAuthError = (error: unknown) => {
  const firebaseErrorCode = getFirebaseErrorCode(error)

  if (firebaseErrorCode) {
    return AUTH_ERROR_MESSAGES[firebaseErrorCode] ?? '登入流程發生未預期錯誤，請稍後再試。'
  }

  if (error instanceof Error) {
    return error.message
  }

  return '登入流程發生未預期錯誤，請稍後再試。'
}

const mapAuthSession = (user: User | null): AuthSession | null => {
  if (!user) {
    return null
  }

  return {
    displayName: user.displayName ?? '',
    email: user.email ?? '',
    photoURL: user.photoURL ?? '',
    uid: user.uid,
  }
}

let authReadyPromise: Promise<User | null> | null = null
let authStateProcessingPromise: Promise<void> = Promise.resolve()

const useAuthStore = defineStore('auth', () => {
  const authSession = ref<AuthSession | null>(null)
  const state = ref<AuthStoreState>({
    errorMessage: '',
    isReady: false,
    isSubmitting: false,
  })

  const getIsLoggedIn = computed(() => authSession.value !== null)
  const getUserEmail = computed(() => authSession.value?.email ?? '')
  const getUserUid = computed(() => authSession.value?.uid ?? '')

  const clearError = () => {
    state.value.errorMessage = ''
  }

  const waitForAuthStateProcessing = async () => {
    await authStateProcessingPromise
  }

  const init = () => {
    if (authReadyPromise) {
      return authReadyPromise
    }

    authReadyPromise = new Promise((resolve) => {
      let hasResolved = false

      onAuthStateChanged(
        firebaseAuth,
        (user) => {
          authStateProcessingPromise = (async () => {
            const userStore = useUserStore()
            authSession.value = mapAuthSession(user)
            clearError()

            try {
              if (user) {
                await userStore.syncProfileForSession(user)
              } else {
                userStore.reset()
              }
            } catch (error) {
              state.value.errorMessage = normalizeAuthError(error)
            } finally {
              state.value.isReady = true

              if (!hasResolved) {
                hasResolved = true
                resolve(user)
              }
            }
          })()
        },
        (error) => {
          state.value.errorMessage = normalizeAuthError(error)
          state.value.isReady = true

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
    state.value.isSubmitting = true
    clearError()

    try {
      const credential = await createUserWithEmailAndPassword(firebaseAuth, email, password)

      if (displayName.trim()) {
        await updateProfile(credential.user, { displayName: displayName.trim() })
      }

      await waitForAuthStateProcessing()
    } catch (error) {
      state.value.errorMessage = normalizeAuthError(error)
      throw error
    } finally {
      state.value.isSubmitting = false
    }
  }

  const signIn = async (email: string, password: string) => {
    state.value.isSubmitting = true
    clearError()

    try {
      await signInWithEmailAndPassword(firebaseAuth, email, password)
      await waitForAuthStateProcessing()
    } catch (error) {
      state.value.errorMessage = normalizeAuthError(error)
      throw error
    } finally {
      state.value.isSubmitting = false
    }
  }

  const signInWithGoogle = async () => {
    state.value.isSubmitting = true
    clearError()

    try {
      await signInWithPopup(firebaseAuth, googleProvider)
      await waitForAuthStateProcessing()
    } catch (error) {
      state.value.errorMessage = normalizeAuthError(error)
      throw error
    } finally {
      state.value.isSubmitting = false
    }
  }

  const signOutUser = async () => {
    state.value.isSubmitting = true
    clearError()

    try {
      await signOut(firebaseAuth)
      await waitForAuthStateProcessing()
    } catch (error) {
      state.value.errorMessage = normalizeAuthError(error)
      throw error
    } finally {
      state.value.isSubmitting = false
    }
  }

  return {
    ...toRefs(state.value),
    authSession,
    clearError,
    getIsLoggedIn,
    getUserEmail,
    getUserUid,
    init,
    signIn,
    signInWithGoogle,
    signOutUser,
    signUp,
    waitForAuthStateProcessing,
  }
})

export { useAuthStore }
