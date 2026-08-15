<script setup lang="ts">
// ============================================================
// 符卡 SpellCard：首页 hero 的 3D 符卡视觉
// · 四层结构：纯色卡底 → 背景图 → 人物抠图（卡内裁切）→ 人物复制层（与人物层方向重合，只露卡外部分）
// · 人物按原比例放大到高于卡面（pop 可调），底边沉入卡外，形成「人物跳出卡片」的效果
// · 鼠标倾斜：整体 rotateX/rotateY（≤6°，浮动感），rAF 阻尼平滑
// · 高光：跟手光斑 + 光晕边界「实线弧→渐细消失」，独立混合层单独计算
// · 投影：卡底与主页平面间的呼吸投影，随倾斜轻微偏移缩放
// · 图片缺失/加载失败时回退到内置插画（苯环分子 + 弹幕点阵）。
// ============================================================
import { onBeforeUnmount, onMounted, ref } from 'vue'
import YinYangMark from '@/components/atoms/YinYangMark.vue'

const props = withDefaults(
  defineProps<{
    /** 人物抠图（透明 PNG，人物尽量占满画幅：头顶贴住上边缘、底边贴住下边缘） */
    frontSrc?: string
    /** 背景图（卡面场景，以 cover 方式铺满） */
    backSrc?: string
    /** 卡面宽高比 */
    aspect?: string
    /** 人物高出卡面上缘的比例（0 = 不出框），默认 0.1 */
    pop?: number
  }>(),
  {
    frontSrc: '/assets/spell-card/front.png',
    backSrc: '/assets/spell-card/back.png',
    aspect: '3 / 2',
    pop: 0.1,
  },
)

const MAX_TILT = 6 // 最大倾斜角（度），刻意收敛，保持「浮动」而非翻面

const sceneEl = ref<HTMLElement | null>(null)
const tiltEl = ref<HTMLElement | null>(null)
const shadowEl = ref<HTMLElement | null>(null)

const frontFailed = ref(false)
const backFailed = ref(false)

const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

// 指针驱动（目标值）与阻尼平滑后的当前值
const target = { x: 0.5, y: 0.5, lx: 50, ly: 42, hasPointer: false }
const state = { rx: 0, ry: 0, lx: 50, ly: 42 }
let rafId = 0
let lastMove = performance.now()

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

function onPointerMove(e: PointerEvent) {
  const scene = sceneEl.value
  const card = tiltEl.value
  if (!scene || !card) return
  const s = scene.getBoundingClientRect()
  const c = card.getBoundingClientRect()
  // 倾斜：以场景中心为原点归一化
  target.x = (e.clientX - s.left) / s.width
  target.y = (e.clientY - s.top) / s.height
  // 光斑：卡面坐标（允许略微溢出，边缘裁切更自然）
  target.lx = clamp(((e.clientX - c.left) / c.width) * 100, -10, 110)
  target.ly = clamp(((e.clientY - c.top) / c.height) * 100, -10, 110)
  target.hasPointer = true
  lastMove = performance.now()
}

function onPointerEnter() {
  target.hasPointer = true
}

function onPointerLeave() {
  target.hasPointer = false
}

