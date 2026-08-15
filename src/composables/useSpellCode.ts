import { onBeforeUnmount, onMounted } from 'vue'
import { useUiStore } from '@/stores/ui'

/**
 * 彩蛋：在页面任意处（输入框除外）依次键入 "lunatic"，
 * 解锁 LUNATIC 难度——toast 提示 + 全屏樱花祝福（PetalBurst 监听同一事件）。
 */
export const LUNATIC_BURST_EVENT = 'lunatic-burst'
const CODE = 'lunatic'

export function useSpellCode() {
  const ui = useUiStore()
  let buffer = ''

  function onKeydown(e: KeyboardEvent) {
    const target = e.target as HTMLElement | null
    if (
      target &&
      (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
    ) {
      return
    }
    buffer = (buffer + e.key.toLowerCase()).slice(-CODE.length)
    if (buffer === CODE) {
      buffer = ''
      ui.toast('LUNATIC · 难度已解锁，樱花祝福', 'success')
      window.dispatchEvent(new CustomEvent(LUNATIC_BURST_EVENT))
    }
  }

  onMounted(() => window.addEventListener('keydown', onKeydown))
  onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
}
