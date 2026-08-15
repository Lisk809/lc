import axios from 'axios'
import type { AxiosError, AxiosRequestConfig } from 'axios'
import { useUserStore } from '@/stores/user'
import { useUiStore } from '@/stores/ui'
import router from '@/router'
import type { ApiErrorBody } from '@/types'

declare module 'axios' {
  export interface AxiosRequestConfig {
    /** 为 true 时跳过全局错误提示（由调用方自行处理，如表单内联错误） */
    skipToast?: boolean
  }
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '',
  timeout: 30_000,
})

// 请求拦截：附加 Bearer Token
api.interceptors.request.use((config) => {
  const user = useUserStore()
  if (user.token) config.headers.Authorization = `Bearer ${user.token}`
  return config
})

let redirectTimer: ReturnType<typeof setTimeout> | null = null

// 响应拦截：剥离 data 层 + 统一错误处理
api.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError<ApiErrorBody>) => {
    const ui = useUiStore()
    const status = error.response?.status
    const url = error.config?.url ?? ''
    const skipToast = error.config?.skipToast === true
    const isAuthEndpoint = url.includes('/api/auth/')
    const message = error.response?.data?.error

    if (status === 401 && !isAuthEndpoint) {
      const user = useUserStore()
      if (user.token) {
        // 已登录但 Token 失效：清除会话并跳转登录
        user.logout()
        if (!redirectTimer) {
          redirectTimer = setTimeout(() => (redirectTimer = null), 1500)
          const current = router.currentRoute.value
          if (current.meta.requiresAuth) {
            void router.push({ path: '/auth/login', query: { redirect: current.fullPath } })
          }
        }
        if (!skipToast) ui.toast('登录已过期，请重新登录', 'error')
      }
      // 未登录（无 token）时收到 401：静默失败，由视图的空态/重试兜底。
      // 后端目前对公开接口也强制认证，未登录访问列表类接口会走此分支。
    } else if (!skipToast) {
      switch (status) {
        case 400:
          break // 参数错误：由表单内联展示
        case 403:
          ui.toast('没有权限执行此操作', 'error')
          break
        case 409:
          ui.toast(typeof message === 'string' ? message : '资源冲突，请检查后重试', 'error')
          break
        case 413:
          ui.toast('文件过大（限制 10MB）', 'error')
          break
        case 429:
          ui.toast('操作太频繁了，请稍后再试', 'error')
          break
        case 500:
          ui.toast('服务器开小差了，请稍后再试', 'error')
          break
        default:
          if (status !== 401) {
            ui.toast(typeof message === 'string' && message ? message : '请求失败，请稍后再试', 'error')
          }
      }
    }
    return Promise.reject(error)
  }
)

/** 类型安全的请求助手：拦截器已剥离 data 层，返回即业务数据 */
export const http = {
  get: <T>(url: string, config?: AxiosRequestConfig) => api.get<T, T>(url, config),
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    api.post<T, T>(url, data, config),
  patch: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    api.patch<T, T>(url, data, config),
}
