import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue'

// Turnstile 官方脚本注入的全局对象（官方无 @types 包，此处自行声明）
interface TurnstileWidgetOptions {
  sitekey: string
  theme?: 'auto' | 'light' | 'dark'
  callback?: (token: string) => void
  'expired-callback'?: () => void
  'error-callback'?: () => void
}

interface Turnstile {
  render(container: HTMLElement, options: TurnstileWidgetOptions): string
  reset(widgetId?: string): void
  remove(widgetId?: string): void
}

declare global {
  interface Window {
    turnstile?: Turnstile
    turnstileOnload?: () => void
  }
}

const SCRIPT_SRC =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=turnstileOnload'
const SCRIPT_ID = 'cf-turnstile-script'
let loadPromise: Promise<void> | null = null

function loadTurnstileScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve()
  if (loadPromise) return loadPromise
  loadPromise = new Promise((resolve, reject) => {
    window.turnstileOnload = () => {
      delete window.turnstileOnload
      resolve()
    }
    const script = document.createElement('script')
    script.id = SCRIPT_ID
    script.src = SCRIPT_SRC
    script.async = true
    script.onerror = () => {
      loadPromise = null
      reject(new Error('Turnstile script failed to load'))
    }
    document.head.appendChild(script)
  })
  return loadPromise
}

/**
 * Cloudflare Turnstile 人机验证封装：显式渲染、一次性 token、组件卸载时销毁 widget。
 * 注意：脚本注入后常驻页面（不随组件销毁），仅移除当前 widget；
 * token 一次性且约 300s 过期，提交失败或过期后需调用 reset() 重新验证。
 */
export function useTurnstile(container: Ref<HTMLElement | null>, siteKey: string) {
  const token = ref('')
  let widgetId: string | null = null

  async function mount() {
    if (!siteKey) {
      console.warn('[turnstile] VITE_TURNSTILE_SITE_KEY 未配置，人机验证不可用')
      return
    }
    try {
      await loadTurnstileScript()
    } catch (err) {
      console.error('[turnstile] 脚本加载失败:', err)
      return
    }
    if (!container.value || !window.turnstile) return
    widgetId = window.turnstile.render(container.value, {
      sitekey: siteKey,
      theme: 'auto',
      callback: (t) => {
        token.value = t
      },
      'expired-callback': () => {
        token.value = ''
      },
      'error-callback': () => {
        token.value = ''
      },
    })
  }

  /** 重置 widget 并清空 token（先清空再重置，避免重置同步回调写回旧 token） */
  function reset() {
    token.value = ''
    if (widgetId && window.turnstile) window.turnstile.reset(widgetId)
  }

  onMounted(mount)
  onBeforeUnmount(() => {
    if (widgetId && window.turnstile) window.turnstile.remove(widgetId)
  })

  return { token, reset }
}
