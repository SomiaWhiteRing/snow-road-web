<template>
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
</template>

<script setup lang="ts">
import { useGameStore } from "../stores/game";
import { useI18n } from "vue-i18n";

const gameStore = useGameStore();
const { t } = useI18n();
</script>

<style lang="scss" scoped>
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
</style>
