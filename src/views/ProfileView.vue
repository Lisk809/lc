<script setup lang="ts">
import { ref, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import { useUiStore } from '@/stores/ui'
import { fetchMyFiles, fetchMyPosts, fetchMyQuestions } from '@/api/me'
import { formatBytes, formatDate, formatRelativeTime, shortId, stripMarkdown } from '@/utils/format'
import type { MyPost, MyQuestion, Paginated, ProfileTab, UserFile } from '@/types'
import ProfileSidebar from '@/components/organisms/ProfileSidebar.vue'
import AppAvatar from '@/components/atoms/AppAvatar.vue'
import BaseInput from '@/components/atoms/BaseInput.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import SkeletonBox from '@/components/atoms/SkeletonBox.vue'
import EmptyState from '@/components/atoms/EmptyState.vue'
import FileDropZone from '@/components/molecules/FileDropZone.vue'
import PaginationBar from '@/components/molecules/PaginationBar.vue'

const user = useUserStore()
const ui = useUiStore()

const activeTab = ref<ProfileTab>('info')

// ---------- 通用分页列表 ----------

function usePagedList<T>(fetchPage: (page: number) => Promise<Paginated<T>>) {
  const items = ref<T[]>([])
  const pagination = ref({ page: 1, pages: 0, total: 0 })
  const loading = ref(false)
  const error = ref(false)
  const loaded = ref(false)

  async function load(page = 1) {
    loading.value = true
    error.value = false
    try {
      const res = await fetchPage(page)
      items.value = res.data
      pagination.value = res.pagination
      loaded.value = true
    } catch {
      error.value = true
    } finally {
      loading.value = false
    }
  }

  return { items, pagination, loading, error, loaded, load }
}

const postsTab = usePagedList<MyPost>((page) => fetchMyPosts({ page, limit: 12 }))
const questionsTab = usePagedList<MyQuestion>((page) => fetchMyQuestions({ page, limit: 12 }))
const filesTab = usePagedList<UserFile>((page) => fetchMyFiles({ page, limit: 12 }))

const posts = postsTab.items
const postsPagination = postsTab.pagination
const postsLoading = postsTab.loading
const postsError = postsTab.error
const loadPosts = postsTab.load

const questions = questionsTab.items
const questionsPagination = questionsTab.pagination
const questionsLoading = questionsTab.loading
const questionsError = questionsTab.error
const loadQuestions = questionsTab.load

const files = filesTab.items
const filesPagination = filesTab.pagination
const filesLoading = filesTab.loading
const filesError = filesTab.error
const loadFiles = filesTab.load

watch(activeTab, (tab) => {
  if (tab === 'posts' && !postsTab.loaded.value) void loadPosts()
  if (tab === 'questions' && !questionsTab.loaded.value) void loadQuestions()
  if (tab === 'files' && !filesTab.loaded.value) void loadFiles()
})

function changePage(tab: ProfileTab, page: number) {
  if (tab === 'posts') void loadPosts(page)
  if (tab === 'questions') void loadQuestions(page)
  if (tab === 'files') void loadFiles(page)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// ---------- 个人信息编辑 ----------

const bioDraft = ref(user.bio)
const bioSaving = ref(false)

async function saveBio() {
  bioSaving.value = true
  try {
    await user.updateProfile({ bio: bioDraft.value.trim() })
    ui.toast('个人简介已保存', 'success')
  } catch {
    // 拦截器已提示
  } finally {
    bioSaving.value = false
  }
}

function onFileUploaded() {
  ui.toast('文件上传成功', 'success')
  void loadFiles(1)
}
</script>

<template>
  <div :class="$style.page">
    <header class="pageHead" v-reveal>
      <h1 class="pageTitle">个人中心</h1>
      <p class="pageSub">管理你的资料、帖子、题目与文件。</p>
    </header>

    <div :class="$style.layout">
      <ProfileSidebar :active="activeTab" @update:active="(tab) => (activeTab = tab)" />

      <div :class="$style.main">
        <!-- ============ 个人信息 ============ -->
        <section v-if="activeTab === 'info'" v-reveal="40">
          <div :class="$style.cards">
            <div :class="$style.card">
              <p :class="$style.cardLabel">ACCOUNT</p>
              <div :class="$style.account">
                <AppAvatar :url="user.avatar" :name="user.displayName" :size="88" />
                <div :class="$style.accountInfo">
                  <h2 :class="$style.accountName">{{ user.displayName }}</h2>
                  <dl :class="$style.meta">
                    <div :class="$style.metaRow"><dt>ID</dt><dd>{{ shortId(user.id) }}</dd></div>
                    <div :class="$style.metaRow"><dt>邮箱</dt><dd>{{ user.email || '—' }}</dd></div>
                    <div :class="$style.metaRow"><dt>加入于</dt><dd>{{ formatDate(user.createdAt) }}</dd></div>
                  </dl>
                </div>
              </div>
            </div>

            <div :class="$style.card">
              <p :class="$style.cardLabel">BADGES · {{ user.badges.length }}</p>
              <div v-if="user.badges.length" :class="$style.badges">
                <div v-for="badge in user.badges" :key="badge.id" :class="$style.badge">
                  <img v-if="badge.icon_url" :src="badge.icon_url" :alt="badge.name" :class="$style.badgeIcon" />
                  <span v-else :class="$style.badgeFallback">{{ badge.name.slice(0, 1) }}</span>
                  <div :class="$style.badgeInfo">
                    <p :class="$style.badgeName">{{ badge.name }}</p>
                    <p :class="$style.badgeDesc">{{ badge.description }}</p>
                    <p :class="$style.badgeDate">{{ formatDate(badge.awarded_at) }}</p>
                  </div>
                </div>
              </div>
              <EmptyState v-else title="还没有徽章" description="参与社区活动，赢得第一枚徽章。" />
            </div>
          </div>

          <div :class="$style.card">
            <p :class="$style.cardLabel">PROFILE</p>
            <div :class="$style.form">
              <BaseInput v-model="bioDraft" textarea :rows="4" label="个人简介" placeholder="介绍一下自己…" />
              <div :class="$style.formActions">
                <BaseButton :loading="bioSaving" @click="saveBio">保存简介</BaseButton>
              </div>
            </div>
          </div>

          <div :class="$style.card">
            <p :class="$style.cardLabel">AVATAR</p>
            <p :class="$style.cardHint">
              头像由 Gravatar 提供，与注册邮箱绑定。前往
              <a href="https://gravatar.com" target="_blank" rel="noopener noreferrer" :class="$style.cardLink">gravatar.com</a>
              用同一邮箱设置头像后自动生效。
            </p>
          </div>
        </section>

        <!-- ============ 我的帖子 ============ -->
        <section v-else-if="activeTab === 'posts'" v-reveal="40">
          <template v-if="postsLoading">
            <div v-for="i in 4" :key="i" :class="$style.itemSkeleton">
              <SkeletonBox height="20px" width="55%" />
              <SkeletonBox height="15px" width="90%" />
              <SkeletonBox height="15px" width="40%" />
            </div>
          </template>
          <template v-else-if="postsError">
            <div :class="$style.stateCard">
              <EmptyState title="加载失败" description="网络似乎开小差了。">
                <template #action>
                  <BaseButton variant="outline" @click="loadPosts()">重新加载</BaseButton>
                </template>
              </EmptyState>
            </div>
          </template>
          <template v-else-if="posts.length">
            <div :class="$style.listCard">
              <RouterLink v-for="p in posts" :key="p.id" :to="`/posts/${p.id}`" :class="$style.item">
                <div :class="$style.itemMain">
                  <h3 :class="$style.itemTitle">{{ p.title }}</h3>
                  <p :class="$style.itemSub">{{ stripMarkdown(p.content, 120) }}</p>
                </div>
                <div :class="$style.itemAside">
                  <span :class="$style.itemMeta">{{ p.reply_count }} 回复</span>
                  <span :class="$style.itemMeta">{{ formatRelativeTime(p.created_at) }}</span>
                </div>
              </RouterLink>
            </div>
            <div :class="$style.pagination">
              <PaginationBar :page="postsPagination.page" :pages="postsPagination.pages" :total="postsPagination.total" @change="(p) => changePage('posts', p)" />
            </div>
          </template>
          <div v-else :class="$style.stateCard">
            <EmptyState title="还没有帖子" description="你的第一帖会出现在这里。">
              <template #action>
                <RouterLink to="/posts/create">
                  <BaseButton>发布帖子</BaseButton>
                </RouterLink>
              </template>
            </EmptyState>
          </div>
        </section>

        <!-- ============ 我的题目 ============ -->
        <section v-else-if="activeTab === 'questions'" v-reveal="40">
          <template v-if="questionsLoading">
            <div v-for="i in 4" :key="i" :class="$style.itemSkeleton">
              <SkeletonBox height="20px" width="55%" />
              <SkeletonBox height="15px" width="90%" />
              <SkeletonBox height="15px" width="40%" />
            </div>
          </template>
          <template v-else-if="questionsError">
            <div :class="$style.stateCard">
              <EmptyState title="加载失败" description="网络似乎开小差了。">
                <template #action>
                  <BaseButton variant="outline" @click="loadQuestions()">重新加载</BaseButton>
                </template>
              </EmptyState>
            </div>
          </template>
          <template v-else-if="questions.length">
            <div :class="$style.listCard">
              <div v-for="q in questions" :key="q.id" :class="$style.item">
                <div :class="$style.itemMain">
                  <h3 :class="$style.itemTitle">{{ q.title }}</h3>
                  <p :class="$style.itemSub">{{ stripMarkdown(q.content, 120) }}</p>
                  <p v-if="q.answer" :class="$style.answer">参考答案 · {{ stripMarkdown(q.answer, 60) }}</p>
                </div>
                <div :class="$style.itemAside">
                  <span :class="$style.itemMeta">{{ formatRelativeTime(q.created_at) }}</span>
                </div>
              </div>
            </div>
            <div :class="$style.pagination">
              <PaginationBar :page="questionsPagination.page" :pages="questionsPagination.pages" :total="questionsPagination.total" @change="(p) => changePage('questions', p)" />
            </div>
          </template>
          <div v-else :class="$style.stateCard">
            <EmptyState title="还没有题目" description="创建你的第一道竞赛题。">
              <template #action>
                <RouterLink to="/questions/create">
                  <BaseButton>创建题目</BaseButton>
                </RouterLink>
              </template>
            </EmptyState>
          </div>
        </section>

        <!-- ============ 我的文件 ============ -->
        <section v-else v-reveal="40">
          <div :class="$style.card">
            <p :class="$style.cardLabel">UPLOAD</p>
            <FileDropZone mode="upload" compact @uploaded="onFileUploaded" />
          </div>

          <template v-if="filesLoading">
            <div v-for="i in 3" :key="i" :class="$style.itemSkeleton">
              <SkeletonBox height="20px" width="55%" />
              <SkeletonBox height="15px" width="90%" />
              <SkeletonBox height="15px" width="40%" />
            </div>
          </template>
          <template v-else-if="filesError">
            <div :class="$style.stateCard">
              <EmptyState title="加载失败" description="网络似乎开小差了。">
                <template #action>
                  <BaseButton variant="outline" @click="loadFiles()">重新加载</BaseButton>
                </template>
              </EmptyState>
            </div>
          </template>
          <template v-else-if="files.length">
            <div :class="$style.listCard">
              <a v-for="f in files" :key="f.id" :href="f.file_url" target="_blank" rel="noopener noreferrer" :class="$style.item">
                <div :class="$style.itemMain">
                  <h3 :class="$style.itemTitle">{{ f.file_name }}</h3>
                  <p :class="$style.itemSub">{{ f.mime_type }} · {{ formatBytes(f.file_size) }}</p>
                </div>
                <div :class="$style.itemAside">
                  <span :class="$style.itemMeta">{{ formatRelativeTime(f.created_at) }}</span>
                </div>
              </a>
            </div>
            <div :class="$style.pagination">
              <PaginationBar :page="filesPagination.page" :pages="filesPagination.pages" :total="filesPagination.total" @change="(p) => changePage('files', p)" />
            </div>
          </template>
          <div v-else :class="$style.stateCard">
            <EmptyState title="还没有文件" description="上传文件后，它们会出现在这里。" />
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<style module lang="scss">
.page {
  @include container;
  padding-top: var(--space-section);
}

.layout {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 2.5rem;
  align-items: start;
  margin-top: 2.5rem;

  @media (max-width: $bp-tablet - 1) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

.main {
  min-width: 0;
}

// ---------- 卡片 ----------

.cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
  margin-bottom: 1.25rem;

  @media (max-width: $bp-desktop - 1) {
    grid-template-columns: 1fr;
  }
}

.card {
  padding: 1.75rem;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-card);
  box-shadow: var(--shadow-card);
  margin-bottom: 1.25rem;

  @media (max-width: $bp-tablet - 1) {
    padding: 1.25rem;
  }
}

.cardLabel {
  margin-bottom: 1.25rem;
  font-family: var(--font-mono);
  font-size: var(--fs-meta);
  letter-spacing: 0.12em;
  color: var(--c-slate);
}

.cardHint {
  margin: -0.5rem 0 1rem;
  color: var(--c-steel);
  font-size: 0.875rem;
  line-height: 1.6;
}

.cardLink {
  color: var(--c-accent);
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
}

.account {
  display: flex;
  align-items: center;
  gap: 1.5rem;

  @media (max-width: $bp-tablet - 1) {
    flex-direction: column;
    align-items: flex-start;
  }
}

.accountInfo {
  min-width: 0;
}

.accountName {
  font-size: 1.375rem;
  letter-spacing: -0.015em;
}

.meta {
  margin: 0.75rem 0 0;
  display: grid;
  gap: 0.375rem;
}

.metaRow {
  display: flex;
  gap: 0.75rem;
  font-size: 0.875rem;

  dt {
    color: var(--c-slate);
    font-family: var(--font-mono);
    font-size: var(--fs-meta);
    min-width: 3.5rem;
    padding-top: 0.125rem;
  }

  dd {
    margin: 0;
    color: var(--c-steel);
    overflow-wrap: anywhere;
  }
}

// ---------- 徽章 ----------

.badges {
  display: grid;
  gap: 1rem;
}

.badge {
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
  padding: 0.875rem;
  border: 1px solid var(--c-border);
  border-radius: var(--r-md);
  background: var(--c-canvas);
}

.badgeIcon,
.badgeFallback {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: var(--r-full);
}

.badgeFallback {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--c-accent-soft);
  color: var(--c-accent);
  font-family: var(--font-mono);
  font-weight: 600;
}

