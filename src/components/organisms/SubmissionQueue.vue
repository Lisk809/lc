<script setup lang="ts">
// 批改工作台左栏：待批改/已批改队列（分页）
import { formatRelativeTime, shortId } from '@/utils/format'
import type { AdminQueueItem, SubmissionStatus } from '@/types'
import SkeletonBox from '@/components/atoms/SkeletonBox.vue'
import PaginationBar from '@/components/molecules/PaginationBar.vue'

defineProps<{
  items: AdminQueueItem[]
  selectedId: string | null
  filter: SubmissionStatus
  loading: boolean
  page: number
  pages: number
  total: number
}>()

const emit = defineEmits<{
  select: [id: string]
  'update:filter': [status: SubmissionStatus]
  change: [page: number]
}>()

const filters: { key: SubmissionStatus; label: string }[] = [
  { key: 'pending', label: '待批改' },
  { key: 'graded', label: '已批改' },
]
</script>

<template>
  <div :class="$style.panel">
    <div :class="$style.filters" role="tablist" aria-label="状态筛选">
      <button
        v-for="f in filters"
        :key="f.key"
        type="button"
        role="tab"
        :aria-selected="filter === f.key"
        :class="[$style.filterTab, { [$style.filterActive]: filter === f.key }]"
        @click="emit('update:filter', f.key)"
      >
        {{ f.label }}
      </button>
    </div>

    <div :class="$style.list">
      <template v-if="loading">
        <div v-for="i in 4" :key="i" :class="$style.skeleton">
          <SkeletonBox height="16px" width="60%" />
          <SkeletonBox height="14px" width="90%" />
        </div>
      </template>
      <template v-else-if="items.length">
        <button
          v-for="item in items"
          :key="item.id"
          type="button"
          :class="[$style.row, { [$style.rowActive]: item.id === selectedId }]"
          :aria-current="item.id === selectedId ? 'true' : undefined"
          @click="emit('select', item.id)"
        >
          <div :class="$style.rowTop">
            <span :class="$style.user">{{ item.username }}</span>
            <span :class="$style.time">{{ formatRelativeTime(item.created_at) }}</span>
          </div>
          <p :class="$style.title">{{ item.question_title || shortId(item.question_id) }}</p>
          <span v-if="item.grade" :class="$style.score">{{ item.grade.score }} 分</span>
        </button>
      </template>
      <p v-else :class="$style.empty">队列已清空 🎉</p>
    </div>

    <div :class="$style.foot">
      <PaginationBar :page="page" :pages="pages" :total="total" @change="(p) => emit('change', p)" />
    </div>
  </div>
</template>

<style module lang="scss">
.panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-card);
  box-shadow: var(--shadow-card);
  overflow: hidden;
}

.filters {
  display: flex;
  gap: 0.375rem;
  padding: 0.75rem;
  border-bottom: 1px solid var(--c-border);
}

.filterTab {
  flex: 1;
  min-height: 38px;
  padding: 0 0.75rem;
  border-radius: var(--r-sm);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--c-steel);
  transition: background-color $dur var(--ease-out), color $dur var(--ease-out);

  &:hover {
    background: var(--c-surface-2);
    color: var(--c-ink);
  }
}

.filterActive {
  background: var(--c-accent-soft);
  color: var(--c-accent);

  &:hover {
    background: var(--c-accent-soft);
    color: var(--c-accent);
  }
}

.list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

.row {
  display: block;
  width: 100%;
  padding: 0.875rem 1rem;
  border-bottom: 1px solid var(--c-border);
  text-align: left;
  transition: background-color $dur var(--ease-out);

  &:hover {
    background: var(--c-surface-2);
  }
}

.rowActive {
  background: var(--c-accent-soft);
  box-shadow: inset 3px 0 0 var(--c-accent);

  &:hover {
    background: var(--c-accent-soft);
  }
}

.rowTop {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.user {
  font-size: 0.875rem;
  font-weight: 600;
}

.time {
  font-family: var(--font-mono);
  font-size: var(--fs-meta);
  color: var(--c-slate);
  white-space: nowrap;
}

.title {
  margin-top: 0.25rem;
  font-size: 0.8125rem;
  color: var(--c-steel);
  @include line-clamp(2);
}

.score {
  display: inline-block;
  margin-top: 0.375rem;
  padding: 0.1rem 0.5rem;
  border-radius: var(--r-full);
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
  font-family: var(--font-mono);
  font-size: var(--fs-meta);
  font-weight: 600;
}

.skeleton {
  display: grid;
  gap: 0.5rem;
  padding: 1rem;
  border-bottom: 1px solid var(--c-border);
}

.empty {
  padding: 2.5rem 1rem;
  text-align: center;
  color: var(--c-slate);
  font-size: 0.875rem;
}

.foot {
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--c-border);
}
</style>
