<script setup lang="ts">
// 批改工作台中栏：PDF 答卷 / Markdown 文本预览（exam.md §3 中栏 + §4 PDF.js）
import { ref, watch } from 'vue'
import { usePdfViewer } from '@/composables/usePdfViewer'
import { shortId } from '@/utils/format'
import type { AdminQueueItem } from '@/types'
import MarkdownView from '@/components/molecules/MarkdownView.vue'
import SkeletonBox from '@/components/atoms/SkeletonBox.vue'
import EmptyState from '@/components/atoms/EmptyState.vue'

const props = defineProps<{ item: AdminQueueItem | null }>()

const containerRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const { loadPDF, nextPage, prevPage, totalPages, currentPage, loading, error, cleanup } =
  usePdfViewer(canvasRef, containerRef)

const isPdf = () => Boolean(props.item?.attachment_url?.toLowerCase().endsWith('.pdf'))

// 切换选中项：PDF 则加载渲染（旧文档在 loadPDF 内自动销毁）；文本/空则显式释放已加载文档
watch(
  () => props.item,
  (item) => {
    if (item && isPdf()) void loadPDF(item.attachment_url!)
    else cleanup()
  },
)
</script>

<template>
  <div :class="$style.panel">
    <template v-if="item">
      <header :class="$style.head">
        <h2 :class="$style.headTitle">{{ item.question_title || shortId(item.question_id) }}</h2>
        <p :class="$style.headMeta">
          {{ item.username }} · {{ item.attachment_name || '文本答案' }}
        </p>
      </header>

      <div ref="containerRef" :class="$style.body">
        <!-- PDF 答卷 -->
        <template v-if="isPdf()">
          <div v-if="loading" :class="$style.pdfSkeleton">
            <SkeletonBox height="100%" width="100%" />
            <p :class="$style.pdfHint">正在加载 PDF…</p>
          </div>
          <div v-else-if="error" :class="$style.pdfError">
            <EmptyState title="PDF 加载失败" description="请点击附件链接在新窗口查看。" />
          </div>
          <div v-else :class="$style.pdfWrap">
            <!-- PDF 纸张始终为白色（暗色模式下不变） -->
            <canvas ref="canvasRef" :class="$style.pdfCanvas" aria-label="PDF 答卷预览" />
            <div v-if="totalPages > 1" :class="$style.pageControls">
              <button
                type="button"
                :class="$style.pageBtn"
                :disabled="currentPage <= 1"
                aria-label="上一页"
                @click="prevPage"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
              </button>
              <span :class="$style.pageInfo">{{ currentPage }} / {{ totalPages }}</span>
              <button
                type="button"
                :class="$style.pageBtn"
                :disabled="currentPage >= totalPages"
                aria-label="下一页"
                @click="nextPage"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>
              </button>
            </div>
          </div>
        </template>

        <!-- 文本答案（Markdown） -->
        <MarkdownView v-else-if="item.content" :content="item.content" />
        <div v-else :class="$style.pdfError">
          <EmptyState title="无作答内容" description="该提交没有文本答案，也没有 PDF 附件。" />
        </div>
      </div>
    </template>

    <div v-else :class="$style.empty">
      <EmptyState title="未选中提交" description="从左侧队列选择一份答卷开始批改。" />
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

.head {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--c-border);
}

.headTitle {
  font-size: 1.0625rem;
  letter-spacing: -0.01em;
  @include line-clamp(1);
}

.headMeta {
  margin-top: 0.25rem;
  font-family: var(--font-mono);
  font-size: var(--fs-meta);
  color: var(--c-slate);
}

.body {
  flex: 1;
  min-height: 0;
  padding: 1.5rem;
  overflow-y: auto;
}

.pdfSkeleton {
  position: relative;
  min-height: 400px;
  border-radius: var(--r-sm);
  overflow: hidden;
}

.pdfHint {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--c-slate);
  font-size: 0.875rem;
}

.pdfWrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border-radius: var(--r-sm);
  background: rgba(148, 163, 184, 0.12);
}

.pdfCanvas {
  display: block;
  max-width: 100%;
  background: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.18);
}

.pageControls {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
}

.pageBtn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--r-full);
  background: var(--c-surface-2);
  color: var(--c-ink);
  transition: background-color $dur var(--ease-out), color $dur var(--ease-out);

  &:hover:not(:disabled) {
    background: var(--c-accent-soft);
    color: var(--c-accent);
  }

  &:disabled {
    opacity: 0.35;
    cursor: default;
  }

  svg {
    width: 18px;
    height: 18px;
  }
}

.pageInfo {
  font-family: var(--font-mono);
  font-size: var(--fs-meta);
  color: var(--c-slate);
}

.pdfError,
.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-height: 320px;
}
</style>
