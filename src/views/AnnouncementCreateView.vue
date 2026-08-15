<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { createAnnouncement } from '@/api/announcements'
import { useUiStore } from '@/stores/ui'
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import MarkdownEditor from '@/components/molecules/MarkdownEditor.vue'

const router = useRouter()
const ui = useUiStore()

const title = ref('')
const content = ref('')
const submitting = ref(false)
const attempted = ref(false)
const submitError = ref('')

async function submit() {
  attempted.value = true
  if (!title.value.trim()) {
    submitError.value = '请填写公告标题'
    return
  }
  if (!content.value.trim()) {
    submitError.value = '请填写公告内容'
    return
  }
  submitError.value = ''
  submitting.value = true
  try {
    await createAnnouncement({
      title: title.value.trim(),
      content: content.value.trim(),
    })
    ui.toast('公告已发布', 'success')
    router.push('/announcements')
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
      <p class="eyebrow">博丽神社 · ADMIN</p>
      <h1 class="pageTitle">发布公告</h1>
      <p class="pageSub">公告将展示在公告列表与首页动态条中。</p>
    </header>

    <form v-reveal="80" :class="$style.form" @submit.prevent="submit">
      <BaseInput
        v-model="title"
        label="标题"
        placeholder="公告标题"
        :error="attempted && !title.trim() ? '请填写公告标题' : undefined"
      />

      <div :class="$style.field">
        <label :class="$style.label">内容</label>
        <MarkdownEditor v-model="content" />
        <p v-if="attempted && !content.trim()" :class="$style.error">请填写公告内容</p>
      </div>

      <div v-if="submitError" :class="$style.formError" role="alert">{{ submitError }}</div>

      <div :class="$style.actions">
        <BaseButton type="submit" size="lg" :loading="submitting">发布公告</BaseButton>
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
</style>
