<script setup lang="ts">
// 学生个人学情面板（嵌入个人中心「学情分析」tab，exam.md §5.2）
// 联考暂无标签，雷达图按方案降级为「各场联考得失对比折线图」
import { nextTick, onMounted, ref } from 'vue'
import { fetchMyStatistics, fetchMySubmissions } from '@/api/submissions'
import { useCountUp } from '@/composables/useCountUp'
import { useECharts } from '@/composables/useECharts'
import { usePagedList } from '@/composables/usePagedList'
import { formatRelativeTime, shortId, stripMarkdown } from '@/utils/format'
import type { MyStatistics, MySubmission } from '@/types'
import BaseButton from '@/components/atoms/BaseButton.vue'
import SkeletonBox from '@/components/atoms/SkeletonBox.vue'
import EmptyState from '@/components/atoms/EmptyState.vue'
import PaginationBar from '@/components/molecules/PaginationBar.vue'

const stats = ref<MyStatistics | null>(null)
const statsLoading = ref(false)
const statsError = ref(false)

async function loadStats() {
  statsLoading.value = true
  statsError.value = false
  try {
    stats.value = await fetchMyStatistics()
    await nextTick() // 图表容器随数据就绪渲染后再初始化
    renderCharts()
  } catch {
    statsError.value = true
  } finally {
    statsLoading.value = false
  }
}

onMounted(() => {
  void loadStats()
  void loadSubmissions()
})

// KPI 数字滚动动画（平均分 *10 以保留一位小数）
const myAvg10 = useCountUp(() => Math.round((stats.value?.summary.my_avg ?? 0) * 10))
const globalAvg10 = useCountUp(() => Math.round((stats.value?.summary.global_avg ?? 0) * 10))

// ---------- 图表 ----------

const gainChartEl = ref<HTMLElement | null>(null)
const gainChart = useECharts(gainChartEl)
const historyChartEl = ref<HTMLElement | null>(null)
const historyChart = useECharts(historyChartEl)

/** 长标题截断（图表 x 轴） */
function shortTitle(title: string | null, id: string) {
  const t = title || shortId(id)
  return t.length > 10 ? t.slice(0, 10) + '…' : t
}

function renderCharts() {
  if (!stats.value) return
  const { per_exam, last_grades } = stats.value

  if (per_exam.length) {
    gainChart.setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: ['我的得分', '全局均分'] },
      grid: { left: 40, right: 20, top: 44, bottom: 64 },
      xAxis: {
        type: 'category',
        data: per_exam.map((p) => shortTitle(p.title, p.exam_id)),
        axisLabel: { interval: 0, rotate: per_exam.length > 4 ? 30 : 0 },
      },
      yAxis: { type: 'value', min: 0, max: 100 },
      series: [
        {
          name: '我的得分',
          type: 'line',
          data: per_exam.map((p) => p.score),
          itemStyle: { color: '#dc3d3d' },
          lineStyle: { color: '#dc3d3d' },
        },
        {
          name: '全局均分',
          type: 'line',
          data: per_exam.map((p) => p.global_avg),
          itemStyle: { color: '#3b82f6' },
          lineStyle: { color: '#3b82f6' },
        },
      ],
    })
  }

  if (last_grades.length) {
    // 旧 → 新展示分数波动
    const ordered = [...last_grades].reverse()
    historyChart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: 40, right: 20, top: 24, bottom: 32 },
      xAxis: { type: 'category', data: ordered.map((_, i) => `#${i + 1}`) },
      yAxis: { type: 'value', min: 0, max: 100 },
      series: [
        {
          name: '成绩',
          type: 'line',
          data: ordered.map((g) => g.score),
          areaStyle: { opacity: 0.15 },
          itemStyle: { color: '#dc3d3d' },
          lineStyle: { color: '#dc3d3d' },
        },
      ],
    })
  }
}

// ---------- 我的提交列表 ----------

const submissionsTab = usePagedList<MySubmission>((page) => fetchMySubmissions({ page, limit: 8 }))

const submissions = submissionsTab.items
const submissionsPagination = submissionsTab.pagination
const submissionsLoading = submissionsTab.loading
const submissionsError = submissionsTab.error
const loadSubmissions = submissionsTab.load
</script>

