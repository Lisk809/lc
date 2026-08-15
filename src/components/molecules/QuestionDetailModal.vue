<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useUiStore } from '@/stores/ui'
import { fileNameFromUrl, formatDate, shortId } from '@/utils/format'
import { fetchMySubmission, submitAnswer } from '@/api/submissions'
import type { Question, SubmissionDetail } from '@/types'
import MarkdownView from '@/components/molecules/MarkdownView.vue'
import AppAvatar from '@/components/atoms/AppAvatar.vue'
import YinYangMark from '@/components/atoms/YinYangMark.vue'
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import SkeletonBox from '@/components/atoms/SkeletonBox.vue'
import FileDropZone from '@/components/molecules/FileDropZone.vue'

const props = defineProps<{ question: Question | null }>()
const emit = defineEmits<{ close: [] }>()

const route = useRoute()
const user = useUserStore()
const ui = useUiStore()

/** 参考答案默认折叠，点击按钮展开 */
const answerOpen = ref(false)

const hasAnswer = () => Boolean(props.question?.answer?.trim())

const fileName = props.question?.attachment_url
  ? fileNameFromUrl(props.question.attachment_url)
  : ''

// ---------- 提交答案（文本 Markdown 和/或 PDF 答卷） ----------

const submission = ref<SubmissionDetail | null>(null)
const submissionLoading = ref(false)
const textAnswer = ref('')
const answerFile = ref<File | null>(null)
const submitting = ref(false)

function onFileSelected(file: File | null) {
  answerFile.value = file
}

async function loadSubmission(questionId: string) {
  submissionLoading.value = true
  try {
    const res = await fetchMySubmission(questionId)
    // 弹窗已切题则丢弃过期结果
    if (props.question?.id !== questionId) return
    submission.value = res.submission
  } catch {
    submission.value = null
  } finally {
    submissionLoading.value = false
  }
}

