import { pinia } from '@/pinia'
import { useGlobalLoadingStore } from '@/pinia/loading'

const withGlobalLoading = async <T>(task: Promise<T> | (() => Promise<T>)) => {
  const loadingStore = useGlobalLoadingStore(pinia)

  return loadingStore.track(task)
}

export { withGlobalLoading }
