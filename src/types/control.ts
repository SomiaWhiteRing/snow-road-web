export interface ControlSkillType {
  id: string
  name: string
  cost: number // HP消耗
  type: 'skill' | 'stat' // 技能或属性提升
  requirement?: {
    skill?: string // 需要已学会的技能
    maxHp?: number // 需要的最大HP
  }
  effect: {
    learnSkill?: string // 学习技能
    attackUp?: number // 攻击力提升
    defenseUp?: number // 防御力提升
    maxMpUp?: number // 最大MP提升
  }
  costCalculation?: {
    // 动态消耗计算
    type: 'attack' | 'defense' | 'mp'
    base: number // 基础值
  }
}

export const CONTROL_SKILLS: ControlSkillType[] = [
  {
    id: 'flip',
    name: 'フリップ',
    cost: 1,
    type: 'skill',
    effect: {
      learnSkill: 'flip'
    }
  },
  {
    id: 'drive',
    name: 'ドライヴ',
    cost: 1,
    type: 'skill',
    effect: {
      learnSkill: 'drive'
    }
  },
  {
    id: 'secret',
    name: '奥の手',
    cost: 5,
    type: 'skill',
    effect: {
      learnSkill: 'secret'
    }
  },
  {
    id: 'flip_flop',
    name: 'フリップフロップ',
    cost: 99,
    type: 'skill',
    requirement: {
      skill: 'flip'
    },
    effect: {
      learnSkill: 'flip_flop'
    }
  },
  {
    id: 'overdrive',
    name: 'オーバードライヴ',
    cost: 99,
    type: 'skill',
    requirement: {
      skill: 'drive'
    },
    effect: {
      learnSkill: 'overdrive'
    }
  },
  {
    id: 'attack_up',
    name: '攻撃力+1',
    type: 'stat',
    cost: 0, // 动态计算
    costCalculation: {
      type: 'attack',
      base: 5 // 当前攻击力+5
    },
    effect: {
      attackUp: 1
    }
  },
  {
    id: 'defense_up',
    name: '防御力+1',
    type: 'stat',
    cost: 0, // 动态计算
    costCalculation: {
      type: 'defense',
      base: 5 // 当前防御力+5
    },
    effect: {
      defenseUp: 1
    }
  },
  {
    id: 'max_mp_up',
    name: 'MaxMP+1',
    type: 'stat',
    cost: 0, // 动态计算
    costCalculation: {
      type: 'mp',
      base: 0 // 特殊计算：当MaxMP为0时为20，否则等于当前MaxMP
    },
    effect: {
      maxMpUp: 1
    }
  }
]

// 计算制御技能消耗的辅助函数
export function calculateControlCost(skill: ControlSkillType, stats: {
  attack: number,
  defense: number,
  maxMp: number
}): number {
  if (!skill.costCalculation) {
    return skill.cost
  }

  switch (skill.costCalculation.type) {
    case 'attack':
      return stats.attack + skill.costCalculation.base
    case 'defense':
      return stats.defense + skill.costCalculation.base
    case 'mp':
      return stats.maxMp === 0 ? 20 : stats.maxMp
    default:
      return skill.cost
  }
} 