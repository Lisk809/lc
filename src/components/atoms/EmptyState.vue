<script setup lang="ts">
import YinYangMark from '@/components/atoms/YinYangMark.vue'

defineProps<{ title: string; description?: string }>()
</script>

<template>
  <div :class="$style.empty">
    <YinYangMark :class="$style.mark" />
    <p :class="$style.title">{{ title }}</p>
    <p v-if="description" :class="$style.desc">{{ description }}</p>
    <div v-if="$slots.action" :class="$style.action">
      <slot name="action" />
    </div>
  </div>
</template>

<style module lang="scss">
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 3rem 1.5rem;
}

.mark {
  width: 56px;
  height: 56px;
  color: var(--c-slate);
  opacity: 0.8;
}

.title {
  margin-top: 1.25rem;
  font-weight: 700;
  font-size: 1.0625rem;
  color: var(--c-ink);
}

.desc {
  margin-top: 0.5rem;
  max-width: 40ch;
  color: var(--c-steel);
  font-size: 0.9375rem;
}

.action {
  margin-top: 1.5rem;
}
</style>
