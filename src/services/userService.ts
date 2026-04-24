import type { User as FirebaseUser } from 'firebase/auth'
import {
  arrayRemove,
  arrayUnion,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  type Unsubscribe,
} from 'firebase/firestore'
import { userDoc } from '@/services/firebase/firestore'
import type { FirestoreUserProfile } from '@/services/firebase/types/firestore-user-profile.interface'
import type { UserProfile } from '@/views/settings/types/interface'
import type { Timestamp } from 'firebase/firestore'
import { generateInviteCode } from '@/utils/inviteCode'

const toDate = (value?: Timestamp | null) => value ? value.toDate() : null

const resolveDisplayName = (authUser: Pick<FirebaseUser, 'displayName' | 'email' | 'uid'>) => {
  const profileName = authUser.displayName?.trim()

  if (profileName) {
    return profileName
  }

  const emailName = authUser.email?.split('@')[0]?.trim()

  if (emailName) {
    return emailName
  }

  return `user-${authUser.uid.slice(0, 6)}`
}

const mapUserProfile = (data: FirestoreUserProfile): UserProfile => ({
  uid: data.uid,
  email: data.email,
  displayName: data.displayName,
  photoURL: data.photoURL,
  inviteCode: data.inviteCode,
  coupleId: data.coupleId ?? null,
  partnerUid: data.partnerUid ?? null,
  points: typeof data.points === 'number' ? data.points : 0,
  createdAt: toDate(data.createdAt),
  updatedAt: toDate(data.updatedAt),
  fcmTokens: Array.isArray(data.fcmTokens) ? data.fcmTokens : [],
  hasSeenPairingOnboarding: data.hasSeenPairingOnboarding ?? true,
})

const ensureUserProfile = async (authUser: FirebaseUser) => {
  const reference = userDoc(authUser.uid)
  const snapshot = await getDoc(reference)
  const fallbackDisplayName = resolveDisplayName(authUser)

  if (!snapshot.exists()) {
    const inviteCode = generateInviteCode()

    await setDoc(reference, {
      uid: authUser.uid,
      email: authUser.email ?? '',
      displayName: fallbackDisplayName,
      photoURL: authUser.photoURL ?? '',
      inviteCode,
      coupleId: null,
      partnerUid: null,
      points: 0,
      fcmTokens: [],
      hasSeenPairingOnboarding: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    return
  }

  const existingProfile = snapshot.data() as Partial<FirestoreUserProfile>
  const inviteCode = existingProfile.inviteCode?.trim() || generateInviteCode()

  await setDoc(
    reference,
    {
      uid: authUser.uid,
      email: authUser.email ?? existingProfile.email ?? '',
      displayName: existingProfile.displayName?.trim() || fallbackDisplayName,
      photoURL: authUser.photoURL ?? existingProfile.photoURL ?? '',
      inviteCode,
      coupleId: existingProfile.coupleId ?? null,
      partnerUid: existingProfile.partnerUid ?? null,
      points: typeof existingProfile.points === 'number' ? existingProfile.points : 0,
      fcmTokens: Array.isArray(existingProfile.fcmTokens) ? existingProfile.fcmTokens : [],
      hasSeenPairingOnboarding: existingProfile.hasSeenPairingOnboarding ?? true,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )
}

const subscribeToUserProfile = (
  uid: string,
  callback: (profile: UserProfile | null) => void,
  onError?: (error: Error) => void,
): Unsubscribe => onSnapshot(
  userDoc(uid),
  (snapshot) => {
    if (!snapshot.exists()) {
      callback(null)
      return
    }

    callback(mapUserProfile(snapshot.data() as FirestoreUserProfile))
  },
  (error) => {
    onError?.(error)
  },
)

const getUserProfile = async (uid: string) => {
  const snapshot = await getDoc(userDoc(uid))

  if (!snapshot.exists()) {
    return null
  }

  return mapUserProfile(snapshot.data() as FirestoreUserProfile)
}

const updateUserDisplayName = async (uid: string, displayName: string) => {
  await updateDoc(userDoc(uid), {
    displayName: displayName.trim(),
    updatedAt: serverTimestamp(),
  })
}

const markPairingOnboardingSeen = async (uid: string) => {
  await updateDoc(userDoc(uid), {
    hasSeenPairingOnboarding: true,
    updatedAt: serverTimestamp(),
  })
}

const addUserFcmToken = async (uid: string, token: string) => {
  const normalizedToken = token.trim()

  if (!normalizedToken) {
    return
  }

  await updateDoc(userDoc(uid), {
    fcmTokens: arrayUnion(normalizedToken),
    updatedAt: serverTimestamp(),
  })
}

const removeUserFcmToken = async (uid: string, token: string) => {
  const normalizedToken = token.trim()

  if (!normalizedToken) {
    return
  }

  await updateDoc(userDoc(uid), {
    fcmTokens: arrayRemove(normalizedToken),
    updatedAt: serverTimestamp(),
  })
}

export {
  addUserFcmToken,
  ensureUserProfile,
  getUserProfile,
  markPairingOnboardingSeen,
  removeUserFcmToken,
  subscribeToUserProfile,
  updateUserDisplayName,
}
