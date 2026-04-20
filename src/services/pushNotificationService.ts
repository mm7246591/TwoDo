import {
  deleteToken,
  getMessaging,
  getToken,
  isSupported,
  onMessage,
  type MessagePayload,
  type Messaging,
} from 'firebase/messaging'
import {
  firebaseApp,
  firebaseWebPushVapidKey,
} from '@/services/firebase/app'
import {
  addUserFcmToken,
  removeUserFcmToken,
} from '@/services/userService'

type PushNotificationStatus = {
  hasVapidKey: boolean
  isCurrentDeviceEnabled: boolean
  isSupported: boolean
  permission: NotificationPermission | 'unsupported'
  token: string | null
}

const PUSH_SERVICE_WORKER_PATH = '/firebase-messaging-sw.js'
const FALLBACK_PUSH_LINK = '/notifications'

let browserMessagingPromise: Promise<Messaging | null> | null = null

const hasNotificationApi = () => typeof window !== 'undefined' && 'Notification' in window

const hasServiceWorkerApi = () => typeof navigator !== 'undefined' && 'serviceWorker' in navigator

const getPermissionState = (): NotificationPermission | 'unsupported' => {
  if (!hasNotificationApi()) {
    return 'unsupported'
  }

  return Notification.permission
}

const isPushNotificationsSupported = async () => {
  if (!hasNotificationApi() || !hasServiceWorkerApi()) {
    return false
  }

  return isSupported()
}

const getBrowserMessaging = async () => {
  if (!browserMessagingPromise) {
    browserMessagingPromise = (async () => {
      if (!await isPushNotificationsSupported()) {
        return null
      }

      return getMessaging(firebaseApp)
    })()
  }

  return browserMessagingPromise
}

const ensureServiceWorkerRegistration = async () => {
  if (!hasServiceWorkerApi()) {
    throw new Error('目前瀏覽器不支援 Service Worker，無法開啟推播。')
  }

  return navigator.serviceWorker.register(PUSH_SERVICE_WORKER_PATH)
}

const resolveCurrentDeviceToken = async () => {
  if (!firebaseWebPushVapidKey) {
    return null
  }

  const messaging = await getBrowserMessaging()

  if (!messaging) {
    return null
  }

  const serviceWorkerRegistration = await ensureServiceWorkerRegistration()

  return getToken(messaging, {
    vapidKey: firebaseWebPushVapidKey,
    serviceWorkerRegistration,
  })
}

const getPushNotificationStatus = async (
  storedTokens: string[],
): Promise<PushNotificationStatus> => {
  const isSupported = await isPushNotificationsSupported()
  const hasVapidKey = Boolean(firebaseWebPushVapidKey)
  const permission = getPermissionState()

  if (!isSupported || !hasVapidKey || permission !== 'granted') {
    return {
      hasVapidKey,
      isCurrentDeviceEnabled: false,
      isSupported,
      permission,
      token: null,
    }
  }

  const token = await resolveCurrentDeviceToken()

  return {
    hasVapidKey,
    isCurrentDeviceEnabled: Boolean(token && storedTokens.includes(token)),
    isSupported,
    permission,
    token: token ?? null,
  }
}

const syncCurrentDevicePushToken = async (
  uid: string,
  storedTokens: string[],
) => {
  const status = await getPushNotificationStatus(storedTokens)

  if (!status.token || storedTokens.includes(status.token)) {
    return status
  }

  await addUserFcmToken(uid, status.token)

  return {
    ...status,
    isCurrentDeviceEnabled: true,
  }
}

const enablePushNotifications = async (uid: string) => {
  if (!firebaseWebPushVapidKey) {
    throw new Error('尚未設定 VITE_FIREBASE_VAPID_KEY，請先補上 Web Push 憑證。')
  }

  if (!await isPushNotificationsSupported()) {
    throw new Error('目前瀏覽器不支援 Firebase Web Push。')
  }

  const permission = await Notification.requestPermission()

  if (permission !== 'granted') {
    throw new Error('你尚未允許通知權限，無法開啟推播。')
  }

  const token = await resolveCurrentDeviceToken()

  if (!token) {
    throw new Error('目前無法取得 FCM token，請稍後再試。')
  }

  await addUserFcmToken(uid, token)

  return token
}

const disablePushNotifications = async (uid: string) => {
  if (!await isPushNotificationsSupported()) {
    throw new Error('目前瀏覽器不支援 Firebase Web Push。')
  }

  const messaging = await getBrowserMessaging()

  if (!messaging) {
    throw new Error('目前無法初始化推播服務。')
  }

  const token = getPermissionState() === 'granted'
    ? await resolveCurrentDeviceToken()
    : null

  const didDeleteToken = await deleteToken(messaging)

  if (token) {
    await removeUserFcmToken(uid, token)
  }

  return didDeleteToken
}

const subscribeToForegroundPushMessages = async (
  callback: (payload: MessagePayload) => void,
) => {
  const messaging = await getBrowserMessaging()

  if (!messaging) {
    return () => {}
  }

  return onMessage(messaging, callback)
}

const showForegroundPushNotification = (payload: MessagePayload) => {
  if (getPermissionState() !== 'granted' || !hasNotificationApi()) {
    return
  }

  const title = payload.notification?.title?.trim() || payload.data?.title?.trim() || 'TwoDo 通知'
  const body = payload.notification?.body?.trim() || payload.data?.message?.trim() || ''
  const link = payload.data?.link?.trim() || FALLBACK_PUSH_LINK

  const notification = new Notification(title, {
    body,
    data: { link },
  })

  notification.onclick = () => {
    window.focus()
    window.location.assign(link)
    notification.close()
  }
}

export type { PushNotificationStatus }
export {
  disablePushNotifications,
  enablePushNotifications,
  getPushNotificationStatus,
  subscribeToForegroundPushMessages,
  showForegroundPushNotification,
  syncCurrentDevicePushToken,
}
