import { http } from './http'
import type { LoginPayload, LoginResponse, RegisterPayload } from '@/types'

/** POST /api/auth/register */
export function register(payload: RegisterPayload) {
  return http.post<{ message: string; user_id: string }>('/api/auth/register', payload, {
    skipToast: true,
  })
}

/** POST /api/auth/login */
export function login(payload: LoginPayload) {
  return http.post<LoginResponse>('/api/auth/login', payload, { skipToast: true })
}
