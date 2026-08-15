import { defineStore } from 'pinia'
import { login as apiLogin, register as apiRegister } from '@/api/auth'
import { fetchMe, updateProfile } from '@/api/me'
import type { Badge, LoginPayload, RegisterPayload, UpdateProfilePayload } from '@/types'

interface UserState {
  token: string | null
  id: string
  username: string
  email: string
  avatar: string | null
  bio: string
  createdAt: number
  badges: Badge[]
  isAdmin: boolean
}

const initialState = (): UserState => ({
  token: null,
  id: '',
  username: '',
  email: '',
  avatar: null,
  bio: '',
  createdAt: 0,
  badges: [],
  isAdmin: false,
})

// ---------- 会话持久化 ----------
// 「记住我」勾选 → localStorage（跨会话保持登录）；未勾选 → sessionStorage（关浏览器即失效）
const STORAGE_KEY = 'lunacho-user'
const REMEMBER_KEY = 'lunacho-remember'

function readPersistedUser(): Partial<UserState> {
  const raw = localStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(STORAGE_KEY)
  if (!raw) return {}
  try {
    return JSON.parse(raw) as Partial<UserState>
  } catch {
    return {}
  }
}

function persistUser(state: UserState, remember: boolean) {
  const { token, id, username, email, avatar, bio, createdAt, badges, isAdmin } = state
  const data = JSON.stringify({ token, id, username, email, avatar, bio, createdAt, badges, isAdmin })
  ;(remember ? localStorage : sessionStorage).setItem(STORAGE_KEY, data)
  if (!remember) localStorage.removeItem(STORAGE_KEY)
  localStorage.setItem(REMEMBER_KEY, remember ? '1' : '0')
}

/** 上次登录是否勾选了「记住我」（登录表单勾选框默认值） */
export function getRememberPref(): boolean {
  return localStorage.getItem(REMEMBER_KEY) !== '0'
}

export const useUserStore = defineStore('user', {
  state: () => ({ ...initialState(), ...readPersistedUser() }),
  getters: {
    isLoggedIn: (state) => Boolean(state.token),
    displayName: (state) => state.username || state.email || '访客',
  },
  actions: {
    /** 登录：remember=true 时跨会话保持登录，否则仅本次会话有效 */
    async login(payload: LoginPayload, remember = true) {
      const res = await apiLogin(payload)
      this.token = res.token
      this.id = res.user.id
      this.username = res.user.username
      this.email = res.user.email
      try {
        await this.fetchMe()
      } catch {
        // 资料拉取失败不阻断登录（基础信息已就绪）
      }
      persistUser(this.$state, remember)
    },

    /** 注册成功后自动登录（默认记住） */
    async register(payload: RegisterPayload) {
      await apiRegister(payload)
      await this.login({ username: payload.username, password: payload.password })
    },

    /** GET /api/me：同步完整资料（含 is_admin、badges） */
    async fetchMe() {
      const me = await fetchMe()
      this.id = me.id
      this.username = me.username
      this.avatar = me.avatar
      this.bio = me.bio ?? ''
      this.createdAt = me.created_at
      this.badges = me.badges ?? []
      this.isAdmin = me.is_admin ?? false
    },

    /** PATCH /api/me：字段使用 avatar（后端兼容 avatar_url 过渡） */
    async updateProfile(payload: UpdateProfilePayload) {
      await updateProfile(payload)
      if (payload.bio !== undefined) this.bio = payload.bio
      if (payload.avatar !== undefined) this.avatar = payload.avatar || null
    },

    logout() {
      localStorage.removeItem(STORAGE_KEY)
      sessionStorage.removeItem(STORAGE_KEY)
      this.$reset()
    },
  },
})
