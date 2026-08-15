<script setup lang="ts">
import type { Reply } from '@/types'
import { fileNameFromUrl, formatRelativeTime, shortId } from '@/utils/format'
import AppAvatar from '@/components/atoms/AppAvatar.vue'
import MarkdownView from '@/components/molecules/MarkdownView.vue'

const props = defineProps<{ reply: Reply }>()

const fileName = props.reply.attachment_url ? fileNameFromUrl(props.reply.attachment_url) : ''
</script>

<template>
  <article :class="$style.reply">
    <div :class="$style.head">
      <span :class="$style.author">
        <AppAvatar :name="reply.author?.username || reply.user_id" :url="reply.author?.avatar_url" :size="32" />
        <span :class="$style.authorName">{{ reply.author?.username || shortId(reply.user_id) }}</span>
      </span>
      <time :class="$style.time">{{ formatRelativeTime(reply.created_at) }}</time>
    </div>
    <MarkdownView :content="reply.content" :class="$style.body" />
    <a
      v-if="reply.attachment_url"
      :href="reply.attachment_url"
      target="_blank"
      rel="noopener noreferrer"
      :class="$style.attach"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5" /><path d="M12 15V3" /></svg>
      {{ fileName }}
    </a>
  </article>
</template>

<style module lang="scss">
.reply {
  padding: 1.25rem 0;
  border-top: 1px solid var(--c-border);

  &:last-child {
    border-bottom: 1px solid var(--c-border);
  }
}

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.625rem;
}

.author {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.authorName {
  font-size: var(--fs-meta);
  color: var(--c-steel);
}

.time {
  font-family: var(--font-mono);
  font-size: var(--fs-meta);
  color: var(--c-slate);
  white-space: nowrap;
}

.body {
  font-size: 0.9688rem;
}

.attach {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  margin-top: 0.625rem;
  min-height: 44px;
  color: var(--c-accent);
  font-size: 0.875rem;
  font-weight: 500;
  transition: color $dur var(--ease-out);

  &:hover {
    color: var(--c-accent-ink);
  }

  svg {
    width: 16px;
    height: 16px;
  }
}
</style>
