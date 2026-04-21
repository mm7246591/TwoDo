import { collection, doc } from 'firebase/firestore'
import { db } from '@/services/firebase/app'

const usersCollection = collection(db, 'users')
const couplesCollection = collection(db, 'couples')
const tasksCollection = collection(db, 'tasks')
const rewardsCollection = collection(db, 'rewards')
const redemptionsCollection = collection(db, 'redemptions')
const pointLogsCollection = collection(db, 'pointLogs')
const notificationsCollection = collection(db, 'notifications')

const userDoc = (uid: string) => doc(db, 'users', uid)

const coupleDoc = (coupleId: string) => doc(db, 'couples', coupleId)
const taskDoc = (taskId: string) => doc(db, 'tasks', taskId)
const rewardDoc = (rewardId: string) => doc(db, 'rewards', rewardId)

export {
  coupleDoc,
  couplesCollection,
  notificationsCollection,
  pointLogsCollection,
  redemptionsCollection,
  rewardDoc,
  rewardsCollection,
  taskDoc,
  tasksCollection,
  userDoc,
  usersCollection,
}
