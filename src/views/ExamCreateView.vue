<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useExamStore } from '@/stores/exams'
import { useUiStore } from '@/stores/ui'
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import MarkdownEditor from '@/components/molecules/MarkdownEditor.vue'
import FileDropZone from '@/components/molecules/FileDropZone.vue'

const router = useRouter()
const examStore = useExamStore()
const ui = useUiStore()

const title = ref('')
/** 说明（markdown，可选） */
const description = ref('')
const paperFile = ref<File | null>(null)
const sheetFile = ref<File | null>(null)
const uploadProgress = ref(0)
const submitting = ref(false)
const attempted = ref(false)
const submitError = ref('')

async function submit() {
  attempted.value = true
  if (!title.value.trim()) {
    submitError.value = '请填写联考标题'
    return
  }
  if (!paperFile.value) {
    submitError.value = '试卷 PDF 为必传项'
    return
  }
  if (!sheetFile.value) {
    submitError.value = '答题卡 PDF 为必传项'
    return
  }
  submitError.value = ''
  submitting.value = true
  uploadProgress.value = 0
  try {
    const form = new FormData()
    form.append('title', title.value.trim())
    if (description.value.trim()) form.append('description', description.value.trim())
    form.append('paper', paperFile.value)
    form.append('sheet', sheetFile.value)
    await examStore.createExam(form, (p) => (uploadProgress.value = p))
    ui.toast('联考创建成功（未发布）', 'success')
    router.push('/exams')
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
      <h1 class="pageTitle">创建联考</h1>
      <p class="pageSub">上传试卷与答题卡 PDF。创建后默认为未发布，发布后全站可见并开放答卷提交。</p>
    </header>

    <form v-reveal="80" :class="$style.form" @submit.prevent="submit">
      <BaseInput
        v-model="title"
        label="标题"
        placeholder="如：2026 暑假集训第一次联考"
        :error="attempted && !title.trim() ? '请填写联考标题' : undefined"
      />

      <div :class="$style.field">
        <label :class="$style.label">说明（可选）</label>
        <MarkdownEditor v-model="description" />
      </div>

      <div :class="$style.field">
        <label :class="$style.label">试卷 PDF（必传）</label>
        <FileDropZone mode="select" compact :accept="['.pdf']" @select="(f) => (paperFile = f)" />
        <p v-if="attempted && !paperFile" :class="$style.error">试卷 PDF 为必传项</p>
      </div>

      <div :class="$style.field">
        <label :class="$style.label">答题卡 PDF（必传）</label>
        <FileDropZone mode="select" compact :accept="['.pdf']" @select="(f) => (sheetFile = f)" />
        <p v-if="attempted && !sheetFile" :class="$style.error">答题卡 PDF 为必传项</p>
      </div>

      <div v-if="uploadProgress > 0 && uploadProgress < 100" :class="$style.progressRow">
        <div :class="$style.progressTrack" role="progressbar" :aria-valuenow="uploadProgress" aria-valuemin="0" aria-valuemax="100">
          <div :class="$style.progressFill" :style="{ transform: `scaleX(${uploadProgress / 100})` }" />
        </div>
        <span :class="$style.progressText">{{ uploadProgress }}%</span>
      </div>

      <div v-if="submitError" :class="$style.formError" role="alert">{{ submitError }}</div>

      <div :class="$style.actions">
        <BaseButton type="submit" size="lg" :loading="submitting">创建联考</BaseButton>
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
