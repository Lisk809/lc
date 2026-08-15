<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePostStore } from '@/stores/posts'
import { useUserStore } from '@/stores/user'
import type { PostSortBy } from '@/types'
import PostCard from '@/components/molecules/PostCard.vue'
import PaginationBar from '@/components/molecules/PaginationBar.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import SkeletonBox from '@/components/atoms/SkeletonBox.vue'
import EmptyState from '@/components/atoms/EmptyState.vue'

const router = useRouter()
const postStore = usePostStore()
const user = useUserStore()

const sorts: { key: PostSortBy; label: string }[] = [
  { key: 'created_at', label: '最新' },
  { key: 'likes_count', label: '最热' },
  { key: 'reply_count', label: '回复最多' },
]

onMounted(() => {
  if (!postStore.list.length) void postStore.fetchList({ page: 1 })
})

function changeSort(key: PostSortBy) {
  if (postStore.sortBy === key) return
  postStore.sortBy = key
  void postStore.fetchList({ page: 1 })
}

function changePage(page: number) {
  void postStore.fetchList({ page })
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function goCreate() {
  if (user.isLoggedIn) router.push('/posts/create')
  else router.push({ path: '/auth/login', query: { redirect: '/posts/create' } })
}
</script>

<template>
  <div :class="$style.page">
    <div :class="$style.head">
      <header class="pageHead" v-reveal>
        <h1 class="pageTitle">帖子</h1>
        <p class="pageSub">真题讨论、解法分享与备考心得。支持 Markdown 与附件。</p>
      </header>
      <BaseButton v-reveal="80" @click="goCreate">发布帖子</BaseButton>
    </div>

    <div v-reveal="120" :class="$style.toolbar">
      <div :class="$style.sorts" role="tablist" aria-label="排序方式">
        <button
          v-for="sort in sorts"
          :key="sort.key"
          type="button"
          role="tab"
          :aria-selected="postStore.sortBy === sort.key"
          :class="[$style.sort, { [$style.sortActive]: postStore.sortBy === sort.key }]"
          @click="changeSort(sort.key)"
        >
          {{ sort.label }}
        </button>
      </div>
      <p v-if="postStore.pagination.total > 0" :class="$style.count">共 {{ postStore.pagination.total }} 篇</p>
    </div>

    <div :class="$style.grid">
      <template v-if="postStore.loading">
        <div v-for="i in 6" :key="i" :class="$style.skeletonCard">
          <SkeletonBox height="22px" width="70%" />
          <SkeletonBox height="16px" width="100%" />
          <SkeletonBox height="16px" width="60%" />
          <SkeletonBox height="18px" width="45%" radius="999px" />
        </div>
      </template>
      <template v-else-if="postStore.error">
        <div :class="$style.gridFull">
          <EmptyState title="帖子加载失败" description="网络似乎开小差了，稍后重试。">
            <template #action>
              <BaseButton variant="outline" @click="postStore.fetchList()">重新加载</BaseButton>
            </template>
          </EmptyState>
        </div>
      </template>
      <template v-else-if="postStore.list.length">
        <div v-for="(post, i) in postStore.list" :key="post.id" v-reveal="i * 40">
          <PostCard :post="post" />
        </div>
      </template>
      <div v-else :class="$style.gridFull">
        <EmptyState title="还没有帖子" description="发布第一帖，开启社区讨论。">
          <template #action>
            <BaseButton @click="goCreate">发布帖子</BaseButton>
          </template>
        </EmptyState>
      </div>
    </div>

    <div :class="$style.pagination">
      <PaginationBar
        :page="postStore.pagination.page"
        :pages="postStore.pagination.pages"
        :total="postStore.pagination.total"
        @change="changePage"
      />
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

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 2.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--c-border);
  flex-wrap: wrap;
}

.sorts {
  display: inline-flex;
  gap: 0.25rem;
  padding: 0.25rem;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-full);
}

.sort {
  min-height: 44px;
  padding: 0 1.125rem;
  border-radius: var(--r-full);
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--c-steel);
  transition: background-color $dur var(--ease-out), color $dur var(--ease-out);

  &:hover {
    color: var(--c-ink);
  }
}

.sortActive {
  background: var(--c-accent-soft);
  color: var(--c-accent);

  &:hover {
    color: var(--c-accent);
  }
}

.count {
  font-family: var(--font-mono);
  font-size: var(--fs-meta);
  color: var(--c-slate);
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
  margin-top: 1.5rem;

  @media (max-width: $bp-desktop - 1) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: $bp-tablet - 1) {
    grid-template-columns: 1fr;
  }
}

.skeletonCard {
  display: grid;
  gap: 0.875rem;
  padding: 1.5rem;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-card);
}

.gridFull {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  border: 1px dashed var(--c-border-strong);
  border-radius: var(--r-card);
}

.pagination {
  margin-top: 2.5rem;
}
</style>
