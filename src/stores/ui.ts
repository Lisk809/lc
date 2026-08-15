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
