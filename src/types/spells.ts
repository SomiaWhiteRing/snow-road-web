export interface SpellType {
  id: string
  name: string
  mpCost: number
  isVirtualMp: boolean // 是否可以使用虚拟MP
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
    mpCost: 0,
    isVirtualMp: true,
    power: 1
  },
  {
    id: 'become_charcoal',
    name: '消し炭になあれ',
    mpCost: 1,
    isVirtualMp: true,
    power: 5
  },
  {
    id: 'explode',
    name: '爆ぜろ',
    mpCost: 5,
    isVirtualMp: true,
    power: 25
  },
  {
    id: 'become_charcoal_max',
    name: '消し炭になあれ',
    mpCost: 20,
    isVirtualMp: true,
    power: 0 // 等于玩家当前MP
  },
  {
    id: 'warmth_of_others',
    name: '己ならざるのぬくもりよ',
    mpCost: 3,
    isVirtualMp: false,
    effects: {
      healHp: true
    }
  },
  {
    id: 'light',
    name: 'ゆびさきにともしびを',
    mpCost: 0,
    isVirtualMp: true,
    effects: {
      addVirtualMp: 5
    }
  },
  {
    id: 'sun_in_palm',
    name: '手のひらに太陽を',
    mpCost: 0,
    isVirtualMp: true,
    effects: {
      multiplyVirtualMp: 2
    }
  },
  {
    id: 'spring_dream',
    name: '春ノ夢',
    mpCost: 5,
    isVirtualMp: false,
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
    mpCost: 5,
    isVirtualMp: false,
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
    mpCost: 99,
    isVirtualMp: true,
    effects: {
      continuousAttack: true // 连续攻击次数由星印数量决定
    }
  }
]
