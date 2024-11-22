<template>
  <audio ref="audioRef" loop></audio>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from "vue";
import { useGameStore } from "../stores/game";
import { assetManager } from "../services/assetManager";

const gameStore = useGameStore();
const audioRef = ref<HTMLAudioElement | null>(null);
const currentMusic = ref<string>("");

// 根据游戏阶段定义对应的背景音乐
const stageMusicMap: Record<number, string> = {
  0: "macchi.mp3", // 开始阶段
  1: "sironotuiku.mp3", // 第一阶段
  2: "haumu.mp3", // 第二阶段
  3: "fuleuden.mp3", // 第三阶段
  4: "haruyori.mp3", // 第四阶段
  5: "coldecot.mp3", // 第五阶段
  // 可以根据需要添加更多阶段的音乐
};

// 更新背景音乐
const updateBackgroundMusic = async () => {
  const musicFile = stageMusicMap[gameStore.stage] || "yukimichi.mp3";

  if (currentMusic.value === musicFile) return;

  try {
    const musicUrl = await assetManager.getAssetUrl(`music/${musicFile}`);
    if (audioRef.value) {
      audioRef.value.src = musicUrl;
      audioRef.value.volume = 0.5; // 设置适当的音量
      audioRef.value.play();
      currentMusic.value = musicFile;
    }
  } catch (error) {
    console.error("加载背景音乐失败:", error);
  }
};

// 监听游戏阶段变化
watch(() => gameStore.stage, updateBackgroundMusic);

onMounted(() => {
  updateBackgroundMusic();
});

onUnmounted(() => {
  if (audioRef.value) {
    audioRef.value.pause();
    audioRef.value.src = "";
  }
});
</script>
