import { showConfirmDialog } from 'vant'
import { hideAppToast, showAppToast } from '@/services/appToast'

const showSuccessMessage = (message: string) => {
  showAppToast({
    message,
    variant: 'success',
  })
}

const showErrorMessage = (message: string) => {
  showAppToast({
    message,
    variant: 'error',
  })
}

const showLoadingMessage = (message: string) => {
  showAppToast({
    dismissible: false,
    message,
    variant: 'loading',
  })
}

const hideLoadingMessage = () => {
  hideAppToast()
}

const confirmDangerAction = async (message: string, title = '請確認') => {
  try {
    await showConfirmDialog({
      cancelButtonText: '取消',
      confirmButtonText: '確認',
      message,
      title,
    })

    return true
  } catch {
    return false
  }
}

export {
  confirmDangerAction,
  hideLoadingMessage,
  showErrorMessage,
  showLoadingMessage,
  showSuccessMessage,
}
