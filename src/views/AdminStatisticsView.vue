<script setup lang="ts">
// 管理员全局统计看板（exam.md §5.1）：KPI 卡片 + 分数分布 / 题目难度 / 批改趋势
import { nextTick, onMounted, ref } from 'vue'
import { fetchAdminOverview } from '@/api/submissions'
import { useCountUp } from '@/composables/useCountUp'
import { useECharts } from '@/composables/useECharts'
import type { AdminOverview } from '@/types'
import SkeletonBox from '@/components/atoms/SkeletonBox.vue'
import EmptyState from '@/components/atoms/EmptyState.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'

const overview = ref<AdminOverview | null>(null)
const loading = ref(false)
const error = ref(false)

async function load() {
  loading.value = true
  error.value = false
  try {
    overview.value = await fetchAdminOverview()
    await nextTick() // 图表容器随数据就绪渲染后再初始化
    renderCharts()
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

onMounted(() => void load())

// KPI 数字滚动动画（平均分 *10 以保留一位小数）
const totalDisplay = useCountUp(() => overview.value?.kpis.total_submissions ?? 0)
const pendingDisplay = useCountUp(() => overview.value?.kpis.pending_submissions ?? 0)
const avg10Display = useCountUp(() => Math.round((overview.value?.kpis.avg_score ?? 0) * 10))
const studentsDisplay = useCountUp(() => overview.value?.kpis.students ?? 0)

// ---------- 图表 ----------

const distEl = ref<HTMLElement | null>(null)
const distChart = useECharts(distEl)
const diffEl = ref<HTMLElement | null>(null)
const diffChart = useECharts(diffEl)
const trendEl = ref<HTMLElement | null>(null)
const trendChart = useECharts(trendEl)

/** 题目难度颜色映射：红（低分/难）→ 绿（高分/易） */
function scoreColor(avg: number) {
  if (avg < 60) return '#ef4444'
  if (avg < 70) return '#f59e0b'
  if (avg < 80) return '#3b82f6'
  return '#22c55e'
}

function shortTitle(title: string | null, id: string) {
  const t = title || `联考 ${id.slice(0, 8)}`
  return t.length > 14 ? t.slice(0, 14) + '…' : t
}

function renderCharts() {
  if (!overview.value) return
  const { score_distribution, exam_difficulty, trend } = overview.value

  // 分数分布柱状图（渐进蓝色）
  if (score_distribution.length) {
    distChart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: 40, right: 20, top: 24, bottom: 36 },
      xAxis: { type: 'category', data: score_distribution.map((d) => d.bucket) },
      yAxis: { type: 'value', minInterval: 1 },
      series: [
        {
          name: '人数',
          type: 'bar',
          data: score_distribution.map((d) => d.count),
          barWidth: '46%',
          itemStyle: {
            color: (params: { dataIndex: number }) =>
              ['#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8'][params.dataIndex],
          },
        },
      ],
    })
  }

  // 联考难度横向条形图（后端已按平均分升序：最难在前）
  if (exam_difficulty.length) {
    const rows = exam_difficulty.slice(0, 20) // 最多展示 20 场，避免拥挤
    diffChart.setOption({
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: 8, right: 44, top: 12, bottom: 32, containLabel: true },
      xAxis: { type: 'value', min: 0, max: 100 },
      yAxis: {
        type: 'category',
        inverse: true,
        data: rows.map((d) => shortTitle(d.title, d.exam_id)),
      },
      series: [
        {
          name: '平均分',
          type: 'bar',
          data: rows.map((d) => d.avg_score),
          barWidth: '60%',
          label: { show: true, position: 'right', color: 'inherit' },
          itemStyle: { color: (params: { dataIndex: number }) => scoreColor(rows[params.dataIndex].avg_score) },
        },
      ],
    })
  }

  // 批改趋势面积图（提交 vs 批改，14 天）
  if (trend.length) {
    trendChart.setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: ['提交', '批改'] },
      grid: { left: 40, right: 20, top: 44, bottom: 36 },
      xAxis: { type: 'category', data: trend.map((t) => t.date) },
      yAxis: { type: 'value', minInterval: 1 },
      series: [
        {
          name: '提交',
          type: 'line',
          smooth: true,
          data: trend.map((t) => t.submitted),
          areaStyle: { opacity: 0.25 },
          itemStyle: { color: '#3b82f6' },
          lineStyle: { color: '#3b82f6' },
        },
        {
          name: '批改',
          type: 'line',
          smooth: true,
          data: trend.map((t) => t.graded),
          areaStyle: { opacity: 0.3 },
          itemStyle: { color: '#8b5cf6' },
          lineStyle: { color: '#8b5cf6' },
        },
      ],
    })
  }
}
</script>

