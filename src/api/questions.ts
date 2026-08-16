import { http } from './http'
import type { Paginated, PaginationParams, Question, QuestionStatus } from '@/types'

/** GET /api/questions */
export function fetchQuestions(params: PaginationParams) {
  return http.get<Paginated<Question>>('/api/questions', { params })
}

/** POST /api/questions（multipart/form-data：title / content(markdown) / answer(markdown) / file） */
export function createQuestion(form: FormData, onProgress?: (percent: number) => void) {
  return http.post<Question>('/api/questions', form, {
    onUploadProgress: (e) => {
      if (e.total) onProgress?.(Math.round((e.loaded / e.total) * 100))
    },
  })
}

/** PATCH /api/questions/:id/status（管理员发布/下线题目） */
export function setQuestionStatus(id: string, status: QuestionStatus) {
  return http.patch<{ id: string; status: QuestionStatus }>(`/api/questions/${id}/status`, { status })
}
