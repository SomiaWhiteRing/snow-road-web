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

export type ShopOfferId = "weapon" | "armor" | "book" | "star";
export type ShopOfferState = "available" | "sold_out" | "already_read" | "maxed";
export type EquipmentKind = "weapon" | "armor";

export interface ShopOffer {
  id: ShopOfferId;
  cost: number;
  state: ShopOfferState;
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

export const createShopOffers = (
  hasBook: boolean,
  starCapacity: number
): ShopOffer[] => [
  {
    id: "weapon",
    cost: 10,
    state: "available",
  },
  {
    id: "armor",
    cost: 10,
    state: "available",
  },
  {
    id: "book",
    cost: 20,
    state: hasBook ? "already_read" : "available",
  },
  {
    id: "star",
    cost: starCapacity === 0 ? 50 : 60,
    state: starCapacity >= 2 ? "maxed" : "available",
  },
];

export const rollShopEquipment = (kind: EquipmentKind): RolledEquipment => {
  const pool = kind === "weapon" ? STANDARD_WEAPONS : STANDARD_ARMORS;
  const item = pool[Math.floor(Math.random() * pool.length)];

  return {
    kind,
    id: item.id,
    name: item.name,
    power: item.power,
    virtualBonus: 0,
  };
};

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
