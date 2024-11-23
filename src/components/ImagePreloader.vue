<template>
  <div class="image-preloader">
    <img
      v-for="(src, index) in imageSources"
      :key="index"
      :src="src"
      @load="handleImageLoad(index)"
      @error="handleImageError(index)"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";

interface Props {
  imageSources: string[];
  onProgress?: (current: number, total: number) => void;
  onComplete?: () => void;
  onError?: (error: any) => void;
}

const props = defineProps<Props>();
const loadedCount = ref(0);

// 添加调试日志
console.log("Images to preload:", props.imageSources);

const handleImageLoad = (index: number) => {
  console.log(`Image loaded: ${props.imageSources[index]}`);
  loadedCount.value++;
  props.onProgress?.(loadedCount.value, props.imageSources.length);

  if (loadedCount.value === props.imageSources.length) {
    console.log("All images loaded");
    props.onComplete?.();
  }
};

const handleImageError = (index: number) => {
  console.error(`Failed to load image: ${props.imageSources[index]}`);
  loadedCount.value++; // 即使加载失败也计数，以确保能完成加载过程
  props.onError?.(
    new Error(`Failed to load image: ${props.imageSources[index]}`)
  );

  if (loadedCount.value === props.imageSources.length) {
    props.onComplete?.();
  }
};

// 监听组件挂载
onMounted(() => {
  console.log("ImagePreloader mounted");
  // 如果没有图片需要加载，直接完成
  if (props.imageSources.length === 0) {
    console.log("No images to preload");
    props.onComplete?.();
  }
});
</script>

<style scoped>
.image-preloader {
  position: fixed;
  left: -9999px;
  top: -9999px;
  width: 1px;
  height: 1px;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
}
</style>
