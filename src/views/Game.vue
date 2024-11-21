<template>
  <div class="game-view">
    <!-- 左侧场景区域 -->
    <div class="scene-area">
      <!-- 这里渲染雪景和敌人 -->
      <img src="../assets/sprite/snow0.bmp" alt="scene" />
      <SnowEffect />
    </div>

    <!-- 右侧状态区域 -->
    <div class="status-area">
      <div class="character">
        <img src="../assets/sprite/self.bmp" alt="character" />
      </div>

      <div class="stats">
        <div class="stat-line">進んだ距離: {{ gameStore.distance }}</div>
        <div class="stat-line">
          LV {{ gameStore.level }} EXP:{{ gameStore.exp }}/{{
            gameStore.nextExp
          }}
        </div>
        <div class="stat-line">
          HP: {{ gameStore.hp }}/{{ gameStore.maxHp }}
        </div>
      </div>

      <div class="buttons buttons-1">
        <button>進む</button>
      </div>
      <div class="buttons buttons-2">
        <button>制御</button>
      </div>
      <div class="buttons buttons-3">
        <button>マッチ {{ gameStore.matches }}本</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useGameStore } from "../stores/game";
import SnowEffect from "../components/SnowEffect.vue";
const gameStore = useGameStore();
</script>

<style lang="scss" scoped>
.game-view {
  display: flex;
  width: 100%;
  height: 100%;
  padding: 40px 25px 50px;
  background: #000;
  font-size: 12px;
  image-rendering: pixelated;
  gap: 25px;

  .scene-area {
    height: 100%;
    width: 100%;
    padding-top: 10px;
    position: relative;
  }

  .status-area {
    width: 100%;
    position: relative;

    .character {
      position: absolute;
      top: 0;
      left: 0;
      width: 150px;

      img {
        width: 100%;
        height: auto;
      }
    }

    .stats {
      position: absolute;
      left: 0;
      top: 170px;
      color: #fff;

      .stat-line {
        line-height: 1;
        margin-bottom: 2px;
        height: 12px;
        font-size: 12px;
      }
    }

    .buttons {
      position: absolute;
      right: 0;
      display: flex;
      flex-direction: row;
      gap: 2px;

      &.buttons-1 {
        bottom: 110px;
      }

      &.buttons-2 {
        bottom: 65px;
      }

      &.buttons-3 {
        bottom: 0;
      }

      button {
        height: 24px;
        min-width: 48px;
        padding: 0 4px;
        width: auto;
        font-weight: bold;
      }
    }
  }
}
</style>
