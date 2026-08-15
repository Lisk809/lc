import { http } from './http'
import type { Me, MyPost, MyQuestion, Paginated, PaginationParams, UpdateProfilePayload, UserFile } from '@/types'

/** GET /api/me */
export function fetchMe() {
  return http.get<Me>('/api/me')
}

/** PATCH /api/me（头像字段统一为 avatar，兼容后端 avatar_url 过渡） */
export function updateProfile(payload: UpdateProfilePayload) {
  return http.patch<{ message: string }>('/api/me', payload)
}

/** GET /api/me/posts */
export function fetchMyPosts(params: PaginationParams) {
  return http.get<Paginated<MyPost>>('/api/me/posts', { params })
}

/** GET /api/me/questions */
export function fetchMyQuestions(params: PaginationParams) {
  return http.get<Paginated<MyQuestion>>('/api/me/questions', { params })
}

/** GET /api/me/files */
export function fetchMyFiles(params: PaginationParams) {
  return http.get<Paginated<UserFile>>('/api/me/files', { params })
}
