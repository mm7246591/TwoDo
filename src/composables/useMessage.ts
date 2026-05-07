/**
 * 管理共用的使用者回饋訊息與危險操作確認流程。
 */
import { Dialog } from 'vant'
import { showAppToast } from '@/composables/useAppToast'

/**
 * 顯示成功狀態的應用內提示訊息。
 *
 * @param message - 要顯示給使用者的提示文字。
 */
const showSuccessMessage = (message: string) => {
  showAppToast({
    message,
    variant: 'success',
  })
}

/**
 * 顯示錯誤狀態的應用內提示訊息。
 *
 * @param message - 要顯示給使用者的提示文字。
 */
const showErrorMessage = (message: string) => {
  showAppToast({
    message,
    variant: 'error',
  })
}

/**
 * 顯示危險操作確認對話框，並回傳使用者是否確認。
 *
 * @param message - 確認對話框的主要說明文字。
 * @param title - 確認對話框標題。
 * @returns 使用者按下確認時為 true，取消或關閉時為 false。
 */
const confirmDangerAction = async (message: string, title = '請確認') => {
  try {
    await Dialog.confirm({
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
  showErrorMessage,
  showSuccessMessage,
}
