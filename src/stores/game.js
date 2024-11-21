import { defineStore } from 'pinia';

export const useGameStore = defineStore('game', {
  state: () => ({
    distance: 0,
    level: 1,
    exp: 0,
    nextExp: 5,
    hp: 15,
    maxHp: 15,
    matches: 10,
  }),
  actions: {
    // 定义游戏逻辑相关的动作
  },
});
