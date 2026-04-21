import {
  closeToast,
  showConfirmDialog,
  showFailToast,
  showLoadingToast,
  showSuccessToast,
} from 'vant'

const showSuccessMessage = (message: string) => {
  showSuccessToast({
    duration: 1800,
    message,
  })
}

const showErrorMessage = (message: string) => {
  showFailToast({
    duration: 2200,
    message,
  })
}

const showLoadingMessage = (message: string) => {
  showLoadingToast({
    duration: 0,
    forbidClick: true,
    message,
  })
}

const hideLoadingMessage = () => {
  closeToast()
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
