import {
  onSnapshot,
  query,
  where,
  type Timestamp,
  type Unsubscribe,
} from 'firebase/firestore'
import {
  type FunctionsError,
  httpsCallable,
} from 'firebase/functions'
import { firebaseFunctions } from '@/services/firebase/app'
import { tasksCollection } from '@/services/firebase/firestore'
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
  onError?: (error: Error) => void,
): Unsubscribe => onSnapshot(
  query(tasksCollection, where('coupleId', '==', coupleId)),
  (snapshot) => {
    const tasks = snapshot.docs.map((documentSnapshot) => mapTask(
      documentSnapshot.id,
      documentSnapshot.data() as FirestoreTask,
    ))

    callback(sortTasksByUpdatedAt(tasks))
  },
  (error) => {
    onError?.(error)
  },
)

const createTask = async (payload: CreateTaskPayload) => {
  const trimmedTitle = payload.title.trim()
  const trimmedDescription = payload.description.trim()

  if (!trimmedTitle) {
    throw new Error('請先輸入待辦名稱。')
  }

  if (!payload.coupleId) {
    throw new Error('目前沒有配對資料，無法新增待辦。')
  }

  if (!payload.assignedTo) {
    throw new Error('請先選擇要交給誰。')
  }

  if (payload.points <= 0) {
    throw new Error('待辦點數至少要大於 0。')
  }

  try {
    const createTaskCallable = httpsCallable<
      {
        assignedTo: string
        coupleId: string
        description: string
        dueDateIso: string | null
        points: number
        title: string
      },
      { taskId: string }
    >(firebaseFunctions, 'createTask')

    await createTaskCallable({
      assignedTo: payload.assignedTo,
      coupleId: payload.coupleId,
      description: trimmedDescription,
      dueDateIso: payload.dueDate ? payload.dueDate.toISOString() : null,
      points: payload.points,
      title: trimmedTitle,
    })
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'message' in error) {
      throw new Error(String((error as FunctionsError).message))
    }

    throw error
  }
}

const completeTask = async (task: Task, actorUid: string) => {
  if (task.assignedTo !== actorUid) {
    throw new Error('只有收到這件待辦的人可以標記完成。')
  }

  if (task.status !== 'pending') {
    throw new Error('目前只有待完成的待辦可以標記完成。')
  }

  try {
    const completeTaskCallable = httpsCallable<
      { taskId: string },
      { success: true }
    >(firebaseFunctions, 'completeTask')

    await completeTaskCallable({ taskId: task.id })
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'message' in error) {
      throw new Error(String((error as FunctionsError).message))
    }

    throw error
  }
}

const confirmTask = async (task: Task, actorUid: string) => {
  if (task.createdBy !== actorUid) {
    throw new Error('只有新增這件待辦的人可以確認完成。')
  }

  if (task.status !== 'completed_pending_confirm') {
    throw new Error('只有待確認的待辦可以確認完成。')
  }

  try {
    const confirmTaskCallable = httpsCallable<
      { taskId: string },
      { success: true }
    >(firebaseFunctions, 'confirmTask')

    await confirmTaskCallable({ taskId: task.id })
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'message' in error) {
      throw new Error(String((error as FunctionsError).message))
    }

    throw error
  }
}

const cancelTask = async (task: Task, actorUid: string) => {
  if (task.createdBy !== actorUid) {
    throw new Error('只有新增這件待辦的人可以取消。')
  }

  if (task.status === 'confirmed' || task.status === 'cancelled') {
    throw new Error('這件待辦目前不能取消。')
  }

  try {
    const cancelTaskCallable = httpsCallable<
      { taskId: string },
      { success: true }
    >(firebaseFunctions, 'cancelTask')

    await cancelTaskCallable({ taskId: task.id })
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'message' in error) {
      throw new Error(String((error as FunctionsError).message))
    }

    throw error
  }
}

export { cancelTask, completeTask, confirmTask, createTask, subscribeToTasks }
