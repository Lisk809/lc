<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import AppAvatar from '@/components/atoms/AppAvatar.vue'
import type { ProfileTab } from '@/types'

defineProps<{ active: ProfileTab }>()
const emit = defineEmits<{ 'update:active': [tab: ProfileTab] }>()

const user = useUserStore()

const tabs: { key: ProfileTab; label: string }[] = [
  { key: 'info', label: '个人信息' },
  { key: 'posts', label: '我的帖子' },
  { key: 'questions', label: '我的题目' },
  { key: 'files', label: '我的文件' },
  { key: 'analytics', label: '学情分析' },
]
</script>

<template>
  <aside :class="$style.aside">
    <div :class="$style.profile">
      <AppAvatar :url="user.avatar" :name="user.displayName" :size="72" />
      <h2 :class="$style.name">{{ user.displayName }}</h2>
      <p v-if="user.bio" :class="$style.bio">{{ user.bio }}</p>
    </div>

    <nav :class="$style.menu" aria-label="个人中心菜单">
      <button
        v-for="(tab, i) in tabs"
        :key="tab.key"
        type="button"
        :class="[$style.item, { [$style.itemActive]: active === tab.key }]"
        :aria-current="active === tab.key ? 'page' : undefined"
        @click="emit('update:active', tab.key)"
      >
        <span :class="$style.index">{{ String(i + 1).padStart(2, '0') }}</span>
        {{ tab.label }}
      </button>
    </nav>
  </aside>
</template>

<style module lang="scss">
.aside {
  position: sticky;
  top: calc(#{$navbar-height} + 1.5rem);
  align-self: start;
  padding: 1.75rem;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-card);
  box-shadow: var(--shadow-card);

  @media (max-width: $bp-tablet - 1) {
    position: static;
    padding: 1rem;
  }
}

.profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--c-border);

  @media (max-width: $bp-tablet - 1) {
    display: none;
  }
}

.name {
  margin-top: 1rem;
  font-size: 1.1875rem;
  letter-spacing: -0.01em;
}

.bio {
  margin-top: 0.375rem;
  color: var(--c-steel);
  font-size: 0.875rem;
  @include line-clamp(2);
}

.menu {
  display: grid;
  gap: 0.375rem;
  margin-top: 1.25rem;

  @media (max-width: $bp-tablet - 1) {
    display: flex;
    margin-top: 0;
    overflow-x: auto;
    @include hide-scrollbar;
  }
}

.item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  min-height: 44px;
  padding: 0.625rem 0.875rem;
  border-radius: var(--r-md);
  text-align: left;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--c-steel);
  white-space: nowrap;
  transition: background-color $dur var(--ease-out), color $dur var(--ease-out);

  &:hover {
    background: var(--c-surface-2);
    color: var(--c-ink);
  }

  @media (max-width: $bp-tablet - 1) {
    width: auto;
    justify-content: center;
  }
}

.itemActive {
  background: var(--c-accent-soft);
  color: var(--c-accent);

  &:hover {
    background: var(--c-accent-hover);
    color: var(--c-accent);
  }
}

.index {
  font-family: var(--font-mono);
  font-size: var(--fs-meta);
  color: var(--c-slate);

  .itemActive & {
    color: var(--c-accent);
  }
}
</style>
