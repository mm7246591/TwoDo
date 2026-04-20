import {
  addDoc,
  doc,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
  type Timestamp,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '@/services/firebase/app'
import { pointLogsCollection, taskDoc, tasksCollection, userDoc } from '@/services/firebase/firestore'
import type { CreateTaskPayload, FirestoreTask } from '@/services/firebase/types/firestore-task.interface'
import type { FirestoreUserProfile } from '@/services/firebase/types/firestore-user-profile.interface'
import type { Task } from '@/views/tasks/types/interface'

const toDate = (value?: Timestamp | null) => value ? value.toDate() : null

const mapTask = (taskId: string, data: FirestoreTask): Task => ({
  id: taskId,
  assignedTo: data.assignedTo,
  completedAt: toDate(data.completedAt),
  confirmedAt: toDate(data.confirmedAt),
  coupleId: data.coupleId,
  createdAt: toDate(data.createdAt) ?? new Date(),
  createdBy: data.createdBy,
  description: data.description ?? '',
  dueDate: toDate(data.dueDate),
  points: typeof data.points === 'number' ? data.points : 0,
  status: data.status,
  title: data.title,
  updatedAt: toDate(data.updatedAt) ?? new Date(),
})

const sortTasksByUpdatedAt = (tasks: Task[]) => [...tasks].sort((leftTask, rightTask) => {
  const leftTime = leftTask.updatedAt.getTime()
  const rightTime = rightTask.updatedAt.getTime()

  return rightTime - leftTime
})

const subscribeToTasks = (
  coupleId: string,
  callback: (tasks: Task[]) => void,
): Unsubscribe => onSnapshot(
  query(tasksCollection, where('coupleId', '==', coupleId)),
  (snapshot) => {
    const tasks = snapshot.docs.map((documentSnapshot) => mapTask(
      documentSnapshot.id,
      documentSnapshot.data() as FirestoreTask,
    ))

    callback(sortTasksByUpdatedAt(tasks))
  },
)

const createTask = async (payload: CreateTaskPayload) => {
  const trimmedTitle = payload.title.trim()
  const trimmedDescription = payload.description.trim()

  if (!trimmedTitle) {
    throw new Error('請先輸入任務標題。')
  }

  if (!payload.coupleId) {
    throw new Error('目前沒有配對資料，無法建立任務。')
  }

  if (!payload.assignedTo) {
    throw new Error('請先選擇指派對象。')
  }

  if (payload.points <= 0) {
    throw new Error('任務點數至少要大於 0。')
  }

  await addDoc(tasksCollection, {
    assignedTo: payload.assignedTo,
    completedAt: null,
    confirmedAt: null,
    coupleId: payload.coupleId,
    createdAt: serverTimestamp(),
    createdBy: payload.createdBy,
    description: trimmedDescription,
    dueDate: payload.dueDate ?? null,
    points: payload.points,
    status: 'pending',
    title: trimmedTitle,
    updatedAt: serverTimestamp(),
  })
}

const completeTask = async (task: Task, actorUid: string) => {
  if (task.assignedTo !== actorUid) {
    throw new Error('只有被指派的人可以標記任務完成。')
  }

  if (task.status !== 'pending') {
    throw new Error('目前只有待處理的任務可以標記完成。')
  }

  await updateDoc(taskDoc(task.id), {
    completedAt: serverTimestamp(),
    status: 'completed_pending_confirm',
    updatedAt: serverTimestamp(),
  })
}

const confirmTask = async (task: Task, actorUid: string) => {
  if (task.createdBy !== actorUid) {
    throw new Error('只有建立任務的人可以確認完成。')
  }

  if (task.status !== 'completed_pending_confirm') {
    throw new Error('只有待確認的任務可以確認完成。')
  }

  await runTransaction(db, async (transaction) => {
    const taskReference = taskDoc(task.id)
    const assignedUserRef = userDoc(task.assignedTo)
    const pointLogReference = doc(pointLogsCollection)
    const [latestTaskSnapshot, assignedUserSnapshot] = await Promise.all([
      transaction.get(taskReference),
      transaction.get(assignedUserRef),
    ])

    if (!latestTaskSnapshot.exists()) {
      throw new Error('找不到這筆任務，請重新整理後再試。')
    }

    if (!assignedUserSnapshot.exists()) {
      throw new Error('被指派的使用者資料不存在，無法發放積分。')
    }

    const latestTask = latestTaskSnapshot.data() as FirestoreTask
    const assignedUser = assignedUserSnapshot.data() as FirestoreUserProfile

    if (latestTask.createdBy !== actorUid) {
      throw new Error('只有建立任務的人可以確認完成。')
    }

    if (latestTask.status !== 'completed_pending_confirm') {
      throw new Error('這筆任務目前不是待確認狀態，請重新整理後再試。')
    }

    const nextPoints = (typeof assignedUser.points === 'number' ? assignedUser.points : 0) + latestTask.points
    const pointLogPayload = {
      coupleId: latestTask.coupleId,
      createdAt: serverTimestamp(),
      points: latestTask.points,
      rewardId: null,
      source: 'task_confirmed',
      taskId: task.id,
      type: 'task_reward',
      userUid: latestTask.assignedTo,
    }

    transaction.update(taskReference, {
      confirmedAt: serverTimestamp(),
      status: 'confirmed',
      updatedAt: serverTimestamp(),
    })

    transaction.update(assignedUserRef, {
      points: nextPoints,
      updatedAt: serverTimestamp(),
    })

    transaction.set(pointLogReference, pointLogPayload)
  })
}

const cancelTask = async (task: Task, actorUid: string) => {
  if (task.createdBy !== actorUid) {
    throw new Error('只有建立任務的人可以取消任務。')
  }

  if (task.status === 'confirmed' || task.status === 'cancelled') {
    throw new Error('這個任務目前不能取消。')
  }

  await updateDoc(taskDoc(task.id), {
    status: 'cancelled',
    updatedAt: serverTimestamp(),
  })
}

export { cancelTask, completeTask, confirmTask, createTask, subscribeToTasks }
