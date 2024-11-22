<template>
  <div class="game-view">
    <div class="scene-area">
      <img
        :src="useAsset(`sprite/snow${gameStore.distance % 3}.png`)"
        alt="scene"
      />
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
      <SnowEffect />
      <EventMessage :message="message" />
    </div>

    <div class="status-area">
      <div class="character">
        <img :src="useAsset('sprite/self.png')" alt="character" />
      </div>

      <StatusPanel />

      <template v-if="viewType === 'normal'">
        <div class="buttons buttons-1">
          <button
            @click="handleInn"
            v-if="subEvent === 'inn'"
            :disabled="
              gameStore.items.matches < subEventExtra.cost ||
              message === subEventExtra.afterMessage
            "
          >
            {{ t("game.actions.inn") }} ({{ subEventExtra.cost }})
          </button>

          <button
            @click="handleCandle"
            v-if="subEvent === 'save'"
            :disabled="
              gameStore.items.matches < subEventExtra.cost ||
              message === subEventExtra.afterMessage
            "
          >
            {{ t("game.actions.candle") }} ({{ subEventExtra.cost }})
          </button>

          <button @click="handleShop" v-if="subEvent === 'shop'">
            {{ t("game.actions.shop") }}
          </button>

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
import StatusPanel from "../components/StatusPanel.vue";
import EventMessage from "../components/EventMessage.vue";
import { assetManager } from "../services/assetManager";
import { useI18n } from "vue-i18n";
import { createForwardService } from "../services/forwardService";

const gameStore = useGameStore();
const { t } = useI18n();
const forwardService = createForwardService(useI18n());

const useAsset = (path: string) => {
  return assetManager.useAsset(path).value;
};

type GameViewType = "normal" | "control" | "battle";
const viewType = ref<GameViewType>("normal");

type SubEvent = "nothing" | "shop" | "inn" | "save" | "matches" | "thought";
const subEvent = ref<SubEvent>("nothing");
const subEventSprite = ref<string>("");
const subEventExtra = ref();

const message = ref<string>("");

const handleForward = () => {
  const event = forwardService.handleForward();
  if (event.type !== "battle") {
    subEvent.value = event.type;
    subEventSprite.value = event.sprite || "";
    subEventExtra.value = event.extra;
    message.value = event.message || "";
    if (event.type === "matches") {
      gameStore.items.matches += event.extra.getNum;
    }
  } else {
    subEvent.value = "nothing";
    subEventSprite.value = "";
    subEventExtra.value = {};
    message.value = "";
    return;
  }
};

const handleInn = () => {
  gameStore.items.matches -= subEventExtra.value.cost;
  message.value = subEventExtra.value.afterMessage;
};

const handleCandle = () => {
  gameStore.items.matches -= subEventExtra.value.cost;
  message.value = subEventExtra.value.afterMessage;
  subEventSprite.value = subEventExtra.value.afterSprite;
};

const handleShop = () => {
  message.value = t("game.actions.shop");
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
    .sub-event-message {
      position: absolute;
      top: 260px;
      left: 25px;
      color: #fff;
      font-size: 12px;
      line-height: 1;
      padding: 1px;
      span {
        display: block;
        margin-bottom: 4px;
        background: #000;
        padding: 1px;
      }
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
