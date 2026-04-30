/**
 * 定義任務狀態與參與者相關的純業務判斷。
 */
import type { Task } from '@/views/task/types/interface'

/**
 * 取得任務的參與者 uid 清單。
 *
 * @param task - 要判斷參與者的任務。
 * @returns 任務參與者 uid 清單。
 */
const getTaskParticipantUids = (task: Task) => {
  if (task.assignmentType === 'couple') {
    return task.participantUids
  }

  return task.assignedTo ? [task.assignedTo] : []
}

/**
 * 判斷任務是否為共同任務。
 *
 * @param task - 要判斷的任務。
 * @returns 任務 assignmentType 為 couple 時回傳 true。
 */
const isCoupleTask = (task: Task) => task.assignmentType === 'couple'

/**
 * 判斷指定使用者是否為任務參與者。
 *
 * @param task - 要判斷的任務。
 * @param uid - 使用者 uid。
 * @returns 使用者屬於任務參與者時回傳 true。
 */
const isTaskParticipant = (task: Task, uid: string) => getTaskParticipantUids(task).includes(uid)

/**
 * 判斷指定使用者是否已完成任務。
 *
 * @param task - 要判斷的任務。
 * @param uid - 使用者 uid。
 * @returns 使用者已在完成清單中時回傳 true。
 */
const hasCompletedTask = (task: Task, uid: string) => task.completedByUids.includes(uid)

/**
 * 判斷指定使用者是否已確認任務。
 *
 * @param task - 要判斷的任務。
 * @param uid - 使用者 uid。
 * @returns 使用者已在確認清單中時回傳 true。
 */
const hasConfirmedTask = (task: Task, uid: string) => task.confirmedByUids.includes(uid)

/**
 * 判斷使用者是否能完成指定任務。
 *
 * @param task - 要判斷的任務。
 * @param uid - 使用者 uid。
 * @returns 使用者符合任務完成條件時回傳 true。
 */
const canCompleteTask = (task: Task, uid: string) => {
  if (!uid || task.status !== 'pending') {
    return false
  }

  if (isCoupleTask(task)) {
    return isTaskParticipant(task, uid) && !hasCompletedTask(task, uid)
  }

  return task.assignedTo === uid
}

/**
 * 判斷使用者是否能確認指定任務。
 *
 * @param task - 要判斷的任務。
 * @param uid - 使用者 uid。
 * @returns 使用者符合任務確認條件時回傳 true。
 */
const canConfirmTask = (task: Task, uid: string) => {
  if (!uid || task.status !== 'completed_pending_confirm') {
    return false
  }

  if (isCoupleTask(task)) {
    return isTaskParticipant(task, uid) && !hasConfirmedTask(task, uid)
  }

  return task.createdBy === uid
}

/**
 * 判斷共同任務是否正在等待其他參與者完成。
 *
 * @param task - 要判斷的任務。
 * @param uid - 目前使用者 uid。
 * @returns 目前使用者已完成但任務仍待其他人完成時回傳 true。
 */
const isWaitingForOtherParticipant = (task: Task, uid: string) => (
  isCoupleTask(task)
  && task.status === 'pending'
  && isTaskParticipant(task, uid)
  && hasCompletedTask(task, uid)
)

export {
  canCompleteTask,
  canConfirmTask,
  getTaskParticipantUids,
  hasCompletedTask,
  hasConfirmedTask,
  isCoupleTask,
  isTaskParticipant,
  isWaitingForOtherParticipant,
}
