<template>
  <div class="game-view">
    <div class="scene-area">
      <img :src="useAsset('sprite/snow0.bmp')" alt="scene" />
      <SnowEffect />
      <ControlPanel v-if="showControl" @close="closeControl" />
    </div>

    <!-- 右侧状态区域 -->
    <div class="status-area">
      <div class="character">
        <img :src="useAsset('sprite/self.bmp')" alt="character" />
      </div>

      <div class="stats">
        <div class="stat-line">
          {{ t("game.stats.distance") }}: {{ gameStore.distance }}
        </div>
        <div class="stat-line">
          {{ t("game.stats.level") }} {{ gameStore.level }}
          {{ t("game.stats.exp") }}:{{ gameStore.exp }}/{{ gameStore.nextExp }}
        </div>
        <div class="stat-line">
          {{ t("game.stats.hp") }}: {{ gameStore.hp }}/{{ gameStore.maxHp }}
        </div>
      </div>

      <template v-if="showStatus">
        <div class="buttons buttons-1">
          <button>{{ t("game.actions.forward") }}</button>
        </div>
        <div class="buttons buttons-2">
          <button @click="toggleControl">
            {{ t("game.actions.control") }}
          </button>
        </div>
        <div class="buttons buttons-3">
          <button>
            {{ t("game.actions.matches", { count: gameStore.items.matches }) }}
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useGameStore } from "../stores/game";
import SnowEffect from "../components/SnowEffect.vue";
import ControlPanel from "../components/ControlPanel.vue";
import { assetManager } from "../services/assetManager";
import { useI18n } from "vue-i18n";

const gameStore = useGameStore();
const { t } = useI18n();

const useAsset = (path: string) => {
  return assetManager.useAsset(path).value;
};

const showStatus = ref(true);
const showControl = ref(false);

// 切换制御面板
const toggleControl = () => {
  showStatus.value = false;
  showControl.value = true;
};

// 关闭制御面板
const closeControl = () => {
  showStatus.value = true;
  showControl.value = false;
};
</script>

<style lang="scss" scoped>
body {
  background: #fff;
}

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
    width: 300px;
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
    }
  }
}
</style>
