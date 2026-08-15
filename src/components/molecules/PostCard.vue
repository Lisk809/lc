<script setup lang="ts">
import { computed } from 'vue'
import type { Post } from '@/types'
import { formatRelativeTime, shortId, stripMarkdown } from '@/utils/format'
import AppAvatar from '@/components/atoms/AppAvatar.vue'

const props = defineProps<{ post: Post }>()

const excerpt = computed(() => stripMarkdown(props.post.content, 120))
</script>

<template>
  <RouterLink :to="`/posts/${post.id}`" :class="$style.card">
    <h3 :class="$style.title">{{ post.title }}</h3>
    <p :class="$style.excerpt">{{ excerpt }}</p>
    <div :class="$style.meta">
      <span :class="$style.author">
        <AppAvatar :name="post.author?.username || post.user_id" :url="post.author?.avatar_url" :size="22" />
        <span :class="$style.authorName">{{ post.author?.username || shortId(post.user_id) }}</span>
      </span>
      <time :class="$style.time">{{ formatRelativeTime(post.created_at) }}</time>
      <span :class="$style.stats">
        <span v-if="post.attachment_url" :class="$style.stat" aria-label="有附件">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" /></svg>
        </span>
        <span :class="$style.stat">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
          {{ post.likes_count }}
        </span>
        <span :class="$style.stat">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg>
          {{ post.reply_count }}
        </span>
      </span>
    </div>
  </RouterLink>
</template>

<style module lang="scss">
.card {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  height: 100%;
  padding: 1.5rem;
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

.meta {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  margin-top: auto;
  color: var(--c-slate);
}

.author {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  min-width: 0;
}

.authorName {
  font-size: var(--fs-meta);
  color: var(--c-steel);
}

.time {
  font-family: var(--font-mono);
  font-size: var(--fs-meta);
  white-space: nowrap;
}

.stats {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  margin-left: auto;
}

.stat {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-family: var(--font-mono);
  font-size: var(--fs-meta);
  font-variant-numeric: tabular-nums;

  svg {
    width: 14px;
    height: 14px;
  }
}
</style>
