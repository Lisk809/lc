<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { fetchAnnouncements } from '@/api/announcements'
import { useUserStore } from '@/stores/user'
import { useAnnouncementReadsStore } from '@/stores/announcementReads'
import { formatDate, shortId, stripMarkdown } from '@/utils/format'
import type { Announcement } from '@/types'
import BaseButton from '@/components/atoms/BaseButton.vue'
import MarkdownView from '@/components/molecules/MarkdownView.vue'
import PaginationBar from '@/components/molecules/PaginationBar.vue'
import SkeletonBox from '@/components/atoms/SkeletonBox.vue'
import EmptyState from '@/components/atoms/EmptyState.vue'

const router = useRouter()
const user = useUserStore()
const reads = useAnnouncementReadsStore()

const list = ref<Announcement[]>([])
const pagination = ref({ page: 1, pages: 0, total: 0 })
const loading = ref(false)
const error = ref(false)
const expandedId = ref<string | null>(null)

async function load(page = 1) {
  loading.value = true
  error.value = false
  try {
    const res = await fetchAnnouncements({ page, limit: 10 })
    list.value = res.data
    pagination.value = res.pagination
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

function toggle(id: string) {
  expandedId.value = expandedId.value === id ? null : id
}

function changePage(page: number) {
  void load(page)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  reads.ensureBaseline() // 防御性，幂等；正常已由弹窗组件保证
  void load()
})
</script>

<template>
  <div :class="$style.page">
    <div :class="$style.head">
      <header class="pageHead" v-reveal>
        <h1 class="pageTitle">公告</h1>
        <p class="pageSub">社区动态与赛事通知，来自 Lunatic ChO 团队。</p>
      </header>
      <BaseButton v-if="user.isAdmin" v-reveal="80" @click="router.push('/admin/announcement/create')">
        发布公告
      </BaseButton>
    </div>

    <div v-reveal="120" :class="$style.list">
      <template v-if="loading">
        <div v-for="i in 4" :key="i" :class="$style.skeletonRow">
          <SkeletonBox height="20px" width="45%" />
          <SkeletonBox height="15px" width="100%" />
          <SkeletonBox height="15px" width="60%" />
        </div>
      </template>
      <template v-else-if="error">
        <EmptyState title="公告加载失败" description="网络似乎开小差了，稍后重试。">
          <template #action>
            <BaseButton variant="outline" @click="load()">重新加载</BaseButton>
          </template>
        </EmptyState>
      </template>
      <template v-else-if="list.length">
        <article
          v-for="(item, i) in list"
          :key="item.id"
          v-reveal="i * 30"
          :class="[$style.row, { [$style.rowOpen]: expandedId === item.id }]"
        >
          <button type="button" :class="$style.rowHead" :aria-expanded="expandedId === item.id" @click="toggle(item.id)">
            <div :class="$style.rowTitle">
              <div :class="$style.titleLine">
                <h2 :class="$style.title">{{ item.title }}</h2>
                <span v-if="reads.isUnread(item.id, item.created_at)" :class="$style.unreadBadge">未读</span>
              </div>
              <p v-if="expandedId !== item.id" :class="$style.excerpt">{{ stripMarkdown(item.content, 140) }}</p>
            </div>
            <div :class="$style.rowAside">
              <time :class="$style.date">{{ formatDate(item.created_at) }}</time>
              <svg :class="$style.chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
            </div>
          </button>
          <div v-if="expandedId === item.id" :class="$style.rowBody">
            <MarkdownView :content="item.content" />
            <div :class="$style.rowFoot">
              <p :class="$style.author">发布者 · {{ item.author?.username || shortId(item.author_id) }}</p>
              <BaseButton
                v-if="reads.isUnread(item.id, item.created_at)"
                size="sm"
                variant="outline"
                @click="reads.markRead(item.id)"
              >
                标记已读
              </BaseButton>
              <BaseButton v-else size="sm" variant="ghost" @click="reads.markUnread(item.id)">标记未读</BaseButton>
            </div>
          </div>
        </article>
      </template>
      <EmptyState v-else title="暂无公告" description="有新的通知时会第一时间出现在这里。" />
    </div>

    <div :class="$style.pagination">
      <PaginationBar :page="pagination.page" :pages="pagination.pages" :total="pagination.total" @change="changePage" />
    </div>
  </div>
</template>

<style module lang="scss">
.page {
  @include container;
  padding-top: var(--space-section);
}

.head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1.5rem;

  @media (max-width: $bp-tablet - 1) {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
}

.list {
  margin-top: 2.5rem;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-card);
  box-shadow: var(--shadow-card);
  overflow: hidden;
}

.row {
  border-bottom: 1px solid var(--c-border);
  transition: background-color $dur var(--ease-out);

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: var(--c-surface-2);
  }
}

.rowHead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  width: 100%;
  padding: 1.5rem 2rem;
  text-align: left;

  @media (max-width: $bp-tablet - 1) {
    padding: 1.25rem;
  }
}

.rowTitle {
  min-width: 0;
}

.title {
  font-size: 1.0625rem;
  letter-spacing: -0.01em;
}

.titleLine {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.unreadBadge {
  flex-shrink: 0;
  padding: 0.125rem 0.5rem;
  border-radius: var(--r-full);
  background: var(--c-accent-soft);
  color: var(--c-accent);
  font-size: 0.75rem;
  font-weight: 600;
}

.excerpt {
  margin-top: 0.375rem;
  color: var(--c-steel);
  font-size: 0.9375rem;
  @include line-clamp(2);
}

.rowAside {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
}

.date {
  font-family: var(--font-mono);
  font-size: var(--fs-meta);
  color: var(--c-slate);
  white-space: nowrap;

  @media (max-width: $bp-tablet - 1) {
    display: none;
  }
}

.chevron {
  width: 18px;
  height: 18px;
  color: var(--c-slate);
  transition: transform $dur var(--ease-out);

  .rowOpen & {
    transform: rotate(180deg);
  }
}

.rowBody {
  padding: 0 2rem 1.5rem;
  font-size: 1rem;
  animation: rowIn $dur var(--ease-out);

  @media (max-width: $bp-tablet - 1) {
    padding: 0 1.25rem 1.25rem;
  }
}

@keyframes rowIn {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.rowFoot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 1rem;
  padding-top: 0.875rem;
  border-top: 1px solid var(--c-border);
}

.author {
  font-size: var(--fs-meta);
  color: var(--c-slate);
}

.skeletonRow {
  display: grid;
  gap: 0.75rem;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--c-border);

  @media (max-width: $bp-tablet - 1) {
    padding: 1.25rem;
  }
}

.pagination {
  margin-top: 2.5rem;
}
</style>
