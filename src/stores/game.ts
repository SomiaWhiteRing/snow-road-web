import { defineStore } from "pinia";
import {
  createEmptyBattleEnemy,
  rollMatchRecovery,
  type BattleEnemy,
} from "../services/gameMechanics";

interface EquipmentState {
  id: string | null;
  name: string | null;
  attack?: number;
  defense?: number;
}

export const useGameStore = defineStore("game", {
  state: () => ({
    distance: 0,
    stage: 0,
    playerName: "",
    level: 1,
    exp: 0,
    nextExp: 5,
    hp: 15,
    maxHp: 15,
    maxMp: 0,
    potential: 0,
    attack: 0,
    virtualAttack: 0,
    defense: 0,
    virtualDefense: 0,
    mp: 0,
    virtualMp: 0,
    starCapacity: 0,
    fuel: 0,
    starDanceActive: false,
    spellBuildRemaining: 0,
    weapon: {
      id: null,
      name: null,
      attack: 0,
    } as EquipmentState,
    armor: {
      id: null,
      name: null,
      defense: 0,
    } as EquipmentState,
    items: {
      matches: 10,
      books: false,
    },
    bearWarningStage: -1,
    scarred: false,
    learnedSkills: [] as string[],
    learnedSpells: [] as string[],
    battle: {
      enemy: createEmptyBattleEnemy() as BattleEnemy,
    },
  }),
  getters: {
    totalAttack: (state) =>
      state.attack + (state.weapon.attack ?? 0) + state.virtualAttack,
    totalDefense: (state) =>
      state.defense + (state.armor.defense ?? 0) + state.virtualDefense,
    hasMagic: (state) => state.items.books,
  },
  actions: {
    levelUp() {
      this.level++;

      const x = Math.floor(Math.random() * 6) + 1;
      const hpIncrease = Math.floor(this.potential / 5) + x;
      this.maxHp += hpIncrease;
      this.potential += 6 - x;

      if (this.potential >= 5) {
        if (this.maxMp > 0 && Math.random() < 0.05) {
          this.maxMp += 1;
          this.potential -= 5;
          this.nextExp = this.calculateNextExp();
          return;
        }

        if (Math.random() < 0.05) {
          this.attack += 1;
          this.potential -= 5;
          this.nextExp = this.calculateNextExp();
          return;
        }

        if (Math.random() < 0.05) {
          this.defense += 1;
          this.potential -= 5;
          this.nextExp = this.calculateNextExp();
          return;
        }
      }

      this.nextExp = this.calculateNextExp();
    },

    calculateNextExp() {
      return this.level * 5;
    },

    gainExp(amount: number) {
      this.exp += amount;
      while (this.exp >= this.nextExp) {
        this.exp -= this.nextExp;
        this.levelUp();
      }
    },

    learnSkill(skillId: string) {
      if (!this.learnedSkills.includes(skillId)) {
        this.learnedSkills.push(skillId);
      }
    },

    learnSpell(spellId: string) {
      if (!this.learnedSpells.includes(spellId)) {
        this.learnedSpells.push(spellId);
      }
    },

    setPlayerName(name: string) {
      this.playerName = name;
    },

    consumeMaxHp(amount: number) {
      this.maxHp = Math.max(1, this.maxHp - amount);
    },

    loseMaxHp(amount: number) {
      this.maxHp = Math.max(0, this.maxHp - amount);
    },

    markScarred() {
      this.scarred = true;
    },

    restoreHpAndMp() {
      this.hp = this.maxHp;
      this.mp = this.maxMp;
    },

    restoreAtInn() {
      this.restoreHpAndMp();
      this.virtualMp = 0;
      this.fuel = this.starCapacity;
    },

    useMatch() {
      if (this.items.matches <= 0) {
        return 0;
      }

      if (this.hp >= this.maxHp) {
        return 0;
      }

      this.items.matches -= 1;
      const healed = Math.min(this.maxHp - this.hp, rollMatchRecovery());
      this.hp += healed;
      return healed;
    },

    buyStarMark() {
      this.starCapacity += 1;
    },

    useLighter() {
      if (this.fuel <= 0) {
        return false;
      }

      this.fuel -= 1;
      this.restoreHpAndMp();
      return true;
    },

    setSpellBuildRemaining(count: number) {
      this.spellBuildRemaining = Math.max(0, count);
    },

    consumeSpellBuildAttempt() {
      if (this.spellBuildRemaining <= 0) {
        return 0;
      }

      this.spellBuildRemaining -= 1;
      return this.spellBuildRemaining;
    },

    activateStarDance() {
      this.starDanceActive = true;
    },

    clearStarDance() {
      this.starDanceActive = false;
    },

    clearVirtualMp() {
      this.virtualMp = 0;
    },

    clearVirtualAttack() {
      this.virtualAttack = 0;
    },

    clearVirtualDefense() {
      this.virtualDefense = 0;
    },

    decayVirtualMp() {
      this.virtualMp = Math.max(0, this.virtualMp - 1);
    },

    decayVirtualAttack() {
      this.virtualAttack = Math.max(0, this.virtualAttack - 1);
    },

    decayVirtualDefense() {
      this.virtualDefense = Math.max(0, this.virtualDefense - 1);
    },

    getVirtualMpCap() {
      return Math.max(0, this.mp * 10);
    },

    addVirtualAttack(amount: number) {
      this.virtualAttack = Math.max(0, this.virtualAttack + amount);
      return this.virtualAttack;
    },

    addVirtualDefense(amount: number) {
      this.virtualDefense = Math.max(0, this.virtualDefense + amount);
      return this.virtualDefense;
    },

    addVirtualMp(amount: number) {
      const cap = this.getVirtualMpCap();
      this.virtualMp = Math.min(cap, this.virtualMp + amount);
      return this.virtualMp;
    },

    multiplyVirtualMp(multiplier: number) {
      const cap = this.getVirtualMpCap();
      this.virtualMp = Math.min(cap, this.virtualMp * multiplier);
      return this.virtualMp;
    },

    canSpendMp(cost: number, allowVirtual: boolean) {
      return allowVirtual
        ? this.mp + this.virtualMp >= cost
        : this.mp >= cost;
    },

    spendMp(cost: number, allowVirtual: boolean) {
      if (!this.canSpendMp(cost, allowVirtual)) {
        return false;
      }

      let remaining = cost;
      if (allowVirtual) {
        const useVirtual = Math.min(this.virtualMp, remaining);
        this.virtualMp -= useVirtual;
        remaining -= useVirtual;
      }

      this.mp -= remaining;
      return true;
    },

    setWeapon(payload: {
      id: string;
      name: string;
      attack: number;
      virtualAttack?: number;
    }) {
      this.weapon = {
        id: payload.id,
        name: payload.name,
        attack: payload.attack,
      };
      if (payload.virtualAttack !== undefined) {
        this.virtualAttack = payload.virtualAttack;
      }
    },

    setArmor(payload: {
      id: string;
      name: string;
      defense: number;
      virtualDefense?: number;
    }) {
      this.armor = {
        id: payload.id,
        name: payload.name,
        defense: payload.defense,
      };
      if (payload.virtualDefense !== undefined) {
        this.virtualDefense = payload.virtualDefense;
      }
    },

    clearWeapon() {
      this.weapon = {
        id: null,
        name: null,
        attack: 0,
      };
    },

    clearArmor() {
      this.armor = {
        id: null,
        name: null,
        defense: 0,
      };
    },

    setBattleEnemy(enemy: BattleEnemy) {
      this.battle.enemy = enemy;
    },

    clearBattleEnemy() {
      this.battle.enemy = createEmptyBattleEnemy();
    },

    resetGame() {
      this.$reset();
    },
  },
});
