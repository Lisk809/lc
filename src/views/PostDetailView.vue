<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePostStore } from '@/stores/posts'
import { useUserStore } from '@/stores/user'
import { useUiStore } from '@/stores/ui'
import { fileNameFromUrl, formatDate, formatRelativeTime, shortId } from '@/utils/format'
import AppAvatar from '@/components/atoms/AppAvatar.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import BaseInput from '@/components/atoms/BaseInput.vue'
import MarkdownView from '@/components/molecules/MarkdownView.vue'
import ReplyItem from '@/components/molecules/ReplyItem.vue'
import FileDropZone from '@/components/molecules/FileDropZone.vue'
import PaginationBar from '@/components/molecules/PaginationBar.vue'
import SkeletonBox from '@/components/atoms/SkeletonBox.vue'
import EmptyState from '@/components/atoms/EmptyState.vue'

const route = useRoute()
const router = useRouter()
const postStore = usePostStore()
const user = useUserStore()
const ui = useUiStore()

const postId = computed(() => String(route.params.id))

// 回复表单
const replyContent = ref('')
const replyFile = ref<File | null>(null)
const replyFormKey = ref(0)
const submitting = ref(false)
const submitError = ref('')

// 点赞：乐观更新 + 500ms 节流
const likeBusy = ref(false)
let lastLikeAt = 0

const liked = computed(() => postStore.likedIds.includes(postId.value))
const likeCount = computed(() => postStore.detail?.likes_count ?? 0)

onMounted(() => {
  void postStore.fetchDetail(postId.value)
  void postStore.fetchReplies(postId.value, { page: 1 })
})

async function handleLike() {
  const now = Date.now()
  if (now - lastLikeAt < 500 || likeBusy.value || !postStore.detail) return
  lastLikeAt = now
  likeBusy.value = true
  try {
    await postStore.toggleLike(postId.value)
  } finally {
    likeBusy.value = false
  }
}

async function submitReply() {
  const content = replyContent.value.trim()
  if (!content) {
    submitError.value = '回复内容不能为空'
    return
  }
  submitError.value = ''
  submitting.value = true
  try {
    const form = new FormData()
    form.append('content', content)
    if (replyFile.value) form.append('file', replyFile.value)
    await postStore.createReply(postId.value, form)
    ui.toast('回复已发表', 'success')
    replyContent.value = ''
    replyFile.value = null
    replyFormKey.value += 1
    void postStore.fetchReplies(postId.value, { page: 1 })
  } catch {
    // 拦截器已提示
  } finally {
    submitting.value = false
  }
}

