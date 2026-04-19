import { computed, onMounted, onUnmounted, ref } from 'vue'

const useKeyboardInset = () => {
  const keyboardInset = ref(0)
  const isKeyboardOpen = computed(() => keyboardInset.value > 0)

  const updateKeyboardInset = () => {
    const viewport = window.visualViewport

    if (!viewport) {
      keyboardInset.value = 0
      return
    }

    const nextInset = window.innerHeight - viewport.height - viewport.offsetTop
    keyboardInset.value = nextInset > 0 ? Math.round(nextInset) : 0
  }

  onMounted(() => {
    updateKeyboardInset()
    window.visualViewport?.addEventListener('resize', updateKeyboardInset)
    window.visualViewport?.addEventListener('scroll', updateKeyboardInset)
  })

  onUnmounted(() => {
    window.visualViewport?.removeEventListener('resize', updateKeyboardInset)
    window.visualViewport?.removeEventListener('scroll', updateKeyboardInset)
  })

  return {
    keyboardInset,
    isKeyboardOpen,
  }
}

export { useKeyboardInset }
