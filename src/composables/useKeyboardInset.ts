import { computed, ref } from 'vue'

/**
 * 管理行動裝置虛擬鍵盤造成的 viewport 底部位移。
 *
 * @returns 鍵盤位移狀態與供元件生命週期呼叫的監聽控制方法。
 */
const useKeyboardInset = () => {
  /** 目前虛擬鍵盤佔用的底部高度，單位為 px。 */
  const keyboardInset = ref(0)
  /** 目前是否可視為鍵盤已開啟。 */
  const isKeyboardOpen = computed(() => keyboardInset.value > 0)

  /** 依照 visualViewport 重新計算鍵盤底部位移。 */
  const updateKeyboardInset = () => {
    const viewport = window.visualViewport

    if (!viewport) {
      keyboardInset.value = 0
      return
    }

    const nextInset = window.innerHeight - viewport.height - viewport.offsetTop
    keyboardInset.value = nextInset > 0 ? Math.round(nextInset) : 0
  }

  /** 開始監聽 visualViewport 變化並立即同步目前鍵盤位移。 */
  const startKeyboardInsetTracking = () => {
    updateKeyboardInset()
    window.visualViewport?.addEventListener('resize', updateKeyboardInset)
    window.visualViewport?.addEventListener('scroll', updateKeyboardInset)
  }

  /** 停止監聽 visualViewport 變化。 */
  const stopKeyboardInsetTracking = () => {
    window.visualViewport?.removeEventListener('resize', updateKeyboardInset)
    window.visualViewport?.removeEventListener('scroll', updateKeyboardInset)
  }

  return {
    keyboardInset,
    isKeyboardOpen,
    startKeyboardInsetTracking,
    stopKeyboardInsetTracking,
  }
}

export { useKeyboardInset }
