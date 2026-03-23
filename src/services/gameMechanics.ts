import {
  ARMORS,
  WEAPONS,
  calculateSpecialEquipmentPower,
  type ArmorType,
  type WeaponType,
} from "../types/equipment";
import type { EnemyType } from "../types/enemies";

export interface PlayerSnapshot {
  level: number;
  maxHp: number;
  maxMp: number;
  attack: number;
  defense: number;
  totalAttack: number;
  totalDefense: number;
}

export interface BattleEnemy {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  attack: number;
  defense: number;
  exp: number;
  matchReward: number;
  isBoss: boolean;
  stage?: number;
  spritePath: string;
  magic?: {
    id: "freeze" | "cremate";
    chance: number;
  };
  rewardEquipment?: {
    kind: "weapon" | "armor";
    id: string;
    name: string;
    power: number;
  };
}

export type ShopOfferKind = "weapon" | "armor" | "book" | "star" | "empty";
export type ShopOfferState = "available" | "sold_out" | "already_read";
export type EquipmentKind = "weapon" | "armor";

export interface ShopOffer {
  slot: number;
  kind: ShopOfferKind;
  cost: number;
  state: ShopOfferState;
  equipmentId?: string;
  power?: number;
}

export interface RolledEquipment {
  kind: EquipmentKind;
  id: string;
  name: string;
  power: number;
  virtualBonus: number;
}

const STANDARD_WEAPONS = WEAPONS.filter(
  (weapon) => !weapon.isSpecial
) as WeaponType[];
const STANDARD_ARMORS = ARMORS.filter(
  (armor) => !armor.isSpecial
) as ArmorType[];

export const createEmptyBattleEnemy = (): BattleEnemy => ({
  id: "",
  name: "",
  hp: 0,
  maxHp: 0,
  mp: 0,
  maxMp: 0,
  attack: 0,
  defense: 0,
  exp: 0,
  matchReward: 0,
  isBoss: false,
  spritePath: "",
  rewardEquipment: undefined,
});

const rollStatValue = (value: number | [number, number]): number => {
  if (typeof value === "number") {
    return value;
  }

  return Math.floor(Math.random() * (value[1] - value[0] + 1)) + value[0];
};

const rollRandomInt = (maxExclusive: number): number =>
  Math.floor(Math.random() * maxExclusive);

export const instantiateEnemy = (
  template: EnemyType,
  player: PlayerSnapshot
): BattleEnemy => {
  const enemy: BattleEnemy = {
    id: template.id,
    name: template.name,
    hp: template.copyPlayerStats?.hp ? player.maxHp : rollStatValue(template.hp),
    maxHp: 0,
    mp: template.copyPlayerStats?.mp ? player.maxMp : rollStatValue(template.mp),
    maxMp: 0,
    attack: template.copyPlayerStats?.attack
      ? player.totalAttack
      : rollStatValue(template.attack),
    defense: template.copyPlayerStats?.defense
      ? player.totalDefense
      : rollStatValue(template.defense),
    exp: template.id === "red_silhouette" ? player.level : template.exp,
    matchReward: template.matchReward ?? 0,
    isBoss: Boolean(template.isBoss),
    stage: template.stage,
    spritePath: template.sprite.path,
    magic: template.magic,
    rewardEquipment: template.rewardEquipment,
  };

  enemy.maxHp = enemy.hp;
  enemy.maxMp = enemy.mp;
  return enemy;
};

export const calculatePhysicalDamage = (
  attack: number,
  defense: number
): number => {
  if (attack <= 0) {
    return 0;
  }

  if (attack > defense) {
    return attack - defense;
  }

  return rollRandomInt(attack + defense) < attack ? 1 : 0;
};

export const rollMatchRecovery = (): number =>
  Math.floor(Math.random() * 2) + 1;

const getStandardEquipmentByRank = (
  kind: EquipmentKind,
  rank: number
): WeaponType | ArmorType => {
  const pool = kind === "weapon" ? STANDARD_WEAPONS : STANDARD_ARMORS;
  return pool[rank - 1];
};

export const createShopOffers = (
  stage: number,
  hasBook: boolean,
  starCapacity: number
): ShopOffer[] =>
  Array.from({ length: 4 }, (_, slot) => {
    const variance = rollRandomInt(3) + 1;
    const cost = stage * 2 + variance * 5;
    const offerType = rollRandomInt(5);

    if (offerType === 0) {
      const rank = stage + variance + 1;
      const item = getStandardEquipmentByRank("weapon", rank);

      return {
        slot,
        kind: "weapon",
        cost,
        state: "available",
        equipmentId: item.id,
        power: item.power,
      } satisfies ShopOffer;
    }

    if (offerType === 1) {
      const rank = stage + variance;
      const item = getStandardEquipmentByRank("armor", rank);

      return {
        slot,
        kind: "armor",
        cost,
        state: "available",
        equipmentId: item.id,
        power: item.power,
      } satisfies ShopOffer;
    }

    if (offerType === 2) {
      return {
        slot,
        kind: "book",
        cost: 20,
        state: hasBook ? "already_read" : "available",
      } satisfies ShopOffer;
    }

    if (offerType === 3) {
      return {
        slot,
        kind: "star",
        cost: starCapacity * 10 + 50,
        state: "available",
      } satisfies ShopOffer;
    }

    return {
      slot,
      kind: "empty",
      cost: 0,
      state: "sold_out",
    } satisfies ShopOffer;
  });

export const createSpecialEquipment = (
  kind: EquipmentKind,
  name: string,
  id: string,
  level: number
): RolledEquipment => {
  const power = calculateSpecialEquipmentPower(level);

  return {
    kind,
    id,
    name,
    power,
    virtualBonus: power * 3,
  };
};

export const normalizeIncantation = (value: string): string =>
  value.replace(/\s+/g, "").trim();

export const calculateMagicDamage = (
  enemyMp: number,
  playerMagicGuard: number
): number => Math.max(0, enemyMp - playerMagicGuard);
