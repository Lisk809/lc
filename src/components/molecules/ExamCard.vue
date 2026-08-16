<script setup lang="ts">
import { computed } from 'vue'
import type { Exam } from '@/types'
import { formatRelativeTime, stripMarkdown } from '@/utils/format'

const props = defineProps<{ exam: Exam }>()
const emit = defineEmits<{ open: [exam: Exam] }>()

const excerpt = computed(() => stripMarkdown(props.exam.description || '', 110))
</script>

<template>
  <button type="button" :class="$style.card" @click="emit('open', exam)">
    <div :class="$style.top">
      <h3 :class="$style.title">{{ exam.title }}</h3>
      <span v-if="exam.status === 'draft'" :class="$style.draftBadge">未发布</span>
    </div>
    <p v-if="excerpt" :class="$style.excerpt">{{ excerpt }}</p>
    <div :class="$style.meta">
      <svg
        :class="$style.attach"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-label="试卷与答题卡 PDF"
      ><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M9 13h6" /><path d="M9 17h4" /></svg>
      <time :class="$style.time">{{ formatRelativeTime(exam.created_at) }}</time>
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

.top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.title {
  @include line-clamp(2);
  font-size: 1.0625rem;
  letter-spacing: -0.01em;
}

.draftBadge {
  flex-shrink: 0;
  padding: 0.1875rem 0.5625rem;
  border-radius: var(--r-full);
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
  font-size: 0.75rem;
  font-weight: 600;
}

.excerpt {
  @include line-clamp(3);
  color: var(--c-steel);
  font-size: 0.9375rem;
}

.meta {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  margin-top: auto;
  color: var(--c-slate);
}

.time {
  margin-left: auto;
  font-family: var(--font-mono);
  font-size: var(--fs-meta);
}

.attach {
  width: 15px;
  height: 15px;
  color: var(--c-slate);
}
</style>
