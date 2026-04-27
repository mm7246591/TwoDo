import { createPinia } from 'pinia'
import { globalLoadingPlugin } from '@/pinia/loading/globalLoading'

const pinia = createPinia()
pinia.use(globalLoadingPlugin)

export { pinia }
