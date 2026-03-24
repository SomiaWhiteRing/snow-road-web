// 来源说明：
// - 敌人与 Boss 的名称、BMP 绑定、数值生成式、火柴奖励已由 snow.exe 的
//   `encountEnemy / encountBoss / setEnemy(0x475174)` 直接坐实。
// - `magic.chance` 仍是 Web 层运行抽象，不对应原版内部原始字段。
export interface EnemyType {
  id: string;
  name: string;
  hp: number | [number, number]; // 固定值或范围
  mp: number | [number, number];
  attack: number | [number, number];
  defense: number | [number, number];
  exp: number;
  matchReward?: number;
  isBoss?: boolean;
  stage?: number; // boss专用
  stages?: number[]; // 普通敌人可能出现在多个关卡
  sprite: {
    path: string;
    x?: number; // 展示坐标，可选
    y?: number;
  };
  // 特殊属性
  copyPlayerStats?: {
    hp?: boolean;
    mp?: boolean;
    attack?: boolean;
    defense?: boolean;
  };
  magic?: {
    id: "freeze" | "cremate";
    chance: number; // Web层行为参数，不对应原版内部原始字段
  };
  rewardEquipment?: {
    kind: "weapon" | "armor";
    id: string;
    name: string;
    power: number;
  };
}

export const ENEMIES: EnemyType[] = [
  {
    id: "yukio",
    name: "ゆきお",
    hp: [1, 4],
    mp: 0,
    attack: 1,
    defense: 0,
    exp: 1,
    stages: [0, 1, 5],
    sprite: {
      path: "sprite/snowman.png",
    },
  },
  {
    id: "ice_flare",
    name: "アイスフレア",
    hp: [1, 2],
    mp: 0,
    attack: [2, 4],
    defense: 0,
    exp: 2,
    stages: [0, 1],
    sprite: {
      path: "sprite/iceflare.png",
    },
  },
  {
    id: "yukiko",
    name: "ゆきこ",
    hp: [3, 4],
    mp: 0,
    attack: [2, 3],
    defense: [1, 2],
    exp: 3,
    stages: [1, 2, 5],
    sprite: {
      path: "sprite/snowwes.png",
    },
  },
  {
    id: "yukimasa",
    name: "ゆきまさ",
    hp: [10, 12],
    mp: 0,
    attack: [5, 6],
    defense: [0, 1],
    exp: 4,
    stages: [2, 3],
    sprite: {
      path: "sprite/nazo00.png",
    },
  },
  {
    id: "unopened_flower",
    name: "ひらかぬ花",
    hp: [1, 2],
    mp: 0,
    attack: [4, 6],
    defense: [6, 8],
    exp: 4,
    stages: [3],
    sprite: {
      path: "sprite/flower0.png",
    },
  },
  {
    id: "epitaph",
    name: "エピタフ",
    hp: [5, 7],
    mp: 0,
    attack: [4, 5],
    defense: [7, 8],
    exp: 8,
    stages: [3, 6],
    sprite: {
      path: "sprite/epitaph0.png",
    },
  },
  {
    id: "white_bear",
    name: "白熊",
    hp: [9, 11],
    mp: 0,
    attack: [5, 6],
    defense: [5, 6],
    exp: 7,
    stages: [1, 2, 4],
    sprite: {
      path: "sprite/whitebear.png",
    },
  },
  {
    id: "white_bear_king",
    name: "白熊王",
    hp: [12, 14],
    mp: 0,
    attack: [7, 8],
    defense: [7, 8],
    exp: 10,
    stages: [4, 6],
    sprite: {
      path: "sprite/whitebear2.png",
    },
  },
  {
    id: "yukihiko",
    name: "ゆきひこ",
    hp: [4, 6],
    mp: 0,
    attack: [10, 11],
    defense: [10, 11],
    exp: 9,
    stages: [5],
    sprite: {
      path: "sprite/snowman.png",
    },
  },
  {
    id: "yukie",
    name: "ゆきえ",
    hp: [7, 9],
    mp: [3, 5],
    attack: [8, 9],
    defense: [8, 9],
    exp: 11,
    stages: [5],
    sprite: {
      path: "sprite/snowwes.png",
    },
    magic: {
      id: "freeze",
      chance: 0.5,
    },
  },
  {
    id: "fearsome_match",
    name: "おそるべきマッチ",
    hp: 1,
    mp: 0,
    attack: [0, 24],
    defense: 0,
    exp: 3,
    matchReward: 1,
    stages: [6],
    sprite: {
      path: "sprite/chas0.png",
    },
  },
  {
    id: "absolute_yukio",
    name: "絶対ゆきお",
    hp: [15, 19],
    mp: 0,
    attack: 0,
    defense: [10, 11],
    exp: 15,
    stages: [8],
    sprite: {
      path: "sprite/snowman4.png",
    },
    copyPlayerStats: {
      attack: true,
    },
  },
  {
    id: "absolute_yukiko",
    name: "絶対ゆきこ",
    hp: [1, 3],
    mp: 0,
    attack: [15, 16],
    defense: 0,
    exp: 12,
    stages: [8],
    sprite: {
      path: "sprite/snowwes3.png",
    },
    copyPlayerStats: {
      defense: true,
    },
  },
  {
    id: "absolute_bear",
    name: "絶対熊",
    hp: 0,
    mp: 10,
    attack: [20, 24],
    defense: [20, 24],
    exp: 30,
    stages: [8, 9, 10],
    sprite: {
      path: "sprite/blackbear.png",
    },
    copyPlayerStats: {
      hp: true,
    },
  },
  {
    id: "coldecot_aura",
    name: "コルデコットオーラ",
    hp: [0, 25],
    mp: [0, 25],
    attack: [0, 25],
    defense: [0, 25],
    exp: 25,
    stages: [9],
    sprite: {
      path: "sprite/fish00.png",
    },
    magic: {
      id: "freeze",
      chance: 0.5,
    },
  },
  {
    id: "from_engine",
    name: "フロムエンジン",
    hp: [0, 50],
    mp: [0, 50],
    attack: [0, 50],
    defense: [0, 50],
    exp: 50,
    stages: [10],
    sprite: {
      path: "sprite/nazo00.png",
    },
    magic: {
      id: "cremate",
      chance: 0.5,
    },
  },
  {
    id: "red_silhouette",
    name: "レッドシルエット",
    hp: 0,
    mp: 0,
    attack: 0,
    defense: 0,
    exp: 0,
    stages: [10],
    sprite: {
      path: "sprite/snowwes4.png",
    },
    copyPlayerStats: {
      hp: true,
      mp: true,
      attack: true,
      defense: true,
    },
  },
];

