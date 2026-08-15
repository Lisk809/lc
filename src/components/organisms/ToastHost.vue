<script setup lang="ts">
import { useUiStore } from '@/stores/ui'

const ui = useUiStore()
</script>

<template>
  <Teleport to="body">
    <div :class="$style.host" aria-live="polite">
      <TransitionGroup name="toast">
        <div v-for="t in ui.toasts" :key="t.id" :class="[$style.toast, $style[t.type]]" role="status">
          <svg v-if="t.type === 'success'" :class="$style.icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
          <svg v-else-if="t.type === 'error'" :class="$style.icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
          <svg v-else :class="$style.icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
          <p :class="$style.msg">{{ t.message }}</p>
          <button type="button" :class="$style.close" aria-label="关闭提示" @click="ui.dismiss(t.id)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<style module lang="scss">
.host {
  position: fixed;
  right: 1.5rem;
  bottom: 1.5rem;
  z-index: 110;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.75rem;
  pointer-events: none;

  @media (max-width: $bp-tablet - 1) {
    left: 1rem;
    right: 1rem;
    align-items: stretch;
  }
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  width: min(400px, 100%);
  padding: 0.875rem 1rem;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-md);
  box-shadow: var(--shadow-pop);
  pointer-events: auto;
}

.icon {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  margin-top: 0.125rem;
}

.success .icon {
  color: var(--c-accent);
}

.error .icon {
  color: var(--c-danger);
}

.info .icon {
  color: var(--c-steel);
}

.msg {
  flex: 1;
  font-size: 0.9375rem;
  line-height: 1.5;
}

.close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  margin: -0.25rem -0.25rem 0 0;
  border-radius: var(--r-full);
  color: var(--c-slate);
  transition: background-color $dur var(--ease-out), color $dur var(--ease-out);

  &:hover {
    background: var(--c-surface-2);
    color: var(--c-ink);
  }

  svg {
    width: 14px;
    height: 14px;
  }
}

// 提示条过渡（transform/opacity only）
:global(.toast-enter-active),
:global(.toast-leave-active) {
  transition: opacity $dur var(--ease-out), transform $dur var(--ease-spring);
}

:global(.toast-enter-from),
:global(.toast-leave-to) {
  opacity: 0;
  transform: translateY(12px) scale(0.97);
}

:global(.toast-move) {
  transition: transform $dur var(--ease-out);
}
</style>
