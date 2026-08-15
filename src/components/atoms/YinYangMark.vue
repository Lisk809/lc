<script setup lang="ts">
// 阴阳玉 × 苯环 融合标志：环与红白半圆为「红白」符号，
// 两个圆点替换为苯环六边形（化学 × 东方）。颜色由 currentColor + --c-accent 驱动。
</script>

<template>
  <svg viewBox="0 0 48 48" fill="none" aria-hidden="true" focusable="false">
    <circle cx="24" cy="24" r="21.5" stroke="currentColor" stroke-width="2" />
    <path
      d="M24 2.5 A21.5 21.5 0 0 1 24 45.5 A10.75 10.75 0 0 1 24 24 A10.75 10.75 0 0 0 24 2.5 Z"
      fill="var(--c-accent)"
    />
    <path
      d="M24 9.05 L27.64 11.15 L27.64 15.35 L24 17.45 L20.36 15.35 L20.36 11.15 Z"
      stroke="var(--c-accent)"
      stroke-width="1.7"
      stroke-linejoin="round"
    />
    <path
      d="M24 30.55 L27.64 32.65 L27.64 36.85 L24 38.95 L20.36 36.85 L20.36 32.65 Z"
      stroke="var(--c-surface)"
      stroke-width="1.7"
      stroke-linejoin="round"
    />
  </svg>
</template>