export const BOSSES: EnemyType[] = [
  {
    id: "yukinobu",
    name: "ゆきのぶ",
    hp: 7,
    mp: 0,
    attack: 2,
    defense: 0,
    exp: 15,
    matchReward: 0,
    isBoss: true,
    stage: 0,
    sprite: {
      path: "sprite/snowman2.png",
    },
  },
  {
    id: "yukino",
    name: "ゆきの",
    hp: 15,
    mp: 0,
    attack: 4,
    defense: 2,
    exp: 30,
    matchReward: 3,
    isBoss: true,
    stage: 1,
    sprite: {
      path: "sprite/snowwes2.png",
    },
  },
  {
    id: "snow_doll",
    name: "スノードール",
    hp: [0, 25],
    mp: [0, 25],
    attack: [0, 25],
    defense: [0, 25],
    exp: 25,
    matchReward: 4,
    isBoss: true,
    stage: 2,
    sprite: {
      path: "sprite/snowdoll.png",
    },
    magic: {
      id: "freeze",
      chance: 0.5,
    },
  },
  {
    id: "opened_flower",
    name: "ひらいた花",
    hp: 20,
    mp: 0,
    attack: 9,
    defense: 3,
    exp: 60,
    matchReward: 5,
    isBoss: true,
    stage: 3,
    sprite: {
      path: "sprite/flower1.png",
    },
  },
  {
    id: "bear_heart",
    name: "ベアーハート",
    hp: 15,
    mp: 0,
    attack: 9,
    defense: 9,
    exp: 80,
    matchReward: 7,
    isBoss: true,
    stage: 4,
    sprite: {
      path: "sprite/bearman.png",
    },
  },
  {
    id: "yukimichi",
    name: "ゆきみち",
    hp: 98,
    mp: 0,
    attack: 12,
    defense: 7,
    exp: 100,
    matchReward: 8,
    isBoss: true,
    stage: 5,
    sprite: {
      path: "sprite/snowman3.png",
    },
  },
  {
    id: "fearsome_epitaph",
    name: "おそるべきエピタフ",
    hp: 1,
    mp: 5,
    attack: 15,
    defense: 999,
    exp: 120,
    matchReward: 10,
    isBoss: true,
    stage: 6,
    sprite: {
      path: "sprite/epitaph1.png",
    },
    magic: {
      id: "freeze",
      chance: 0.5,
    },
  },
  {
    id: "nobody",
    name: "だれもいない",
    hp: 0,
    mp: 0,
    attack: 0,
    defense: 0,
    exp: 0,
    matchReward: 0,
    isBoss: true,
    stage: 7,
    sprite: {
      path: "sprite/noenemy.png",
    },
  },
  {
    id: "kudou",
    name: "クドウ",
    hp: 50,
    mp: 20,
    attack: 20,
    defense: 20,
    exp: 150,
    matchReward: 15,
    isBoss: true,
    stage: 8,
    sprite: {
      path: "sprite/kudou.png",
    },
  },
  {
    id: "coldecot",
    name: "コルデコット",
    hp: 255,
    mp: 30,
    attack: 30,
    defense: 0,
    exp: 1000,
    matchReward: 0,
    isBoss: true,
    stage: 9, // Final
    sprite: {
      path: "sprite/coldeco.png",
    },
    magic: {
      id: "freeze",
      chance: 0.5,
    },
  },
  {
    id: "lucifer",
    name: "ルシファー",
    hp: 9999,
    mp: 9999,
    attack: 99,
    defense: 99,
    exp: 10000,
    matchReward: 0,
    isBoss: true,
    stage: 10,
    sprite: {
      path: "sprite/lucifer.png",
    },
    magic: {
      id: "cremate",
      chance: 0.5,
    },
  },
];
