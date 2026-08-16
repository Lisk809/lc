<script setup lang="ts">
import { ref } from 'vue'
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

const title = ref('')
const content = ref('')
/** 参考答案（markdown，'' 表示不设置） */
const answer = ref('')
const file = ref<File | null>(null)
const uploadProgress = ref(0)
const submitting = ref(false)
const attempted = ref(false)
const submitError = ref('')

async function submit() {
  attempted.value = true
  if (!title.value.trim()) {
    submitError.value = '请填写标题'
    return
  }
  if (!content.value.trim()) {
    submitError.value = '请填写题目内容'
    return
  }
  submitError.value = ''
  submitting.value = true
  uploadProgress.value = 0
  try {
    const form = new FormData()
    form.append('title', title.value.trim())
    form.append('content', content.value.trim())
    if (answer.value.trim()) form.append('answer', answer.value.trim())
    if (file.value) form.append('file', file.value)
    await questionStore.createQuestion(form, (p) => (uploadProgress.value = p))
    ui.toast('题目已创建（草稿），可在题库详情中发布', 'success')
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
      <p class="pageSub">题目与参考答案均支持 markdown。创建后默认为草稿，仅管理员可见，发布后全站开放。</p>
    </header>

    <form v-reveal="80" :class="$style.form" @submit.prevent="submit">
      <BaseInput
        v-model="title"
        label="标题"
        placeholder="一句话概括这道题"
        :error="attempted && !title.trim() ? '请填写标题' : undefined"
      />

      <div :class="$style.field">
        <label :class="$style.label">题目</label>
        <MarkdownEditor v-model="content" />
        <p v-if="attempted && !content.trim()" :class="$style.error">请填写题目内容</p>
      </div>

      <div :class="$style.field">
        <label :class="$style.label">参考答案（可选）</label>
        <MarkdownEditor v-model="answer" />
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
