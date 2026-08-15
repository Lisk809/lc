<script setup lang="ts">
import { computed } from 'vue'
import type { Question } from '@/types'
import { formatRelativeTime, shortId, stripMarkdown } from '@/utils/format'

const props = defineProps<{ question: Question }>()
const emit = defineEmits<{ open: [question: Question] }>()

const excerpt = computed(() => stripMarkdown(props.question.content, 110))
const preview = computed(() => props.question.options.slice(0, 2))
const moreCount = computed(() => Math.max(0, props.question.options.length - 2))
</script>

<template>
  <button type="button" :class="$style.card" @click="emit('open', question)">
    <h3 :class="$style.title">{{ question.title }}</h3>
    <p :class="$style.excerpt">{{ excerpt }}</p>
    <ul :class="$style.options">
      <li v-for="(opt, i) in preview" :key="i" :class="$style.option">
        <span :class="$style.letter">{{ String.fromCharCode(65 + i) }}</span>
        <span :class="$style.optionText">{{ opt }}</span>
      </li>
      <li v-if="moreCount > 0" :class="$style.more">另有 {{ moreCount }} 个选项</li>
    </ul>
    <div :class="$style.meta">
      <span :class="$style.authorId">{{ shortId(question.user_id) }}</span>
      <time :class="$style.time">{{ formatRelativeTime(question.created_at) }}</time>
      <svg
        v-if="question.attachment_url"
        :class="$style.attach"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-label="有附件"
      ><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>
    </div>
  </button>
</template>

<style module lang="scss">
.card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  height: 100%;
  width: 100%;
  padding: 1.5rem;
  text-align: left;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-card);
  box-shadow: var(--shadow-card);
  transition: transform $dur var(--ease-out), box-shadow $dur var(--ease-out),
    border-color $dur var(--ease-out);

  &:hover {
    transform: translateY(-2px);
    border-color: var(--c-border-strong);
  }
}

.title {
  @include line-clamp(2);
  font-size: 1.0625rem;
  letter-spacing: -0.01em;
}

.excerpt {
  @include line-clamp(2);
  color: var(--c-steel);
  font-size: 0.9375rem;
}

.options {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.375rem;
}

.option {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  min-width: 0;
}

.letter {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: var(--r-full);
  background: var(--c-accent-soft);
  color: var(--c-accent);
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 500;
}

.optionText {
  @include line-clamp(1);
  color: var(--c-steel);
  font-size: 0.875rem;
}

.more {
  color: var(--c-slate);
  font-size: 0.8125rem;
}

.meta {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  margin-top: auto;
  color: var(--c-slate);
}

.authorId,
.time {
  font-family: var(--font-mono);
  font-size: var(--fs-meta);
}

.time {
  margin-left: auto;
}

.attach {
  width: 14px;
  height: 14px;
  color: var(--c-slate);
}
</style>
