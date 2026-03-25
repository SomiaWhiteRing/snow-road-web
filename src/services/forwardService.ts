import { useGameStore } from "../stores/game";
import { ENEMIES, BOSSES, type EnemyType } from "../types/enemies";
import { SPELLS } from "../types/spells";
import { ARMORS, WEAPONS } from "../types/equipment";
import { type Composer } from "vue-i18n";
import { soundManager, SOUND } from "../services/soundManager";

export type ForwardEventType =
  | "nothing"
  | "thought"
  | "shop"
  | "inn"
  | "save"
  | "matches"
  | "battle"
  | "note";

interface ForwardEvent {
  type: ForwardEventType;
  enemy?: EnemyType;
  sprite?: string;
  message?: string;
  extra?: {
    cost?: number;
    afterMessage?: string;
    afterSprite?: string;
    getNum?: number;
  };
}

const REGULAR_ENEMY_POOLS: Record<number, string[]> = {
  0: ["yukio", "ice_flare"],
  1: ["yukiko", "ice_flare", "yukio", "white_bear"],
  2: ["yukiko", "yukimasa", "white_bear"],
  3: ["yukimasa", "unopened_flower", "epitaph"],
  4: ["white_bear", "white_bear", "white_bear_king"],
  5: ["yukihiko", "yukie", "yukio", "yukiko", "yukimasa"],
  6: ["epitaph", "fearsome_match", "white_bear_king"],
  7: [],
  8: ["absolute_yukio", "absolute_yukiko", "absolute_bear"],
  9: ["coldecot_aura", "coldecot_aura", "absolute_bear"],
  10: ["absolute_bear", "from_engine", "red_silhouette"],
};

const STANDARD_WEAPONS = WEAPONS.filter((weapon) => !weapon.isSpecial).sort(
  (left, right) => left.power - right.power
);
const STANDARD_ARMORS = ARMORS.filter((armor) => !armor.isSpecial).sort(
  (left, right) => left.power - right.power
);

const randomInt = (maxExclusive: number) =>
  Math.floor(Math.random() * maxExclusive);

const triangularNumber = (value: number) => (value * (value + 1)) / 2;

const selectTriangularWeighted = <T>(entries: T[]): T | undefined => {
  if (!entries.length) {
    return undefined;
  }

  const totalWeight = entries.length * entries.length;
  const roll = randomInt(totalWeight);
  let threshold = 0;

  for (let index = 0; index < entries.length; index += 1) {
    threshold += entries.length * 2 - 1 - index * 2;
    if (roll < threshold) {
      return entries[index];
    }
  }

  return entries[entries.length - 1];
};

export class ForwardService {
  private gameStore: ReturnType<typeof useGameStore> | null = null;
  private i18n: Composer;

  constructor(i18n: Composer) {
    this.i18n = i18n;
  }

  private getStore() {
    if (!this.gameStore) {
      this.gameStore = useGameStore();
    }
    return this.gameStore;
  }

  private translateMessage(key: string, params?: Record<string, any>): string {
    const messages = this.i18n.tm(key) as string | string[];
    if (Array.isArray(messages)) {
      return messages[Math.floor(Math.random() * messages.length)];
    }
    return this.i18n.t(key, params || {});
  }

  private getCurrentStageBoss(): EnemyType | undefined {
    const boss = BOSSES.find((entry) => entry.stage === this.getStore().stage);
    if (!boss) {
      return undefined;
    }

    return {
      ...boss,
      name: this.translateMessage(`enemy.${boss.id}`),
    };
  }

  private getEnemyById(id: string): EnemyType | undefined {
    const enemy = ENEMIES.find((entry) => entry.id === id);
    if (!enemy) {
      return undefined;
    }

    return {
      ...enemy,
      name: this.translateMessage(`enemy.${enemy.id}`),
    };
  }

  private rollRegularEnemy(): EnemyType | undefined {
    const stagePool = REGULAR_ENEMY_POOLS[this.getStore().stage] ?? [];
    const enemyId = selectTriangularWeighted(stagePool);
    return enemyId ? this.getEnemyById(enemyId) : undefined;
  }

