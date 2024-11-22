export interface EnemyType {
  id: string
  name: string
  hp: number | [number, number] // 固定值或范围
  mp: number | [number, number]
  attack: number | [number, number]
  defense: number | [number, number]
  exp: number
  isBoss?: boolean
  stage?: number // boss专用
  stages?: number[] // 普通敌人可能出现在多个关卡
  sprite: {
    path: string
    x?: number // 展示坐标，可选
    y?: number
  }
  // 特殊属性
  copyPlayerStats?: {
    hp?: boolean
    mp?: boolean
    attack?: boolean
    defense?: boolean
  }
}

export const ENEMIES: EnemyType[] = [
  {
    id: 'yukio',
    name: 'ゆきお',
    hp: [1, 4],
    mp: 0,
    attack: 1,
    defense: 0,
    exp: 1,
    stages: [0, 8],
    sprite: {
      path: 'sprite/snowman.png'
    }
  },
  {
    id: 'ice_flare',
    name: 'アイスフレア',
    hp: [1, 2],
    mp: 0,
    attack: [1, 4],
    defense: 0,
    exp: 2,
    stages: [0],
    sprite: {
      path: 'sprite/iceflare.png'
    }
  },
  {
    id: 'yukiko',
    name: 'ゆきこ',
    hp: [2, 4],
    mp: 0,
    attack: [2, 3],
    defense: [1, 2],
    exp: 3,
    stages: [0, 8],
    sprite: {
      path: 'sprite/snowman2.png'
    }
  },
  {
    id: 'yukimasa',
    name: 'ゆきまさ',
    hp: [10, 12],
    mp: 0,
    attack: [5, 6],
    defense: [0, 1],
    exp: 4,
    stages: [1],
    sprite: {
      path: 'sprite/snowwes.png'
    }
  },
  {
    id: 'unopened_flower',
    name: 'ひらかぬ花',
    hp: [1, 2],
    mp: 0,
    attack: [4, 6],
    defense: [6, 8],
    exp: 4,
    stages: [3],
    sprite: {
      path: 'sprite/flower0.png'
    }
  },
  {
    id: 'epitaph',
    name: 'エピタフ',
    hp: [5, 7],
    mp: 0,
    attack: [4, 6],
    defense: [7, 8],
    exp: 8,
    stages: [6],
    sprite: {
      path: 'sprite/epitaph0.png'
    }
  },
  {
    id: 'white_bear',
    name: '白熊',
    hp: [9, 11],
    mp: 0,
    attack: [5, 6],
    defense: [5, 6],
    exp: 7,
    stages: [4],
    sprite: {
      path: 'sprite/whitebear.png'
    }
  },
  {
    id: 'white_bear_king',
    name: '白熊王',
    hp: [12, 14],
    mp: 0,
    attack: [7, 8],
    defense: [7, 8],
    exp: 10,
    stages: [6],
    sprite: {
      path: 'sprite/bearman.png'
    }
  },
  {
    id: 'yukihiko',
    name: 'ゆきひこ',
    hp: [4, 6],
    mp: 0,
    attack: [10, 12],
    defense: [10, 12],
    exp: 9,
    stages: [5],
    sprite: {
      path: 'sprite/snowwes4.png'
    }
  },
  {
    id: 'yukie',
    name: 'ゆきえ',
    hp: [7, 8],
    mp: [2, 5],
    attack: [6, 8],
    defense: [7, 9],
    exp: 11,
    stages: [5],
    sprite: {
      path: 'sprite/snowwes3.png'
    }
  },
  {
    id: 'fearsome_match',
    name: 'おそるべきマッチ',
    hp: 1,
    mp: 0,
    attack: [1, 25],
    defense: 0,
    exp: 3,
    stages: [6],
    sprite: {
      path: 'sprite/hell2.png'
    }
  },
  {
    id: 'absolute_yukio',
    name: '絶対ゆきお',
    hp: [15, 19],
    mp: 0,
    attack: 0,
    defense: [8, 11],
    exp: 15,
    stages: [8],
    sprite: {
      path: 'sprite/snowwes2.png'
    },
    copyPlayerStats: {
      attack: true
    }
  },
  {
    id: 'absolute_yukiko',
    name: '絶対ゆきこ',
    hp: [1, 3],
    mp: 0,
    attack: [14, 16],
    defense: 0,
    exp: 12,
    stages: [8],
    sprite: {
      path: 'sprite/snowwes3.png'
    },
    copyPlayerStats: {
      defense: true
    }
  },
  {
    id: 'absolute_bear',
    name: '絶対熊',
    hp: 0,
    mp: 10,
    attack: [20, 24],
    defense: [20, 24],
    exp: 30,
    stages: [8, 9],
    sprite: {
      path: 'sprite/whitebear2.png'
    },
    copyPlayerStats: {
      hp: true
    }
  },
  {
    id: 'coldecot_aura',
    name: 'コルデコットオーラ',
    hp: [0, 25],
    mp: [0, 25],
    attack: [0, 25],
    defense: [0, 25],
    exp: 25,
    stages: [9],
    sprite: {
      path: 'sprite/coldecot.png'
    }
  },
  {
    id: 'from_engine',
    name: 'フロムエンジン',
    hp: [0, 50],
    mp: [0, 50],
    attack: [0, 50],
    defense: [0, 50],
    exp: 50,
    stages: [10],
    sprite: {
      path: 'sprite/engine.png'
    }
  },
  {
    id: 'red_silhouette',
    name: 'レッドシルエット',
    hp: 0,
    mp: 0,
    attack: 0,
    defense: 0,
    exp: 0,
    stages: [10],
    sprite: {
      path: 'sprite/self.png'
    },
    copyPlayerStats: {
      hp: true,
      mp: true,
      attack: true,
      defense: true
    }
  }
]

