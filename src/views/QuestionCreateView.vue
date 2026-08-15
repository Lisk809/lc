<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useQuestionStore } from '@/stores/questions'
import { useUiStore } from '@/stores/ui'
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import MarkdownEditor from '@/components/molecules/MarkdownEditor.vue'
import FileDropZone from '@/components/molecules/FileDropZone.vue'

const router = useRouter()
const questionStore = useQuestionStore()
const ui = useUiStore()

const MIN_OPTIONS = 2
const MAX_OPTIONS = 6

const title = ref('')
const content = ref('')
const options = ref<string[]>(['', ''])
/** 参考答案：存完整选项文本（'' 表示不设置） */
const answer = ref('')
const file = ref<File | null>(null)
const uploadProgress = ref(0)
const submitting = ref(false)
const attempted = ref(false)
const submitError = ref('')

const trimmedOptions = computed(() => options.value.map((o) => o.trim()))

const optionsError = computed(() => {
  if (!attempted.value) return ''
  if (trimmedOptions.value.some((o) => !o)) return '所有选项均不能为空'
  if (answer.value && !trimmedOptions.value.includes(answer.value)) return '参考答案需匹配其中一个选项'
  return ''
})

const answerChoices = computed(() =>
  trimmedOptions.value.map((text, i) => ({
    value: text,
    label: `${String.fromCharCode(65 + i)}. ${text}`,
  }))
)

// 选项被修改导致答案失效时，自动清除答案
watch(trimmedOptions, (opts) => {
  if (answer.value && !opts.includes(answer.value)) answer.value = ''
})

function addOption() {
  if (options.value.length < MAX_OPTIONS) options.value.push('')
}

function removeOption(index: number) {
  if (options.value.length > MIN_OPTIONS) options.value.splice(index, 1)
}

