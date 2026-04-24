import { createApp } from 'vue'
import { pinia } from '@/pinia'
import { useAuthStore } from '@/pinia/auth'
import App from '@/App.vue'
import router from '@/router'
import '@fontsource/plus-jakarta-sans/400.css'
import '@fontsource/plus-jakarta-sans/500.css'
import '@fontsource/plus-jakarta-sans/600.css'
import '@fontsource/plus-jakarta-sans/700.css'
import '@fontsource/plus-jakarta-sans/800.css'
import '@fontsource/noto-sans-tc/400.css'
import '@fontsource/noto-sans-tc/500.css'
import '@fontsource/noto-sans-tc/600.css'
import '@fontsource/noto-sans-tc/700.css'
import '@fontsource/noto-sans-tc/800.css'
import '@fontsource-variable/material-symbols-outlined/fill.css'
import '@/assets/css/tailwind.css'
import '@/assets/css/theme-variable.css'
import '@/assets/css/main.css'
import 'vant/lib/index.css'

document.documentElement.dataset.theme ||= 'default'

const app = createApp(App)

app.use(pinia)
app.use(router)

await useAuthStore(pinia).init()

app.mount('#app')
