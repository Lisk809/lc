<script setup lang="ts">
const props = defineProps<{ options: string[]; answer?: string | null }>()

function isAnswer(option: string, index: number): boolean {
  const a = (props.answer ?? '').trim()
  if (!a) return false
  const letter = String.fromCharCode(65 + index)
  return a === option.trim() || a === letter || a === `${letter}.` || option.trim().startsWith(a)
}
</script>

<template>
  <ol :class="$style.list">
    <li
      v-for="(opt, i) in options"
      :key="i"
      :class="[$style.item, { [$style.answer]: isAnswer(opt, i) }]"
    >
      <span :class="$style.letter">{{ String.fromCharCode(65 + i) }}</span>
      <span :class="$style.text">{{ opt }}</span>
    </li>
  </ol>
</template>

<style module lang="scss">
.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.625rem;
}

.item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  border: 1px solid var(--c-border);
  border-radius: var(--r-md);
  background: var(--c-canvas);
  transition: border-color $dur var(--ease-out), background-color $dur var(--ease-out);
}

.letter {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: var(--r-full);
  background: var(--c-accent-soft);
  color: var(--c-accent);
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  font-weight: 500;
}

.text {
  padding-top: 0.125rem;
  line-height: 1.6;
}

.answer {
  border-color: var(--c-accent);
  background: var(--c-accent-soft);

  .letter {
    background: var(--c-accent);
    color: #fff;
  }
}
</style>
