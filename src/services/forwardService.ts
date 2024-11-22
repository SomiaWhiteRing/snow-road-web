import { useGameStore } from '../stores/game'
import { ENEMIES, BOSSES, type EnemyType } from '../types/enemies'
import { type Composer } from 'vue-i18n'

export type ForwardEventType = 'nothing' | 'thought' | 'shop' | 'sleep' | 'save' | 'matches' | 'battle'

interface ForwardEvent {
  type: ForwardEventType
  enemy?: EnemyType
  sprite?: string
  message?: string
}

// 添加事件权重配置
const EVENT_WEIGHTS = {
  nothing: 30,
  thought: 10,
  shop: 10,
  sleep: 10,
  save: 10,
  matches: 10,
  matchesExtra: 1,
  bearWarning: 10,
  battle: 10
} as const

export class ForwardService {
  private gameStore: ReturnType<typeof useGameStore> | null = null
  private i18n: Composer

  constructor(i18n: Composer) {
    this.i18n = i18n
  }

  // 获取 store 实例
  private getStore() {
    if (!this.gameStore) {
      this.gameStore = useGameStore()
    }
    return this.gameStore
  }

  // 获取当前关卡的怪物池
  private getCurrentStageEnemies(): EnemyType[] {
    return ENEMIES.filter(enemy => enemy.stages?.includes(this.getStore().stage))
  }

  // 获取当前关卡的BOSS
  private getCurrentStageBoss(): EnemyType | undefined {
    return BOSSES.find(boss => boss.stage === this.getStore().stage)
  }

  // 检查当前关卡是否有熊类怪物
  private hasBearInCurrentStage(): boolean {
    return this.getCurrentStageEnemies().some(enemy =>
      enemy.id.includes('bear')
    )
  }

  // 随机选择一个普通怪物
  private getRandomEnemy(): EnemyType {
    const enemies = this.getCurrentStageEnemies()
    return enemies[Math.floor(Math.random() * enemies.length)]
  }

  // 计算总权重
  private getTotalWeight(): number {
    return Object.values(EVENT_WEIGHTS).reduce((sum, weight) => sum + weight, 0)
  }

  private translateMessage(key: string, params?: Record<string, any>): string {
    return this.i18n.t(key, params || {})
  }

  // 处理前进事件
  public handleForward(): ForwardEvent {
    // 增加距离
    this.getStore().distance++

    // 检查是否是BOSS战
    if (this.getStore().distance % 100 === 0) {
      const boss = this.getCurrentStageBoss()
      if (boss) {
        return {
          type: 'battle',
          enemy: boss,
          sprite: boss.sprite.path
        }
      }
    }

    // 根据权重随机选择事件
    let rand = Math.random() * this.getTotalWeight()

    if ((rand -= EVENT_WEIGHTS.nothing) < 0) {
      return { type: 'nothing' }
    }
    if ((rand -= EVENT_WEIGHTS.thought) < 0) {
      return {
        type: 'thought',
        message: this.translateMessage('events.thought.default')
      }
    }
    if ((rand -= EVENT_WEIGHTS.shop) < 0) {
      return {
        type: 'shop',
        sprite: 'sprite/shop.png',
        message: this.translateMessage('events.shop')
      }
    }
    if ((rand -= EVENT_WEIGHTS.sleep) < 0) {
      return {
        type: 'sleep',
        sprite: 'sprite/inn.png',
        message: this.translateMessage('events.sleep')
      }
    }
    if ((rand -= EVENT_WEIGHTS.save) < 0) {
      return {
        type: 'save',
        sprite: 'sprite/candle0.png',
        message: this.translateMessage('events.save')
      }
    }
    if ((rand -= EVENT_WEIGHTS.matches) < 0) {
      return {
        type: 'matches',
        sprite: 'sprite/chas0.png',
        message: this.translateMessage('events.matches.default')
      }
    }
    if ((rand -= EVENT_WEIGHTS.matchesExtra) < 0) {
      return {
        type: 'matches',
        sprite: 'sprite/chas2.png',
        message: this.translateMessage('events.matches.extra', { extra: '10' })
      }
    }
    if ((rand -= EVENT_WEIGHTS.bearWarning) < 0 && this.hasBearInCurrentStage()) {
      return {
        type: 'thought',
        sprite: 'sprite/warning.png',
        message: this.translateMessage('events.thought.bear_warning')
      }
    }

    const enemy = this.getRandomEnemy()
    return {
      type: 'battle',
      enemy,
      sprite: enemy.sprite.path,
      message: this.translateMessage('events.battle', { enemy: enemy.name })
    }
  }
}

// 修改服务实例化的方式
export const createForwardService = (i18n: Composer) => {
  return new ForwardService(i18n)
} 