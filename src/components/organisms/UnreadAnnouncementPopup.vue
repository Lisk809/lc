<script setup lang="ts">
// 顶部未读公告横幅：boot 时取公告第一页，过滤出未读；未读 > 0 且本会话未关闭时滑入。
// 关闭（X）只在本会话生效；在列表页重新标未读（未读数增加）会再次弹出。
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { fetchAnnouncements } from '@/api/announcements'
import { useAnnouncementReadsStore } from '@/stores/announcementReads'
import { formatRelativeTime } from '@/utils/format'
import type { Announcement } from '@/types'
import BaseButton from '@/components/atoms/BaseButton.vue'

const reads = useAnnouncementReadsStore()
const router = useRouter()

/** 第一页全量公告（含已读），仅 boot 时取一次 */
const allItems = ref<Announcement[]>([])

const unreadItems = computed(() => allItems.value.filter((a) => reads.isUnread(a.id, a.created_at)))
const unreadCount = computed(() => unreadItems.value.length)

// 显隐：未读 > 0 且本次会话未点过关闭
const visible = computed(() => unreadCount.value > 0 && !reads.sessionDismissed)

onMounted(async () => {
  reads.ensureBaseline()
  try {
    const res = await fetchAnnouncements({ page: 1, limit: 10 })
    allItems.value = res.data
  } catch {
    // 静默失败：不弹窗、不 toast（列表页有它自己的错误态）
  }
})

// 状态机核心：未读数「增加」→ 解除本次会话的关闭状态（X 只改 dismissed 不动计数，不会触发）。
// 非 immediate，boot 首次计算不会误触发。
watch(unreadCount, (n, prev) => {
  if (n > prev) reads.sessionDismissed = false
})

function markRead(item: Announcement) {
  reads.markRead(item.id)
}

function markAllRead() {
  reads.markAllRead(unreadItems.value.map((i) => i.id))
}

function dismiss() {
  reads.sessionDismissed = true
}

function goAll() {
  reads.sessionDismissed = true
  void router.push('/announcements')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="announcement-pop">
      <div v-if="visible" :class="$style.popup" role="dialog" aria-label="未读公告">
        <div :class="$style.head">
          <p :class="$style.headline">有 {{ unreadCount }} 条未读公告</p>
          <button type="button" :class="$style.close" aria-label="关闭未读公告提醒" @click="dismiss">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
          </button>
        </div>

        <ul v-if="unreadItems.length" :class="$style.list">
          <li v-for="item in unreadItems" :key="item.id" :class="$style.row">
            <div :class="$style.rowText">
              <p :class="$style.rowTitle">{{ item.title }}</p>
              <time :class="$style.rowTime">{{ formatRelativeTime(item.created_at) }}</time>
            </div>
            <BaseButton size="sm" variant="ghost" @click="markRead(item)">标记已读</BaseButton>
          </li>
        </ul>

        <div :class="$style.foot">
          <BaseButton size="sm" variant="outline" @click="markAllRead">全部标为已读</BaseButton>
          <BaseButton size="sm" variant="ghost" @click="goAll">查看全部公告</BaseButton>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style module lang="scss">
.popup {
  position: fixed;
  top: calc(#{$navbar-height} + 0.75rem);
  left: 0;
  right: 0;
  margin-inline: auto; // 居中不依赖 transform，避免与入场动画冲突
  width: min(560px, calc(100vw - 1rem));
  max-height: calc(100vh - #{$navbar-height} - 2rem);
  overflow-y: auto;
  padding: 1rem 1.25rem;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: var(--r-md);
  box-shadow: var(--shadow-pop);
  z-index: 100; // modal 90 之上、toast 110 之下
}

.head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.headline {
  font-size: 0.9375rem;
  font-weight: 600;
}

.close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--r-full);
  color: var(--c-slate);
  transition: background-color $dur var(--ease-out), color $dur var(--ease-out);

  &:hover {
    background: var(--c-surface-2);
    color: var(--c-ink);
  }

  svg {
    width: 16px;
    height: 16px;
  }
}

.list {
  margin-top: 0.75rem;
  border-top: 1px solid var(--c-border);
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--c-border);

  &:last-child {
    border-bottom: none;
    padding-bottom: 0.25rem;
  }
}

.rowText {
  min-width: 0;
}

.rowTitle {
  font-size: 0.9375rem;
  @include line-clamp(1);
}

.rowTime {
  margin-top: 0.125rem;
  font-family: var(--font-mono);
  font-size: var(--fs-meta);
  color: var(--c-slate);
}

.foot {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.625rem;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--c-border);
}

// 顶部滑入过渡（仅 transform/opacity，遵循 toast/modal 惯例）
:global(.announcement-pop-enter-active),
:global(.announcement-pop-leave-active) {
  transition: opacity $dur var(--ease-out), transform $dur-slow var(--ease-spring);
}

:global(.announcement-pop-enter-from),
:global(.announcement-pop-leave-to) {
  opacity: 0;
  transform: translateY(-16px);
}
</style>
