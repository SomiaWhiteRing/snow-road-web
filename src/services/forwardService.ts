import { useGameStore } from '../stores/game'
import { ENEMIES, BOSSES, type EnemyType } from '../types/enemies'

export type ForwardEventType = 'nothing' | 'thought' | 'shop' | 'sleep' | 'save' | 'matches' | 'battle'

interface ForwardEvent {
  type: ForwardEventType
  enemy?: EnemyType
  sprite?: string
  extra?: string
}

export class ForwardService {
  private gameStore: ReturnType<typeof useGameStore> | null = null

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

    // 随机事件概率分配
    const rand = Math.random()

    if (rand < 0.3) {
      return { type: 'nothing' }
    } else if (rand < 0.4) {
      return { type: 'thought' }
    } else if (rand < 0.5) {
      return {
        type: 'shop',
        sprite: 'sprite/shop.png'
      }
    } else if (rand < 0.6) {
      return {
        type: 'sleep',
        sprite: 'sprite/inn.png'
      }
    } else if (rand < 0.7) {
      return {
        type: 'save',
        sprite: 'sprite/candle0.png'
      }
    } else if (rand < 0.8) {
      return {
        type: 'matches',
        sprite: 'sprite/chas0.png'
      }
    } else if (rand < 0.84) {
      return {
        type: 'matches',
        sprite: 'sprite/chas2.png',
        extra: '10'
      }
    } else if (rand < 0.85 && this.hasBearInCurrentStage()) {
      return {
        type: 'thought',
        sprite: 'sprite/warning.png'
      }
    } else {
      const enemy = this.getRandomEnemy()
      return {
        type: 'battle',
        enemy,
        sprite: enemy.sprite.path
      }
    }
  }
}

// 创建单例
export const forwardService = new ForwardService() 