import {
  onSnapshot,
  type Timestamp,
  type Unsubscribe,
} from 'firebase/firestore'
import {
  type FunctionsError,
  httpsCallable,
} from 'firebase/functions'
import { firebaseFunctions } from '@/services/firebase/app'
import { coupleDoc } from '@/services/firebase/firestore'
import type { FirestoreCouple } from '@/services/firebase/types/firestore-couple.interface'
import type { Couple } from '@/views/pairing/types/interface'

const toDate = (value?: Timestamp | null) => value ? value.toDate() : null

const mapCouple = (data: FirestoreCouple): Couple => ({
  id: data.id,
  memberUids: Array.isArray(data.memberUids) ? data.memberUids : [],
  inviteCode: data.inviteCode,
  status: data.status,
  createdBy: data.createdBy,
  createdAt: toDate(data.createdAt),
  updatedAt: toDate(data.updatedAt),
})

const subscribeToCouple = (
  coupleId: string,
  callback: (couple: Couple | null) => void,
): Unsubscribe => onSnapshot(coupleDoc(coupleId), (snapshot) => {
  if (!snapshot.exists()) {
    callback(null)
    return
  }

  callback(mapCouple(snapshot.data() as FirestoreCouple))
})

const joinCoupleByInviteCode = async (uid: string, rawInviteCode: string) => {
  if (!uid) {
    throw new Error('目前找不到你的登入資訊，請重新登入後再試。')
  }

  try {
    const joinCouple = httpsCallable<
      { inviteCode: string },
      { coupleId: string }
    >(firebaseFunctions, 'joinCoupleByInviteCode')
    const result = await joinCouple({ inviteCode: rawInviteCode })

    return result.data.coupleId
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'message' in error) {
      throw new Error(String((error as FunctionsError).message))
    }

    throw error
  }
}

const unpairCouple = async () => {
  try {
    const unpairCoupleCallable = httpsCallable<
      Record<string, never>,
      { success: true }
    >(firebaseFunctions, 'unpairCouple')

    await unpairCoupleCallable({})
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'message' in error) {
      throw new Error(String((error as FunctionsError).message))
    }

    throw error
  }
}

export { joinCoupleByInviteCode, subscribeToCouple, unpairCouple }
