<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { onClickOutside } from '@vueuse/core'
import { useUserStore } from '@/stores/user'
import { useUiStore } from '@/stores/ui'
import AppAvatar from '@/components/atoms/AppAvatar.vue'
import BaseButton from '@/components/atoms/BaseButton.vue'

const route = useRoute()
const router = useRouter()
const user = useUserStore()
const ui = useUiStore()

const links = [
  { to: '/', label: '首页' },
  { to: '/posts', label: '帖子' },
  { to: '/questions', label: '题库' },
  { to: '/exams', label: '联考' },
  { to: '/announcements', label: '公告' },
]

function isActive(to: string) {
  return to === '/' ? route.path === '/' : route.path.startsWith(to)
}

const menuOpen = ref(false)
const userMenuOpen = ref(false)
const userMenuRef = ref<HTMLElement>()

onClickOutside(userMenuRef, () => {
  userMenuOpen.value = false
})

watch(
  () => route.fullPath,
  () => {
    menuOpen.value = false
    userMenuOpen.value = false
  }
)

watch(menuOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
})

onBeforeUnmount(() => {
  document.body.style.overflow = ''
})

function handleLogout() {
  user.logout()
  userMenuOpen.value = false
  router.push('/')
}

function goLogin() {
  router.push({ path: '/auth/login', query: { redirect: route.fullPath } })
}
</script>

<template>
  <header :class="$style.navbar">
    <div :class="$style.inner">
      <RouterLink to="/" :class="$style.brand" aria-label="Lunatic ChO 首页">
        <img :class="$style.logoMark" src="/logo.png" alt="Lunatic ChO 化竞幻想乡" />
        <span :class="$style.wordmark">Lunatic ChO</span>
        <span :class="$style.kana">ルナティック</span>
      </RouterLink>

      <nav :class="$style.links" aria-label="主导航">
        <RouterLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          :class="[$style.link, { [$style.active]: isActive(link.to) }]"
        >
          {{ link.label }}
        </RouterLink>
      </nav>

      <div :class="$style.actions">
        <button
          type="button"
          :class="$style.iconBtn"
          :aria-label="ui.isDark ? '切换到浅色模式' : '切换到深色模式'"
          @click="ui.toggleDark()"
        >
          <svg v-if="ui.isDark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></svg>
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>
        </button>

        <template v-if="user.isLoggedIn">
          <div ref="userMenuRef" :class="$style.userWrap">
            <button
              type="button"
              :class="$style.userBtn"
              :aria-expanded="userMenuOpen"
              aria-haspopup="menu"
              @click="userMenuOpen = !userMenuOpen"
            >
              <AppAvatar :url="user.avatar" :name="user.displayName" :size="30" />
              <span :class="$style.userName">{{ user.displayName }}</span>
              <svg :class="[$style.chevron, { [$style.chevronOpen]: userMenuOpen }]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
            </button>

            <Transition name="dropdown">
              <div v-if="userMenuOpen" :class="$style.menu" role="menu">
                <div :class="$style.menuHead">
                  <p :class="$style.menuName">{{ user.displayName }}</p>
                  <p :class="$style.menuEmail">{{ user.email || '—' }}</p>
                </div>
                <RouterLink to="/profile" :class="$style.menuItem" role="menuitem">个人中心</RouterLink>
                <RouterLink v-if="user.isAdmin" to="/admin/grade" :class="$style.menuItem" role="menuitem">批改工作台</RouterLink>
                <RouterLink v-if="user.isAdmin" to="/admin/statistics" :class="$style.menuItem" role="menuitem">统计看板</RouterLink>
                <RouterLink v-if="user.isAdmin" to="/admin/announcement/create" :class="$style.menuItem" role="menuitem">发布公告</RouterLink>
                <button type="button" :class="[$style.menuItem, $style.danger]" role="menuitem" @click="handleLogout">退出登录</button>
              </div>
            </Transition>
          </div>
        </template>

        <span v-else :class="$style.authBtns">
          <BaseButton variant="ghost" size="sm" @click="goLogin">登录</BaseButton>
          <BaseButton size="sm" @click="router.push('/auth/register')">注册</BaseButton>
        </span>

        <button type="button" :class="[$style.iconBtn, $style.menuToggle]" aria-label="打开菜单" @click="menuOpen = true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" /></svg>
          <span>菜单</span>
        </button>
      </div>
    </div>
  </header>

  <!-- 移动端全屏菜单 -->
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="menuOpen" :class="$style.drawer">
        <div :class="$style.drawerHead">
          <span :class="$style.wordmark">Lunatic ChO</span>
          <button type="button" :class="[$style.iconBtn, $style.drawerClose]" aria-label="关闭菜单" @click="menuOpen = false">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
            <span>关闭</span>
          </button>
        </div>
        <nav :class="$style.drawerLinks" aria-label="移动端导航">
          <RouterLink
            v-for="(link, i) in links"
            :key="link.to"
            :to="link.to"
            :class="[$style.drawerLink, { [$style.active]: isActive(link.to) }]"
            :style="{ '--i': i }"
          >
            <span :class="$style.drawerIndex">{{ String(i + 1).padStart(2, '0') }}</span>
            {{ link.label }}
          </RouterLink>
        </nav>
        <div :class="$style.drawerActions">
          <template v-if="user.isLoggedIn">
            <p :class="$style.drawerUser">{{ user.displayName }}</p>
            <BaseButton variant="outline" block @click="menuOpen = false; router.push('/profile')">个人中心</BaseButton>
            <BaseButton variant="danger" block @click="handleLogout">退出登录</BaseButton>
          </template>
          <template v-else>
            <BaseButton block @click="router.push('/auth/register')">注册</BaseButton>
            <BaseButton variant="outline" block @click="goLogin">登录</BaseButton>
          </template>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style module lang="scss">
