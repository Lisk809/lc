import { ref } from 'vue'
import { initGoogleAnalytics } from '@/utils/analytics'

/**
 * Cookie 同意状态：
 * - null：尚未选择 → 显示横幅
 * - 'accepted'：接受 → 加载 Google Analytics
 * - 'declined'：拒绝 → 不加载任何统计脚本
 */
const CONSENT_KEY = 'lunacho-cookie-consent'

type Consent = 'accepted' | 'declined' | null

const accepted = ref<Consent>(null)
let initialized = false

function readConsent(): Consent {
  const value = localStorage.getItem(CONSENT_KEY)
  return value === 'accepted' ? 'accepted' : value === 'declined' ? 'declined' : null
}

export function useCookieConsent() {
  if (!initialized) {
    initialized = true
    accepted.value = readConsent()
    if (accepted.value === 'accepted') initGoogleAnalytics()
  }

  function accept() {
    localStorage.setItem(CONSENT_KEY, 'accepted')
    accepted.value = 'accepted'
    initGoogleAnalytics()
  }

  function decline() {
    localStorage.setItem(CONSENT_KEY, 'declined')
    accepted.value = 'declined'
  }

  return { accepted, accept, decline }
}
