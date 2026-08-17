import { defineStore } from 'pinia'
import type { ToastItem, ToastType } from '@/types'

let toastSeq = 0

export const useUiStore = defineStore('ui', {
  state: () => ({
    isDark: false,
    toasts: [] as ToastItem[],
  }),
  actions: {
    applyTheme() {
      document.documentElement.classList.toggle('dark', this.isDark)
      // 浏览器导航栏（移动端地址栏/浏览器 chrome）颜色跟随主题，与 --c-canvas 令牌一致
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', this.isDark ? '#0e0e11' : '#f9fafb')
    },
    toggleDark() {
      this.isDark = !this.isDark
      this.applyTheme()
    },
    toast(message: string, type: ToastType = 'info', duration = 4000) {
      const id = ++toastSeq
      this.toasts.push({ id, message, type })
      window.setTimeout(() => this.dismiss(id), duration)
    },
    dismiss(id: number) {
      const index = this.toasts.findIndex((t) => t.id === id)
      if (index > -1) this.toasts.splice(index, 1)
    },
  },
  persist: {
    key: 'lunacho-ui',
    paths: ['isDark'],
  },
})
