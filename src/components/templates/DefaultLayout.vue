<script setup lang="ts">
import AppNavbar from '@/components/organisms/AppNavbar.vue'
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
          <p :class="$style.tagline">月之都的化学竞赛知识社区 · ChO = 化学奥林匹克 · C·H·O</p>
        </div>
        <nav :class="$style.nav" aria-label="页脚导航">
          <RouterLink to="/posts">帖子</RouterLink>
          <RouterLink to="/questions">题库</RouterLink>
          <RouterLink to="/announcements">公告</RouterLink>
        </nav>
        <div :class="$style.bottom">
          <p>© 2026 Lunatic ChO · 化学竞赛社区 · 幻想郷</p>
          <p :class="$style.tech">Vue 3 · Vite · TypeScript · 紅白</p>
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

.tech {
  font-family: var(--font-mono);
  font-size: var(--fs-meta);
}
</style>
