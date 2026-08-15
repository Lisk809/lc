<script setup lang="ts">
import BaseButton from '@/components/atoms/BaseButton.vue'
import { useCookieConsent } from '@/composables/useCookieConsent'

const { accepted, accept, decline } = useCookieConsent()
</script>

<template>
  <Transition name="cookie">
    <div
      v-if="accepted === null"
      :class="$style.banner"
      role="dialog"
      aria-label="Cookie 使用提示"
    >
      <p :class="$style.text">
        我们使用 Cookie 保障网站基本功能；经你同意后，还会用 Google Analytics 匿名统计访问情况。
      </p>
      <div :class="$style.actions">
        <BaseButton variant="ghost" size="sm" @click="decline">拒绝</BaseButton>
        <BaseButton variant="primary" size="sm" @click="accept">接受</BaseButton>
      </div>
    </div>
  </Transition>
</template>

<style module lang="scss">
.banner {
  position: fixed;
  left: 1.5rem;
  bottom: 1.5rem;
  z-index: 105;
  display: flex;
  align-items: center;
  gap: 1rem;
  width: min(520px, calc(100vw - 3rem));
  padding: 1rem 1.25rem;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-md);
  box-shadow: var(--shadow-pop);

  @media (max-width: $bp-tablet - 1) {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
    left: 1rem;
    right: 1rem;
    width: auto;
    bottom: 1rem;
  }
}

.text {
  color: var(--c-steel);
  font-size: 0.875rem;
  line-height: 1.6;
}

.actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;

  @media (max-width: $bp-tablet - 1) {
    justify-content: flex-end;
  }
}
</style>

<style lang="scss">
.cookie-enter-active,
.cookie-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.cookie-enter-from,
.cookie-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
</style>
