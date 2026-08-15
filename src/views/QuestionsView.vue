<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuestionStore } from '@/stores/questions'
import { useUserStore } from '@/stores/user'
import type { Question } from '@/types'
import QuestionCard from '@/components/molecules/QuestionCard.vue'
import QuestionDetailModal from '@/components/molecules/QuestionDetailModal.vue'
import PaginationBar from '@/components/molecules/PaginationBar.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import SkeletonBox from '@/components/atoms/SkeletonBox.vue'
import EmptyState from '@/components/atoms/EmptyState.vue'

const router = useRouter()
const questionStore = useQuestionStore()
const user = useUserStore()

const selected = ref<Question | null>(null)

onMounted(() => {
  if (!questionStore.list.length) void questionStore.fetchList({ page: 1 })
})

function openQuestion(question: Question) {
  selected.value = question
}

function closeModal() {
  selected.value = null
}

function changePage(page: number) {
  void questionStore.fetchList({ page })
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function goCreate() {
  if (user.isLoggedIn) router.push('/questions/create')
  else router.push({ path: '/auth/login', query: { redirect: '/questions/create' } })
}
</script>

<template>
  <div :class="$style.page">
    <div :class="$style.head">
      <header class="pageHead" v-reveal>
        <h1 class="pageTitle">题库</h1>
        <p class="pageSub">社区共建的竞赛题库。点击题目卡片查看详情，答案仅作者与管理员可见。</p>
      </header>
      <BaseButton v-reveal="80" @click="goCreate">创建题目</BaseButton>
    </div>

    <div :class="$style.grid">
      <template v-if="questionStore.loading">
        <div v-for="i in 6" :key="i" :class="$style.skeletonCard">
          <SkeletonBox height="22px" width="70%" />
          <SkeletonBox height="16px" width="100%" />
          <SkeletonBox height="16px" width="55%" />
          <SkeletonBox height="18px" width="45%" radius="999px" />
        </div>
      </template>
      <template v-else-if="questionStore.error">
        <div :class="$style.gridFull">
          <EmptyState title="题库加载失败" description="网络似乎开小差了，稍后重试。">
            <template #action>
              <BaseButton variant="outline" @click="questionStore.fetchList()">重新加载</BaseButton>
            </template>
          </EmptyState>
        </div>
      </template>
      <template v-else-if="questionStore.list.length">
        <div v-for="(q, i) in questionStore.list" :key="q.id" v-reveal="i * 40">
          <QuestionCard :question="q" @open="openQuestion" />
        </div>
      </template>
      <div v-else :class="$style.gridFull">
        <EmptyState title="题库还是空的" description="创建第一道题目，为社区题库添砖加瓦。">
          <template #action>
            <BaseButton @click="goCreate">创建题目</BaseButton>
          </template>
        </EmptyState>
      </div>
    </div>

    <div :class="$style.pagination">
      <PaginationBar
        :page="questionStore.pagination.page"
        :pages="questionStore.pagination.pages"
        :total="questionStore.pagination.total"
        @change="changePage"
      />
    </div>

    <QuestionDetailModal :question="selected" @close="closeModal" />
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

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
  margin-top: 2.5rem;

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
