import type { Directive } from 'vue'

/**
 * v-reveal：滚动渐显指令
 * 用法：v-reveal 或 v-reveal="120"（毫秒级延迟，用于列表交错入场）
 * 仅动画 transform / opacity，符合 DESIGN.md 硬件规则
 */
interface RevealElement extends HTMLElement {
  __revealDelay?: number
}

const observer: IntersectionObserver | null =
  typeof IntersectionObserver !== 'undefined'
    ? new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              const el = entry.target as RevealElement
              el.classList.add('is-visible')
              observer?.unobserve(el)
            }
          }
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
      )
    : null

const reveal: Directive<RevealElement, number | undefined> = {
  mounted(el, binding) {
    el.classList.add('reveal')
    const delay = binding.value ?? 0
    if (delay) el.style.setProperty('--reveal-delay', `${delay}ms`)
    if (observer) observer.observe(el)
    else el.classList.add('is-visible')
  },
  unmounted(el) {
    observer?.unobserve(el)
  },
}

export default reveal