.badgeInfo {
  min-width: 0;
}

.badgeName {
  font-weight: 600;
  font-size: 0.9375rem;
}

.badgeDesc {
  margin-top: 0.125rem;
  color: var(--c-steel);
  font-size: 0.8125rem;
}

.badgeDate {
  margin-top: 0.25rem;
  font-family: var(--font-mono);
  font-size: var(--fs-meta);
  color: var(--c-slate);
}

// ---------- 简介表单 ----------

.form {
  display: grid;
  gap: 1rem;
}

.formActions {
  display: flex;
  justify-content: flex-end;

  @media (max-width: $bp-tablet - 1) {
    justify-content: stretch;

    > * {
      width: 100%;
    }
  }
}

// ---------- 列表 ----------

.listCard {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-card);
  box-shadow: var(--shadow-card);
  overflow: hidden;
}

.item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--c-border);
  transition: background-color $dur var(--ease-out);

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: var(--c-surface-2);
  }

  @media (max-width: $bp-tablet - 1) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}

.itemMain {
  min-width: 0;
}

.itemTitle {
  font-size: 1rem;
  letter-spacing: -0.01em;
  @include line-clamp(1);
}

.itemSub {
  margin-top: 0.25rem;
  color: var(--c-steel);
  font-size: 0.875rem;
  @include line-clamp(2);
}

.itemAside {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
}

.itemMeta {
  font-family: var(--font-mono);
  font-size: var(--fs-meta);
  color: var(--c-slate);
  white-space: nowrap;
}

.answer {
  margin-top: 0.5rem;
  font-size: 0.8125rem;
  color: var(--c-accent);
  @include line-clamp(1);
}

.itemSkeleton {
  display: grid;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-card);
  margin-bottom: 0.75rem;
}

.stateCard {
  display: flex;
  justify-content: center;
  padding: 2.5rem;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-card);
  box-shadow: var(--shadow-card);
}

.pagination {
  margin-top: 1.5rem;
}
</style>