async function submit() {
  attempted.value = true
  if (!title.value.trim()) {
    submitError.value = '请填写标题'
    return
  }
  if (!content.value.trim()) {
    submitError.value = '请填写题干内容'
    return
  }
  if (trimmedOptions.value.some((o) => !o)) {
    submitError.value = '所有选项均不能为空'
    return
  }
  if (answer.value && !trimmedOptions.value.includes(answer.value)) {
    submitError.value = '参考答案需匹配其中一个选项'
    return
  }
  submitError.value = ''
  submitting.value = true
  uploadProgress.value = 0
  try {
    const form = new FormData()
    form.append('title', title.value.trim())
    form.append('content', content.value.trim())
    form.append('options', JSON.stringify(trimmedOptions.value))
    if (answer.value) form.append('answer', answer.value)
    if (file.value) form.append('file', file.value)
    await questionStore.createQuestion(form, (p) => (uploadProgress.value = p))
    ui.toast('题目已创建', 'success')
    router.push('/questions')
  } catch {
    // 拦截器已提示
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div :class="$style.page">
    <header class="pageHead" v-reveal>
      <h1 class="pageTitle">创建题目</h1>
      <p class="pageSub">支持 {{ MIN_OPTIONS }}-{{ MAX_OPTIONS }} 个选项。答案仅作者与管理员可见，可留空不设答案。</p>
    </header>

    <form v-reveal="80" :class="$style.form" @submit.prevent="submit">
      <BaseInput
        v-model="title"
        label="标题"
        placeholder="一句话概括这道题"
        :error="attempted && !title.trim() ? '请填写标题' : undefined"
      />

      <div :class="$style.field">
        <label :class="$style.label">题干</label>
        <MarkdownEditor v-model="content" />
        <p v-if="attempted && !content.trim()" :class="$style.error">请填写题干内容</p>
      </div>

      <fieldset :class="$style.field">
        <legend :class="$style.label">选项</legend>
        <div :class="$style.optionList">
          <div v-for="(opt, i) in options" :key="i" :class="$style.optionRow">
            <span :class="$style.letter">{{ String.fromCharCode(65 + i) }}</span>
            <BaseInput
              v-model="options[i]"
              :placeholder="`选项 ${String.fromCharCode(65 + i)}`"
              :error="attempted && !opt.trim() ? '不能为空' : undefined"
            />
            <button
              type="button"
              :class="$style.remove"
              :disabled="options.length <= MIN_OPTIONS"
              aria-label="删除该选项"
              @click="removeOption(i)"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
            </button>
          </div>
        </div>
        <p v-if="optionsError" :class="$style.error">{{ optionsError }}</p>
        <div>
          <BaseButton type="button" variant="ghost" size="sm" :disabled="options.length >= MAX_OPTIONS" @click="addOption">
            + 添加选项
          </BaseButton>
        </div>
      </fieldset>

      <div :class="$style.field">
        <label :class="$style.label" for="answer">参考答案（可选，仅作者与管理员可见）</label>
        <select id="answer" v-model="answer" :class="$style.select">
          <option value="">不设置参考答案</option>
          <option v-for="choice in answerChoices" :key="choice.value" :value="choice.value">
            {{ choice.label }}
          </option>
        </select>
      </div>

      <div :class="$style.field">
        <label :class="$style.label">附件（可选）</label>
        <FileDropZone mode="select" @select="(f) => (file = f)" />
      </div>

      <div v-if="uploadProgress > 0 && uploadProgress < 100" :class="$style.progressRow">
        <div :class="$style.progressTrack" role="progressbar" :aria-valuenow="uploadProgress" aria-valuemin="0" aria-valuemax="100">
          <div :class="$style.progressFill" :style="{ transform: `scaleX(${uploadProgress / 100})` }" />
        </div>
        <span :class="$style.progressText">{{ uploadProgress }}%</span>
      </div>

      <div v-if="submitError" :class="$style.formError" role="alert">{{ submitError }}</div>

      <div :class="$style.actions">
        <BaseButton type="submit" size="lg" :loading="submitting">创建题目</BaseButton>
      </div>
    </form>
  </div>
</template>

<style module lang="scss">
.page {
  @include container;
  padding-top: var(--space-section);
}

.form {
  display: grid;
  gap: 1.5rem;
  max-width: 860px;
  margin-top: 2.5rem;
  padding: 2.5rem;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-card);
  box-shadow: var(--shadow-card);

  @media (max-width: $bp-tablet - 1) {
    padding: 1.25rem;
  }
}

.field {
  display: grid;
  gap: 0.5rem;
  min-width: 0;
}

.label {
  font-size: 0.875rem;
  font-weight: 600;
}

.error {
  color: var(--c-danger);
  font-size: 0.8125rem;
}

.optionList {
  display: grid;
  gap: 0.75rem;
}

.optionRow {
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;

  .letter {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: var(--r-full);
    background: var(--c-accent-soft);
    color: var(--c-accent);
    font-family: var(--font-mono);
    font-size: 0.875rem;
    font-weight: 500;
  }
}

.remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: var(--r-full);
  color: var(--c-slate);
  transition: color $dur var(--ease-out), background-color $dur var(--ease-out);

  &:hover:not(:disabled) {
    color: var(--c-danger);
    background: var(--c-danger-soft);
  }

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }

  svg {
    width: 16px;
    height: 16px;
  }
}

.select {
  width: 100%;
  min-height: 44px;
  padding: 0.625rem 0.875rem;
  background: var(--c-surface);
  border: 1px solid var(--c-border-strong);
  border-radius: var(--r-sm);
  color: var(--c-ink);

  &:focus-visible {
    @include focus-ring;
  }
}

.formError {
  padding: 0.75rem 1rem;
  border: 1px solid var(--c-danger);
  border-radius: var(--r-sm);
  background: var(--c-danger-soft);
  color: var(--c-danger);
  font-size: 0.875rem;
}

.actions {
  display: flex;

  @media (max-width: $bp-tablet - 1) {
    display: grid;
  }
}

.progressRow {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.progressTrack {
  position: relative;
  flex: 1;
  height: 4px;
  border-radius: var(--r-full);
  background: var(--c-surface-2);
  overflow: hidden;
}

.progressFill {
  position: absolute;
  inset: 0;
  transform-origin: left center;
  background: var(--c-accent);
  transition: transform 0.2s var(--ease-out);
}

.progressText {
  font-family: var(--font-mono);
  font-size: var(--fs-meta);
  color: var(--c-steel);
}
</style>
