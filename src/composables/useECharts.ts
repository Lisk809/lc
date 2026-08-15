// ECharts 组合式封装：按需引入（控制包体积）+ 暗色模式同步 + 窗口 resize
// 主题色通过 setOption 合并进实例；ui.isDark 是 .dark class 的唯一写入方，watch 它即可
import { onBeforeUnmount, watch, type Ref } from 'vue'
import * as echarts from 'echarts/core'
import { BarChart, LineChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { EChartsCoreOption } from 'echarts/core'
import { useUiStore } from '@/stores/ui'

echarts.use([BarChart, LineChart, GridComponent, LegendComponent, TooltipComponent, CanvasRenderer])

type Chart = ReturnType<typeof echarts.init>

/** 明暗两套文字/轴线/提示框配色（按需引入的组件子集） */
function themeOption(isDark: boolean): EChartsCoreOption {
  const text = isDark ? '#cbd5e1' : '#475569'
  const grid = isDark ? 'rgba(148, 163, 184, 0.15)' : '#e2e8f0'
  const axis = isDark ? '#52525b' : '#cbd5e1'
  return {
    textStyle: { color: text },
    xAxis: {
      axisLine: { lineStyle: { color: axis } },
      axisLabel: { color: text },
      splitLine: { lineStyle: { color: grid } },
    },
    yAxis: {
      axisLine: { lineStyle: { color: axis } },
      axisLabel: { color: text },
      splitLine: { lineStyle: { color: grid } },
    },
    legend: { textStyle: { color: text } },
    tooltip: {
      backgroundColor: isDark ? '#1e293b' : '#ffffff',
      borderColor: isDark ? '#334155' : '#e2e8f0',
      textStyle: { color: isDark ? '#f1f5f9' : '#0f172a' },
    },
  }
}

export function useECharts(elRef: Ref<HTMLElement | null>) {
  const ui = useUiStore()
  let chart: Chart | null = null

  function init() {
    const el = elRef.value
    if (!el || chart) return
    chart = echarts.init(el)
  }

  function setOption(option: EChartsCoreOption) {
    if (!chart) init()
    if (!chart) return
    chart.setOption(option)
    chart.setOption(themeOption(ui.isDark)) // echarts 按组件索引合并，不会覆盖调用方的 xAxis 数据
  }

  function resize() {
    chart?.resize()
  }

  function dispose() {
    chart?.dispose()
    chart = null
  }

  // 暗色切换：重新合并主题色（exam.md §5.3）
  watch(
    () => ui.isDark,
    (isDark) => {
      if (chart) chart.setOption(themeOption(isDark))
    },
  )

  window.addEventListener('resize', resize)
  onBeforeUnmount(() => {
    window.removeEventListener('resize', resize)
    dispose()
  })

  return { init, setOption, resize, dispose }
}
