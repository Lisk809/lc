<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { fetchPosts } from '@/api/posts'
import { fetchQuestions } from '@/api/questions'
import { fetchAnnouncements } from '@/api/announcements'
import { useUserStore } from '@/stores/user'
import { useCountUp } from '@/composables/useCountUp'
import { formatDateShort } from '@/utils/format'
import type { Announcement, Post } from '@/types'
import PostCard from '@/components/molecules/PostCard.vue'
import CountdownCard from '@/components/molecules/CountdownCard.vue'
import SakuraPetals from '@/components/molecules/SakuraPetals.vue'
import SpellCard from '@/components/molecules/SpellCard.vue'
import SkeletonBox from '@/components/atoms/SkeletonBox.vue'
import EmptyState from '@/components/atoms/EmptyState.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'
import YinYangMark from '@/components/atoms/YinYangMark.vue'

const router = useRouter()
const user = useUserStore()

const hotPosts = ref<Post[]>([])
const postsTotal = ref(0)
const announcements = ref<Announcement[]>([])
const announcementsTotal = ref(0)
const questionsTotal = ref(0)
const loading = reactive({ posts: true, announcements: true, questions: true })
const failed = reactive({ posts: false, announcements: false, questions: false })

async function loadPosts() {
  loading.posts = true
  failed.posts = false
  try {
    const res = await fetchPosts({ page: 1, limit: 6, sortBy: 'likes_count', order: 'DESC' })
    hotPosts.value = res.data
    postsTotal.value = res.pagination.total
  } catch {
    failed.posts = true
  } finally {
    loading.posts = false
  }
}

async function loadAnnouncements() {
  loading.announcements = true
  failed.announcements = false
  try {
    const res = await fetchAnnouncements({ page: 1, limit: 5 })
    announcements.value = res.data
    announcementsTotal.value = res.pagination.total
  } catch {
    failed.announcements = true
  } finally {
    loading.announcements = false
  }
}

async function loadQuestionsTotal() {
  loading.questions = true
  failed.questions = false
  try {
    const res = await fetchQuestions({ page: 1, limit: 1 })
    questionsTotal.value = res.pagination.total
  } catch {
    failed.questions = true
  } finally {
    loading.questions = false
  }
}

onMounted(() => {
  void loadPosts()
  void loadAnnouncements()
  void loadQuestionsTotal()
})

// 首页看板数字滚动
const postsTotalDisplay = useCountUp(() => postsTotal.value)
const questionsTotalDisplay = useCountUp(() => questionsTotal.value)
const announcementsTotalDisplay = useCountUp(() => announcementsTotal.value)

function goCreateQuestion() {
  if (user.isLoggedIn) router.push('/questions/create')
  else router.push({ path: '/auth/login', query: { redirect: '/questions/create' } })
}
</script>

