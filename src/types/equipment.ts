export interface EquipmentBase {
  id: string
  name: string
  power: number
  price?: number // 商店价格(以火柴为单位)
  isSpecial?: boolean // 是否为特殊装备(春ノ夢/夏ノ空)
}

export interface WeaponType extends EquipmentBase {
  type: 'weapon'
  virtualAttack?: number // 虚拟攻击力(春ノ夢的3倍效果)
}

export interface ArmorType extends EquipmentBase {
  type: 'armor'
  virtualDefense?: number // 虚拟防御力(夏ノ空的3倍效果)
}

export type EquipmentType = WeaponType | ArmorType

// 武器数据
export const WEAPONS: WeaponType[] = [
  { id: 'axe', type: 'weapon', name: '斧', power: 1 },
  { id: 'hatchet', type: 'weapon', name: '鉈', power: 2 },
  { id: 'battle_axe', type: 'weapon', name: 'バトルアクス', power: 3 },
  { id: 'silver_axe', type: 'weapon', name: '銀の斧', power: 4 },
  { id: 'clearing_hatchet', type: 'weapon', name: '薙ぎ鉈', power: 5 },
  { id: 'platinum_axe', type: 'weapon', name: '白銀の斧', power: 6 },
  { id: 'nameless', type: 'weapon', name: '無銘', power: 7 },
  { id: 'aurora_axe', type: 'weapon', name: 'オーロラアクス', power: 8 },
  { id: 'head_disconnector', type: 'weapon', name: 'ヘッドディスコネクター', power: 9 },
  { id: 'of_ogre', type: 'weapon', name: 'オブオーガ', power: 10 },
  { id: 'of_giant', type: 'weapon', name: 'オブジャイアント', power: 11 },
  { id: 'of_titan', type: 'weapon', name: 'オブティターン', power: 12 },
  { id: '13th', type: 'weapon', name: '13th', power: 13 },
  { id: 'sentimentalism_farewell', type: 'weapon', name: 'センチメンタリズム決別の斧', power: 14 },
  { id: 'bisector_of_heaven_and_earth', type: 'weapon', name: '天地の二等分線', power: 15 },
  {
    id: 'spring_dream',
    type: 'weapon',
    name: '春ノ夢',
    power: 0, // 根据等级变化
    isSpecial: true,
    virtualAttack: 0 // 实际攻击力的3倍
  }
]

// 防具数据
export const ARMORS: ArmorType[] = [
  { id: 'cape', type: 'armor', name: 'ケープ', power: 1 },
  { id: 'mantle', type: 'armor', name: 'マント', power: 2 },
  { id: 'cloak', type: 'armor', name: 'クローク', power: 3 },
  { id: 'haori', type: 'armor', name: '羽織', power: 4 },
  { id: 'velvet_cloak', type: 'armor', name: 'ベルベットクローク', power: 5 },
  { id: 'charcoal_mantle', type: 'armor', name: '消し炭色のマント', power: 6 },
  { id: 'silk', type: 'armor', name: '絹', power: 7 },
  { id: 'aurora_cape', type: 'armor', name: 'オーロラケープ', power: 8 },
  { id: 'ittan_momen', type: 'armor', name: '一反木綿', power: 9 },
  { id: 'blanket', type: 'armor', name: '毛布', power: 10 },
  { id: 'dancing_carpet', type: 'armor', name: 'ダンシングカーペット', power: 11 },
  { id: 'mirage_haori', type: 'armor', name: '蜃気楼羽織', power: 12 },
  { id: 'carnival_house', type: 'armor', name: 'カーニバルハウス', power: 13 },
  { id: 'of_ryness', type: 'armor', name: 'オブライナス', power: 14 },
  { id: 'tent', type: 'armor', name: '天幕', power: 15 },
  {
    id: 'summer_sky',
    type: 'armor',
    name: '夏ノ空',
    power: 0, // 根据等级变化
    isSpecial: true,
    virtualDefense: 0 // 实际防御力的3倍
  }
]

// 计算特殊装备强度的函数
export function calculateSpecialEquipmentPower(level: number): number {
  if (level <= 2) return 1
  if (level <= 4) return 2
  if (level <= 8) return 3
  if (level <= 12) return 4
  if (level <= 18) return 5
  if (level <= 24) return 6
  if (level <= 32) return 7
  if (level <= 40) return 8
  if (level <= 50) return 9
  if (level <= 60) return 10
  if (level <= 72) return 11
  return 12 // 超过72级
} 