<script setup lang="ts">
import { useRouter } from 'vue-router'
import BaseButton from '@/components/atoms/BaseButton.vue'
import SakuraPetals from '@/components/molecules/SakuraPetals.vue'

const router = useRouter()
</script>

<template>
  <div :class="$style.page">
    <SakuraPetals />
    <p class="eyebrow">SPELL CARD · 梦想封印</p>
    <p :class="$style.code">404</p>
    <h1 :class="$style.title">这张符卡不存在</h1>
    <p :class="$style.sub">你访问的符卡不存在或已被回收。</p>
    <BaseButton size="lg" @click="router.push('/')">返回首页</BaseButton>
  </div>
</template>

<style module lang="scss">
.page {
  @include container;
  position: relative;
  min-height: min(70dvh, 800px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  text-align: center;
}

.code {
  font-family: var(--font-mono);
  font-size: clamp(5rem, 14vw, 9rem);
  font-weight: 700;
  letter-spacing: -0.04em;
  color: var(--c-accent-soft);
  line-height: 1;
  user-select: none;
}

.title {
  font-size: var(--fs-h2);
  letter-spacing: -0.02em;
}

.sub {
  color: var(--c-steel);
  margin-bottom: 0.5rem;
}
</style>
