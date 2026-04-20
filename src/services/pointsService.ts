import { onSnapshot, query, where, type Timestamp, type Unsubscribe } from 'firebase/firestore'
import { pointLogsCollection } from '@/services/firebase/firestore'
import type { FirestorePointLog } from '@/services/firebase/types/firestore-point-log.interface'
import type { PointLog } from '@/views/points/types/interface'

const toDate = (value?: Timestamp | null) => value ? value.toDate() : new Date()

const mapPointLog = (pointLogId: string, data: FirestorePointLog): PointLog => ({
  id: pointLogId,
  coupleId: data.coupleId,
  userUid: data.userUid,
  type: data.type,
  points: typeof data.points === 'number' ? data.points : 0,
  taskId: data.taskId ?? null,
  rewardId: data.rewardId ?? null,
  source: data.source,
  createdAt: toDate(data.createdAt),
})

const sortPointLogsByCreatedAt = (pointLogs: PointLog[]) => [...pointLogs].sort((leftLog, rightLog) => {
  const leftTime = leftLog.createdAt.getTime()
  const rightTime = rightLog.createdAt.getTime()

  return rightTime - leftTime
})

const subscribeToPointLogs = (
  userUid: string,
  coupleId: string,
  callback: (pointLogs: PointLog[]) => void,
): Unsubscribe => onSnapshot(
  query(pointLogsCollection, where('userUid', '==', userUid)),
  (snapshot) => {
    const pointLogs = snapshot.docs
      .map((documentSnapshot) => mapPointLog(
        documentSnapshot.id,
        documentSnapshot.data() as FirestorePointLog,
      ))
      .filter((pointLog) => pointLog.coupleId === coupleId)

    callback(sortPointLogsByCreatedAt(pointLogs))
  },
)

export { subscribeToPointLogs }
