import { getUserProfile } from '@/services/userService'
import type { UserProfile } from '@/views/settings/types/interface'

type PostAuthRouteName = 'home' | 'pairing'

const resolvePostAuthRouteName = async (
  uid: string,
  currentProfile: Pick<UserProfile, 'uid' | 'partnerUid'> | null = null,
): Promise<PostAuthRouteName> => {
  if (!uid) {
    return 'pairing'
  }

  try {
    const profile = currentProfile?.uid === uid
      ? currentProfile
      : await getUserProfile(uid)

    return profile?.partnerUid ? 'home' : 'pairing'
  } catch {
    return 'pairing'
  }
}

export { resolvePostAuthRouteName }
