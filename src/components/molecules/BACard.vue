<template>
  <div class="bad-apple-wrapper" @click="togglePlay" title="点击暂停/继续">
    <canvas
      ref="canvasRef"
      :width="canvasWidth"
      :height="canvasHeight"
      :style="{ background: bgColor }"
    ></canvas>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';

// ==================== Props ====================
const props = defineProps({
  // 数据文件路径
  src: {
    type: String,
    default: '/assets/badapple_frames_compressed.bin',
  },
  // 背景色
  bgColor: {
    type: String,
    default: '#000000',
  },
  // 前景色（亮色）
  primaryColor: {
    type: String,
    default: '#ffffff',
  },
  // 字符网格尺寸（必须与数据一致）
  cols: {
    type: Number,
    default: 80,
  },
  rows: {
    type: Number,
    default: 30,
  },
  // 每个像素块的大小（px）
  blockSize: {
    type: Number,
    default: 8,
  },
  // 帧率
  fps: {
    type: Number,
    default: 10,
  },
});

// ==================== 内部配置 ====================
const PADDING = 1.8;      // 边距
const RADIUS = 1.9;       // 圆角
const JUMP_AMP = 0;       // 跳动幅度（0 关闭）
const JUMP_SPEED = 0;     // 跳动速度（无效）

// ==================== DOM 引用 ====================
const canvasRef = ref(null);
let ctx = null;
let canvasWidth = 0;
let canvasHeight = 0;

// ==================== 动画状态 ====================
let framesBuffer = null;      // Uint8Array (压缩位流)
let totalFrames = 0;
let currentFrame = 0;
let isPlaying = true;
let animId = null;
let lastTimestamp = 0;
let lastFrameSwitch = 0;
const frameInterval = 1000 / props.fps;

// ==================== 核心函数 ====================
// 解析颜色：支持 #hex 与 CSS 变量（var(--x)），变量按当前主题实时解析，融入页面明暗模式
function resolveColor(value) {
  const v = String(value).trim();
  if (v.startsWith('var(')) {
    const name = v.slice(4, -1).trim();
    const resolved = getComputedStyle(canvasRef.value).getPropertyValue(name).trim();
    return resolved || v;
  }
  return v;
}

// 从压缩位流读取像素 (0 或 1)
function getPixel(frameIndex, row, col) {
  const pixelIdx = frameIndex * props.cols * props.rows + row * props.cols + col;
  const byteIdx = pixelIdx >> 3;
  const bitIdx = pixelIdx & 7;
  const byte = framesBuffer[byteIdx];
  return (byte >> bitIdx) & 1;
}

// 圆角矩形（兼容不支持 roundRect 的浏览器）
function roundRect(ctx, x, y, w, h, r) {
  if (ctx.roundRect) {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.rect(x, y, w, h);
  }
}

// ==================== 绘制 ====================
function drawFrame() {
  if (!ctx || !framesBuffer) return;

  const bg = resolveColor(props.bgColor);
  const primary = resolveColor(props.primaryColor);

  // 清空画布
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  const halfPad = PADDING / 2;
  const blockSize = props.blockSize - PADDING;

  for (let row = 0; row < props.rows; row++) {
    for (let col = 0; col < props.cols; col++) {
      const bit = getPixel(currentFrame, row, col);
      if (bit === 0) continue; // 跳过黑色像素

      const x = col * props.blockSize + halfPad;
      const y = row * props.blockSize + halfPad; // 跳动关闭，无偏移

      ctx.fillStyle = primary;
      ctx.beginPath();
      roundRect(ctx, x, y, blockSize, blockSize, RADIUS);
      ctx.fill();
    }
  }

  // 可选：显示帧数（可注释掉）
  // ctx.font = '13px monospace';
  // ctx.fillStyle = '#0ff';
  // ctx.fillText(`${currentFrame + 1} / ${totalFrames}`, 10, 22);
}

// ==================== 动画循环 ====================
function animate(timestamp) {
  if (!isPlaying || !framesBuffer) {
    animId = requestAnimationFrame(animate);
    return;
  }

  if (lastTimestamp === 0) lastTimestamp = timestamp;
  const delta = Math.min(100, timestamp - lastTimestamp);
  lastTimestamp = timestamp;

  if (lastFrameSwitch === 0) lastFrameSwitch = timestamp;
  if (timestamp - lastFrameSwitch >= frameInterval) {
    currentFrame = (currentFrame + 1) % totalFrames;
    lastFrameSwitch = timestamp;
  }

  drawFrame();
  animId = requestAnimationFrame(animate);
}

// ==================== 加载数据 ====================
async function loadData() {
  try {
    const resp = await fetch(props.src);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const buf = await resp.arrayBuffer();
    const view = new DataView(buf);

    totalFrames = view.getUint32(0, true);
    const fw = view.getUint16(4, true);
    const fh = view.getUint16(6, true);
    if (fw !== props.cols || fh !== props.rows) {
      console.warn(`尺寸不匹配: 文件 ${fw}x${fh}, 预期 ${props.cols}x${props.rows}`);
    }
    // 从第8字节开始是像素位流
    framesBuffer = new Uint8Array(buf, 8);

    console.log(`✅ Bad Apple 加载成功: ${totalFrames} 帧, ${fw}×${fh}`);
    // 启动动画
    startAnimation();
  } catch (err) {
    console.error('加载 Bad Apple 数据失败:', err);
    // 在画布上显示错误
    if (ctx) {
      ctx.fillStyle = '#f55';
      ctx.font = '16px sans-serif';
      ctx.fillText('❌ 数据加载失败，请检查路径', 20, 50);
    }
  }
}

function startAnimation() {
  isPlaying = true;
  lastTimestamp = 0;
  lastFrameSwitch = 0;
  currentFrame = 0;
  if (animId) cancelAnimationFrame(animId);
  animId = requestAnimationFrame(animate);
}

function stopAnimation() {
  isPlaying = false;
  if (animId) {
    cancelAnimationFrame(animId);
    animId = null;
  }
}

// 点击切换播放/暂停：暂停后从当前帧继续，不重置回开头
function togglePlay() {
  if (!framesBuffer) return; // 数据未加载完成时忽略
  isPlaying = !isPlaying;
  if (isPlaying) {
    lastTimestamp = 0;
    lastFrameSwitch = 0;
  }
}

// ==================== 生命周期 ====================
onMounted(() => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  ctx = canvas.getContext('2d');
  // 计算画布物理尺寸（与 CSS 保持一致，但宽度/高度由 blockSize 决定）
  canvasWidth = props.cols * props.blockSize;
  canvasHeight = props.rows * props.blockSize;
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  // 加载数据
  loadData();
});

onBeforeUnmount(() => {
  stopAnimation();
});

// 如果 props 改变（如颜色），重绘
watch(
  () => [props.bgColor, props.primaryColor],
  () => {
    if (framesBuffer) drawFrame();
  }
);
</script>

<style scoped>
.bad-apple-wrapper {
  display: inline-block;
  cursor: pointer;
  /* 可根据需要设置宽高，canvas 会自适应 */
}
canvas {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 8px;
}
</style>