import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import './style.css'
import App from './App.vue'
import Game from './views/Game.vue'

const pinia = createPinia()

const routes = [
  { path: '/', component: Game }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

const app = createApp(App)
app.use(pinia)
app.use(router)
app.mount('#app')
