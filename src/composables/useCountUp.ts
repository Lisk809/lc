import { onBeforeUnmount, ref, watch } from 'vue'

/**
 * 数字滚动动画（rAF + easeOutCubic，仅写值不触发布局动画）
 * 用于首页数据看板的统计数字。
 */
export function useCountUp(source: () => number, duration = 800) {
  const value = ref(0)
  let raf = 0

  const stop = watch(
    source,
    (target) => {
      cancelAnimationFrame(raf)
      const start = value.value
      const delta = target - start
      if (delta === 0 || typeof target !== 'number') return
      const t0 = performance.now()
      const tick = (now: number) => {
        const p = Math.min(1, (now - t0) / duration)
        const eased = 1 - Math.pow(1 - p, 3)
        value.value = Math.round(start + delta * eased)
        if (p < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    },
    { immediate: true }
  )

  onBeforeUnmount(() => {
    stop()
    cancelAnimationFrame(raf)
  })

  return value
}
