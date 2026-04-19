import {
  addDoc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type Timestamp,
  type Unsubscribe,
} from 'firebase/firestore'
import { taskDoc, tasksCollection } from '@/services/firebase/firestore'
import type { CreateTaskPayload, FirestoreTask } from '@/services/firebase/types/firestore-task.interface'
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

  await updateDoc(taskDoc(task.id), {
    confirmedAt: serverTimestamp(),
    status: 'confirmed',
    updatedAt: serverTimestamp(),
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
