import {
  toValue,
  watch,
  type MaybeRefOrGetter,
} from 'vue'
import { showErrorMessage } from '@/services/uiFeedback'

const useErrorToast = (messageSource: MaybeRefOrGetter<string>) => {
  let lastShownMessage = ''

  watch(
    () => toValue(messageSource),
    (message) => {
      if (!message) {
        lastShownMessage = ''
        return
      }

      if (message === lastShownMessage) {
        return
      }

      lastShownMessage = message
      showErrorMessage(message)
    },
    { immediate: true },
  )
}

export { useErrorToast }
