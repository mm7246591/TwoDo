import { getUserProfile } from '@/services/userService'
import type { UserProfile } from '@/views/setting/types/interface'

type PostAuthRouteName = 'home' | 'pairing'

const resolvePostAuthRouteName = async (
  uid: string,
  currentProfile: Pick<
    UserProfile,
    'uid' | 'partnerUid' | 'hasSeenPairingOnboarding'
  > | null = null,
): Promise<PostAuthRouteName> => {
  if (!uid) {
    return 'home'
  }

  try {
    const profile = currentProfile?.uid === uid
      ? currentProfile
      : await getUserProfile(uid)

    if (!profile || profile.partnerUid || profile.hasSeenPairingOnboarding) {
      return 'home'
    }

    return 'pairing'
  } catch {
    return 'home'
  }
}

export { resolvePostAuthRouteName }
