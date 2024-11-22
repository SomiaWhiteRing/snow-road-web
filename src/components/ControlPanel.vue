<template>
  <div class="control-overlay">
    <div class="control-text">
      <div
        v-for="(line, index) in controlLines"
        :key="index"
        :style="{ transform: `translateX(${line.offset}px)` }"
      >
        {{ line.text }}
      </div>
    </div>
    <div class="control-buttons">
      <button
        v-for="button in generateControlButtons()"
        :key="button.skill.id"
        :style="{
          position: 'absolute',
          left: `${button.position.x}px`,
          top: `${button.position.y}px`,
        }"
        @click="useControlSkill(button.skill)"
      >
        {{ t(`control.${button.skill.id}`) }} ({{ button.cost }})
      </button>
    </div>
    <div class="control-exit">
      <button @click="emit('close')">
        {{ t("game.controlMenu.exit") }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useGameStore } from "../stores/game";
import { useI18n } from "vue-i18n";
import { generateControlText } from "../utils/textGenerator";
import {
  CONTROL_SKILLS,
  calculateControlCost,
  type ControlSkillType,
} from "../types/control";

const emit = defineEmits<{
  (e: "close"): void;
}>();

const gameStore = useGameStore();
const { t, tm } = useI18n();

interface TextLine {
  text: string;
  offset: number;
}

const controlLines = ref<TextLine[]>([]);
const buttonPositions = ref<Map<string, { x: number; y: number }>>(new Map());

// 计算可用的制御技能
const availableSkills = computed(() => {
  return CONTROL_SKILLS.filter((skill) => {
    // 如果是已学习的技能则不显示
    if (
      skill.type === "skill" &&
      gameStore.learnedSkills.includes(skill.effect.learnSkill!)
    ) {
      return false;
    }

    // 检查前置技能要求
    if (
      skill.requirement?.skill &&
      !gameStore.learnedSkills.includes(skill.requirement.skill)
    ) {
      return false;
    }

    // 计算消耗
    const cost = calculateControlCost(skill, {
      attack: gameStore.attack,
      defense: gameStore.defense,
      maxMp: gameStore.maxMp,
    });

    // 检查HP是否足够
    return gameStore.maxHp > cost;
  });
});

// 生成随机位置的技能按钮
const generateControlButtons = () => {
  // 创建临时DOM元素并添加相同的样式
  const measureButton = document.createElement("button");
  measureButton.style.position = "absolute";
  measureButton.style.visibility = "hidden";
  measureButton.style.fontSize = "12px";
  const controlButtons = document.querySelector(".control-buttons");
  if (controlButtons) {
    controlButtons.appendChild(measureButton);
  } else {
    document.body.appendChild(measureButton);
  }

  const buttons = availableSkills.value.map((skill) => {
    const cost = calculateControlCost(skill, {
      attack: gameStore.attack,
      defense: gameStore.defense,
      maxMp: gameStore.maxMp,
    });

    // 如果位置已存在，使用已保存的位置
    let position = buttonPositions.value.get(skill.id);

    if (!position) {
      // 只在第一次生成位置
      measureButton.textContent = `${t(`control.${skill.id}`)} (${cost})`;
      const buttonWidth = measureButton.offsetWidth;
      position = {
        x: Math.random() * (240 - buttonWidth),
        y: Math.random() * 200,
      };
      buttonPositions.value.set(skill.id, position);
    }

    return {
      skill,
      cost,
      position,
    };
  });

  measureButton.remove();
  return buttons;
};

// 处理技能学习
const useControlSkill = (skill: ControlSkillType) => {
  const cost = calculateControlCost(skill, {
    attack: gameStore.attack,
    defense: gameStore.defense,
    maxMp: gameStore.maxMp,
  });

  // 消耗MaxHP
  gameStore.consumeMaxHp(cost);

  // 应用技能效果
  if (skill.effect.learnSkill) {
    gameStore.learnSkill(skill.effect.learnSkill);
  }
  if (skill.effect.attackUp) {
    gameStore.attack += skill.effect.attackUp;
  }
  if (skill.effect.defenseUp) {
    gameStore.defense += skill.effect.defenseUp;
  }
  if (skill.effect.maxMpUp) {
    gameStore.maxMp += skill.effect.maxMpUp;
  }
};

// 初始化文本
const texts = tm("game.controlText") as string[];
if (texts && texts.length) {
  controlLines.value = generateControlText(texts);
}
</script>

<style lang="scss" scoped>
.control-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 250px;
  height: 250px;
  background: #770000;
  overflow: hidden;

  .control-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0.9);
    z-index: 1;
    height: 285px;
    width: 285px;
    overflow: hidden;
    text-align: center;
    color: #aa3300;
    font-size: 12px;
    font-weight: 400;
    line-height: 1;
    white-space: pre-wrap;
    user-select: none;

    div {
      line-height: 1;
      white-space: nowrap;
    }
  }

  .control-buttons {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2;
    button:hover {
      z-index: 3;
    }
  }

  .control-exit {
    position: absolute;
    bottom: 0;
    right: 0;
    z-index: 2;
    font-weight: bold;
  }
}
</style>
