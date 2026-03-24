// 来源说明：
// - 咒文名与 MP 消耗主要来自原版资料页。
// - 本文件的 schema 是 Web 实现侧的统一抽象，不等于原版内部数据结构。
export interface SpellType {
  id: string
  name: string
  shortLabel: string
  mpCost: number
  isVirtualMp: boolean // 是否可以使用虚拟MP
  canUseOutsideBattle: boolean
  power?: number // 魔法伤害
  effects?: {
    healHp?: boolean // HP全回复
    addVirtualMp?: number // 增加虚拟MP
    multiplyVirtualMp?: number // 虚拟MP倍率
    generateEquipment?: {
      type: 'weapon' | 'armor'
      multiplier?: number // 虚拟攻防倍率
    }
    continuousAttack?: boolean // 连续攻击
  }
}

export const SPELLS: SpellType[] = [
  {
    id: 'burn',
    name: '焦げろ',
    shortLabel: '焦げ',
    mpCost: 0,
    isVirtualMp: true,
    canUseOutsideBattle: false,
    power: 1
  },
  {
    id: 'become_charcoal',
    name: '消し炭になあれ',
    shortLabel: '消炭',
    mpCost: 1,
    isVirtualMp: true,
    canUseOutsideBattle: false,
    power: 5
  },
  {
    id: 'explode',
    name: '爆ぜろ',
    shortLabel: '爆ぜ',
    mpCost: 5,
    isVirtualMp: true,
    canUseOutsideBattle: false,
    power: 25
  },
  {
    // 原版 spell index 3 与 index 1 完全同名，靠顺序与 MP 消耗区分。
    id: 'become_charcoal_max',
    name: '消し炭になあれ',
    shortLabel: '消炭',
    mpCost: 20,
    isVirtualMp: true,
    canUseOutsideBattle: false,
    power: 0 // 实际按施法前的真实MP+虚构MP结算
  },
  {
    id: 'warmth_of_others',
    name: '己ならざるのぬくもりよ',
    shortLabel: 'ぬく',
    mpCost: 3,
    isVirtualMp: false,
    canUseOutsideBattle: true,
    effects: {
      healHp: true
    }
  },
  {
    id: 'light',
    name: 'ゆびさきにともしびを',
    shortLabel: '灯せ',
    mpCost: 0,
    isVirtualMp: true,
    canUseOutsideBattle: true,
    effects: {
      addVirtualMp: 5
    }
  },
  {
    id: 'sun_in_palm',
    name: '手のひらに太陽を',
    shortLabel: '太陽',
    mpCost: 0,
    isVirtualMp: true,
    canUseOutsideBattle: true,
    effects: {
      multiplyVirtualMp: 2
    }
  },
  {
    id: 'spring_dream',
    name: '春ノ夢',
    shortLabel: '春夢',
    mpCost: 5,
    isVirtualMp: false,
    canUseOutsideBattle: true,
    effects: {
      generateEquipment: {
        type: 'weapon',
        multiplier: 3 // 虚拟攻击力是实际的3倍
      }
    }
  },
  {
    id: 'summer_sky',
    name: '夏ノ空',
    shortLabel: '夏空',
    mpCost: 5,
    isVirtualMp: false,
    canUseOutsideBattle: true,
    effects: {
      generateEquipment: {
        type: 'armor',
        multiplier: 3 // 虚拟防御力是实际的3倍
      }
    }
  },
  {
    id: 'warmer_than_spring_and_summer',
    name: '春よりも夏よりもあたたかい日',
    shortLabel: '故郷',
    mpCost: 99,
    isVirtualMp: true,
    canUseOutsideBattle: false,
    effects: {
      continuousAttack: true // Web层用此标记映射原版“≪星舞い≫”状态
    }
  }
]
