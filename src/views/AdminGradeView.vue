<script setup lang="ts">
// 教师批改工作台（exam.md §3）：三栏沉浸式布局
// 左栏队列（状态筛选 + 分页）· 中栏 PDF/Markdown 预览 · 右栏打分面板
// 键盘 ←/→ 切换批改对象；提交后自动跳到下一项
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useUiStore } from '@/stores/ui'
import { fetchAdminQueue, gradeSubmission } from '@/api/submissions'
import { usePagedList } from '@/composables/usePagedList'
import type { AdminQueueItem, SubmissionStatus } from '@/types'
import SubmissionQueue from '@/components/organisms/SubmissionQueue.vue'
import SubmissionPreview from '@/components/organisms/SubmissionPreview.vue'
import GradingPanel from '@/components/organisms/GradingPanel.vue'
import EmptyState from '@/components/atoms/EmptyState.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'

const ui = useUiStore()

const filter = ref<SubmissionStatus>('pending')
const selectedId = ref<string | null>(null)
const saving = ref(false)
/** 批改成功的短暂动效（中栏绿色脉冲） */
const successPulse = ref(false)
let pulseTimer: ReturnType<typeof setTimeout> | null = null

const queue = usePagedList<AdminQueueItem>((page) =>
  fetchAdminQueue({ status: filter.value, page, limit: 10 }),
)

const items = queue.items
const pagination = queue.pagination
const loading = queue.loading
const queueError = queue.error

const selected = computed(() => items.value.find((i) => i.id === selectedId.value) ?? null)

// 列表变化后保持有效选中（无选中则自动选第一项）
watch(items, (list) => {
  if (!list.length) {
    selectedId.value = null
    return
  }
  if (!list.some((i) => i.id === selectedId.value)) selectedId.value = list[0].id
})

watch(filter, () => {
  selectedId.value = null
  void queue.load(1)
})

onMounted(() => {
  void queue.load(1)
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  if (pulseTimer) clearTimeout(pulseTimer)
})

// ---------- 键盘 ←/→ 切换（输入框内、保存中、带修饰键时不响应） ----------

function onKeydown(e: KeyboardEvent) {
  const target = e.target as HTMLElement | null
  if (target?.closest('input, textarea, select, [contenteditable]')) return
  if (e.metaKey || e.ctrlKey || e.altKey) return
  if (saving.value || !items.value.length) return

  const idx = items.value.findIndex((i) => i.id === selectedId.value)
  if (e.key === 'ArrowLeft') {
    e.preventDefault()
    const prev = idx <= 0 ? items.value.length - 1 : idx - 1
    selectedId.value = items.value[prev].id
  } else if (e.key === 'ArrowRight') {
    e.preventDefault()
    const next = idx < 0 ? 0 : (idx + 1) % items.value.length
    selectedId.value = items.value[next].id
  }
}

// ---------- 批改提交：成功后移除本项并跳到同位置下一项 ----------

async function onGrade(payload: { score: number; comment: string }) {
  const current = selectedId.value
  if (!current || saving.value) return
  saving.value = true
  try {
    await gradeSubmission(current, payload)
    ui.toast(`已批改：${payload.score} 分`, 'success')
    pulse()
    const idx = items.value.findIndex((i) => i.id === current)
    queue.removeItem(current)
    const remaining = items.value
    if (remaining.length) {
      // 选中同位置的下一条（最后一格则选最后一条）
      selectedId.value = remaining[Math.min(idx, remaining.length - 1)].id
    } else {
      // 本页清空：跳到上一页继续批改（总数为 0 时重拉本页）
      selectedId.value = null
      const target = Math.max(1, Math.min(pagination.value.page, pagination.value.pages))
      void queue.load(target)
    }
  } catch {
    // 拦截器已提示
  } finally {
    saving.value = false
  }
}

function pulse() {
  successPulse.value = true
  if (pulseTimer) clearTimeout(pulseTimer)
  pulseTimer = setTimeout(() => (successPulse.value = false), 600)
}
</script>

<template>
  <div :class="$style.page">
    <header class="pageHead" v-reveal>
      <h1 class="pageTitle">批改工作台</h1>
      <p class="pageSub">键盘 ←/→ 快速切换批改对象，提交后自动跳转下一份。</p>
    </header>

    <div
      :class="[$style.workbench, { [$style.successPulse]: successPulse }]"
      v-reveal="40"
    >
      <SubmissionQueue
        :items="items"
        :selected-id="selectedId"
        :filter="filter"
        :loading="loading"
        :page="pagination.page"
        :pages="pagination.pages"
        :total="pagination.total"
        @select="(id) => (selectedId = id)"
        @update:filter="(s) => (filter = s)"
        @change="(p) => queue.load(p)"
      />

      <div :class="$style.middle">
        <SubmissionPreview v-if="selected" :item="selected" />
        <div v-else-if="queueError" :class="$style.state">
          <EmptyState title="队列加载失败" description="网络似乎开小差了。">
            <template #action>
              <BaseButton variant="outline" @click="queue.load(pagination.page)">重新加载</BaseButton>
            </template>
          </EmptyState>
        </div>
        <div v-else :class="$style.state">
          <EmptyState
            title="队列已清空"
            :description="filter === 'pending' ? '暂无待批改的提交。' : '暂无已批改的提交。'"
          />
        </div>
      </div>

      <GradingPanel :item="selected" :saving="saving" @submit="onGrade" />
    </div>
  </div>
</template>

<style module lang="scss">
.page {
  @include container;
  padding-top: var(--space-section);
}

.workbench {
  display: grid;
  grid-template-columns: minmax(240px, 300px) minmax(0, 1fr) 320px;
  gap: 1.25rem;
  align-items: stretch;
  height: calc(100dvh - #{$navbar-height} - 9.5rem);
  min-height: 560px;
  margin-top: 2.5rem;
  border-radius: var(--r-card);

  @media (max-width: $bp-desktop - 1) {
    grid-template-columns: 260px minmax(0, 1fr);
  }

  @media (max-width: $bp-tablet - 1) {
    grid-template-columns: 1fr;
    height: auto;
  }
}

// 提交成功的短暂脉冲动效（覆盖三栏）
.successPulse {
  animation: pulseGlow 0.6s var(--ease-out);
}

@keyframes pulseGlow {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
  }
  30% {
    box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.25);
  }
}

.middle {
  display: flex;
  min-width: 0;
  min-height: 0;

  > * {
    flex: 1;
    min-width: 0;
  }
}

.state {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-card);
  box-shadow: var(--shadow-card);
}
</style>
