<template>
  <div class="loading-view" @click="startGame">
    <!-- 标题窗格 -->
    <div class="title-window">
      <img src="../assets/sprite/title.png" alt="title" class="title-image" />
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
    <div class="game-name">{{ t("game.title") }}</div>

    <!-- 加载进度条和文本 -->
    <div class="loading-status">
      <div class="progress-bar">
        <div class="progress" :style="{ width: `${progress}%` }"></div>
      </div>
      <div class="loading-text">{{ loadingText }}</div>
    </div>

    <!-- 预加载组件 -->
    <ImagePreloader
      v-if="showPreloader"
      :imageSources="imageUrls"
      :onProgress="handlePreloadProgress"
      :onComplete="handlePreloadComplete"
      :onError="handlePreloadError"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { assetManager } from "../services/assetManager";
import SnowEffect from "../components/SnowEffect.vue";
import { useAssetStore } from "../stores/assetStore";
import ImagePreloader from "../components/ImagePreloader.vue";

const { proxy } = getCurrentInstance()!;

const { t } = useI18n();
const progress = ref<number>(0);
const loadingText = ref<string>(t("game.loading.checking"));
const loaded = ref<boolean>(false);
const router = useRouter();

const assetStore = useAssetStore();

const showPreloader = ref(false);
const imageUrls = ref<string[]>([]);

// 处理单个加载阶段的函数
const handleLoadingPhase = async (
  loadingFn: (
    callback: (current: number, total: number) => void
  ) => Promise<void>,
  loadingTextKey: string
) => {
  progress.value = 0;
  loadingText.value = t(loadingTextKey);

  await loadingFn((current: number, total: number) => {
    progress.value = Math.floor((current / total) * 100);
    loadingText.value = t(`${loadingTextKey}_progress`, { current, total });
  });

  // 确保进度条到达100%
  progress.value = 100;
  await new Promise((resolve) => setTimeout(resolve, 200));
};

// 预加载图片的过程
const handlePreload = async () => {
  progress.value = 0;
  loadingText.value = t("game.loading.preloading");

  // 先获取所有图片的URL
  await assetManager.preloadAllImages((current, total) => {
    progress.value = Math.floor((current / total) * 100);
    loadingText.value = t("game.loading.preloading_progress", {
      current,
      total,
    });
  });

  // 获取需要预加载的图片URL列表
  imageUrls.value = assetManager.getPreloadImageUrls();
  console.log("URLs to preload:", imageUrls.value);

  if (imageUrls.value.length === 0) {
    console.log("No images to preload, completing...");
    handlePreloadComplete();
    return;
  }

  showPreloader.value = true;
};

// 处理预加载进度
const handlePreloadProgress = (current: number, total: number) => {
  console.log(`Preload progress: ${current}/${total}`);
  progress.value = Math.floor((current / total) * 100);
  loadingText.value = t("game.loading.preloading_progress", { current, total });
};

// 处理预加载完成
const handlePreloadComplete = () => {
  console.log("Preload complete");
  progress.value = 100;
  showPreloader.value = false;
  loadingText.value = "";
  loaded.value = true;
  assetStore.setAssetsLoaded(true);
};

// 处理预加载错误
const handlePreloadError = (error: any) => {
  console.error("Preload error:", error);
  loadingText.value = t("game.loading.error");
  assetStore.setAssetsLoaded(false);
  showPreloader.value = false;
};

// 完整的加载过程
const handleFullLoading = async () => {
  try {
    // 第一阶段：加载资源
    await handleLoadingPhase(
      assetManager.loadAllAssets.bind(assetManager),
      "game.loading.loading"
    );

    // 第二阶段：预加载图片
    await handlePreload();
  } catch (error) {
    console.error("加载失败:", error);
    loadingText.value = t("game.loading.error");
    assetStore.setAssetsLoaded(false);
  }
};

onMounted(async () => {
  try {
    const hasAssets = await assetManager.hasAssets();
    if (hasAssets) {
      await handlePreload();
      return;
    }

    await handleFullLoading();
  } catch (error) {
    console.error("资产加载失败:", error);
    loadingText.value = t("game.loading.error");
    assetStore.setAssetsLoaded(false);
  }
});

const startGame = () => {
  if (!loaded.value) return;
  proxy!.$sound.playSound(proxy!.$SOUND.THATHATHA);
  router.push("/game");
};

onUnmounted(() => {
  if (!loaded.value) {
    assetStore.setAssetsLoaded(false);
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
