import type { Task } from '@/views/task/types/interface'

const getTaskParticipantUids = (task: Task) => {
  if (task.assignmentType === 'couple') {
    return task.participantUids
  }

  return task.assignedTo ? [task.assignedTo] : []
}

const isCoupleTask = (task: Task) => task.assignmentType === 'couple'

const isTaskParticipant = (task: Task, uid: string) => getTaskParticipantUids(task).includes(uid)

const hasCompletedTask = (task: Task, uid: string) => task.completedByUids.includes(uid)

const hasConfirmedTask = (task: Task, uid: string) => task.confirmedByUids.includes(uid)

const canCompleteTask = (task: Task, uid: string) => {
  if (!uid || task.status !== 'pending') {
    return false
  }

  if (isCoupleTask(task)) {
    return isTaskParticipant(task, uid) && !hasCompletedTask(task, uid)
  }

  return task.assignedTo === uid
}

const canConfirmTask = (task: Task, uid: string) => {
  if (!uid || task.status !== 'completed_pending_confirm') {
    return false
  }

  if (isCoupleTask(task)) {
    return isTaskParticipant(task, uid) && !hasConfirmedTask(task, uid)
  }

  return task.createdBy === uid
}

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
