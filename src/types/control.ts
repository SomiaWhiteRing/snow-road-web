// 来源说明：
// - 制御项、基础耗费与显示前提当前以逆向结果为主。
// - 本文件中的类型划分与 action schema 仍是 Web 层实现抽象。
export interface ControlSkillType {
  id: string
  name: string
  cost: number // HP消耗
  type: 'skill' | 'stat' | 'action' // 技能、属性提升或特殊动作
  requirement?: {
    skill?: string // 需要已学会的技能
    maxHp?: number // 需要的最大HP
    hasBook?: boolean // 需要已经买到书
    stageMin?: number // 最低阶段
  }
  effect: {
    learnSkill?: string // 学习技能
    attackUp?: number // 攻击力提升
    defenseUp?: number // 防御力提升
    maxMpUp?: number // 最大MP提升
    action?: 'spell_build' | 'primeval'
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
  },
  {
    id: 'spell_build',
    name: '呪文構築',
    cost: 3,
    type: 'action',
    requirement: {
      hasBook: true
    },
    effect: {
      action: 'spell_build'
    }
  },
  {
    id: 'primeval',
    name: '原初へ',
    cost: 99,
    type: 'action',
    requirement: {
      stageMin: 10
    },
    effect: {
      action: 'primeval'
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
