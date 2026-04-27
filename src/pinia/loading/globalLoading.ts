import type { PiniaPluginContext } from 'pinia'
import { useGlobalLoadingStore } from '@/pinia/loading'

const GLOBAL_LOADING_ACTIONS = new Set([
  'cancelExistingTask',
  'confirmTaskCompletion',
  'createNewReward',
  'createNewTask',
  'init',
  'joinByInviteCode',
  'markAllAsRead',
  'markOneAsRead',
  'markPairingOnboardingAsSeen',
  'markTaskCompleted',
  'redeemExistingReward',
  'refreshCurrentUser',
  'resendVerificationEmail',
  'saveDisplayName',
  'saveProfilePhoto',
  'signIn',
  'signInWithGoogle',
  'signOutUser',
  'signUp',
  'syncProfileForSession',
  'toggleRewardAvailability',
  'unpairCurrentCouple',
])

const globalLoadingPlugin = ({ pinia, store }: PiniaPluginContext) => {
  if (store.$id === 'globalLoading') {
    return
  }

  store.$onAction(({ after, name, onError }) => {
    if (!GLOBAL_LOADING_ACTIONS.has(name)) {
      return
    }

    const loadingStore = useGlobalLoadingStore(pinia)
    const requestId = loadingStore.start()

    after(() => {
      loadingStore.finish(requestId)
    })

    onError(() => {
      loadingStore.finish(requestId)
    })
  })
}

export { globalLoadingPlugin }
