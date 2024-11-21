<template>
  <canvas ref="canvas" class="snow-canvas"></canvas>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const props = defineProps({
  // 不同大小雪花的配置
  flakes: {
    type: Array,
    default: () => [
      {
        size: 1, // 雪花大小
        count: 100, // 该大小的雪花数量
        speedY: [0.2, 0.4], // 纵向速度范围 [最小值, 最大值]
        speedX: [0.1, 0.8], // 水平速度范围 [最小值, 最大值]
      },
      {
        size: 2,
        count: 80,
        speedY: [0.3, 0.5],
        speedX: [0.2, 0.8],
      },
      {
        size: 3,
        count: 40,
        speedY: [0.3, 0.5],
        speedX: [0.3, 0.6],
      },
      {
        size: 4,
        count: 20,
        speedY: [0.3, 0.5],
        speedX: [0.4, 0.8],
      },
      {
        size: 6,
        count: 10,
        speedY: [0.3, 0.5],
        speedX: [0.5, 1],
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
    ctx.fillRect(Math.floor(this.x), Math.floor(this.y), this.size, this.size);
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

  canvas.value.width = rect.width * dpr;
  canvas.value.height = rect.height * dpr;

  const ctx = canvas.value.getContext("2d");
  ctx.scale(dpr, dpr);

  // 创建雪花实例
  snowflakes = props.flakes.flatMap((config) =>
    Array(config.count)
      .fill()
      .map(
        () =>
          new Snowflake(rect.width, rect.height, {
            ...config,
            color: props.color,
          })
      )
  );

  // 预渲染5秒的动画状态
  preRender(snowflakes, 5000);
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