export const BOSSES: EnemyType[] = [
  {
    id: 'yukinobu',
    name: 'ゆきのぶ',
    hp: 7,
    mp: 0,
    attack: 2,
    defense: 0,
    exp: 10,
    isBoss: true,
    stage: 0,
    sprite: {
      path: 'sprite/snowman3.png'
    }
  },
  {
    id: 'yukino',
    name: 'ゆきの',
    hp: 15,
    mp: 0,
    attack: 4,
    defense: 2,
    exp: 15,
    isBoss: true,
    stage: 1,
    sprite: {
      path: 'sprite/snowman4.png'
    }
  },
  {
    id: 'snow_doll',
    name: 'スノードール',
    hp: 25,
    mp: 0,
    attack: 6,
    defense: 3,
    exp: 20,
    isBoss: true,
    stage: 2,
    sprite: {
      path: 'sprite/snowdoll.png'
    }
  },
  {
    id: 'opened_flower',
    name: 'ひらいた花',
    hp: 20,
    mp: 0,
    attack: 9,
    defense: 3,
    exp: 25,
    isBoss: true,
    stage: 3,
    sprite: {
      path: 'sprite/flower1.png'
    }
  },
  {
    id: 'bear_heart',
    name: 'ベアーハート',
    hp: 15,
    mp: 0,
    attack: 9,
    defense: 9,
    exp: 30,
    isBoss: true,
    stage: 4,
    sprite: {
      path: 'sprite/bearman.png'
    }
  },
  {
    id: 'yukimichi',
    name: 'ゆきみち',
    hp: 98,
    mp: 0,
    attack: 12,
    defense: 7,
    exp: 35,
    isBoss: true,
    stage: 5,
    sprite: {
      path: 'sprite/snowwes.png'
    }
  },
  {
    id: 'fearsome_epitaph',
    name: 'おそるべきエピタフ',
    hp: 1,
    mp: 5,
    attack: 15,
    defense: 999,
    exp: 40,
    isBoss: true,
    stage: 6,
    sprite: {
      path: 'sprite/epitaph1.png'
    }
  },
  {
    id: 'nobody',
    name: 'だれもいない',
    hp: 0,
    mp: 0,
    attack: 0,
    defense: 0,
    exp: 0,
    isBoss: true,
    stage: 7,
    sprite: {
      path: 'sprite/noenemy.png'
    }
  },
  {
    id: 'kudou',
    name: 'クドウ',
    hp: 50,
    mp: 20,
    attack: 20,
    defense: 20,
    exp: 45,
    isBoss: true,
    stage: 8,
    sprite: {
      path: 'sprite/kudou.png'
    }
  },
  {
    id: 'coldecot',
    name: 'コルデコット',
    hp: 250,
    mp: 30,
    attack: 30,
    defense: 0,
    exp: 50,
    isBoss: true,
    stage: 9, // Final
    sprite: {
      path: 'sprite/coldecot.png'
    }
  }
] 