async function submit() {
  const q = props.question
  if (!q || submitting.value) return
  if (!textAnswer.value.trim() && !answerFile.value) {
    ui.toast('请填写答案或上传 PDF 答卷', 'error')
    return
  }
  submitting.value = true
  try {
    const form = new FormData()
    form.append('content', textAnswer.value.trim())
    if (answerFile.value) form.append('file', answerFile.value)
    const res = await submitAnswer(q.id, form)
    submission.value = res
    textAnswer.value = ''
    answerFile.value = null
    ui.toast('提交成功，等待批改', 'success')
  } catch {
    // 拦截器已提示
  } finally {
    submitting.value = false
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

watch(
  () => props.question,
  (q) => {
    answerOpen.value = false
    submission.value = null
    textAnswer.value = ''
    answerFile.value = null
    document.body.style.overflow = q ? 'hidden' : ''
    if (q) window.addEventListener('keydown', onKeydown)
    else window.removeEventListener('keydown', onKeydown)
    if (q && user.isLoggedIn) void loadSubmission(q.id)
  }
)

onBeforeUnmount(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="question" :class="$style.overlay" @click.self="emit('close')" @keydown="onKeydown">
        <div :class="$style.dialog" role="dialog" aria-modal="true" :aria-label="question.title" tabindex="-1">
          <header :class="$style.head">
            <h3 :class="$style.title">{{ question.title }}</h3>
            <button type="button" :class="$style.close" aria-label="关闭" @click="emit('close')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
            </button>
          </header>

          <div :class="$style.body">
            <MarkdownView :content="question.content" />

            <section v-if="hasAnswer()" :class="$style.answerSection">
              <button
                type="button"
                :class="$style.answerToggle"
                :aria-expanded="answerOpen"
                aria-controls="question-answer"
                @click="answerOpen = !answerOpen"
              >
                <YinYangMark :class="$style.seal" aria-hidden="true" />
                {{ answerOpen ? '收起参考答案' : '查看参考答案' }}
                <svg :class="[$style.chevron, answerOpen && $style.chevronOpen]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
              </button>
              <Transition name="answer">
                <div v-if="answerOpen" id="question-answer" :class="$style.answerBox">
                  <MarkdownView :content="question.answer || ''" />
                </div>
              </Transition>
            </section>

            <a
              v-if="question.attachment_url"
              :href="question.attachment_url"
              target="_blank"
              rel="noopener noreferrer"
              :class="$style.attach"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5" /><path d="M12 15V3" /></svg>
              {{ fileName }}
            </a>

            <!-- ============ 提交答案 ============ -->
            <section :class="$style.submitSection">
              <div :class="$style.statusRow">
                <template v-if="submission">
                  <span
                    :class="[$style.statusBadge, submission.status === 'pending' ? $style.pending : $style.graded]"
                  >
                    <svg v-if="submission.status === 'pending'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
                    {{ submission.status === 'pending' ? '待批改' : `已批改 · 得分 ${submission.grade?.score ?? '—'} 分` }}
                  </span>
                  <span :class="$style.statusMeta">{{ formatDate(submission.updated_at) }} 提交</span>
                </template>
                <SkeletonBox v-else-if="submissionLoading" width="150px" height="22px" />
                <span v-else-if="user.isLoggedIn" :class="$style.statusMeta">尚未提交答案</span>
              </div>

              <blockquote
                v-if="submission?.status === 'graded' && submission.grade?.comment"
                :class="$style.gradeComment"
              >
                <MarkdownView :content="submission.grade.comment" />
              </blockquote>

              <template v-if="user.isLoggedIn">
                <div :class="$style.submitForm">
                  <BaseInput
                    v-model="textAnswer"
                    textarea
                    :rows="6"
                    label="提交答案"
                    placeholder="在此输入你的解答，支持 Markdown…"
                  />
                  <p :class="$style.answerHint">或上传 PDF 答卷（不超过 10MB）</p>
                  <FileDropZone mode="select" compact :accept="['.pdf']" @select="onFileSelected" />
                  <div :class="$style.submitActions">
                    <BaseButton :loading="submitting" @click="submit">
                      {{ submission ? '重新提交' : '提交答案' }}
                    </BaseButton>
                  </div>
                  <p v-if="submission" :class="$style.resubmitHint">重新提交会覆盖原答案，并重置为待批改状态</p>
                </div>
              </template>
              <p v-else :class="$style.guestHint">
                登录后即可提交答案。
                <RouterLink
                  :to="{ path: '/auth/login', query: { redirect: route.fullPath } }"
                  :class="$style.loginLink"
                >去登录</RouterLink>
              </p>
            </section>
          </div>

          <footer :class="$style.foot">
            <span :class="$style.author">
              <AppAvatar :name="question.author?.username || question.user_id" :url="question.author?.avatar_url" :size="22" />
              {{ question.author?.username || shortId(question.user_id) }}
            </span>
            <time :class="$style.time">{{ formatDate(question.created_at) }}</time>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style module lang="scss">
.overlay {
  position: fixed;
  inset: 0;
  z-index: 90;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(15, 15, 18, 0.5);
  backdrop-filter: blur(4px);
}

.dialog {
  width: min(680px, 100%);
  max-height: min(85dvh, 900px);
  display: flex;
  flex-direction: column;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-panel);
  box-shadow: var(--shadow-pop);
  overflow: hidden;
  outline: none;
}

.head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.75rem 2rem 0;
}

.title {
  font-size: 1.25rem;
  letter-spacing: -0.01em;
}

.close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: var(--r-full);
  color: var(--c-slate);
  transition: background-color $dur var(--ease-out), color $dur var(--ease-out);

  &:hover {
    background: var(--c-surface-2);
    color: var(--c-ink);
  }

  svg {
    width: 18px;
    height: 18px;
  }
}

.body {
  padding: 1rem 2rem;
  overflow-y: auto;
}

.answerSection {
  margin-top: 1.75rem;
}