function tick(now: number) {
  const hasPointer = target.hasPointer
  // 倾斜：跟手，离开后缓慢回正
  const tx = hasPointer ? clamp((target.x - 0.5) * 2, -1, 1) : 0
  const ty = hasPointer ? clamp((target.y - 0.5) * 2, -1, 1) : 0
  const kTilt = hasPointer ? 0.13 : 0.045
  state.rx += (ty * MAX_TILT - state.rx) * kTilt
  state.ry += (tx * MAX_TILT - state.ry) * kTilt

  // 光斑：跟手；闲置时沿椭圆轨迹缓慢漂移，模拟卡面高光游移
  let lx = state.lx
  let ly = state.ly
  if (hasPointer) {
    lx = target.lx
    ly = target.ly
  } else if (!reduced && now - lastMove > 2400) {
    lx = 50 + Math.sin(now / 2300) * 26
    ly = 42 + Math.sin(now / 3100 + 1.9) * 18
  }
  const kLight = hasPointer ? 0.32 : 0.02
  state.lx += (lx - state.lx) * kLight
  state.ly += (ly - state.ly) * kLight

  if (tiltEl.value) {
    const t = `rotateX(${state.rx.toFixed(3)}deg) rotateY(${state.ry.toFixed(3)}deg)`
    if (tiltEl.value.style.transform !== t) tiltEl.value.style.transform = t
    tiltEl.value.style.setProperty('--lx', `${state.lx.toFixed(2)}%`)
    tiltEl.value.style.setProperty('--ly', `${state.ly.toFixed(2)}%`)
  }
  if (shadowEl.value) {
    // 投影随倾斜反方向偏移、随俯仰轻微缩放
    const shx = -state.ry * 1.6
    const shs = 1 - ((Math.abs(state.rx) + Math.abs(state.ry)) / (MAX_TILT * 2)) * 0.09
    const t = `translateX(${shx.toFixed(2)}px) scale(${shs.toFixed(3)})`
    if (shadowEl.value.style.transform !== t) shadowEl.value.style.transform = t
  }
  rafId = requestAnimationFrame(tick)
}

onMounted(() => {
  rafId = requestAnimationFrame(tick)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
})
</script>

<template>
  <div
    ref="sceneEl"
    :class="$style.scene"
    :style="{ '--card-aspect': props.aspect, '--pop': props.pop }"
    @pointermove="onPointerMove"
    @pointerenter="onPointerEnter"
    @pointerleave="onPointerLeave"
  >
    <div :class="$style.float">
      <div ref="tiltEl" :class="$style.tilt">
        <!-- 最底层：纯色卡底（画板），四周露出的色边即卡框 -->
        <div :class="$style.layerBase" />

        <!-- 第二层：背景图（卡面场景，四周露出卡底色边） -->
        <div :class="$style.layerBack">
          <img
            v-if="props.backSrc && !backFailed"
            :src="props.backSrc"
            alt=""
            draggable="false"
            @error="backFailed = true"
          />
          <div v-else :class="$style.backFallback" aria-hidden="true">
            <div :class="$style.backFrame" />
            <YinYangMark :class="$style.backSeal" />
          </div>
          <div :class="$style.backSheen" aria-hidden="true" />
        </div>

        <!-- 第三层：人物抠图（裁切到卡内，带卡面高光与轮廓投影）
             第四层：人物复制层 —— 与人物层方向完全重合，只放行卡面上缘以外的部分，
             两层像素一致、在卡面上缘处无缝相接，形成「人物跳出卡片」 -->
        <template v-if="props.frontSrc && !frontFailed">
          <div :class="$style.layerFront">
            <img
              :src="props.frontSrc"
              alt=""
              draggable="false"
              :class="[$style.personImg, $style.personShadow]"
              @error="frontFailed = true"
            />
            <!-- 高光：独立混合层，单独计算（跟手光斑 + 边界高光弧线） -->
            <div :class="$style.glare" aria-hidden="true">
              <div :class="$style.glowWide" />
              <div :class="$style.glowCore" />
              <div :class="$style.glowRim" />
            </div>
          </div>

          <div :class="$style.layerTop">
            <img :src="props.frontSrc" alt="" draggable="false" :class="$style.personImg" />
          </div>
        </template>
      </div>
    </div>

    <!-- 卡底与主页平面间的浮动投影 -->
    <div ref="shadowEl" :class="$style.cardShadow" aria-hidden="true">
      <div :class="$style.shadowPulse" />
    </div>
  </div>
</template>

<style module lang="scss">
// ---- 场景（透视容器） ----
.scene {
  position: relative;
  width: 100%;
  max-width: 440px;
  // 上边距为跳出的人物头部留空间（卡高上限 293px：440 × 2/3）
  padding: calc(34px + var(--pop, 0.1) * 293px) 10px 44px;
  perspective: 1000px;
  touch-action: pan-y;
  user-select: none;
}

// 待机浮动：上下轻浮 + 微小摆动；preserve-3d 保持透视链不断
.float {
  transform-style: preserve-3d;

  @include motion-safe {
    animation: card-float 6s ease-in-out infinite;
  }
}

