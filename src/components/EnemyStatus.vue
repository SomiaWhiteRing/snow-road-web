<template>
  <div class="status-box">
    <span>{{ enemy.name }}</span>
    <span>{{ t("game.stats.hp") }}: {{ enemy.hp }}</span>
    <span v-if="enemy.mp">{{ t("game.stats.mp") }}: {{ enemy.mp }}</span>
    <span v-if="enemy.attack">{{ t("game.stats.attack") }}: {{ enemy.attack }}</span>
    <span v-if="enemy.defense">{{ t("game.stats.defense") }}: {{ enemy.defense }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useGameStore } from "@/stores/game";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const gameStore = useGameStore();
const enemy = computed(() => gameStore.battle.enemy);
</script>

<style lang="scss" scoped>
.status-box {
  position: absolute;
  top: 25px;
  left: 15px;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  span {
    display: inline;
    margin-bottom: 4px;
    background: rgba(0, 0, 0, 0.7);
    white-space: nowrap;
    line-height: 1.1;
  }
}
</style>
