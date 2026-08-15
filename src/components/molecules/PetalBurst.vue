<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { LUNATIC_BURST_EVENT } from '@/composables/useSpellCode'

// 全屏一次性樱花祝福：监听 lunatic-burst 事件，播放约 4 秒后自动隐藏。
// 仅 transform/opacity 动画；prefers-reduced-motion 下保持隐形。
interface BurstPetal {
  x: number
  delay: number
  dur: number
  size: number
  sway: number
  rotate: number
  opacity: number
}

const PETALS: BurstPetal[] = [
  { x: 2, delay: 0, dur: 3.4, size: 18, sway: 70, rotate: 200, opacity: 0.55 },
  { x: 7, delay: 0.25, dur: 3.1, size: 13, sway: -60, rotate: 180, opacity: 0.45 },
  { x: 11, delay: 0.5, dur: 3.8, size: 16, sway: 85, rotate: 240, opacity: 0.5 },
  { x: 16, delay: 0.1, dur: 3.3, size: 20, sway: -75, rotate: 210, opacity: 0.6 },
  { x: 21, delay: 0.7, dur: 3.6, size: 12, sway: 55, rotate: 190, opacity: 0.45 },
  { x: 26, delay: 0.35, dur: 3, size: 17, sway: -85, rotate: 230, opacity: 0.5 },
  { x: 31, delay: 0.9, dur: 3.9, size: 14, sway: 65, rotate: 205, opacity: 0.5 },
  { x: 36, delay: 0.15, dur: 3.2, size: 19, sway: -55, rotate: 220, opacity: 0.55 },
  { x: 41, delay: 0.6, dur: 3.5, size: 13, sway: 90, rotate: 185, opacity: 0.45 },
  { x: 46, delay: 1, dur: 3.7, size: 16, sway: -70, rotate: 235, opacity: 0.5 },
  { x: 51, delay: 0.3, dur: 3.1, size: 21, sway: 60, rotate: 215, opacity: 0.6 },
  { x: 56, delay: 0.8, dur: 3.6, size: 12, sway: -80, rotate: 195, opacity: 0.45 },
  { x: 61, delay: 0.05, dur: 3.3, size: 17, sway: 75, rotate: 225, opacity: 0.55 },
  { x: 66, delay: 0.55, dur: 3.9, size: 14, sway: -65, rotate: 210, opacity: 0.5 },
  { x: 71, delay: 1.1, dur: 3.4, size: 18, sway: 80, rotate: 190, opacity: 0.55 },
  { x: 76, delay: 0.2, dur: 3, size: 13, sway: -90, rotate: 240, opacity: 0.45 },
  { x: 81, delay: 0.65, dur: 3.7, size: 16, sway: 70, rotate: 200, opacity: 0.5 },
  { x: 86, delay: 0.4, dur: 3.2, size: 20, sway: -60, rotate: 220, opacity: 0.6 },
  { x: 91, delay: 0.95, dur: 3.5, size: 12, sway: 85, rotate: 205, opacity: 0.45 },
  { x: 96, delay: 0.15, dur: 3.3, size: 15, sway: -75, rotate: 230, opacity: 0.5 },
  { x: 99, delay: 0.7, dur: 3.1, size: 14, sway: 65, rotate: 215, opacity: 0.5 },
  { x: 4, delay: 1.2, dur: 3.8, size: 15, sway: -55, rotate: 185, opacity: 0.5 },
  { x: 94, delay: 1.3, dur: 3.6, size: 13, sway: 75, rotate: 235, opacity: 0.45 },
  { x: 8, delay: 1.45, dur: 3.4, size: 17, sway: -70, rotate: 210, opacity: 0.55 },
]

const wave = ref(0)
const visible = ref(false)
let timer = 0

function onBurst() {
  visible.value = false
  // 下一帧重挂载以重启动画
  requestAnimationFrame(() => {
    wave.value += 1
    visible.value = true
    window.clearTimeout(timer)
    timer = window.setTimeout(() => (visible.value = false), 4200)
  })
}

onMounted(() => window.addEventListener(LUNATIC_BURST_EVENT, onBurst))
onBeforeUnmount(() => {
  window.removeEventListener(LUNATIC_BURST_EVENT, onBurst)
  window.clearTimeout(timer)
})
</script>

<template>
  <Teleport to="body">
    <div v-if="visible" :key="wave" :class="$style.overlay" aria-hidden="true">
      <svg
        v-for="(p, i) in PETALS"
        :key="i"
        viewBox="0 0 24 24"
        :class="$style.petal"
        :style="{
          left: `${p.x}%`,
          width: `${p.size}px`,
          height: `${p.size}px`,
          animationDelay: `${p.delay}s`,
          animationDuration: `${p.dur}s`,
          '--sway': `${p.sway}px`,
          '--rotate': `${p.rotate}deg`,
          '--petal-opacity': p.opacity,
        }"
      >
        <path d="M12 2 C17.5 7.5 17.5 16.5 12 22 C6.5 16.5 6.5 7.5 12 2 Z" fill="currentColor" />
      </svg>
    </div>
  </Teleport>
</template>

<style module lang="scss">
.overlay {
  position: fixed;
  inset: 0;
  z-index: 120;
  overflow: hidden;
  pointer-events: none;
}

.petal {
  position: absolute;
  top: -28px;
  color: var(--c-accent);
  opacity: 0;
  will-change: transform, opacity;
  animation: burst-fall linear 1 both;
  animation-play-state: paused;
}

@include motion-safe {
  .petal {
    animation-play-state: running;
  }
}

@keyframes burst-fall {
  0% {
    transform: translate3d(0, 0, 0) rotate(0deg);
    opacity: 0;
  }

  12% {
    opacity: var(--petal-opacity, 0.5);
  }

  85% {
    opacity: var(--petal-opacity, 0.5);
  }

  100% {
    transform: translate3d(var(--sway, 60px), 112vh, 0) rotate(var(--rotate, 220deg));
    opacity: 0;
  }
}
</style>
