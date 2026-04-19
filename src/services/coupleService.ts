import {
  onSnapshot,
  runTransaction,
  serverTimestamp,
  type Timestamp,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '@/services/firebase/app'
import { coupleDoc, userDoc } from '@/services/firebase/firestore'
import type {
  FirestoreCouple,
  FirestoreUserState,
} from '@/services/firebase/types/firestore-couple.interface'
import { generateInviteCode, normalizeInviteCode } from '@/utils/inviteCode'
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

const createCoupleInviteForUser = async (uid: string) => {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const inviteCode = generateInviteCode()

    try {
      await runTransaction(db, async (transaction) => {
        const currentUserRef = userDoc(uid)
        const currentCoupleRef = coupleDoc(inviteCode)
        const currentUserSnapshot = await transaction.get(currentUserRef)
        const currentCoupleSnapshot = await transaction.get(currentCoupleRef)

        if (!currentUserSnapshot.exists()) {
          throw new Error('找不到目前使用者資料，請重新登入後再試。')
        }

        const currentUserState = currentUserSnapshot.data() as FirestoreUserState

        if (currentUserState.coupleId) {
          throw new Error('你已經有配對資料，不能再建立新的邀請碼。')
        }

        if (currentCoupleSnapshot.exists()) {
          throw new Error('invite-code-collision')
        }

        transaction.set(currentCoupleRef, {
          id: inviteCode,
          memberUids: [uid],
          inviteCode,
          status: 'waiting_partner',
          createdBy: uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })

        transaction.update(currentUserRef, {
          coupleId: inviteCode,
          partnerUid: null,
          updatedAt: serverTimestamp(),
        })
      })

      return inviteCode
    } catch (error) {
      if (error instanceof Error && error.message === 'invite-code-collision') {
        continue
      }

      throw error
    }
  }

  throw new Error('邀請碼建立失敗，請稍後再試。')
}

const joinCoupleByInviteCode = async (uid: string, rawInviteCode: string) => {
  const inviteCode = normalizeInviteCode(rawInviteCode)

  if (!inviteCode) {
    throw new Error('請先輸入邀請碼。')
  }

  await runTransaction(db, async (transaction) => {
    const currentUserRef = userDoc(uid)
    const targetCoupleRef = coupleDoc(inviteCode)
    const currentUserSnapshot = await transaction.get(currentUserRef)
    const targetCoupleSnapshot = await transaction.get(targetCoupleRef)

    if (!currentUserSnapshot.exists()) {
      throw new Error('找不到目前使用者資料，請重新登入後再試。')
    }

    if (!targetCoupleSnapshot.exists()) {
      throw new Error('查無此邀請碼，請確認後再試。')
    }

    const currentUserState = currentUserSnapshot.data() as FirestoreUserState

    if (currentUserState.coupleId) {
      throw new Error('你已經有配對資料，不能再加入新的邀請碼。')
    }

    const coupleState = targetCoupleSnapshot.data() as FirestoreCouple

    if (coupleState.memberUids.includes(uid)) {
      throw new Error('你已經在這組配對裡了。')
    }

    if (coupleState.memberUids.length >= 2) {
      throw new Error('這組邀請碼已經被使用完成。')
    }

    const partnerUid = coupleState.memberUids[0]
    const partnerRef = userDoc(partnerUid)
    const partnerSnapshot = await transaction.get(partnerRef)

    if (!partnerSnapshot.exists()) {
      throw new Error('邀請碼對應的配對資料不完整，請重新產生邀請碼。')
    }

    transaction.update(targetCoupleRef, {
      memberUids: [...coupleState.memberUids, uid],
      status: 'paired',
      updatedAt: serverTimestamp(),
    })

    transaction.update(currentUserRef, {
      coupleId: inviteCode,
      partnerUid,
      updatedAt: serverTimestamp(),
    })

    transaction.update(partnerRef, {
      coupleId: inviteCode,
      partnerUid: uid,
      updatedAt: serverTimestamp(),
    })
  })
}

export { createCoupleInviteForUser, joinCoupleByInviteCode, subscribeToCouple }