<template>
  <div>
    <!-- Hero：左文案 + 右符卡视觉，非对称分栏 + 樱花飘落 -->
    <section :class="$style.hero">
      <SakuraPetals />
      <div :class="$style.heroInner">
        <div :class="$style.heroCopy">
          <p
            v-motion
            :initial="{ opacity: 0, y: 16 }"
            :enter="{ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } }"
            class="eyebrow"
          >
            Lunatic ChO · 化竞幻想乡 · 化学竞赛社区
          </p>
          <h1
            v-motion
            :initial="{ opacity: 0, y: 24 }"
            :enter="{ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20, delay: 80 } }"
            :class="$style.heroTitle"
          >
            为化学竞赛而生的<span :class="$style.inlineMark" aria-hidden="true">
              <YinYangMark /></span>知识社区
          </h1>
          <p
            v-motion
            :initial="{ opacity: 0, y: 24 }"
            :enter="{ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20, delay: 160 } }"
            :class="$style.heroSub"
          >
            讨论真题、共建题库、分享讲义，第一时间获取备考公告。
          </p>
          <div
            v-motion
            :initial="{ opacity: 0, y: 24 }"
            :enter="{ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20, delay: 240 } }"
            :class="$style.heroActions"
          >
            <BaseButton size="lg" @click="router.push('/posts')">探索帖子</BaseButton>
            <BaseButton size="lg" variant="ghost" @click="goCreateQuestion">共建题库</BaseButton>
          </div>
        </div>

        <div
          v-motion
          :initial="{ opacity: 0, y: 32 }"
          :enter="{ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 20, delay: 200 } }"
          :class="$style.heroVisual"
        >
          <div :class="$style.spellWrap">
            <SpellCard />
            <div :class="$style.liveCard">
              <span :class="$style.liveDot" aria-hidden="true" />
              <div :class="$style.liveText">
                <p :class="$style.liveLabel">LATEST · 最新公告</p>
                <template v-if="loading.announcements">
                  <SkeletonBox height="18px" width="70%" />
                </template>
                <template v-else-if="announcements.length">
                  <RouterLink to="/announcements" :class="$style.liveTitle">{{ announcements[0].title }}</RouterLink>
                </template>
                <p v-else :class="$style.liveTitle">暂无公告</p>
              </div>
            </div>
            <p :class="$style.visualCaption">
              <YinYangMark :class="$style.captionSeal" />
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- 比赛倒计时（hero 之后、告示板之前） -->
    <section :class="$style.section">
      <div v-reveal :class="$style.sectionInner">
        <header class="sectionHead">
          <div>
            <p class="eyebrow">比赛倒计时 · COUNTDOWN</p>
          </div>
        </header>
        <CountdownCard />
      </div>
    </section>

    <!-- 公告滚动条 -->
    <section :class="$style.section">
      <div :class="$style.sectionInner">
        <header v-reveal class="sectionHead">
          <div>
            <p class="eyebrow">博丽告示板 · ANNOUNCEMENTS</p>
            <h2>最新公告</h2>
          </div>
          <RouterLink to="/announcements" class="viewAll">查看全部 →</RouterLink>
        </header>
        <div v-reveal="60" :class="$style.ticker">
          <template v-if="loading.announcements">
            <span v-for="i in 4" :key="i" :class="$style.chip"><SkeletonBox height="44px" width="220px" radius="999px" /></span>
          </template>
          <template v-else-if="failed.announcements">
            <p :class="$style.tickerHint">
              公告加载失败
              <button type="button" :class="$style.retry" @click="loadAnnouncements">重试</button>
            </p>
          </template>
          <template v-else-if="announcements.length">
            <RouterLink v-for="a in announcements" :key="a.id" to="/announcements" :class="$style.chip">
              <time :class="$style.chipTime">{{ formatDateShort(a.created_at) }}</time>
              <span :class="$style.chipTitle">{{ a.title }}</span>
            </RouterLink>
          </template>
          <p v-else :class="$style.tickerHint">暂无公告</p>
        </div>
      </div>
    </section>

    <!-- 数据看板 -->
    <section :class="$style.section">
      <div v-reveal :class="$style.sectionInner">
        <div :class="$style.statsStrip">
          <div :class="$style.stat">
            <span :class="$style.statRank">NORMAL</span>
            <span :class="$style.statLabel">帖子讨论</span>
            <span :class="$style.statValue">{{ failed.posts ? '—' : postsTotalDisplay }}</span>
          </div>
          <div :class="$style.stat">
            <span :class="$style.statRank">HARD</span>
            <span :class="$style.statLabel">题库题目</span>
            <span :class="$style.statValue">{{ failed.questions ? '—' : questionsTotalDisplay }}</span>
          </div>
          <div :class="$style.stat">
            <span :class="$style.statRank">LUNATIC</span>
            <span :class="$style.statLabel">官方公告</span>
            <span :class="$style.statValue">{{ failed.announcements ? '—' : announcementsTotalDisplay }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 热门帖子 -->
    <section :class="$style.section">
      <div :class="$style.sectionInner">
        <header v-reveal class="sectionHead">
          <div>
            <p class="eyebrow">SPELL CARD RANKING</p>
            <h2>大家在讨论什么</h2>
          </div>
          <RouterLink to="/posts" class="viewAll">查看全部 →</RouterLink>
        </header>

        <div :class="$style.postsGrid">
          <template v-if="loading.posts">
            <div v-for="i in 6" :key="i" :class="$style.skeletonCard">
              <SkeletonBox height="22px" width="70%" />
              <SkeletonBox height="16px" width="100%" />
              <SkeletonBox height="16px" width="60%" />
              <SkeletonBox height="18px" width="45%" radius="999px" />
            </div>
          </template>
          <template v-else-if="failed.posts">
            <div :class="$style.gridFull">
              <EmptyState title="热门帖子加载失败" description="网络似乎开小差了，稍后重试。">
                <template #action>
                  <BaseButton variant="outline" @click="loadPosts">重新加载</BaseButton>
                </template>
              </EmptyState>
            </div>
          </template>
          <template v-else-if="hotPosts.length">
            <div v-for="(post, i) in hotPosts" :key="post.id" v-reveal="i * 50">
              <PostCard :post="post" />
            </div>
          </template>
          <div v-else :class="$style.gridFull">
            <EmptyState title="还没有帖子" description="发布第一帖，开启社区讨论。">
              <template #action>
                <BaseButton @click="router.push(user.isLoggedIn ? '/posts/create' : { path: '/auth/login', query: { redirect: '/posts/create' } })">
                  发布帖子
                </BaseButton>
              </template>
            </EmptyState>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style module lang="scss">
.section {
  margin-top: var(--space-section);
}

.sectionInner,
.heroInner {
  @include container;
}

// ---------------- Hero ----------------
.hero {
  position: relative;
  padding-top: clamp(2.5rem, 6vw, 5rem);
}

.heroInner {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
  align-items: center;
  gap: clamp(2rem, 5vw, 5rem);

  @media (max-width: $bp-tablet - 1) {
    grid-template-columns: 1fr;
  }
}

.heroTitle {
  margin-top: 1rem;
  font-size: var(--fs-display);
  font-weight: 800;
  letter-spacing: -0.025em;
  line-height: 1.1;
  max-width: 14ch;
}

// 行内阴阳玉徽标：标题中的视觉标点
.inlineMark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 0.92em;
  height: 0.92em;
  margin: 0 0.08em;
  padding: 0.13em;
  border-radius: 0.3em;
  background: var(--c-accent-soft);
  color: var(--c-ink);
  vertical-align: -0.06em;

  svg {
    width: 100%;
    height: 100%;
  }

  @media (max-width: $bp-tablet - 1) {
    display: none;
  }
}

