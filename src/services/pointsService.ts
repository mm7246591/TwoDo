import {
  getDoc,
  onSnapshot,
  query,
  where,
  type Timestamp,
  type Unsubscribe,
} from 'firebase/firestore'
import {
  pointLogsCollection,
  rewardDoc,
  taskDoc,
} from '@/services/firebase/firestore'
import type { FirestorePointLog } from '@/services/firebase/types/firestore-point-log.interface'
import type { FirestoreReward } from '@/services/firebase/types/firestore-reward.interface'
import type { FirestoreTask } from '@/services/firebase/types/firestore-task.interface'
import type { PointLog } from '@/views/point/types/interface'

const toDate = (value?: Timestamp | null) => value ? value.toDate() : new Date()

const mapPointLog = (
  pointLogId: string,
  data: FirestorePointLog,
  relatedTitles: {
    rewardTitle: string | null
    taskTitle: string | null
  },
): PointLog => ({
  id: pointLogId,
  coupleId: data.coupleId,
  userUid: data.userUid,
  type: data.type,
  points: typeof data.points === 'number' ? data.points : 0,
  taskId: data.taskId ?? null,
  rewardId: data.rewardId ?? null,
  taskTitle: relatedTitles.taskTitle,
  rewardTitle: relatedTitles.rewardTitle,
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
  onError?: (error: Error) => void,
): Unsubscribe => onSnapshot(
  query(
    pointLogsCollection,
    where('userUid', '==', userUid),
    where('coupleId', '==', coupleId),
  ),
  async (snapshot) => {
    try {
      const rawPointLogs = snapshot.docs
        .map((documentSnapshot) => ({
          data: documentSnapshot.data() as FirestorePointLog,
          id: documentSnapshot.id,
        }))

      const taskIds = Array.from(
        new Set(rawPointLogs.map((pointLog) => pointLog.data.taskId).filter(Boolean)),
      ) as string[]
      const rewardIds = Array.from(
        new Set(rawPointLogs.map((pointLog) => pointLog.data.rewardId).filter(Boolean)),
      ) as string[]

      const [taskEntries, rewardEntries] = await Promise.all([
        Promise.all(taskIds.map(async (taskId) => {
          const snapshot = await getDoc(taskDoc(taskId))
          const task = snapshot.data() as FirestoreTask | undefined

          return [taskId, task?.title ?? null] as const
        })),
        Promise.all(rewardIds.map(async (rewardId) => {
          const snapshot = await getDoc(rewardDoc(rewardId))
          const reward = snapshot.data() as FirestoreReward | undefined

          return [rewardId, reward?.title ?? null] as const
        })),
      ])

      const taskTitleMap = new Map(taskEntries)
      const rewardTitleMap = new Map(rewardEntries)

      const pointLogs = rawPointLogs.map((pointLog) => mapPointLog(
        pointLog.id,
        pointLog.data,
        {
          rewardTitle: pointLog.data.rewardId ? rewardTitleMap.get(pointLog.data.rewardId) ?? null : null,
          taskTitle: pointLog.data.taskId ? taskTitleMap.get(pointLog.data.taskId) ?? null : null,
        },
      ))

      callback(sortPointLogsByCreatedAt(pointLogs))
    } catch (error) {
      onError?.(
        error instanceof Error
          ? error
          : new Error('點數流水補充資料讀取失敗，請稍後再試。'),
      )
    }
  },
  (error) => {
    onError?.(error)
  },
)

export { subscribeToPointLogs }
