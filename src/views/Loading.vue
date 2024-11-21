<template>
  <div class="loading-view" @click="loaded && router.push('/game')">
    <!-- 标题窗格 -->
    <div class="title-window">
      <img src="../assets/sprite/title.bmp" alt="title" class="title-image" />
      <!-- 雪景效果 -->
      <SnowEffect
        :flakes="[
          {
            size: 1, // 雪花大小
            count: 40, // 该大小的雪花数量
            speedY: [0.2, 0.4], // 纵向速度范围 [最小值, 最大值]
            speedX: [0.1, 0.8], // 水平速度范围 [最小值, 最大值]
          },
          {
            size: 2,
            count: 20,
            speedY: [0.3, 0.5],
            speedX: [0.2, 0.8],
          },
          {
            size: 3,
            count: 5,
            speedY: [0.3, 0.5],
            speedX: [0.3, 0.6],
          },
          {
            size: 4,
            count: 3,
            speedY: [0.3, 0.5],
            speedX: [0.4, 0.8],
          },
        ]"
      />
    </div>

    <!-- 游戏名称 -->
    <div class="game-name">雪道</div>

    <!-- 加载进度条和文本 -->
    <div class="loading-status">
      <div class="progress-bar">
        <div class="progress" :style="{ width: `${progress}%` }"></div>
      </div>
      <div class="loading-text">{{ loadingText }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { assetManager } from "../services/assetManager";
import SnowEffect from "../components/SnowEffect.vue";

const progress = ref(0);
const loadingText = ref("正在检查资源...");
const loaded = ref(false);
const router = useRouter();

onMounted(async () => {
  try {
    const hasAssets = await assetManager.hasAssets();
    if (hasAssets) {
      loadingText.value = "";
      loaded.value = true;
      return;
    }

    loadingText.value = "正在加载游戏资源...";
    await assetManager.loadAllAssets((current, total) => {
      progress.value = Math.floor((current / total) * 100);
      loadingText.value = `正在加载游戏资源... (${current}/${total})`;
    });

    loadingText.value = "";
    loaded.value = true;
  } catch (error) {
    console.error("资产加载失败:", error);
    loadingText.value = "资源加载失败，请刷新页面重试...";
  }
});
</script>

<style lang="scss" scoped>
.loading-view {
  width: 100%;
  height: 100%;
  background: #fff;
  position: relative;
  overflow: hidden;

  .title-window {
    position: absolute;
    top: 80px;
    left: 50%;
    transform: translate(-50%, 0);
    background: #000;

    .title-image {
      display: block;
      image-rendering: pixelated;
      image-rendering: crisp-edges;
    }
  }

  .game-name {
    position: absolute;
    top: 230px;
    left: 50%;
    transform: translate(-50%, 0);
    color: #000;
  }

  .loading-status {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;

    .progress-bar {
      width: 100%;
      height: 2px;
      background: transparent;
      overflow: hidden;

      .progress {
        height: 100%;
        background: #000;
      }
    }

    .loading-text {
      position: absolute;
      right: 10px;
      bottom: 5px;
      font-size: 10px;
      color: #000;
    }
  }
}
</style>