  private rollEquipmentEncounter(): EnemyType {
    let rank = Math.min(15, this.getStore().stage + 1);
    for (let index = 0; index < 4 && rank < 15; index += 1) {
      if (randomInt(2) === 0) {
        rank += 1;
      }
    }

    const isWeapon = randomInt(2) === 0;
    const equipment = isWeapon
      ? STANDARD_WEAPONS[rank - 1]
      : STANDARD_ARMORS[rank - 1];
    const name = this.translateMessage(`equipment.${equipment.id}`);
    const triangle = triangularNumber(rank);

    return {
      id: `${equipment.id}_encounter`,
      name,
      hp: rank,
      mp: 0,
      attack: isWeapon ? triangle : rank,
      defense: isWeapon ? rank : triangle,
      exp: triangle,
      matchReward: 0,
      sprite: {
        path: isWeapon ? "sprite/ax.png" : "sprite/cloak.png",
      },
      rewardEquipment: {
        kind: isWeapon ? "weapon" : "armor",
        id: equipment.id,
        name,
        power: equipment.power,
      },
    };
  }

  private rollInnCost(): number {
    let cost = 1;
    if (randomInt(2) === 0) {
      cost *= 2;
    }
    if (randomInt(5) === 0) {
      cost *= 5;
    }
    if (randomInt(10) === 0) {
      cost *= 10;
    }
    return cost;
  }

  private createBattleEvent(enemy: EnemyType): ForwardEvent {
    if (
      enemy.id.includes("bear") &&
      this.getStore().bearWarningStage !== this.getStore().stage
    ) {
      this.getStore().bearWarningStage = this.getStore().stage;
      soundManager.playSound(SOUND.STEP);
      return {
        type: "thought",
        sprite: "sprite/warning.png",
        message: this.translateMessage("events.thought.bear_warning"),
      };
    }

    soundManager.playSound(SOUND.STEP);
    return {
      type: "battle",
      enemy,
      sprite: enemy.sprite.path,
      message: this.translateMessage(
        enemy.isBoss ? "events.battle_boss" : "events.battle",
        { enemy: enemy.name }
      ),
    };
  }

  public handleForward(): ForwardEvent {
    const store = this.getStore();
    store.distance += 1;

    if (store.distance % 100 === 0) {
      const boss = this.getCurrentStageBoss();
      if (boss) {
        soundManager.playSound(SOUND.STEP);
        return {
          type: "battle",
          enemy: boss,
          sprite: boss.sprite.path,
          message: this.translateMessage("events.battle_boss", { enemy: boss.name }),
        };
      }
    }

    const roll = randomInt(100);

    if (roll < 10) {
      soundManager.playSound(SOUND.STEP);
      return {
        type: "thought",
        message: this.translateMessage("events.thought.default"),
      };
    }

    if (roll < 40) {
      if (randomInt(20) === 0) {
        return this.createBattleEvent(this.rollEquipmentEncounter());
      }

      const enemy = this.rollRegularEnemy();
      if (!enemy) {
        soundManager.playSound(SOUND.STEP);
        return { type: "nothing" };
      }

      return this.createBattleEvent(enemy);
    }

    if (roll < 50) {
      soundManager.playSound(SOUND.POPON);
      const isMatchBox = randomInt(100) === 0;
      return {
        type: "matches",
        sprite: isMatchBox ? "sprite/chas2.png" : "sprite/chas0.png",
        message: this.translateMessage(
          isMatchBox ? "events.matches.extra" : "events.matches.default"
        ),
        extra: {
          getNum: isMatchBox ? 10 : 1,
        },
      };
    }

    if (roll < 55) {
      soundManager.playSound(SOUND.STEP);
      const cost = this.rollInnCost();
      return {
        type: "inn",
        sprite: "sprite/inn.png",
        message: this.translateMessage("events.inn.before", { num: cost }),
        extra: {
          afterMessage: this.translateMessage("events.inn.after"),
          cost,
        },
      };
    }

    if (roll < 95) {
      soundManager.playSound(SOUND.STEP);
      return { type: "nothing" };
    }

    if (roll === 95) {
      soundManager.playSound(SOUND.STEP);
      const spell = SPELLS[randomInt(SPELLS.length)];
      return {
        type: "note",
        sprite: "sprite/memo.png",
        message: this.translateMessage("events.note", {
          name: this.translateMessage(`spell.${spell.id}`),
        }),
      };
    }

    if (roll < 98) {
      soundManager.playSound(SOUND.STEP);
      return {
        type: "shop",
        sprite: "sprite/shop.png",
        message: this.translateMessage("events.shop"),
      };
    }

    soundManager.playSound(SOUND.STEP);
    return {
      type: "save",
      sprite: "sprite/candle0.png",
      message: this.translateMessage("events.save.before"),
      extra: {
        afterMessage: this.translateMessage("events.save.after"),
        afterSprite: "sprite/candle1.png",
        cost: 1,
      },
    };
  }
}

export const createForwardService = (i18n: Composer) => {
  return new ForwardService(i18n);
};
