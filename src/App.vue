<template>
  <div class="app-container" :lang="currentLang">
    <div class="game-frame" :style="frameStyle">
      <div
        class="game-container"
        :class="{ 'game-container-rotated': settingsStore.effectiveRotateScreen }"
      >
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { assetManager } from "./services/assetManager";
import { useI18n } from "vue-i18n";
import { useSettingsStore } from "./stores/settings";

// 游戏窗口基础尺寸
const BASE_WIDTH = 600;
const BASE_HEIGHT = 400;
const ROTATED_WIDTH = BASE_HEIGHT;
const ROTATED_HEIGHT = BASE_WIDTH;

const windowSize = ref({
  width: window.innerWidth,
  height: window.innerHeight,
});

// 监听窗口大小变化
const handleResize = () => {
  windowSize.value = {
    width: window.innerWidth,
    height: window.innerHeight,
  };
};

onMounted(() => {
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  assetManager.clearAssets();
});

const settingsStore = useSettingsStore();
const frameWidth = computed(() =>
  settingsStore.effectiveRotateScreen ? ROTATED_WIDTH : BASE_WIDTH
);
const frameHeight = computed(() =>
  settingsStore.effectiveRotateScreen ? ROTATED_HEIGHT : BASE_HEIGHT
);

// 计算容器样式,保持原始游戏画面的比例
const frameStyle = computed(() => {
  const { width: windowWidth, height: windowHeight } = windowSize.value;

  const scaleX = windowWidth / frameWidth.value;
  const scaleY = windowHeight / frameHeight.value;
  const scale = Math.min(scaleX, scaleY);

  const scaledWidth = frameWidth.value * scale;
  const scaledHeight = frameHeight.value * scale;
  const left = (windowWidth - scaledWidth) / 2;
  const top = (windowHeight - scaledHeight) / 2;

  return {
    width: `${frameWidth.value}px`,
    height: `${frameHeight.value}px`,
    transform: `scale(${scale})`,
    transformOrigin: "top left",
    left: `${left}px`,
    top: `${top}px`,
  };
});

const { locale } = useI18n();
const currentLang = computed(() => locale.value);
</script>

<style lang="scss">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body,
#app {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.app-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.game-frame {
  position: absolute;
  background: #000;
  overflow: hidden;
}

.game-container {
  width: 600px;
  height: 400px;
  position: absolute;
  top: 0;
  left: 0;
  background: #000;
  overflow: hidden;
}

.game-container-rotated {
  transform: translateX(400px) rotate(90deg);
  transform-origin: top left;
}

// 像素图片渲染设置
img {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}
</style>

