<script setup lang="ts">
import { useCssModule } from 'vue'

type ButtonVariant = 'primary' | 'ghost' | 'outline' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

withDefaults(
  defineProps<{
    variant?: ButtonVariant
    size?: ButtonSize
    type?: 'button' | 'submit'
    loading?: boolean
    disabled?: boolean
    block?: boolean
  }>(),
  { variant: 'primary', size: 'md', type: 'button', loading: false, disabled: false, block: false }
)

const styles = useCssModule()
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      styles.btn,
      styles[variant],
      styles[size],
      { [styles.block]: block, [styles.isLoading]: loading },
    ]"
  >
    <span v-if="loading" class="btn-dots" aria-hidden="true"><i /><i /><i /></span>
    <span class="btn-label"><slot /></span>
  </button>
</template>

<style module lang="scss">
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 44px;
  padding: 0.625rem 1.375rem;
  border: 1px solid transparent;
  border-radius: var(--r-full);
  font-weight: 600;
  font-size: 0.9375rem;
  line-height: 1;
  white-space: nowrap;
  user-select: none;
  transition: background-color $dur var(--ease-out), border-color $dur var(--ease-out),
    color $dur var(--ease-out), transform $dur-fast var(--ease-out);

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  :global(.btn-label) {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }

  svg {
    flex-shrink: 0;
  }
}

// 主按钮：强调色填充，悬停背景微移，按下轻微下沉（无外发光）
.primary {
  background: var(--c-accent);
  color: #fff;

  &:hover:not(:disabled) {
    background: var(--c-accent-ink);
  }

  &:active:not(:disabled) {
    transform: translateY(1px) scale(0.99);
  }
}

// 幽灵按钮：弱色底 + 强调色文字
.ghost {
  background: var(--c-accent-soft);
  color: var(--c-accent);

  &:hover:not(:disabled) {
    background: var(--c-accent-hover);
  }

  &:active:not(:disabled) {
    transform: translateY(1px) scale(0.99);
  }
}

// 描边按钮
.outline {
  background: transparent;
  border-color: var(--c-border-strong);
  color: var(--c-ink);

  &:hover:not(:disabled) {
    border-color: var(--c-accent);
    color: var(--c-accent);
    background: var(--c-accent-soft);
  }

  &:active:not(:disabled) {
    transform: translateY(1px) scale(0.99);
  }
}

.danger {
  background: transparent;
  color: var(--c-danger);

  &:hover:not(:disabled) {
    background: var(--c-danger-soft);
  }
}

.sm {
  min-height: 36px;
  padding: 0.375rem 0.875rem;
  font-size: 0.875rem;
}

.md {
  min-height: 44px;
}

.lg {
  min-height: 52px;
  padding: 0.875rem 2rem;
  font-size: 1rem;
}

.block {
  width: 100%;
}

.isLoading {
  pointer-events: none;
}
</style>
