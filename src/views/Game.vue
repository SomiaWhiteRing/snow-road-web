<template>
  <div class="game-view">
    <div class="scene-area">
      <img
        :src="useAsset(`sprite/snow${gameStore.distance % 3}.png`)"
        alt="scene"
      />
      <SnowEffect />
      <ControlPanel
        v-if="viewType === 'control'"
        @close="viewType = 'normal'"
      />
      <img
        class="sub-event"
        v-if="viewType === 'normal' && subEvent !== 'nothing' && subEventSprite"
        :src="useAsset(subEventSprite)"
        alt="sub-event"
      />
    </div>

    <!-- 右侧状态区域 -->
    <div class="status-area">
      <div class="character">
        <img :src="useAsset('sprite/self.png')" alt="character" />
      </div>

      <div class="stats">
        <div class="stat-line" v-if="gameStore.stage > 0">
          {{ t("game.stats.stage", { stage: gameStore.stage }) }}
        </div>
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
        <div class="stat-line" v-if="gameStore.mp > 0">
          {{ t("game.stats.mp") }}: {{ gameStore.mp }}/{{ gameStore.maxMp }}
        </div>
        <div class="stat-line" v-if="gameStore.attack > 0">
          {{ t("game.stats.attack") }}: {{ gameStore.attack }}
        </div>
        <div class="stat-line" v-if="gameStore.defense > 0">
          {{ t("game.stats.defense") }}: {{ gameStore.defense }}
        </div>
        <div class="stat-line" v-if="gameStore.weapon.name">
          {{ t("game.stats.weapon") }}: {{ gameStore.weapon.name }}（{{
            gameStore.weapon.attack
          }}）
        </div>
        <div class="stat-line" v-if="gameStore.armor.name">
          {{ t("game.stats.armor") }}: {{ gameStore.armor.name }}（{{
            gameStore.armor.defense
          }}）
        </div>
      </div>

      <template v-if="viewType === 'normal'">
        <div class="buttons buttons-1">
          <button @click="handleForward">
            {{ t("game.actions.forward") }}
          </button>
        </div>
        <div class="buttons buttons-2">
          <button @click="viewType = 'control'">
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
import { forwardService } from "../services/forwardService";

const gameStore = useGameStore();
const { t } = useI18n();

const useAsset = (path: string) => {
  return assetManager.useAsset(path).value;
};

// 当前界面类型定义
type GameViewType = "normal" | "control" | "battle";
const viewType = ref<GameViewType>("normal");
// 子事件类型定义
type SubEvent = "nothing" | "shop" | "sleep" | "save" | "matches" | "thought";
const subEvent = ref<SubEvent>("nothing");
const subEventSprite = ref<string>("");

const handleForward = () => {
  const event = forwardService.handleForward();
  if (event.type !== "battle") {
    subEvent.value = event.type;
    subEventSprite.value = event.sprite || "";
  }
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
    flex-shrink: 0;
    img {
      width: 100%;
      height: 100%;
      position: absolute;
      top: 0;
      left: 0;
    }
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
