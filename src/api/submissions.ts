// 提交与批改 API（在线批改与学情分析系统）
import { http } from './http'
import type {
  AdminOverview,
  AdminQueueItem,
  GradeResult,
  MyStatistics,
  MySubmission,
  Paginated,
  PaginationParams,
  SubmissionDetail,
  SubmissionStatus,
} from '@/types'

/** 提交答案（文本 Markdown 和/或 PDF 答卷；重交 = 覆盖并把状态打回待批改） */
export function submitAnswer(questionId: string, form: FormData) {
  return http.post<SubmissionDetail>(`/api/questions/${questionId}/submit`, form)
}

/** 我在该题下的提交（未提交时 submission 为 null） */
export function fetchMySubmission(questionId: string) {
  return http.get<{ submission: SubmissionDetail | null }>(`/api/questions/${questionId}/submission`)
}

/** 我的提交列表（含批改状态与得分） */
export function fetchMySubmissions(params: PaginationParams) {
  return http.get<Paginated<MySubmission>>('/api/me/submissions', { params })
}

/** 管理员批改队列（pending 升序 FIFO / graded 降序） */
export function fetchAdminQueue(params: { status: SubmissionStatus; page?: number; limit?: number }) {
  return http.get<Paginated<AdminQueueItem>>('/api/admin/submissions/pending', { params })
}

/** 提交批改结果（覆盖式更新） */
export function gradeSubmission(id: string, payload: { score: number; comment?: string }) {
  return http.post<GradeResult>(`/api/admin/submissions/${id}/grade`, payload)
}

/** 管理员全局统计看板数据 */
export function fetchAdminOverview() {
  return http.get<AdminOverview>('/api/admin/statistics/overview')
}

/** 学生个人学情数据 */
export function fetchMyStatistics() {
  return http.get<MyStatistics>('/api/me/statistics')
}
