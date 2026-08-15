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

export const useUserStore = defineStore('user', {
  state: initialState,
  getters: {
    isLoggedIn: (state) => Boolean(state.token),
    displayName: (state) => state.username || state.email || '访客',
  },
  actions: {
    /** 登录：保存 token 与基础信息，并拉取完整资料 */
    async login(payload: LoginPayload) {
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
    },

    /** 注册成功后自动登录 */
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
      this.$reset()
    },
  },
  persist: {
    key: 'lunacho-user',
  },
})