<template>
  <div :class="$style.panel">
    <!-- 加载态 -->
    <div v-if="statsLoading" :class="$style.skeletons">
      <div v-for="i in 3" :key="i" :class="$style.skeletonCard">
        <SkeletonBox height="18px" width="40%" />
        <SkeletonBox height="28px" width="65%" />
      </div>
    </div>

    <!-- 失败态 -->
    <div v-else-if="statsError" :class="$style.stateCard">
      <EmptyState title="加载失败" description="网络似乎开小差了。">
        <template #action>
          <BaseButton variant="outline" @click="loadStats">重新加载</BaseButton>
        </template>
      </EmptyState>
    </div>

    <template v-else-if="stats">
      <!-- 综合概览：个人平均分 vs 全局平均分 -->
      <div :class="$style.kpiCards">
        <div :class="$style.kpiCard">
          <p :class="$style.kpiLabel">个人平均分</p>
          <p :class="$style.kpiValue">
            {{ stats.summary.my_avg === null ? '—' : (myAvg10 / 10).toFixed(1) }}
          </p>
        </div>
        <div :class="$style.kpiCard">
          <p :class="$style.kpiLabel">全局平均分</p>
          <p :class="$style.kpiValue">
            {{ stats.summary.global_avg === null ? '—' : (globalAvg10 / 10).toFixed(1) }}
          </p>
        </div>
      </div>
      <p :class="$style.kpiMeta">
        已批改 {{ stats.summary.graded_count }} 场 · 共提交 {{ stats.summary.total_submissions }} 次
      </p>

      <!-- 图表（联考无标签，雷达图降级为得失对比折线图） -->
      <div v-if="stats.per_exam.length" :class="$style.chartCard">
        <p :class="$style.chartLabel">各场联考得失对比 · 我的得分 vs 全局均分</p>
        <div ref="gainChartEl" :class="$style.chart" />
      </div>
      <div v-if="stats.last_grades.length" :class="$style.chartCard">
        <p :class="$style.chartLabel">历史成绩（近 10 次已批改）</p>
        <div ref="historyChartEl" :class="$style.chart" />
      </div>
      <div v-if="stats.summary.graded_count === 0" :class="$style.stateCard">
        <EmptyState title="暂无批改记录" description="提交答卷并等待管理员批改后，这里会展示你的学情分析。" />
      </div>
    </template>

    <!-- 我的提交列表 -->
    <div :class="$style.listHead">
      <p :class="$style.chartLabel">我的提交</p>
    </div>
    <template v-if="submissionsLoading">
      <div v-for="i in 3" :key="i" :class="$style.itemSkeleton">
        <SkeletonBox height="20px" width="55%" />
        <SkeletonBox height="15px" width="40%" />
      </div>
    </template>
    <template v-else-if="submissionsError">
      <div :class="$style.stateCard">
        <EmptyState title="加载失败" description="网络似乎开小差了。">
          <template #action>
            <BaseButton variant="outline" @click="loadSubmissions()">重新加载</BaseButton>
          </template>
        </EmptyState>
      </div>
    </template>
    <template v-else-if="submissions.length">
      <div :class="$style.listCard">
        <div v-for="s in submissions" :key="s.id" :class="$style.item">
          <div :class="$style.itemMain">
            <h4 :class="$style.itemTitle">{{ s.exam_title || shortId(s.exam_id) }}</h4>
            <p v-if="s.comment" :class="$style.itemSub">{{ stripMarkdown(s.comment, 80) }}</p>
          </div>
          <div :class="$style.itemAside">
            <span v-if="s.status === 'pending'" :class="[$style.badge, $style.pending]">待批改</span>
            <span v-else :class="[$style.badge, $style.graded]">{{ s.score }} 分</span>
            <span :class="$style.itemMeta">{{ formatRelativeTime(s.created_at) }}</span>
          </div>
        </div>
      </div>
      <div :class="$style.pagination">
        <PaginationBar
          :page="submissionsPagination.page"
          :pages="submissionsPagination.pages"
          :total="submissionsPagination.total"
          @change="(p) => loadSubmissions(p)"
        />
      </div>
    </template>
    <div v-else :class="$style.stateCard">
      <EmptyState title="还没有提交" description="在联考页打开联考即可提交答卷。" />
    </div>
  </div>
</template>

<style module lang="scss">
.panel {
  display: grid;
  gap: 1.25rem;
}

.skeletons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;

  @media (max-width: $bp-tablet - 1) {
    grid-template-columns: 1fr;
  }
}

.skeletonCard {
  display: grid;
  gap: 0.75rem;
  padding: 1.75rem;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-card);
}

.kpiCards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;

  @media (max-width: $bp-tablet - 1) {
    grid-template-columns: 1fr;
  }
}

.kpiCard {
  padding: 1.5rem 1.75rem;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-card);
  box-shadow: var(--shadow-card);
}

.kpiLabel {
  font-family: var(--font-mono);
  font-size: var(--fs-meta);
  letter-spacing: 0.12em;
  color: var(--c-slate);
}

.kpiValue {
  margin-top: 0.5rem;
  font-family: var(--font-mono);
  font-size: clamp(2rem, 3vw, 2.5rem);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--c-accent);
}

.kpiMeta {
  margin-top: -0.5rem;
  color: var(--c-steel);
  font-size: 0.875rem;
}

.chartCard {
  padding: 1.5rem 1.25rem 1rem;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-card);
  box-shadow: var(--shadow-card);
}

.chartLabel {
  font-family: var(--font-mono);
  font-size: var(--fs-meta);
  letter-spacing: 0.12em;
  color: var(--c-slate);
  margin-bottom: 0.5rem;
}

.chart {
  width: 100%;
  height: 300px;
}

.listHead {
  margin-top: 0.25rem;
}

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
  gap: 1rem;
  padding: 1rem 1.5rem;
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
  @include line-clamp(1);
}

.itemAside {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.itemMeta {
  font-family: var(--font-mono);
  font-size: var(--fs-meta);
  color: var(--c-slate);
  white-space: nowrap;
}

.badge {
  padding: 0.2rem 0.625rem;
  border-radius: var(--r-full);
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.pending {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.graded {
  background: rgba(34, 197, 94, 0.15);
  color: #22c55e;
}

.itemSkeleton {
  display: grid;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-card);
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
  margin-top: 0.25rem;
}
</style>