.heroSub {
  margin-top: 1.25rem;
  max-width: 46ch;
  color: var(--c-steel);
  font-size: 1.125rem;
}

.heroActions {
  display: flex;
  gap: 0.75rem;
  margin-top: 2rem;
  flex-wrap: wrap;

  // 移动端：单列网格，按钮自动拉伸至全宽
  @media (max-width: $bp-tablet - 1) {
    display: grid;
    grid-template-columns: 1fr;
  }
}

.heroVisual {
  display: flex;
  justify-content: center;

  @media (max-width: $bp-tablet - 1) {
    order: -1;
  }
}

.spellWrap {
  position: relative;
  width: 100%;
  max-width: 470px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

// 公告徽章：浮贴在符卡右上角，轻微错位旋转
.liveCard {
  position: absolute;
  top: 0.25rem;
  right: 0.75rem;
  z-index: 2;
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  max-width: 300px;
  padding: 0.75rem 1rem;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-card);
  box-shadow: var(--shadow-pop);
  transform: rotate(1.6deg);

  @media (max-width: $bp-tablet - 1) {
    position: static;
    transform: none;
    max-width: 100%;
    margin-top: 1.25rem;
  }
}

.liveDot {
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  margin-top: 0.5rem;
  border-radius: 50%;
  background: var(--c-accent);
  animation: live-pulse 2s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
}

@keyframes live-pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: 0.4;
    transform: scale(0.8);
  }
}

.liveText {
  min-width: 0;
  display: grid;
  gap: 0.375rem;
}

.liveLabel {
  font-family: var(--font-mono);
  font-size: var(--fs-meta);
  letter-spacing: 0.1em;
  color: var(--c-slate);
}

.liveTitle {
  @include line-clamp(2);
  font-weight: 600;
  font-size: 0.9688rem;
  color: var(--c-ink);
  transition: color $dur var(--ease-out);

  &:hover {
    color: var(--c-accent);
  }
}

.visualCaption {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  margin-top: 1rem;
  font-family: var(--font-mono);
  font-size: var(--fs-meta);
  letter-spacing: 0.08em;
  color: var(--c-slate);
  transform: rotate(-1deg);
}

.captionSeal {
  width: 14px;
  height: 14px;
  color: var(--c-slate);
}

// ---------------- 公告滚动条 ----------------
.ticker {
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
  padding-block: 0.25rem;
  @include hide-scrollbar;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  flex-shrink: 0;
  min-height: 44px;
  padding: 0.5rem 1.25rem;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-full);
  transition: border-color $dur var(--ease-out), transform $dur var(--ease-out);

  &:hover {
    border-color: var(--c-accent);
    transform: translateY(-2px);
  }
}

.chipTime {
  font-family: var(--font-mono);
  font-size: var(--fs-meta);
  color: var(--c-accent);
}

.chipTitle {
  @include line-clamp(1);
  max-width: 260px;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--c-ink);
}

.tickerHint {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--c-slate);
  font-size: 0.9375rem;
}

.retry {
  min-height: 44px;
  color: var(--c-accent);
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
}

// ---------------- 数据看板 ----------------
.statsStrip {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border-block: 1px solid var(--c-border);

  @media (max-width: $bp-tablet - 1) {
    grid-template-columns: 1fr;
    gap: 1.25rem;
    padding-block: 1.5rem;
  }
}

.stat {
  display: grid;
  gap: 0.375rem;
  padding: 2rem 2.5rem;

  & + & {
    border-left: 1px solid var(--c-border);
  }

  @media (max-width: $bp-tablet - 1) {
    padding: 0;

    & + & {
      border-left: none;
      border-top: 1px solid var(--c-border);
      padding-top: 1.25rem;
    }
  }
}

.statRank {
  font-family: var(--font-mono);
  font-size: var(--fs-meta);
  letter-spacing: 0.14em;
  color: var(--c-slate);
}

// 彩蛋：只有 LUNATIC 难度（官方公告）以红白强调
.stat:last-child .statRank {
  color: var(--c-accent);
}

.statLabel {
  color: var(--c-steel);
  font-size: 0.9375rem;
}

.statValue {
  font-family: var(--font-mono);
  font-size: clamp(2rem, 3.5vw, 2.75rem);
  font-weight: 500;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
  color: var(--c-ink);
}

// ---------------- 热门帖子 ----------------
.postsGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;

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
</style>
