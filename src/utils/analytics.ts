// ============================================================
// Google Analytics（GA4）— 仅在用户接受 Cookie 后由 useCookieConsent 触发加载
// 动态注入 gtag.js，避免未经同意就埋点
// ============================================================

const GA_ID = 'G-BDSC261F7W'

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
  }
}

let loaded = false

export function initGoogleAnalytics() {
  if (loaded) return
  loaded = true

  // 开发环境不加载，避免本地调试污染统计
  if (import.meta.env.DEV) return

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
  document.head.appendChild(script)

  window.dataLayer = window.dataLayer || []
  window.gtag = function (...args: unknown[]) {
    window.dataLayer.push(args)
  }
  window.gtag('js', new Date())
  window.gtag('config', GA_ID)
}
