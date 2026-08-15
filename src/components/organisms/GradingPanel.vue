<script setup lang="ts">
// 批改工作台右栏：分数（滑块 + 数字输入）+ 快捷评语模板 + 提交（exam.md §3 右栏）
import { ref, watch } from 'vue'
import type { AdminQueueItem } from '@/types'
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'

const props = defineProps<{ item: AdminQueueItem | null; saving: boolean }>()
const emit = defineEmits<{ submit: [payload: { score: number; comment: string }] }>()

const score = ref(80)
const comment = ref('')

const TEMPLATES = [
  '步骤完整，计算无误',
  '注意单位换算',
  '思路正确，细节需加强',
  '平衡与配平需再检查',
  '审题要更仔细',
]

// 切换选中项：从已有批改预填（便于改分），否则回默认值
watch(
  () => props.item,
  (item) => {
    score.value = item?.grade?.score ?? 80
    comment.value = item?.grade?.comment ?? ''
  },
)

function clampScore(v: number) {
  if (Number.isNaN(v)) return
  score.value = Math.min(100, Math.max(0, Math.round(v)))
}

function onRange(e: Event) {
  clampScore(Number((e.target as HTMLInputElement).value))
}

function onScoreInput(v: string) {
  if (v === '') {
    score.value = 0
    return
  }
  clampScore(Number(v))
}

function applyTemplate(t: string) {
  comment.value = comment.value ? `${comment.value}；${t}` : t
}

function submit() {
  emit('submit', { score: score.value, comment: comment.value.trim() })
}
</script>

<template>
  <div :class="$style.panel">
    <template v-if="item">
      <p :class="$style.label">SCORE</p>
      <p :class="$style.scoreValue">{{ score }}<span :class="$style.scoreUnit"> 分</span></p>

      <input
        type="range"
        min="0"
        max="100"
        step="1"
        :value="score"
        :class="$style.range"
        aria-label="分数滑块"
        @input="onRange"
      />
      <div :class="$style.scoreInput">
        <BaseInput
          :model-value="String(score)"
          type="number"
          label="分数"
          @update:model-value="onScoreInput"
        />
      </div>

      <p :class="$style.label">COMMENT</p>
      <div :class="$style.templates">
        <button
          v-for="t in TEMPLATES"
          :key="t"
          type="button"
          :class="$style.chip"
          @click="applyTemplate(t)"
        >
          {{ t }}
        </button>
      </div>

      <BaseInput
        v-model="comment"
        textarea
        :rows="5"
        placeholder="评语（可选，支持 Markdown）…"
      />

      <div :class="$style.actions">
        <BaseButton block :loading="saving" @click="submit">
          {{ item.grade ? '更新批改' : '提交批改' }}
        </BaseButton>
        <p :class="$style.hint">提交后自动跳转队列下一项（←/→ 键切换）</p>
      </div>
    </template>

    <div v-else :class="$style.empty">
      <p :class="$style.emptyText">从左侧队列选择一份答卷开始批改</p>
    </div>
  </div>
</template>

<style module lang="scss">
.panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: 0;
  padding: 1.5rem;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-card);
  box-shadow: var(--shadow-card);
  overflow-y: auto;
}

.label {
  font-family: var(--font-mono);
  font-size: var(--fs-meta);
  letter-spacing: 0.12em;
  color: var(--c-slate);
}

.scoreValue {
  font-family: var(--font-mono);
  font-size: clamp(2.5rem, 4vw, 3.25rem);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  color: var(--c-accent);
}

.scoreUnit {
  font-size: 1rem;
  font-weight: 500;
  color: var(--c-slate);
}

.range {
  width: 100%;
  height: 4px;
  appearance: none;
  border-radius: var(--r-full);
  background: var(--c-surface-2);
  outline: none;

  &::-webkit-slider-thumb {
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: var(--r-full);
    background: var(--c-accent);
    border: 3px solid var(--c-surface);
    box-shadow: 0 0 0 1px var(--c-accent);
    cursor: pointer;
  }
}

.scoreInput {
  :global(input) {
    font-family: var(--font-mono);
  }
}

.templates {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.chip {
  padding: 0.375rem 0.75rem;
  border: 1px solid var(--c-border-strong);
  border-radius: var(--r-full);
  background: var(--c-surface-2);
  color: var(--c-steel);
  font-size: 0.8125rem;
  transition: color $dur var(--ease-out), border-color $dur var(--ease-out),
    background-color $dur var(--ease-out);

  &:hover {
    color: var(--c-accent);
    border-color: var(--c-accent);
    background: var(--c-accent-soft);
  }
}

.actions {
  display: grid;
  gap: 0.625rem;
  margin-top: auto;
  padding-top: 0.5rem;
}

.hint {
  color: var(--c-slate);
  font-size: 0.75rem;
  text-align: center;
}

.empty {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-height: 320px;
}

.emptyText {
  color: var(--c-slate);
  font-size: 0.875rem;
}
</style>