function changeRepliesPage(page: number) {
  void postStore.fetchReplies(postId.value, { page })
  document.querySelector('#replies')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <div :class="$style.page">
    <RouterLink to="/posts" :class="$style.back">← 返回帖子列表</RouterLink>

    <!-- 加载骨架 -->
    <template v-if="postStore.detailLoading">
      <div :class="$style.detailGrid">
        <div :class="$style.articleSkeleton">
          <SkeletonBox height="44px" width="75%" />
          <SkeletonBox height="18px" width="40%" />
          <SkeletonBox height="16px" width="100%" />
          <SkeletonBox height="16px" width="92%" />
          <SkeletonBox height="16px" width="60%" />
        </div>
        <div :class="$style.asideSkeleton">
          <SkeletonBox height="200px" radius="1.5rem" />
        </div>
      </div>
    </template>

    <!-- 不存在 -->
    <template v-else-if="postStore.detailError === 'not-found'">
      <div :class="$style.state">
        <EmptyState title="帖子不存在" description="它可能已被删除，或链接有误。">
          <template #action>
            <BaseButton @click="router.push('/posts')">返回帖子列表</BaseButton>
          </template>
        </EmptyState>
      </div>
    </template>

    <!-- 加载失败 -->
    <template v-else-if="postStore.detailError">
      <div :class="$style.state">
        <EmptyState title="加载失败" description="网络似乎出了问题，稍后重试。">
          <template #action>
            <BaseButton variant="outline" @click="postStore.fetchDetail(postId)">重新加载</BaseButton>
          </template>
        </EmptyState>
      </div>
    </template>

    <template v-else-if="postStore.detail">
      <div :class="$style.detailGrid">
        <article :class="$style.article">
          <p :class="$style.spellCard">SPELL CARD · 符卡</p>
          <h1 :class="$style.title">{{ postStore.detail.title }}</h1>
          <div :class="$style.meta">
            <span :class="$style.author">
              <AppAvatar :name="postStore.detail.author?.username || postStore.detail.user_id" :url="postStore.detail.author?.avatar_url" :size="34" />
              <span :class="$style.authorName">{{ postStore.detail.author?.username || shortId(postStore.detail.user_id) }}</span>
            </span>
            <time :class="$style.time">{{ formatDate(postStore.detail.created_at) }}</time>
          </div>
          <MarkdownView :content="postStore.detail.content" :class="$style.body" />
          <a
            v-if="postStore.detail.attachment_url"
            :href="postStore.detail.attachment_url"
            target="_blank"
            rel="noopener noreferrer"
            :class="$style.attach"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5" /><path d="M12 15V3" /></svg>
            下载附件
            <span :class="$style.attachName">{{ fileNameFromUrl(postStore.detail.attachment_url) }}</span>
          </a>
        </article>

        <aside :class="$style.aside">
          <div :class="$style.asideCard">
            <p :class="$style.asideLabel">INTERACT</p>
            <BaseButton block :variant="liked ? 'primary' : 'outline'" @click="handleLike">
              <svg viewBox="0 0 24 24" :fill="liked ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
              {{ liked ? '已点赞' : '点赞' }} · {{ likeCount }}
            </BaseButton>
            <dl :class="$style.stats">
              <div :class="$style.statRow"><dt>回复</dt><dd>{{ postStore.detail.reply_count }}</dd></div>
              <div :class="$style.statRow"><dt>点赞</dt><dd>{{ likeCount }}</dd></div>
              <div :class="$style.statRow"><dt>发布</dt><dd>{{ formatRelativeTime(postStore.detail.created_at) }}</dd></div>
            </dl>
          </div>

          <div :class="$style.asideCard">
            <p :class="$style.asideLabel">AUTHOR</p>
            <div :class="$style.authorRow">
              <AppAvatar :name="postStore.detail.author?.username || postStore.detail.user_id" :url="postStore.detail.author?.avatar_url" :size="44" />
              <div>
                <p :class="$style.authorName">{{ postStore.detail.author?.username || shortId(postStore.detail.user_id) }}</p>
                <p :class="$style.authorSub">帖子 #{{ shortId(postStore.detail.id) }}</p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <!-- 回复区 -->
      <section id="replies" :class="$style.replies">
        <h2 :class="$style.repliesTitle">
          回复
          <span :class="$style.repliesCount">{{ postStore.repliesPagination.total || postStore.detail.reply_count }}</span>
        </h2>

        <form v-if="user.isLoggedIn" :class="$style.replyForm" @submit.prevent="submitReply">
          <BaseInput
            v-model="replyContent"
            textarea
            :rows="4"
            label="写下你的回复"
            placeholder="支持 Markdown 语法"
            :error="submitError || undefined"
          />
          <FileDropZone :key="replyFormKey" mode="select" compact @select="(f) => (replyFile = f)" />
          <div :class="$style.replyActions">
            <BaseButton type="submit" :loading="submitting">发表回复</BaseButton>
          </div>
        </form>
        <p v-else :class="$style.loginHint">
          登录后参与讨论 —
          <RouterLink :to="{ path: '/auth/login', query: { redirect: $route.fullPath } }" :class="$style.loginLink">去登录</RouterLink>
        </p>

        <div :class="$style.replyList">
          <template v-if="postStore.repliesLoading">
            <div v-for="i in 3" :key="i" :class="$style.replySkeleton">
              <SkeletonBox height="18px" width="30%" />
              <SkeletonBox height="16px" width="100%" />
              <SkeletonBox height="16px" width="70%" />
            </div>
          </template>
          <template v-else-if="postStore.repliesError">
            <EmptyState title="回复加载失败" description="稍后重试。">
              <template #action>
                <BaseButton variant="outline" @click="postStore.fetchReplies(postId, { page: 1 })">重新加载</BaseButton>
              </template>
            </EmptyState>
          </template>
          <template v-else-if="postStore.replies.length">
            <ReplyItem v-for="reply in postStore.replies" :key="reply.id" :reply="reply" />
          </template>
          <EmptyState v-else title="还没有回复" description="写下第一条回复，参与讨论。" />
        </div>

        <div :class="$style.replyPagination">
          <PaginationBar
            :page="postStore.repliesPagination.page"
            :pages="postStore.repliesPagination.pages"
            @change="changeRepliesPage"
          />
        </div>
      </section>
    </template>
  </div>
</template>

<style module lang="scss">
.page {
  @include container;
  padding-top: 2rem;
}

.back {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  color: var(--c-steel);
  font-size: 0.9375rem;
  transition: color $dur var(--ease-out);

  &:hover {
    color: var(--c-accent);
  }
}

.state {
  display: flex;
  justify-content: center;
  margin-top: 3rem;
  border: 1px dashed var(--c-border-strong);
  border-radius: var(--r-card);
}

.detailGrid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 2.5rem;
  align-items: start;
  margin-top: 2rem;

  @media (max-width: $bp-desktop - 1) {
    grid-template-columns: 1fr;
  }
}

