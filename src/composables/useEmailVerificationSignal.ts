/**
 * 管理 email 驗證完成後跨分頁通知與本頁訂閱。
 */
const EMAIL_VERIFICATION_CHANNEL_NAME = 'twodo-email-verification'
const EMAIL_VERIFICATION_STORAGE_KEY = 'twodo-email-verification-signal'

interface EmailVerificationListener {
  (): void
}

const createChannel = () => {
  if (typeof window === 'undefined' || !('BroadcastChannel' in window)) {
    return null
  }

  return new BroadcastChannel(EMAIL_VERIFICATION_CHANNEL_NAME)
}

/**
 * 發送 email 驗證完成訊號，通知其他頁籤重新檢查驗證狀態。
 */
const emitEmailVerificationSignal = () => {
  if (typeof window === 'undefined') {
    return
  }

  const channel = createChannel()
  channel?.postMessage({ type: 'verified', timestamp: Date.now() })
  channel?.close()

  window.localStorage.setItem(EMAIL_VERIFICATION_STORAGE_KEY, `${Date.now()}`)
}

/**
 * 訂閱 email 驗證完成訊號。
 *
 * @param listener - 收到驗證訊號時執行的回呼。
 * @returns 取消訂閱函式。
 */
const subscribeEmailVerificationSignal = (listener: EmailVerificationListener) => {
  if (typeof window === 'undefined') {
    return () => {}
  }

  const channel = createChannel()
  const handleChannelMessage = () => {
    listener()
  }
  const handleStorageEvent = (event: StorageEvent) => {
    if (event.key === EMAIL_VERIFICATION_STORAGE_KEY && event.newValue) {
      listener()
    }
  }

  channel?.addEventListener('message', handleChannelMessage)
  window.addEventListener('storage', handleStorageEvent)

  return () => {
    channel?.removeEventListener('message', handleChannelMessage)
    channel?.close()
    window.removeEventListener('storage', handleStorageEvent)
  }
}

export { emitEmailVerificationSignal, subscribeEmailVerificationSignal }
