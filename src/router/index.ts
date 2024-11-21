import { createRouter, createWebHistory } from 'vue-router';
import Loading from '../views/Loading.vue';
import Game from '../views/Game.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/loading'
    },
    {
      path: '/loading',
      component: Loading
    },
    {
      path: '/game',
      component: Game
    }
  ]
});

export default router; 