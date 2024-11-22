import { defineStore } from 'pinia';

export const useGameStore = defineStore('game', {
  state: () => ({
    distance: 0,
    level: 1,
    exp: 0,
    nextExp: 5,
    hp: 15,
    maxHp: 15,
    potential: 0,
    attack: 0,
    defense: 0,
    mp: 0,
    maxMp: 0,
    virtualMp: 0,
    maxVirtualMp: 0,
    weapon: null,
    armor: null,
    spells: [],
    items: {
      matches: 10,
      books: 0,
      stars: 0
    }
  }),
  actions: {
    levelUp() {
      // 1. 基础等级提升
      this.level++

      // 2. 随机数X(1-6)
      const x = Math.floor(Math.random() * 6) + 1

      // 3. 计算最大HP增加值: (潜能值/5的整数部分 + X)
      const hpIncrease = Math.floor(this.potential / 5) + x
      this.maxHp += hpIncrease
      this.hp = this.maxHp // 升级时恢复满HP

      // 4. 潜能值增加: (6 - X)
      this.potential += (6 - x)

      // 5. 如果潜能值>=5，有几率触发能力提升
      if (this.potential >= 5) {
        // 5.1 如果有MP，5%概率MP+1
        if (this.maxMp > 0 && Math.random() < 0.05) {
          this.maxMp += 1
          this.potential -= 5
          return // 每次升级只触发一种能力提升
        }

        // 5.2 5%概率攻击力+1
        if (Math.random() < 0.05) {
          this.attack += 1
          this.potential -= 5
          return
        }

        // 5.3 5%概率防御力+1
        if (Math.random() < 0.05) {
          this.defense += 1
          this.potential -= 5
          return
        }
      }

      // 6. 设置下一级所需经验值
      this.nextExp = this.calculateNextExp()
    },

    // 计算下一级所需经验值的辅助方法
    calculateNextExp() {
      // 这里需要根据游戏设计确定具体的经验值计算公式
      // 示例: 每级所需经验值增加5
      return this.nextExp + 5
    },

    // 获得经验值的方法
    gainExp(amount: number) {
      this.exp += amount
      while (this.exp >= this.nextExp) {
        this.exp -= this.nextExp
        this.levelUp()
      }
    }
  },
});
