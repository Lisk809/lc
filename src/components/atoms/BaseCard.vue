<script setup lang="ts">
import { useCssModule } from 'vue'

withDefaults(defineProps<{ pad?: 'md' | 'lg'; hover?: boolean }>(), { pad: 'md', hover: false })

const styles = useCssModule()
</script>

<template>
  <div :class="[styles.card, styles[pad], { [styles.hover]: hover }]">
    <slot />
  </div>
</template>

<style module lang="scss">
.card {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-card);
  box-shadow: var(--shadow-card);
}

.md {
  padding: 1.5rem;
}

.lg {
  padding: 2.5rem;

  @media (max-width: $bp-tablet - 1) {
    padding: 1.5rem;
  }
}

// 仅卡片类交互使用轻微上浮（DESIGN.md：动画仅 transform/opacity）
.hover {
  transition: transform $dur var(--ease-out), box-shadow $dur var(--ease-out);

  &:hover {
    transform: translateY(-2px);
  }
}
</style>
