import { defineStore } from 'pinia'

/**
 * 公告已读/未读（纯本地，不改后端）。
 * 判定优先级：显式未读 > 显式已读 > 时间规则（createdAt > baseline 视为未读）。
 * baseline 在首次运行时记录，旧公告默认已读，只有之后发布的新公告会弹窗。
 */
export const useAnnouncementReadsStore = defineStore('announcementReads', {
  state: () => ({
    /** 已显式标为已读的公告 id */
    readIds: [] as string[],
    /** 已显式标为未读的公告 id */
    unreadIds: [] as string[],
    /** 首次运行时间（秒级）；0 = 尚未初始化 */
    baseline: 0 as number,
    /** 本次会话内用户点过关闭（X）—— 不持久化 */
    sessionDismissed: false,
  }),
  actions: {
    /** 首次运行时记录 baseline。幂等，可重复调用。 */
    ensureBaseline() {
      if (!this.baseline) this.baseline = Math.floor(Date.now() / 1000)
    },
    /** 模板中直接调用即可（内部读取响应式 state，渲染自动追踪）。 */
    isUnread(id: string, createdAt: number): boolean {
      if (this.unreadIds.includes(id)) return true
      if (this.readIds.includes(id)) return false
      return createdAt > this.baseline
    },
    /** 标为已读；与 unreadIds 互斥，幂等。 */
    markRead(id: string) {
      if (this.readIds.includes(id)) return
      this.readIds.push(id)
      const i = this.unreadIds.indexOf(id)
      if (i > -1) this.unreadIds.splice(i, 1)
    },
    /** 标为未读；与 readIds 互斥，幂等。 */
    markUnread(id: string) {
      if (this.unreadIds.includes(id)) return
      this.unreadIds.push(id)
      const i = this.readIds.indexOf(id)
      if (i > -1) this.readIds.splice(i, 1)
    },
    /** 批量标为已读（弹窗「全部标为已读」）。 */
    markAllRead(ids: string[]) {
      if (!ids.length) return
      this.readIds.push(...ids.filter((id) => !this.readIds.includes(id)))
      this.unreadIds = this.unreadIds.filter((id) => !ids.includes(id))
    },
  },
  persist: {
    key: 'lunacho-announcement-reads',
    paths: ['readIds', 'unreadIds', 'baseline'],
  },
})