.answerToggle {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 44px;
  padding: 0.5rem 0.875rem;
  border: 1px solid var(--c-border-strong);
  border-radius: var(--r-sm);
  background: var(--c-surface-2);
  color: var(--c-steel);
  font-size: 0.875rem;
  font-weight: 500;
  transition: color $dur var(--ease-out), border-color $dur var(--ease-out),
    background-color $dur var(--ease-out);

  &:hover {
    color: var(--c-accent);
    border-color: var(--c-accent);
    background: var(--c-accent-soft);
  }
}

.chevron {
  width: 16px;
  height: 16px;
  transition: transform $dur var(--ease-out);
}

.chevronOpen {
  transform: rotate(180deg);
}

// 参考答案封印：阴阳玉印章
.seal {
  display: inline-block;
  width: 15px;
  height: 15px;
  color: var(--c-accent);
  vertical-align: -2.5px;
}

.answerBox {
  margin-top: 0.75rem;
  padding: 1rem 1.25rem;
  border-left: 3px solid var(--c-accent);
  border-radius: 0 var(--r-sm) var(--r-sm) 0;
  background: var(--c-accent-soft);
}

.attach {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  margin-top: 1.75rem;
  min-height: 44px;
  color: var(--c-accent);
  font-size: 0.875rem;
  font-weight: 500;

  &:hover {
    color: var(--c-accent-ink);
  }

  svg {
    width: 16px;
    height: 16px;
  }
}

// ---------- 提交答案 ----------

.submitSection {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--c-border);
}

.statusRow {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 24px;
}

.statusBadge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.75rem;
  border-radius: var(--r-full);
  font-size: 0.8125rem;
  font-weight: 600;

  svg {
    width: 14px;
    height: 14px;
  }
}

.pending {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.graded {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.statusMeta {
  color: var(--c-slate);
  font-family: var(--font-mono);
  font-size: var(--fs-meta);
}

.gradeComment {
  margin: 0.875rem 0 0;
  padding: 0.875rem 1.125rem;
  border-left: 3px solid #22c55e;
  border-radius: 0 var(--r-sm) var(--r-sm) 0;
  background: rgba(34, 197, 94, 0.08);
}

.submitForm {
  display: grid;
  gap: 0.75rem;
  margin-top: 1rem;
}

.answerHint {
  margin: -0.25rem 0 0.25rem;
  color: var(--c-slate);
  font-size: 0.8125rem;
}

.submitActions {
  display: flex;
  justify-content: flex-end;
}

.resubmitHint {
  color: var(--c-slate);
  font-size: 0.75rem;
  text-align: right;
}

.guestHint {
  margin-top: 1rem;
  color: var(--c-steel);
  font-size: 0.875rem;
}

.loginLink {
  display: inline-block;
  min-height: 44px;
  padding: 0.5rem 0.25rem;
  color: var(--c-accent);
  font-weight: 600;

  &:hover {
    text-decoration: underline;
  }
}

.foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 2rem 1.75rem;
  border-top: 1px solid var(--c-border);
}

.author {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--c-steel);
  font-size: var(--fs-meta);
}

.time {
  color: var(--c-slate);
  font-family: var(--font-mono);
  font-size: var(--fs-meta);
}

// 弹窗过渡（transform/opacity only）
:global(.modal-enter-active),
:global(.modal-leave-active) {
  transition: opacity $dur-slow var(--ease-out);

  .dialog {
    transition: transform $dur-slow var(--ease-spring), opacity $dur-slow var(--ease-out);
  }
}

// 参考答案折叠过渡
.answer-enter-active,
.answer-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.answer-enter-from,
.answer-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

:global(.modal-enter-from),
:global(.modal-leave-to) {
  opacity: 0;

  .dialog {
    transform: translateY(24px) scale(0.97);
    opacity: 0;
  }
}

@media (max-width: $bp-tablet - 1) {
  .head {
    padding: 1.25rem 1.25rem 0;
  }

  .body {
    padding: 0.75rem 1.25rem;
  }

  .foot {
    padding: 1rem 1.25rem 1.5rem;
  }
}
</style>
