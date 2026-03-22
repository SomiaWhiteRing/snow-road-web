<template>
  <audio ref="audioRef" loop></audio>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from "vue";
import { useGameStore } from "../stores/game";
import { assetManager } from "../services/assetManager";

const props = withDefaults(
  defineProps<{
    suspended?: boolean;
    overrideTrack?: string | null;
  }>(),
  {
    suspended: false,
    overrideTrack: null,
  }
);

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
  6: "yukimichi.mp3",
  7: "simoyake.mp3",
  8: "yukio.mp3",
  9: "coldecot.mp3",
  10: "thanatos.mp3",
};

const resolveStageMusicPath = () => {
  const musicFile = stageMusicMap[gameStore.stage] || "thanatos.mp3";
  return `music/${musicFile}`;
};

// 更新背景音乐
const updateBackgroundMusic = async () => {
  if (!audioRef.value) {
    return;
  }

  if (props.suspended && !props.overrideTrack) {
    audioRef.value.pause();
    return;
  }

  const musicPath = props.overrideTrack ?? resolveStageMusicPath();

  try {
    if (currentMusic.value !== musicPath) {
      const musicUrl = await assetManager.getAssetUrl(musicPath);
      audioRef.value.src = musicUrl;
      audioRef.value.volume = 0.5; // 设置适当的音量
      currentMusic.value = musicPath;
    }

    if (audioRef.value.paused) {
      await audioRef.value.play();
    }
  } catch (error) {
    console.error("加载背景音乐失败:", error);
  }
};

// 监听游戏阶段变化
watch(
  [
    () => gameStore.stage,
    () => props.suspended,
    () => props.overrideTrack,
  ],
  updateBackgroundMusic
);

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
