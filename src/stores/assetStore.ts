import { defineStore } from 'pinia';

export const useAssetStore = defineStore('asset', {
  state: () => ({
    assetsLoaded: false
  }),
  actions: {
    setAssetsLoaded(loaded: boolean) {
      this.assetsLoaded = loaded;
    }
  }
}); 