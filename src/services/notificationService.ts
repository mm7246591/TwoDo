import {
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
  type Timestamp,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '@/services/firebase/app'
import { notificationsCollection } from '@/services/firebase/firestore'
import type { FirestoreNotification } from '@/services/firebase/types/firestore-notification.interface'
import type { NotificationItem } from '@/views/notifications/types/interface'

const toDate = (value?: Timestamp | null) => value ? value.toDate() : new Date()

const mapNotification = (
  notificationId: string,
  data: FirestoreNotification,
): NotificationItem => ({
  id: notificationId,
  userUid: data.userUid,
  coupleId: data.coupleId,
  type: data.type,
  title: data.title,
  message: data.message,
  isRead: Boolean(data.isRead),
  refId: data.refId ?? null,
  createdAt: toDate(data.createdAt),
})

const sortNotificationsByCreatedAt = (notifications: NotificationItem[]) => [...notifications].sort(
  (leftNotification, rightNotification) => rightNotification.createdAt.getTime() - leftNotification.createdAt.getTime(),
)

const subscribeToNotifications = (
  userUid: string,
  coupleId: string,
  callback: (notifications: NotificationItem[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe => onSnapshot(
  query(notificationsCollection, where('userUid', '==', userUid)),
  (snapshot) => {
    const notifications = snapshot.docs
      .map((documentSnapshot) => mapNotification(
        documentSnapshot.id,
        documentSnapshot.data() as FirestoreNotification,
      ))
      .filter((notification) => notification.coupleId === coupleId)

    callback(sortNotificationsByCreatedAt(notifications))
  },
  (error) => {
    onError?.(error)
  },
)

const markNotificationAsRead = async (notificationId: string) => {
  await updateDoc(doc(notificationsCollection, notificationId), {
    isRead: true,
  })
}

const markAllNotificationsAsRead = async (userUid: string, coupleId: string) => {
  const snapshot = await getDocs(query(
    notificationsCollection,
    where('userUid', '==', userUid),
  ))

  const batch = writeBatch(db)

  snapshot.docs.forEach((documentSnapshot) => {
    const notification = documentSnapshot.data() as FirestoreNotification

    if (notification.coupleId !== coupleId || notification.isRead) {
      return
    }

    batch.update(documentSnapshot.ref, { isRead: true })
  })

  await batch.commit()
}

const createNotificationPayload = (
  notification: Omit<FirestoreNotification, 'createdAt'>,
) => ({
  ...notification,
  createdAt: serverTimestamp(),
})

export {
  createNotificationPayload,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  subscribeToNotifications,
}