.navbar {
  position: sticky;
  top: 0;
  z-index: 40;
  background: color-mix(in srgb, var(--c-canvas) 82%, transparent);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--c-border);
}

.inner {
  @include container;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 2rem;
  height: $navbar-height;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
}

.logoMark {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  object-fit: cover;
  box-shadow: 0 0 0 1px var(--c-border-strong);
  transition: transform 0.7s var(--ease-spring);

  // 彩蛋：悬停品牌时 logo 轻微放大
  @include motion-safe {
    .brand:hover & {
      transform: scale(1.06);
    }
  }
}

// 品牌手写体：Clicker Script 仅 400 字重，需放大以保证可读性
.wordmark {
  font-family: var(--font-script);
  font-size: 1.75rem;
  font-weight: 400;
  letter-spacing: 0;
  line-height: 1;
}

.kana {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.14em;
  color: var(--c-slate);
  align-self: center;

  @media (max-width: 480px) {
    display: none;
  }
}

.links {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.link {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 0.875rem;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--c-steel);
  transition: color $dur var(--ease-out);

  &:hover {
    color: var(--c-ink);
  }

  &.active {
    color: var(--c-ink);

    &::after {
      content: '';
      position: absolute;
      left: 0.875rem;
      right: 0.875rem;
      bottom: 6px;
      height: 2px;
      border-radius: var(--r-full);
      background: var(--c-accent);
    }
  }
}

.actions {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.authBtns {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.iconBtn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  min-width: 44px;
  height: 44px;
  padding: 0 0.625rem;
  border-radius: var(--r-full);
  color: var(--c-steel);
  font-size: 0.875rem;
  transition: background-color $dur var(--ease-out), color $dur var(--ease-out);

  &:hover {
    background: var(--c-surface-2);
    color: var(--c-ink);
  }

  svg {
    width: 18px;
    height: 18px;
  }
}

.menuToggle {
  display: none;
}

// 用户菜单
.userWrap {
  position: relative;
}

.userBtn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 44px;
  padding: 0 0.5rem;
  border-radius: var(--r-full);
  transition: background-color $dur var(--ease-out);

  &:hover {
    background: var(--c-surface-2);
  }
}

.userName {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.9375rem;
  font-weight: 500;
}

.chevron {
  width: 14px;
  height: 14px;
  color: var(--c-slate);
  transition: transform $dur var(--ease-out);

  &.chevronOpen {
    transform: rotate(180deg);
  }
}

.menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  z-index: 45;
  width: 224px;
  padding: 0.5rem;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-md);
  box-shadow: var(--shadow-pop);
}

.menuHead {
  padding: 0.625rem 0.75rem 0.75rem;
  border-bottom: 1px solid var(--c-border);
  margin-bottom: 0.5rem;
}

.menuName {
  font-weight: 600;
  font-size: 0.9375rem;
}

.menuEmail {
  font-family: var(--font-mono);
  font-size: var(--fs-meta);
  color: var(--c-slate);
  overflow-wrap: anywhere;
}

.menuItem {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 44px;
  padding: 0 0.75rem;
  border-radius: var(--r-sm);
  font-size: 0.9375rem;
  color: var(--c-ink);
  transition: background-color $dur var(--ease-out);

  &:hover {
    background: var(--c-surface-2);
  }

  &.danger {
    color: var(--c-danger);

    &:hover {
      background: var(--c-danger-soft);
    }
  }
}

// 下拉过渡
:global(.dropdown-enter-active),
:global(.dropdown-leave-active) {
  transition: opacity $dur var(--ease-out), transform $dur var(--ease-out);
}

:global(.dropdown-enter-from),
:global(.dropdown-leave-to) {
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
}

// 移动端抽屉
.drawer {
  position: fixed;
  inset: 0;
  z-index: 95;
  display: flex;
  flex-direction: column;
  background: var(--c-canvas);
  padding: 1rem 1.5rem 2rem;
}

.drawerHead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: $navbar-height;
}

.drawerClose {
  gap: 0.375rem;
}

.drawerLinks {
  display: grid;
  gap: 0.25rem;
  margin-top: 2rem;
}

.drawerLink {
  display: flex;
  align-items: baseline;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid var(--c-border);
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  animation: drawer-in 0.5s var(--ease-out) both;
  animation-delay: calc(var(--i) * 60ms + 80ms);

  &.active {
    color: var(--c-accent);
  }
}

.drawerIndex {
  font-family: var(--font-mono);
  font-size: var(--fs-meta);
  color: var(--c-slate);
  font-weight: 400;
}

.drawerActions {
  display: grid;
  gap: 0.75rem;
  margin-top: auto;
}

.drawerUser {
  color: var(--c-steel);
  font-size: 0.9375rem;
  margin-bottom: 0.25rem;
}

@keyframes drawer-in {
  from {
    opacity: 0;
    transform: translateY(14px);
  }

  to {
    opacity: 1;
    transform: none;
  }
}

:global(.drawer-enter-active),
:global(.drawer-leave-active) {
  transition: opacity $dur-slow var(--ease-out), transform $dur-slow var(--ease-out);
}

:global(.drawer-enter-from),
:global(.drawer-leave-to) {
  opacity: 0;
  transform: translateY(-12px);
}

// 响应式
@media (max-width: $bp-tablet - 1) {
  .links {
    display: none;
  }

  .menuToggle {
    display: inline-flex;
  }

  .userBtn .userName,
  .userBtn .chevron {
    display: none;
  }
}

@media (max-width: 480px) {
  .authBtns {
    display: none;
  }
}
</style>