@keyframes card-float {
  0%,
  100% {
    transform: translateY(-5px) rotate(-0.35deg);
  }

  50% {
    transform: translateY(5px) rotate(0.3deg);
  }
}

.tilt {
  position: relative;
  transform-style: preserve-3d;
  // 光斑位置（%），由 rAF 写入，两层高光共用
  --lx: 50%;
  --ly: 42%;
}

// ---- 最底层：纯色卡底（画板），承担纸边收光与投影 ----
.layerBase {
  width: 100%;
  aspect-ratio: var(--card-aspect, 3 / 2);
  border-radius: 1.375rem;
  background: var(--c-surface);
  transform: translateZ(-14px) rotate(1.1deg);
  backface-visibility: hidden;
  // 纸边厚度：上/左缘受光泛白、下/右缘暗部收边；外投影落在主页平面上
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.6),
    inset 1px 0 0 rgba(255, 255, 255, 0.22),
    inset 0 -1px 0 rgba(15, 18, 25, 0.1),
    inset -1px 0 0 rgba(15, 18, 25, 0.05),
    0 1px 2px rgba(15, 18, 25, 0.1),
    0 10px 22px -10px rgba(15, 18, 25, 0.26);
}

// ---- 第二层：背景图（四周露卡底色边，轻微嵌入画板） ----
.layerBack {
  position: absolute;
  inset: 3.2%;
  overflow: hidden;
  border-radius: 0.875rem;
  background: var(--c-surface);
  transform: translateZ(-8px) rotate(1.1deg);
  backface-visibility: hidden;
  // 内嵌阴影：照片沉入画板的感觉
  box-shadow:
    inset 0 2px 10px rgba(15, 18, 25, 0.22),
    inset 0 -1px 0 rgba(255, 255, 255, 0.3);

  img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

// 背景回退：纸色渐变 + 弹幕点阵 + 内框 + 阴阳玉印章
.backFallback {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background-color: var(--c-surface);
  background-image:
    radial-gradient(circle 2px, color-mix(in srgb, var(--c-slate) 55%, transparent) 40%, transparent 46%),
    radial-gradient(circle 1.5px, color-mix(in srgb, var(--c-slate) 45%, transparent) 40%, transparent 46%),
    linear-gradient(
      160deg,
      color-mix(in srgb, var(--c-surface) 80%, var(--c-accent) 20%),
      color-mix(in srgb, var(--c-surface) 64%, var(--c-accent) 36%)
    );
  background-size: 36px 36px, 22px 22px, 100% 100%;
  background-position: 0 0, 11px 9px, 0 0;
}

.backFrame {
  position: absolute;
  inset: 14px;
  border: 1px solid color-mix(in srgb, var(--c-ink) 16%, transparent);
  border-radius: 0.875rem;
}

.backSeal {
  width: 30%;
  height: auto;
  color: color-mix(in srgb, var(--c-ink) 12%, transparent);
}

// 背景微弱反光：画面也沾一点光
// 半径只能用 px：circle 的 <size> 语法不接受单个百分比（圆：一个 <length>；椭圆：两个 <length-percentage>）
.backSheen {
  position: absolute;
  inset: 0;
  pointer-events: none;
  mix-blend-mode: screen;
  mix-blend-mode: plus-lighter;
  background: radial-gradient(circle 134px at var(--lx, 50%) var(--ly, 42%), rgba(255, 255, 255, 0.17), transparent 70%);
}

// ---- 第三层：人物抠图（裁切到卡内 + 卡面高光） ----
.layerFront {
  position: absolute;
  inset: 0;
  overflow: hidden;
  border-radius: 1.375rem;
  transform: translateZ(16px) rotate(1.1deg);
  backface-visibility: hidden;
}

// ---- 第四层：人物复制层 —— 与人物层方向完全重合，只在卡面上缘以外显示，
//      两层像素一致，在卡面上缘处无缝相接，形成「人物跳出卡片」 ----
.layerTop {
  position: absolute;
  inset: 0;
  transform: translateZ(16px) rotate(1.1deg);
  backface-visibility: hidden;
  // 只裁掉卡内部分：上缘向上放宽 pop（再 -2px 防亚像素切到头顶），左右与卡边对齐、底边与卡底对齐
  clip-path: inset(calc(-1 * var(--pop, 0.1) * 100% - 2px) 0 0 0);
}

// 人物贴图：保持原比例放大到高于卡面，底边沉到卡底以下，
// 让身体的「硬切边」藏进卡外；左右超宽部分由卡面裁切
// 贴图再转 -1.95°，与卡框 +1.1° 相抵后净 -0.85°，延续贴纸的轻微反斜
.personImg {
  position: absolute;
  bottom: -8px;
  left: 50%;
  height: calc((1 + var(--pop, 0.1)) * 100% + 8px);
  width: auto;
  transform: translateX(-50%) rotate(-1.95deg);
  backface-visibility: hidden;
}

// 卡内人物的轮廓投影（落在背景图上；顶层人物不重复投影，头部保持干净）
.personShadow {
  filter: drop-shadow(0 14px 18px rgba(15, 18, 25, 0.34));
}

// ---- 高光层（卡面表面） ----
.glare {
  position: absolute;
  inset: 0;
  overflow: hidden;
  border-radius: inherit;
  pointer-events: none;
  // 加色混合：真实卡面反光的亮度叠加；独立于倾斜/浮动单独计算
  mix-blend-mode: screen;
  mix-blend-mode: plus-lighter;
}

.glowWide,
.glowCore,
.glowRim {
  position: absolute;
  inset: 0;
}

// 大面积柔光晕（半径 px：见 .backSheen 注释；30% ≈ 440×293 对角基准 374px 的 30%）
.glowWide {
  background: radial-gradient(circle 112px at var(--lx, 50%) var(--ly, 42%), rgba(255, 255, 255, 0.2), transparent 68%);
}

// 中心亮核
.glowCore {
  background: radial-gradient(circle 37px at var(--lx, 50%) var(--ly, 42%), rgba(255, 255, 255, 0.55), rgba(255, 255, 255, 0.14) 52%, transparent 70%);
}

// 光晕边界：一段高光实线弧，沿边缘渐细、两端消失（现实卡面照光的边界感）
// 注意：--rim-r 不能含百分比（max(58px, 15%) 会让 mask 整体失效，扇形裸奔）
.glowRim {
  --rim-r: 58px;
  background: conic-gradient(
    at var(--lx, 50%) var(--ly, 42%),
    transparent 0deg,
    transparent 210deg,
    rgba(255, 255, 255, 0.95) 255deg,
    rgba(255, 255, 255, 0.95) 345deg,
    transparent 395deg
  );
  -webkit-mask: radial-gradient(circle var(--rim-r) at var(--lx, 50%) var(--ly, 42%), transparent calc(100% - 6px), rgba(0, 0, 0, 0.55) calc(100% - 3px), rgba(0, 0, 0, 0.95) calc(100% - 1.5px), transparent 100%);
  mask: radial-gradient(circle var(--rim-r) at var(--lx, 50%) var(--ly, 42%), transparent calc(100% - 6px), rgba(0, 0, 0, 0.55) calc(100% - 3px), rgba(0, 0, 0, 0.95) calc(100% - 1.5px), transparent 100%);
}

// ---- 浮动投影（卡底与主页平面之间） ----
.cardShadow {
  position: absolute;
  left: 12%;
  right: 12%;
  bottom: 14px;
  height: 24px;
  pointer-events: none;
  will-change: transform;
}

.shadowPulse {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(ellipse at center, rgba(10, 12, 20, 0.32), rgba(10, 12, 20, 0.12) 55%, transparent 74%);
  filter: blur(5px);

  // 与卡片的待机浮动同周期呼吸
  @include motion-safe {
    animation: shadow-breathe 6s ease-in-out infinite;
  }
}

@keyframes shadow-breathe {
  0%,
  100% {
    transform: scale(0.9);
    opacity: 0.7;
  }

  50% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
