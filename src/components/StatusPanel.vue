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
    <div class="stat-line" v-if="gameStore.maxMp > 0 || gameStore.virtualMp > 0">
      {{ t("game.stats.mp") }}: {{ gameStore.mp }}/{{ gameStore.maxMp }}
      <template v-if="gameStore.virtualMp > 0">
        +{{ gameStore.virtualMp }}
      </template>
    </div>
    <div class="stat-line" v-if="gameStore.totalAttack > 0">
      {{ t("game.stats.attack") }}: {{ attackDisplay }}
    </div>
    <div class="stat-line" v-if="gameStore.totalDefense > 0">
      {{ t("game.stats.defense") }}: {{ defenseDisplay }}
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
    <div class="stat-line" v-if="gameStore.starCapacity > 0">
      {{ t("game.stats.stars") }}: {{ starMarks }}
    </div>
    <div class="stat-line" v-if="gameStore.starDanceActive">
      {{ t("game.stats.star_dance") }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useGameStore } from "../stores/game";
import { useI18n } from "vue-i18n";

const props = withDefaults(
  defineProps<{
    battleAttackBonus?: number;
    battleDefenseBonus?: number;
  }>(),
  {
    battleAttackBonus: 0,
    battleDefenseBonus: 0,
  }
);

const gameStore = useGameStore();
const { t } = useI18n();
const starMarks = computed(() => {
  const lit = "★".repeat(gameStore.fuel);
  const unlit = "☆".repeat(Math.max(0, gameStore.starCapacity - gameStore.fuel));
  return `${lit}${unlit}`;
});
const attackDisplay = computed(() =>
  props.battleAttackBonus > 0
    ? `${gameStore.totalAttack}＋${props.battleAttackBonus}`
    : `${gameStore.totalAttack}`
);
const defenseDisplay = computed(() =>
  props.battleDefenseBonus > 0
    ? `${gameStore.totalDefense}＋${props.battleDefenseBonus}`
    : `${gameStore.totalDefense}`
);
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
