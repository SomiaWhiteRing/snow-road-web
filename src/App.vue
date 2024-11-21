<template>
  <div class="app-container">
    <div class="game-container" :style="containerStyle">
      <router-view></router-view>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { assetManager } from "./services/assetManager";

// 游戏窗口基础尺寸
const BASE_WIDTH = 600;
const BASE_HEIGHT = 400;

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

// 计算容器样式,保持600*400的比例
const containerStyle = computed(() => {
  const { width: windowWidth, height: windowHeight } = windowSize.value;

  // 计算缩放比例
  const scaleX = windowWidth / BASE_WIDTH;
  const scaleY = windowHeight / BASE_HEIGHT;
  const scale = Math.min(scaleX, scaleY);

  // 计算居中位置
  const scaledWidth = BASE_WIDTH * scale;
  const scaledHeight = BASE_HEIGHT * scale;
  const left = (windowWidth - scaledWidth) / 2;
  const top = (windowHeight - scaledHeight) / 2;

  return {
    transform: `scale(${scale})`,
    transformOrigin: "top left",
    left: `${left}px`,
    top: `${top}px`,
  };
});
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

.game-container {
  width: 600px;
  height: 400px;
  position: absolute;
  background: #000;
  overflow: hidden;
}

// 像素图片渲染设置
img {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}
</style>

