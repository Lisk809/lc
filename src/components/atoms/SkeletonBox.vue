<script setup lang="ts">
import { computed } from 'vue'

// 骨架屏：与真实内容同尺寸的占位块 + 扫光（无转圈 loader）
const props = withDefaults(defineProps<{ width?: string; height?: string; radius?: string }>(), {
  width: '100%',
  height: '16px',
  radius: '6px',
})

const style = computed(() => ({
  width: props.width,
  height: props.height,
  borderRadius: props.radius,
}))
</script>

<template>
  <span :class="$style.skeleton" :style="style" aria-hidden="true" />
</template>

<style module lang="scss">
.skeleton {
  position: relative;
  display: block;
  overflow: hidden;
  background: var(--c-surface-2);

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    transform: translateX(-100%);
    background: linear-gradient(
      90deg,
      transparent,
      var(--c-shimmer, rgba(255, 255, 255, 0.55)),
      transparent
    );
    animation: shimmer 1.6s ease-in-out infinite;
  }
}

:global(.dark) .skeleton::after {
  --c-shimmer: rgba(255, 255, 255, 0.07);
}

@keyframes shimmer {
  to {
    transform: translateX(100%);
  }
}
</style>
