/**
 * 提供跨元件共用的全域 loading 包裝操作。
 */
import { pinia } from '@/pinia'
import { useGlobalLoadingStore } from '@/pinia/loading'

/**
 * 以全域 loading store 追蹤非同步任務。
 *
 * @param task - 要被 loading 狀態包住的 Promise 或 Promise 工廠。
 * @returns 原始任務的回傳結果。
 */
const withGlobalLoading = async <T>(task: Promise<T> | (() => Promise<T>)) => {
  const loadingStore = useGlobalLoadingStore(pinia)

  return loadingStore.track(task)
}

export { withGlobalLoading }
