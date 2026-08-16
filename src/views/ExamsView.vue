<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useExamStore } from '@/stores/exams'
import { useUserStore } from '@/stores/user'
import type { Exam } from '@/types'
import ExamCard from '@/components/molecules/ExamCard.vue'
import ExamDetailModal from '@/components/molecules/ExamDetailModal.vue'
import PaginationBar from '@/components/molecules/PaginationBar.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import SkeletonBox from '@/components/atoms/SkeletonBox.vue'
import EmptyState from '@/components/atoms/EmptyState.vue'

const router = useRouter()
const examStore = useExamStore()
const user = useUserStore()

const selected = ref<Exam | null>(null)

onMounted(() => {
  if (!examStore.list.length) void examStore.fetchList({ page: 1 })
})

function openExam(exam: Exam) {
  selected.value = exam
}

function closeModal() {
  selected.value = null
}

function changePage(page: number) {
  void examStore.fetchList({ page })
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <div :class="$style.page">
    <div :class="$style.head">
      <header class="pageHead" v-reveal>
        <h1 class="pageTitle">联考</h1>
        <p class="pageSub">独立的联考事件：下载试卷与答题卡，提交答卷 PDF，等待批改与统计。</p>
      </header>
      <BaseButton v-if="user.isAdmin" v-reveal="80" @click="router.push('/exams/create')">创建联考</BaseButton>
    </div>

    <div :class="$style.grid">
      <template v-if="examStore.loading">
        <div v-for="i in 6" :key="i" :class="$style.skeletonCard">
          <SkeletonBox height="22px" width="70%" />
          <SkeletonBox height="16px" width="100%" />
          <SkeletonBox height="16px" width="55%" />
          <SkeletonBox height="18px" width="45%" radius="999px" />
        </div>
      </template>
      <template v-else-if="examStore.error">
        <div :class="$style.gridFull">
          <EmptyState title="联考加载失败" description="网络似乎开小差了，稍后重试。">
            <template #action>
              <BaseButton variant="outline" @click="examStore.fetchList()">重新加载</BaseButton>
            </template>
          </EmptyState>
        </div>
      </template>
      <template v-else-if="examStore.list.length">
        <div v-for="(e, i) in examStore.list" :key="e.id" v-reveal="i * 40">
          <ExamCard :exam="e" @open="openExam" />
        </div>
      </template>
      <div v-else :class="$style.gridFull">
        <EmptyState
          :title="user.isAdmin ? '还没有联考' : '暂无进行中的联考'"
          :description="user.isAdmin ? '创建一场联考，上传试卷与答题卡。' : '等管理员发布联考后再来看看吧。'"
        >
          <template v-if="user.isAdmin" #action>
            <BaseButton @click="router.push('/exams/create')">创建联考</BaseButton>
          </template>
        </EmptyState>
      </div>
    </div>

    <div :class="$style.pagination">
      <PaginationBar
        :page="examStore.pagination.page"
        :pages="examStore.pagination.pages"
        :total="examStore.pagination.total"
        @change="changePage"
      />
    </div>

    <ExamDetailModal :exam="selected" @close="closeModal" />
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