.article {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-card);
  box-shadow: var(--shadow-card);
  padding: 2.5rem;

  @media (max-width: $bp-tablet - 1) {
    padding: 1.5rem;
  }
}

.spellCard {
  margin-bottom: 0.75rem;
  font-family: var(--font-mono);
  font-size: var(--fs-meta);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--c-accent);
}

.title {
  font-size: var(--fs-h2);
  font-weight: 800;
  letter-spacing: -0.02em;
}

.meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid var(--c-border);
}

.author {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.authorName {
  font-size: var(--fs-meta);
  color: var(--c-steel);
}

.time {
  font-family: var(--font-mono);
  font-size: var(--fs-meta);
  color: var(--c-slate);
}

.body {
  margin-top: 1.5rem;
  font-size: 1.0625rem;
}

.attach {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 2rem;
  min-height: 44px;
  padding: 0.5rem 1rem;
  border: 1px solid var(--c-border-strong);
  border-radius: var(--r-full);
  color: var(--c-accent);
  font-size: 0.9375rem;
  font-weight: 500;
  transition: border-color $dur var(--ease-out), background-color $dur var(--ease-out);

  &:hover {
    border-color: var(--c-accent);
    background: var(--c-accent-soft);
  }

  svg {
    width: 16px;
    height: 16px;
  }
}

.attachName {
  font-family: var(--font-mono);
  font-size: var(--fs-meta);
  color: var(--c-slate);
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.aside {
  display: grid;
  gap: 1.25rem;
  position: sticky;
  top: calc(#{$navbar-height} + 1.5rem);

  @media (max-width: $bp-desktop - 1) {
    position: static;
  }
}

.asideCard {
  padding: 1.5rem;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-card);
  box-shadow: var(--shadow-card);
}

.asideLabel {
  margin-bottom: 1rem;
  font-family: var(--font-mono);
  font-size: var(--fs-meta);
  letter-spacing: 0.12em;
  color: var(--c-slate);
}

.stats {
  margin: 1.25rem 0 0;
  display: grid;
  gap: 0.625rem;
}

.statRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.9375rem;

  dt {
    color: var(--c-steel);
  }

  dd {
    margin: 0;
    font-family: var(--font-mono);
    font-size: var(--fs-meta);
    font-variant-numeric: tabular-nums;
  }
}

.authorRow {
  display: flex;
  align-items: center;
  gap: 0.875rem;
}

.authorName {
  font-size: var(--fs-meta);
  font-weight: 500;
}

.authorSub {
  font-family: var(--font-mono);
  font-size: var(--fs-meta);
  color: var(--c-slate);
}

// 骨架
.articleSkeleton,
.asideSkeleton {
  display: grid;
  gap: 1rem;
  padding: 2.5rem;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-card);
}

// 回复区
.replies {
  margin-top: var(--space-section);
  max-width: 100%;
}

.repliesTitle {
  font-size: var(--fs-h2);
  letter-spacing: -0.02em;
}

.repliesCount {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  padding: 0 0.625rem;
  margin-left: 0.5rem;
  border-radius: var(--r-full);
  background: var(--c-accent-soft);
  color: var(--c-accent);
  font-family: var(--font-mono);
  font-size: var(--fs-meta);
  font-weight: 500;
  vertical-align: middle;
}

.replyForm {
  display: grid;
  gap: 1rem;
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-card);
  box-shadow: var(--shadow-card);

  @media (max-width: $bp-tablet - 1) {
    padding: 1.25rem;
  }
}

.replyActions {
  display: flex;
  justify-content: flex-end;

  @media (max-width: $bp-tablet - 1) {
    justify-content: stretch;

    > * {
      width: 100%;
    }
  }
}

.loginHint {
  margin-top: 1.5rem;
  padding: 1.25rem 1.5rem;
  border: 1px dashed var(--c-border-strong);
  border-radius: var(--r-md);
  color: var(--c-steel);
  font-size: 0.9375rem;
}

.loginLink {
  color: var(--c-accent);
  font-weight: 600;

  &:hover {
    text-decoration: underline;
  }
}

.replyList {
  margin-top: 1.5rem;
}

.replySkeleton {
  display: grid;
  gap: 0.875rem;
  padding: 1.25rem 0;
  border-top: 1px solid var(--c-border);
}

.replyPagination {
  margin-top: 1.5rem;
}
</style>