<template>
  <div :class="$style.page">
    <header class="pageHead" v-reveal>
      <h1 class="pageTitle">统计看板</h1>
      <p class="pageSub">全局提交、批改与成绩分布一览。</p>
    </header>

    <template v-if="loading">
      <div :class="$style.kpiGrid" v-reveal="40">
        <div v-for="i in 4" :key="i" :class="$style.kpiCard">
          <SkeletonBox height="16px" width="45%" />
          <SkeletonBox height="36px" width="65%" />
        </div>
      </div>
    </template>

    <template v-else-if="error">
      <div :class="$style.state" v-reveal="40">
        <EmptyState title="加载失败" description="网络似乎开小差了。">
          <template #action>
            <BaseButton variant="outline" @click="load">重新加载</BaseButton>
          </template>
        </EmptyState>
      </div>
    </template>

    <template v-else-if="overview">
      <!-- KPI 卡片 -->
      <div :class="$style.kpiGrid" v-reveal="40">
        <div :class="$style.kpiCard">
          <p :class="$style.kpiLabel">TOTAL · 总提交</p>
          <p :class="$style.kpiValue">{{ totalDisplay }}</p>
        </div>
        <div :class="$style.kpiCard">
          <p :class="$style.kpiLabel">PENDING · 待批改</p>
          <p :class="$style.kpiValue">{{ pendingDisplay }}</p>
        </div>
        <div :class="$style.kpiCard">
          <p :class="$style.kpiLabel">AVG · 平均分</p>
          <p :class="$style.kpiValue">
            {{ overview.kpis.avg_score === null ? '—' : (avg10Display / 10).toFixed(1) }}
          </p>
        </div>
        <div :class="$style.kpiCard">
          <p :class="$style.kpiLabel">STUDENTS · 参与学生</p>
          <p :class="$style.kpiValue">{{ studentsDisplay }}</p>
        </div>
      </div>

      <!-- 图表（不套 v-reveal：transform 会破坏 echarts 初始测量） -->
      <div :class="$style.charts">
        <div :class="$style.chartCard">
          <p :class="$style.chartLabel">分数分布</p>
          <div ref="distEl" :class="$style.chart" />
        </div>
        <div :class="$style.chartCard">
          <p :class="$style.chartLabel">联考难度（平均分升序）</p>
          <div ref="diffEl" :class="$style.chart" />
        </div>
        <div :class="$style.chartCardWide">
          <p :class="$style.chartLabel">批改趋势（近 14 天）</p>
          <div ref="trendEl" :class="$style.chart" />
        </div>
      </div>
    </template>
  </div>
</template>

<style module lang="scss">
.page {
  @include container;
  padding-top: var(--space-section);
}

.kpiGrid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
  margin-top: 2.5rem;

  @media (max-width: $bp-desktop - 1) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: $bp-tablet - 1) {
    grid-template-columns: 1fr;
  }
}

.kpiCard {
  display: grid;
  gap: 0.75rem;
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
  font-family: var(--font-mono);
  font-size: clamp(2rem, 3vw, 2.5rem);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--c-accent);
}

.charts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
  margin-top: 1.25rem;

  @media (max-width: $bp-tablet - 1) {
    grid-template-columns: 1fr;
  }
}

.chartCard,
.chartCardWide {
  padding: 1.5rem 1.25rem 1rem;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-card);
  box-shadow: var(--shadow-card);
}

.chartCardWide {
  grid-column: 1 / -1;
}

.chartLabel {
  margin-bottom: 0.5rem;
  font-family: var(--font-mono);
  font-size: var(--fs-meta);
  letter-spacing: 0.12em;
  color: var(--c-slate);
}

.chart {
  width: 100%;
  height: 320px;
}

.state {
  display: flex;
  justify-content: center;
  padding: 3rem;
  margin-top: 2.5rem;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-card);
  box-shadow: var(--shadow-card);
}
</style>
