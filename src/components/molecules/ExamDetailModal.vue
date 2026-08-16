<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useUiStore } from '@/stores/ui'
import { fileNameFromUrl, formatDate } from '@/utils/format'
import { fetchMyExamSubmission, setExamStatus, submitExamAnswer } from '@/api/exams'
import type { Exam, ExamStatus, SubmissionDetail } from '@/types'
import MarkdownView from '@/components/molecules/MarkdownView.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import SkeletonBox from '@/components/atoms/SkeletonBox.vue'
import FileDropZone from '@/components/molecules/FileDropZone.vue'

const props = defineProps<{ exam: Exam | null }>()
const emit = defineEmits<{ close: [] }>()

const route = useRoute()
const user = useUserStore()
const ui = useUiStore()

const paperName = props.exam?.paper_url ? fileNameFromUrl(props.exam.paper_url) : ''
const sheetName = props.exam?.sheet_url ? fileNameFromUrl(props.exam.sheet_url) : ''

// ---------- 发布/下线（管理员） ----------

const statusUpdating = ref(false)

async function toggleStatus() {
  const e = props.exam
  if (!e || statusUpdating.value) return
  const next: ExamStatus = e.status === 'draft' ? 'published' : 'draft'
  statusUpdating.value = true
  try {
    const res = await setExamStatus(e.id, next)
    // 与联考列表项是同一引用，就地更新后卡片徽章自动同步
    e.status = res.status
    ui.toast(e.status === 'published' ? '联考已发布' : '联考已下线', 'success')
  } catch {
    // 拦截器已提示
  } finally {
    statusUpdating.value = false
  }
}

// ---------- 提交答卷（仅 PDF） ----------

const submission = ref<SubmissionDetail | null>(null)
const submissionLoading = ref(false)
const answerFile = ref<File | null>(null)
const submitting = ref(false)

function onFileSelected(file: File | null) {
  answerFile.value = file
}

async function loadSubmission(examId: string) {
  submissionLoading.value = true
  try {
    const res = await fetchMyExamSubmission(examId)
    // 弹窗已切换则丢弃过期结果
    if (props.exam?.id !== examId) return
    submission.value = res.submission
  } catch {
    submission.value = null
  } finally {
    submissionLoading.value = false
  }
}

async function submit() {
  const e = props.exam
  if (!e || submitting.value) return
  if (!answerFile.value) {
    ui.toast('请上传 PDF 答卷', 'error')
    return
  }
  submitting.value = true
  try {
    const form = new FormData()
    form.append('file', answerFile.value)
    const res = await submitExamAnswer(e.id, form)
    submission.value = res
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
  () => props.exam,
  (e) => {
    submission.value = null
    answerFile.value = null
    document.body.style.overflow = e ? 'hidden' : ''
    if (e) window.addEventListener('keydown', onKeydown)
    else window.removeEventListener('keydown', onKeydown)
    if (e && user.isLoggedIn && e.status === 'published') void loadSubmission(e.id)
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
      <div v-if="exam" :class="$style.overlay" @click.self="emit('close')" @keydown="onKeydown">
        <div :class="$style.dialog" role="dialog" aria-modal="true" :aria-label="exam.title" tabindex="-1">
          <header :class="$style.head">
            <h3 :class="$style.title">{{ exam.title }}</h3>
            <BaseButton
              v-if="user.isAdmin"
              size="sm"
              variant="outline"
              :class="$style.publishBtn"
              :loading="statusUpdating"
              @click="toggleStatus"
            >{{ exam.status === 'draft' ? '发布' : '下线' }}</BaseButton>
            <button type="button" :class="$style.close" aria-label="关闭" @click="emit('close')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
            </button>
          </header>

          <div :class="$style.body">
            <MarkdownView v-if="exam.description" :content="exam.description" />

            <div :class="$style.docs">
              <a :href="exam.paper_url" target="_blank" rel="noopener noreferrer" :class="$style.docLink">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></svg>
                <span>
                  <span :class="$style.docLabel">试卷</span>
                  <span :class="$style.docName">{{ paperName }}</span>
                </span>
              </a>
              <a :href="exam.sheet_url" target="_blank" rel="noopener noreferrer" :class="$style.docLink">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M9 13h6" /><path d="M9 17h4" /></svg>
                <span>
                  <span :class="$style.docLabel">答题卡</span>
                  <span :class="$style.docName">{{ sheetName }}</span>
                </span>
              </a>
            </div>

            <!-- ============ 提交答卷 ============ -->
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
                <span v-else-if="user.isLoggedIn" :class="$style.statusMeta">尚未提交答卷</span>
              </div>

              <blockquote
                v-if="submission?.status === 'graded' && submission.grade?.comment"
                :class="$style.gradeComment"
              >
                <MarkdownView :content="submission.grade.comment" />
              </blockquote>

              <template v-if="exam.status === 'draft'">
                <p :class="$style.draftHint">该联考尚未发布，暂不可提交答卷</p>
              </template>
              <template v-else-if="user.isLoggedIn">
                <div :class="$style.submitForm">
                  <p :class="$style.answerHint">上传答题卡 PDF 答卷（不超过 10MB）</p>
                  <FileDropZone mode="select" compact :accept="['.pdf']" @select="onFileSelected" />
                  <div :class="$style.submitActions">
                    <BaseButton :loading="submitting" @click="submit">
                      {{ submission ? '重新提交' : '提交答卷' }}
                    </BaseButton>
                  </div>
                  <p v-if="submission" :class="$style.resubmitHint">重新提交会覆盖原答卷，并重置为待批改状态</p>
                </div>
              </template>
              <p v-else :class="$style.guestHint">
                登录后即可提交答卷。
                <RouterLink
                  :to="{ path: '/auth/login', query: { redirect: route.fullPath } }"
                  :class="$style.loginLink"
                >去登录</RouterLink>
              </p>
            </section>
          </div>

          <footer :class="$style.foot">
            <time :class="$style.time">{{ formatDate(exam.created_at) }} 创建</time>
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

.publishBtn {
  flex-shrink: 0;
  margin-left: auto;
  margin-top: 0.125rem;
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

.docs {
  display: grid;
  gap: 0.5rem;
  margin-top: 1.5rem;
}

.docLink {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  min-height: 44px;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--c-border-strong);
  border-radius: var(--r-sm);
  background: var(--c-surface-2);
  color: var(--c-steel);
  font-size: 0.875rem;
  transition: color $dur var(--ease-out), border-color $dur var(--ease-out);

  &:hover {
    color: var(--c-accent);
    border-color: var(--c-accent);
  }

  > svg {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }

  > span {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
}

.docLabel {
  color: var(--c-slate);
  font-size: var(--fs-meta);
}

.docName {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

// ---------- 提交答卷 ----------

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

.draftHint {
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
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem 2rem 1.75rem;
  border-top: 1px solid var(--c-border);
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
