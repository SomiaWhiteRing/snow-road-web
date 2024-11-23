import { createRouter, createWebHistory } from 'vue-router';
import Loading from '../views/Loading.vue';
import Game from '../views/Game.vue';
import { useAssetStore } from '../stores/assetStore';


const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: Loading
    },
    {
      path: '/game',
      component: Game
    }
  ]
});

router.beforeEach((to, _from, next) => {
  const assetStore = useAssetStore();
  
  if (to.path === '/game' && !assetStore.assetsLoaded) {
    next({ path: '/' });
    return;
  }
  next();
});

export default router; 