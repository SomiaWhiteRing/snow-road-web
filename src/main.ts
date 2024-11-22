import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'
import { i18n } from './i18n'
import { soundManager, SOUND } from './services/soundManager'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(i18n)
app.config.globalProperties.$sound = soundManager
app.config.globalProperties.$SOUND = SOUND
app.mount('#app')
