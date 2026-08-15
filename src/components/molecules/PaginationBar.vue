<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ page: number; pages: number; total?: number }>()
const emit = defineEmits<{ change: [page: number] }>()

type PageItem = number | '…'

const items = computed<PageItem[]>(() => {
  const { page, pages } = props
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1)
  const set = new Set<number>([1, pages, page - 1, page, page + 1])
  const nums = [...set].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b)
  const out: PageItem[] = []
  let prev = 0
  for (const n of nums) {
    if (n - prev > 1) out.push('…')
    out.push(n)
    prev = n
  }
  return out
})
</script>

<template>
  <nav v-if="pages > 1" :class="$style.pager" aria-label="分页导航">
    <button
      type="button"
      :class="$style.navBtn"
      :disabled="page <= 1"
      aria-label="上一页"
      @click="emit('change', page - 1)"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
    </button>

    <template v-for="(item, i) in items" :key="i">
      <span v-if="item === '…'" :class="$style.dots">…</span>
      <button
        v-else
        type="button"
        :class="[$style.num, { [$style.current]: item === page }]"
        :aria-current="item === page ? 'page' : undefined"
        @click="emit('change', item)"
      >
        {{ item }}
      </button>
    </template>

    <button
      type="button"
      :class="$style.navBtn"
      :disabled="page >= pages"
      aria-label="下一页"
      @click="emit('change', page + 1)"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
    </button>

    <span v-if="total" :class="$style.total">共 {{ total }} 条</span>
  </nav>
</template>

<style module lang="scss">
.pager {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  flex-wrap: wrap;
  padding: 0.5rem;
}

.navBtn,
.num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  height: 44px;
  padding: 0 0.5rem;
  border-radius: var(--r-md);
  font-family: var(--font-mono);
  font-size: var(--fs-meta);
  color: var(--c-steel);
  transition: background-color $dur var(--ease-out), color $dur var(--ease-out),
    transform $dur-fast var(--ease-out);

  &:hover:not(:disabled) {
    background: var(--c-surface-2);
    color: var(--c-ink);
  }

  &:active:not(:disabled) {
    transform: translateY(1px) scale(0.98);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  svg {
    width: 16px;
    height: 16px;
  }
}

.current {
  background: var(--c-accent-soft);
  color: var(--c-accent);
  font-weight: 500;
}

.dots {
  color: var(--c-slate);
  font-family: var(--font-mono);
  font-size: var(--fs-meta);
  padding: 0 0.25rem;
}

.total {
  margin-left: 0.75rem;
  color: var(--c-slate);
  font-family: var(--font-mono);
  font-size: var(--fs-meta);
}
</style>
