import { createApp } from 'vue'
import App from '@/App.vue'
import { pinia } from '@/pinia'
import { useAuthStore } from '@/pinia/auth'
import router from '@/router'
import '@/assets/css/tailwind.css'
import '@/assets/css/theme-variable.css'
import '@/assets/css/main.css'

document.documentElement.dataset.theme ||= 'default'

const app = createApp(App)

app.use(pinia)
app.use(router)

await useAuthStore(pinia).init()

app.mount('#app')
