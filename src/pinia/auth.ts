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

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/account-exists-with-different-credential': '這個 Email 已經綁定其他登入方式，請改用原本的方式登入。',
  'auth/cancelled-popup-request': 'Google 登入視窗已被取消，請再試一次。',
  'auth/email-already-in-use': '這個 Email 已經註冊過了，請直接登入。',
  'auth/invalid-credential': '登入憑證已失效，請重新操作一次。',
  'auth/invalid-email': 'Email 格式不正確，請重新確認。',
  'auth/network-request-failed': '網路連線不穩定，請檢查網路後再試一次。',
  'auth/operation-not-allowed': '目前暫時無法使用這個登入方式，請稍後再試。',
  'auth/popup-blocked': '瀏覽器封鎖了登入視窗，請允許彈出視窗後再試一次。',
  'auth/popup-closed-by-user': '你已關閉 Google 授權視窗，尚未完成登入。',
  'auth/requires-recent-login': '這個操作需要重新登入後才能繼續。',
  'auth/too-many-requests': '嘗試次數過多，請稍後再試。',
  'auth/user-disabled': '這個帳號目前已被停用，請聯絡管理員。',
  'auth/user-not-found': '找不到這個帳號，請確認 Email 是否正確。',
  'auth/weak-password': '密碼強度不足，請至少使用 6 個字元。',
  'auth/wrong-password': '密碼不正確，請重新輸入。',
}

function getFirebaseErrorCode(error: unknown) {
  if (typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string') {
    return error.code
  }

  return ''
}

function normalizeAuthError(error: unknown) {
  const firebaseErrorCode = getFirebaseErrorCode(error)

  if (firebaseErrorCode) {
    return AUTH_ERROR_MESSAGES[firebaseErrorCode] ?? '登入失敗，請稍後再試一次。'
  }

  if (error instanceof Error) {
    return error.message
  }

  return '登入失敗，請稍後再試一次。'
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
