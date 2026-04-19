import { collection, doc } from 'firebase/firestore'
import { db } from '@/services/firebase/app'

const usersCollection = collection(db, 'users')
const couplesCollection = collection(db, 'couples')
const tasksCollection = collection(db, 'tasks')
const rewardsCollection = collection(db, 'rewards')
const pointLogsCollection = collection(db, 'pointLogs')
const notificationsCollection = collection(db, 'notifications')

const userDoc = (uid: string) => doc(db, 'users', uid)

const coupleDoc = (coupleId: string) => doc(db, 'couples', coupleId)

export {
  coupleDoc,
  couplesCollection,
  notificationsCollection,
  pointLogsCollection,
  rewardsCollection,
  tasksCollection,
  userDoc,
  usersCollection,
}
