import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

let nextLoadingRequestId = 0

const useGlobalLoadingStore = defineStore('globalLoading', () => {
  const activeRequestIds = ref<Set<number>>(new Set())

  const isLoading = computed(() => activeRequestIds.value.size > 0)

  const start = () => {
    nextLoadingRequestId += 1
    activeRequestIds.value = new Set(activeRequestIds.value).add(nextLoadingRequestId)

    return nextLoadingRequestId
  }

  const finish = (requestId: number) => {
    if (!activeRequestIds.value.has(requestId)) {
      return
    }

    const nextRequestIds = new Set(activeRequestIds.value)
    nextRequestIds.delete(requestId)
    activeRequestIds.value = nextRequestIds
  }

  const reset = () => {
    activeRequestIds.value = new Set()
  }

  const track = async <T>(task: Promise<T> | (() => Promise<T>)) => {
    const requestId = start()

    try {
      return await (typeof task === 'function' ? task() : task)
    } finally {
      finish(requestId)
    }
  }

  return {
    finish,
    isLoading,
    reset,
    start,
    track,
  }
})

export { useGlobalLoadingStore }
