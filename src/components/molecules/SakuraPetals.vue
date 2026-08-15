<script setup lang="ts">
// 樱花飘落：仅 transform/opacity 动画，纯装饰（aria-hidden），
// prefers-reduced-motion 下整体停用（opacity 保持 0）。
interface Petal {
  x: number
  delay: number
  dur: number
  size: number
  sway: number
  opacity: number
}

const petals: Petal[] = [
  { x: 6, delay: 0, dur: 11, size: 16, sway: 60, opacity: 0.5 },
  { x: 14, delay: 2.5, dur: 13, size: 12, sway: -50, opacity: 0.35 },
  { x: 24, delay: 5, dur: 10, size: 18, sway: 80, opacity: 0.45 },
  { x: 33, delay: 1.2, dur: 14, size: 11, sway: -70, opacity: 0.4 },
  { x: 44, delay: 6.5, dur: 12, size: 15, sway: 55, opacity: 0.5 },
  { x: 55, delay: 3.8, dur: 15, size: 13, sway: -60, opacity: 0.35 },
  { x: 66, delay: 0.8, dur: 11.5, size: 17, sway: 75, opacity: 0.45 },
  { x: 78, delay: 4.4, dur: 13.5, size: 12, sway: -55, opacity: 0.4 },
  { x: 90, delay: 7.2, dur: 10.5, size: 14, sway: 65, opacity: 0.5 },
]
</script>

<template>
  <div :class="$style.wrap" aria-hidden="true">
    <svg
      v-for="(p, i) in petals"
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
        '--petal-opacity': p.opacity,
      }"
    >
      <path d="M12 2 C17.5 7.5 17.5 16.5 12 22 C6.5 16.5 6.5 7.5 12 2 Z" fill="currentColor" />
    </svg>
  </div>
</template>

<style module lang="scss">
.wrap {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.petal {
  position: absolute;
  top: -24px;
  color: var(--c-accent);
  opacity: 0;
  will-change: transform, opacity;
  animation: petal-fall linear infinite;
  animation-play-state: paused;
}

@include motion-safe {
  .petal {
    animation-play-state: running;
  }
}

@keyframes petal-fall {
  0% {
    transform: translate3d(0, 0, 0) rotate(0deg);
    opacity: 0;
  }

  10% {
    opacity: var(--petal-opacity, 0.4);
  }

  80% {
    opacity: var(--petal-opacity, 0.4);
  }

  100% {
    transform: translate3d(var(--sway, 40px), 82vh, 0) rotate(220deg);
    opacity: 0;
  }
}
</style>
