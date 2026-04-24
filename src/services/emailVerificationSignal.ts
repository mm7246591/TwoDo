const EMAIL_VERIFICATION_CHANNEL_NAME = 'twodo-email-verification'
const EMAIL_VERIFICATION_STORAGE_KEY = 'twodo-email-verification-signal'

type EmailVerificationListener = () => void

const createChannel = () => {
  if (typeof window === 'undefined' || !('BroadcastChannel' in window)) {
    return null
  }

  return new BroadcastChannel(EMAIL_VERIFICATION_CHANNEL_NAME)
}

const emitEmailVerificationSignal = () => {
  if (typeof window === 'undefined') {
    return
  }

  const channel = createChannel()
  channel?.postMessage({ type: 'verified', timestamp: Date.now() })
  channel?.close()

  window.localStorage.setItem(EMAIL_VERIFICATION_STORAGE_KEY, `${Date.now()}`)
}

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
