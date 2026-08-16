// 联考 API（独立事件：仅管理员创建，发布/下线开关，答卷 PDF 提交与批改）
import { http } from './http'
import type { Exam, ExamStatus, Paginated, PaginationParams, SubmissionDetail } from '@/types'

/** GET /api/exams（管理员可见全部，普通用户仅 published） */
export function fetchExams(params: PaginationParams) {
  return http.get<Paginated<Exam>>('/api/exams', { params })
}

/** POST /api/exams（multipart/form-data：title / description / paper / sheet，仅管理员） */
export function createExam(form: FormData, onProgress?: (percent: number) => void) {
  return http.post<Exam>('/api/exams', form, {
    onUploadProgress: (e) => {
      if (e.total) onProgress?.(Math.round((e.loaded / e.total) * 100))
    },
  })
}

/** PATCH /api/exams/:id/status（仅管理员） */
export function setExamStatus(id: string, status: ExamStatus) {
  return http.patch<Exam>(`/api/exams/${id}/status`, { status })
}

/** 提交答卷（仅 PDF；重交 = 覆盖并把状态打回待批改） */
export function submitExamAnswer(examId: string, form: FormData) {
  return http.post<SubmissionDetail>(`/api/exams/${examId}/submit`, form)
}

/** 我在该场联考下的提交（未提交时 submission 为 null） */
export function fetchMyExamSubmission(examId: string) {
  return http.get<{ submission: SubmissionDetail | null }>(`/api/exams/${examId}/submission`)
}
