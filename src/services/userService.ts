import type { User as FirebaseUser } from 'firebase/auth'
import {
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
  coupleId: data.coupleId ?? null,
  partnerUid: data.partnerUid ?? null,
  points: typeof data.points === 'number' ? data.points : 0,
  createdAt: toDate(data.createdAt),
  updatedAt: toDate(data.updatedAt),
  fcmTokens: Array.isArray(data.fcmTokens) ? data.fcmTokens : [],
})

const ensureUserProfile = async (authUser: FirebaseUser) => {
  const reference = userDoc(authUser.uid)
  const snapshot = await getDoc(reference)
  const fallbackDisplayName = resolveDisplayName(authUser)

  if (!snapshot.exists()) {
    await setDoc(reference, {
      uid: authUser.uid,
      email: authUser.email ?? '',
      displayName: fallbackDisplayName,
      photoURL: authUser.photoURL ?? '',
      coupleId: null,
      partnerUid: null,
      points: 0,
      fcmTokens: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    return
  }

  const existingProfile = snapshot.data() as Partial<FirestoreUserProfile>

  await setDoc(
    reference,
    {
      uid: authUser.uid,
      email: authUser.email ?? existingProfile.email ?? '',
      displayName: existingProfile.displayName?.trim() || fallbackDisplayName,
      photoURL: authUser.photoURL ?? existingProfile.photoURL ?? '',
      coupleId: existingProfile.coupleId ?? null,
      partnerUid: existingProfile.partnerUid ?? null,
      points: typeof existingProfile.points === 'number' ? existingProfile.points : 0,
      fcmTokens: Array.isArray(existingProfile.fcmTokens) ? existingProfile.fcmTokens : [],
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  )
}

const subscribeToUserProfile = (
  uid: string,
  callback: (profile: UserProfile | null) => void,
): Unsubscribe => onSnapshot(userDoc(uid), (snapshot) => {
  if (!snapshot.exists()) {
    callback(null)
    return
  }

  callback(mapUserProfile(snapshot.data() as FirestoreUserProfile))
})

const updateUserDisplayName = async (uid: string, displayName: string) => {
  await updateDoc(userDoc(uid), {
    displayName: displayName.trim(),
    updatedAt: serverTimestamp(),
  })
}

export { ensureUserProfile, subscribeToUserProfile, updateUserDisplayName }
