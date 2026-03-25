<template>
  <canvas ref="canvas" class="snow-canvas"></canvas>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";

const BASE_WIDTH = 600;

const props = defineProps({
  // 不同大小雪花的配置
  flakes: {
    type: Array,
    default: () => [
      {
        size: 3,
        count: 100,
        speedY: [0.22, 0.4],
        speedX: [0.28, 0.78],
      },
      {
        size: 4,
        count: 80,
        speedY: [0.28, 0.48],
        speedX: [0.34, 0.84],
      },
      {
        size: 6,
        count: 40,
        speedY: [0.38, 0.6],
        speedX: [0.4, 0.9],
      },
      {
        size: 8,
        count: 20,
        speedY: [0.46, 0.72],
        speedX: [0.46, 0.96],
      },
      {
        size: 10,
        count: 10,
        speedY: [0.56, 0.84],
        speedX: [0.52, 1.02],
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

  update() {
    this.y += this.speedY;
    this.x += this.speedX;

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

const preRender = (snowflakes, duration = 5000, timestep = 8) => {
  // 计算需要预渲染的帧数
  const frames = Math.floor(duration / timestep);

  // 模拟动画帧
  for (let i = 0; i < frames; i++) {
    snowflakes.forEach((snowflake) => {
      snowflake.update();
    });
  }
};

const initCanvas = () => {
  if (!canvas.value) return;

  const parent = canvas.value.parentElement;
  const rect = parent.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  // 获取实际的 CSS 缩放比例
  const computedStyle = window.getComputedStyle(parent);
  const transform = computedStyle.transform;
  const matrix = new DOMMatrix(transform);
  const scale = matrix.a; // 获取水平缩放值

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

  preRender(snowflakes, 9000);
};

const animate = () => {
  if (!canvas.value) return;

  const ctx = canvas.value.getContext("2d");
  const dpr = window.devicePixelRatio || 1;

  ctx.clearRect(0, 0, canvas.value.width / dpr, canvas.value.height / dpr);
  ctx.imageSmoothingEnabled = false;

  snowflakes.forEach((snowflake) => {
    snowflake.update();
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

  animate();
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
