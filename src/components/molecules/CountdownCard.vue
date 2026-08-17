<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const pad = (n: number) => String(n).padStart(2, '0')

const now = ref(new Date())

/** 两个目标时间：化学竞赛初赛 / 决赛 */
const targets = [
  { key: 'prelim', label: '初赛', date: new Date(2026, 8, 6) },
  { key: 'final', label: '决赛', date: new Date(2026, 9, 30) },
]

/** 剩余 天/时/分/秒（秒只更新不翻页，其余翻页动画） */
const groups = computed(() =>
  targets.map((t) => {
    const s = Math.max(0, Math.floor((t.date.getTime() - now.value.getTime()) / 1000))
    const units = [
      { key: 'day', value: pad(Math.floor(s / 86400)) },
      { key: 'hour', value: pad(Math.floor((s % 86400) / 3600)) },
      { key: 'minute', value: pad(Math.floor((s % 3600) / 60)) },
      { key: 'second', value: pad(s % 60) },
    ]
    const flipUnits = units.filter((u) => u.key !== 'second')
    return { ...t, flipUnits, second: units[3] }
  }),
)

let timer: ReturnType<typeof setInterval> | undefined
onMounted(() => {
  timer = setInterval(() => (now.value = new Date()), 1000)
})
onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <div class="countdown">
    <div v-for="g in groups" :key="g.key" class="group">
      <span class="label">{{ g.label }} · 倒计时</span>
      <div class="row">
        <div v-for="u in g.flipUnits" :key="u.key" class="unit">
          <!-- 数值变化 → key 变化 → 翻页过渡 -->
          <Transition name="flip" mode="out-in">
            <div class="card" :key="u.value">
              <span class="half top">{{ u.value }}</span>
              <span class="half bottom">{{ u.value }}</span>
            </div>
          </Transition>
          <span class="unitLabel">{{ { day: '天', hour: '时', minute: '分' }[u.key] }}</span>
        </div>
        <!-- 秒：只更新，不做翻页 -->
        <div class="unit">
          <Transition name="tick" mode="out-in">
            <div class="card" :key="g.second.value">
              <span class="half top">{{ g.second.value }}</span>
              <span class="half bottom">{{ g.second.value }}</span>
            </div>
          </Transition>
          <span class="unitLabel">秒</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style module lang="scss">
.countdown {
  display: flex;
  justify-content: center;
  gap: 2.5rem;
  flex-wrap: wrap;
  perspective: 420px;
}

.group {
  display: grid;
  gap: 0.5rem;
  justify-items: center;
}

.label {
  font-size: 0.875rem;
  color: var(--c-slate);
  letter-spacing: 0.08em;
}

.row {
  display: flex;
  gap: 8px;
}

.unit {
  position: relative;
  display: grid;
  justify-items: center;
  gap: 0.25rem;
}

.card {
  position: relative;
  min-width: 1.65em;
  padding: 0.4em 0;
  text-align: center;
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  background: var(--c-surface-2);
  border-radius: 8px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.35),
    inset 0 0 0 1px var(--c-border);

  // 中间折痕线
  &::after {
    content: '';
    position: absolute;
    inset: 50% 0 auto;
    height: 1px;
    background: var(--c-border-strong);
    z-index: 1;
  }
}

.half {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;

  &.top {
    clip-path: inset(0 0 50% 0);
    transform-origin: top center;
  }

  &.bottom {
    clip-path: inset(50% 0 0 0);
    transform-origin: bottom center;
  }
}

.unitLabel {
  font-size: 0.6875rem;
  color: var(--c-slate);
}

// —— 翻页动画：上半页先折下，下半页再翻起 ——
.flip-enter-active {
  transition: transform 0.4s var(--ease-out);
}

.flip-leave-active {
  transition: transform 0.18s var(--ease-in);
}

.flip-leave-to .top {
  transform: rotateX(-90deg);
}

.flip-leave-to .bottom {
  opacity: 0;
}

.flip-enter-from .top {
  opacity: 0;
}

.flip-enter-from .bottom {
  transform: rotateX(90deg);
}

// 秒：轻微淡入淡出
.tick-enter-active,
.tick-leave-active {
  transition: opacity 0.22s var(--ease-out);
}

.tick-enter-from,
.tick-leave-to {
  opacity: 0.25;
}

@media (prefers-reduced-motion: reduce) {
  .flip-enter-active,
  .flip-leave-active,
  .tick-enter-active,
  .tick-leave-active {
    transition-duration: 0s;
  }
}
</style>
