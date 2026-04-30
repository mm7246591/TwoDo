/**
 * 判斷登入後應導向首頁或配對 onboarding。
 */
import { getUserProfile } from '@/services/userService'
import { withGlobalLoading } from '@/composables/useGlobalLoading'
import type { UserProfile } from '@/views/setting/types/interface'

type PostAuthRouteName = 'home' | 'pairing'

/**
 * 依使用者資料決定登入後目的頁。
 *
 * @param uid - 目前登入使用者 uid。
 * @param currentProfile - 已載入的目前使用者資料，可避免重複查詢。
 * @returns 應導向的路由名稱。
 */
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
      : await withGlobalLoading(() => getUserProfile(uid))

    if (!profile || profile.partnerUid || profile.hasSeenPairingOnboarding) {
      return 'home'
    }

    return 'pairing'
  } catch {
    return 'home'
  }
}

export { resolvePostAuthRouteName }
