<script setup lang="ts">
import AppNavbar from '@/components/organisms/AppNavbar.vue'

/** 页脚社交入口（simpleicons.org 图标）；TODO：替换为官方群/账号链接 */
const socials = [
  { key: 'qq', label: 'QQ 官方群', href: 'https://qm.qq.com/', brand: '#1EBAFC' },
  { key: 'bilibili', label: 'Bilibili 官方账号', href: 'https://www.bilibili.com/', brand: '#00A1D6' },
  // GitHub 品牌色 #181717 在暗色下不可见，darkBrand 用于暗色悬停
  { key: 'github', label: 'GitHub 开源仓库', href: 'https://github.com/LunaticChO', brand: '#181717', darkBrand: '#e6edf3' },
]
</script>

<template>
  <div :class="$style.shell">
    <AppNavbar />
    <main :class="$style.main">
      <RouterView v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" :key="$route.fullPath" />
        </Transition>
      </RouterView>
    </main>
    <footer :class="$style.footer">
      <div :class="$style.footerInner">
        <div :class="$style.brandCol">
          <span :class="$style.brand">
            <img :class="$style.logoMark" src="/logo.png" alt="Lunatic ChO 化竞幻想乡" />
            <span :class="$style.wordmark">Lunatic ChO</span>
            <span :class="$style.kana">ルナティック</span>
          </span>
          <p :class="$style.tagline">幻想乡的化学竞赛知识社区 · Lunatic ChO</p>
        </div>
        <nav :class="$style.nav" aria-label="页脚导航">
          <RouterLink to="/posts">帖子</RouterLink>
          <RouterLink to="/questions">题库</RouterLink>
          <RouterLink to="/exams">联考</RouterLink>
          <RouterLink to="/announcements">公告</RouterLink>
        </nav>
        <div :class="$style.bottom">
          <p>© 2026 Lunatic ChO · 化学竞赛社区 · 化竞幻想郷</p>
          <div :class="$style.social">
            <a
              v-for="s in socials"
              :key="s.key"
              :href="s.href"
              target="_blank"
              rel="noopener noreferrer"
              :aria-label="s.label"
              :title="s.label"
              :class="$style.socialLink"
              :style="{ '--brand': s.brand, '--brand-dark': s.darkBrand ?? s.brand }"
            >
              <!-- QQ（simpleicons.org） -->
              <svg v-if="s.key === 'qq'" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21.395 15.035a40 40 0 0 0-.803-2.264l-1.079-2.695c.001-.032.014-.562.014-.836C19.526 4.632 17.351 0 12 0S4.474 4.632 4.474 9.241c0 .274.013.804.014.836l-1.08 2.695a39 39 0 0 0-.802 2.264c-1.021 3.283-.69 4.643-.438 4.673.54.065 2.103-2.472 2.103-2.472 0 1.469.756 3.387 2.394 4.771-.612.188-1.363.479-1.845.835-.434.32-.379.646-.301.778.343.578 5.883.369 7.482.189 1.6.18 7.14.389 7.483-.189.078-.132.132-.458-.301-.778-.483-.356-1.233-.646-1.846-.836 1.637-1.384 2.393-3.302 2.393-4.771 0 0 1.563 2.537 2.103 2.472.251-.03.581-1.39-.438-4.673" /></svg>
              <!-- Bilibili（simpleicons.org） -->
              <svg v-else-if="s.key === 'bilibili'" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.56 3.76v7.36c-.036 1.51-.556 2.769-1.56 3.773s-2.262 1.524-3.773 1.56H5.333c-1.51-.036-2.769-.556-3.773-1.56S.036 18.858 0 17.347v-7.36c.036-1.511.556-2.765 1.56-3.76 1.004-.996 2.262-1.52 3.773-1.574h.774l-1.174-1.12a1.234 1.234 0 0 1-.373-.906c0-.356.124-.658.373-.907l.027-.027c.267-.249.573-.373.92-.373.347 0 .653.124.92.373L9.653 4.44c.071.071.134.142.187.213h4.267a.836.836 0 0 1 .16-.213l2.853-2.747c.267-.249.573-.373.92-.373.347 0 .662.151.929.4.267.249.391.551.391.907 0 .355-.124.657-.373.906zM5.333 7.24c-.746.018-1.373.276-1.88.773-.506.498-.769 1.13-.786 1.894v7.52c.017.764.28 1.395.786 1.893.507.498 1.134.756 1.88.773h13.334c.746-.017 1.373-.275 1.88-.773.506-.498.769-1.129.786-1.893v-7.52c-.017-.765-.28-1.396-.786-1.894-.507-.497-1.134-.755-1.88-.773zM8 11.107c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c0-.373.129-.689.386-.947.258-.257.574-.386.947-.386zm8 0c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c.017-.391.15-.711.4-.96.249-.249.56-.373.933-.373Z" /></svg>
              <!-- GitHub（simpleicons.org） -->
              <svg v-else viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style module lang="scss">
.shell {
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.footer {
  margin-top: var(--space-section);
  border-top: 1px solid var(--c-border);
}

.footerInner {
  @include container;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 2rem;
  padding-block: 3rem 2rem;

  @media (max-width: $bp-tablet - 1) {
    grid-template-columns: 1fr;
  }
}

.brandCol {
  display: grid;
  gap: 0.5rem;
  align-content: start;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
}

.wordmark {
  font-family: var(--font-script);
  font-size: 1.5rem;
  font-weight: 400;
  letter-spacing: 0;
  line-height: 1;
}

.logoMark {
  width: 28px;
  height: 28px;
  border-radius: 7px;
  object-fit: cover;
  box-shadow: 0 0 0 1px var(--c-border-strong);
  transition: transform 0.7s var(--ease-spring);

  @include motion-safe {
    .brand:hover & {
      transform: scale(1.06);
    }
  }
}

.kana {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.14em;
  color: var(--c-slate);
  align-self: center;
}

.tagline {
  color: var(--c-slate);
  font-size: 0.875rem;
}

.nav {
  display: flex;
  align-items: flex-start;
  gap: 1.5rem;

  a {
    display: inline-flex;
    align-items: center;
    min-height: 44px;
    color: var(--c-steel);
    font-size: 0.9375rem;
    transition: color $dur var(--ease-out);

    &:hover {
      color: var(--c-accent);
    }
  }
}

.bottom {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--c-border);
  color: var(--c-slate);
  font-size: 0.875rem;
  flex-wrap: wrap;
}

.social {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.socialLink {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: var(--r-full);
  color: var(--c-slate);
  transition: background-color $dur var(--ease-out), color $dur var(--ease-out);

  &:hover {
    background: var(--c-surface-2);
    color: var(--brand);
  }

  svg {
    width: 20px;
    height: 20px;
  }
}

// 暗色模式：GitHub 品牌色过深，悬停改用 --brand-dark
:global(.dark) .socialLink:hover {
  color: var(--brand-dark, var(--brand));
}
</style>
