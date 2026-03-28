<template>
  <canvas ref="canvas" class="snow-canvas"></canvas>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";

const BASE_WIDTH = 600;
const REFERENCE_FRAME_MS = 1000 / 60;
const MAX_DELTA_MS = REFERENCE_FRAME_MS * 3;

const props = defineProps({
  // 不同大小雪花的配置
  flakes: {
    type: Array,
    default: () => [
      {
        size: 3,
        count: 100,
        speedY: [0.4, 0.7],
        speedX: [0.5, 1.3],
      },
      {
        size: 4,
        count: 80,
        speedY: [0.5, 0.9],
        speedX: [0.6, 1.4],
      },
      {
        size: 6,
        count: 40,
        speedY: [0.7, 1.1],
        speedX: [0.7, 1.5],
      },
      {
        size: 8,
        count: 20,
        speedY: [0.9, 1.3],
        speedX: [0.8, 1.6],
      },
      {
        size: 10,
        count: 10,
        speedY: [1.1, 1.5],
        speedX: [0.9, 1.7],
      },
    ],
  },
  // 雪花颜色
  color: {
    type: String,
    default: "#FFFFFF",
  },
});

const canvas = ref(null);
let animationFrame = null;
let resizeObserver = null;
let lastFrameTime = null;

const resetAnimationClock = () => {
  lastFrameTime = null;
};

class Snowflake {
  constructor(width, height, config) {
    this.width = width;
    this.height = height;
    this.config = config;
    this.reset();
  }

  reset() {
    const { size, speedY, speedX } = this.config;

    this.x = Math.floor(Math.random() * this.width);
    this.y = -5;
    this.size = size;
    // 在speedY[0]到speedY[1]范围内随机
    this.speedY = Math.random() * (speedY[1] - speedY[0]) + speedY[0];
    // 在-speedX[1]到+speedX[1]范围内随机
    this.speedX = Math.random() * (speedX[1] * 2) - speedX[1];
  }

  update(deltaMs = REFERENCE_FRAME_MS) {
    const frameScale = deltaMs / REFERENCE_FRAME_MS;

    this.y += this.speedY * frameScale;
    this.x += this.speedX * frameScale;

    if (this.y > this.height || this.x < 0 || this.x > this.width) {
      this.reset();
    }
  }

  draw(ctx) {
    ctx.fillStyle = this.config.color;
    ctx.fillRect(this.x, this.y, this.size, this.size);
  }
}

let snowflakes = [];

const preRender = (
  snowflakes,
  duration = 5000,
  timestep = REFERENCE_FRAME_MS
) => {
  for (let elapsed = 0; elapsed < duration; elapsed += timestep) {
    const deltaMs = Math.min(timestep, duration - elapsed);

    snowflakes.forEach((snowflake) => {
      snowflake.update(deltaMs);
    });
  }
};

const initCanvas = () => {
  if (!canvas.value) return;

  const parent = canvas.value.parentElement;
  const rect = parent.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  // 使用原始尺寸设置画布大小，而不是缩放后的尺寸
  canvas.value.width = BASE_WIDTH * dpr;
  canvas.value.height = ((BASE_WIDTH * rect.height) / rect.width) * dpr;

  const ctx = canvas.value.getContext("2d");
  ctx.scale(dpr, dpr);

  // 使用原始配置创建雪花，不需要调整速度
  snowflakes = props.flakes.flatMap((config) =>
    Array(config.count)
      .fill()
      .map(
        () =>
          new Snowflake(BASE_WIDTH, canvas.value.height / dpr, {
            ...config,
            color: props.color,
          })
      )
  );

  preRender(snowflakes, 5000);
  resetAnimationClock();
};

const animate = (timestamp) => {
  if (!canvas.value) return;

  const ctx = canvas.value.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const deltaMs =
    lastFrameTime === null
      ? REFERENCE_FRAME_MS
      : Math.min(timestamp - lastFrameTime, MAX_DELTA_MS);

  lastFrameTime = timestamp;

  ctx.clearRect(0, 0, canvas.value.width / dpr, canvas.value.height / dpr);
  ctx.imageSmoothingEnabled = false;

  snowflakes.forEach((snowflake) => {
    snowflake.update(deltaMs);
    snowflake.draw(ctx);
  });

  animationFrame = requestAnimationFrame(animate);
};

onMounted(() => {
  initCanvas();

  resizeObserver = new ResizeObserver(() => {
    initCanvas();
  });

  if (canvas.value) {
    resizeObserver.observe(canvas.value.parentElement);
  }

  document.addEventListener("visibilitychange", resetAnimationClock);
  animationFrame = requestAnimationFrame(animate);
});

watch(
  () => props.color,
  () => {
    initCanvas();
  }
);

watch(
  () => props.flakes,
  () => {
    initCanvas();
  },
  { deep: true }
);

onUnmounted(() => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
  }
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
  document.removeEventListener("visibilitychange", resetAnimationClock);
});
</script>

<style scoped>
.snow-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}
</style>
