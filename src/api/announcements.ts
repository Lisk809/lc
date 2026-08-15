import { http } from './http'
import type { Announcement, Paginated, PaginationParams } from '@/types'

/** GET /api/announcements（不缓存，实时查询） */
export function fetchAnnouncements(params: PaginationParams) {
  return http.get<Paginated<Announcement>>('/api/announcements', { params })
}

/** POST /api/announcements（仅管理员） */
export function createAnnouncement(payload: { title: string; content: string }) {
  return http.post<Announcement>('/api/announcements', payload)
}
