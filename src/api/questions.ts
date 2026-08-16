import { http } from './http'
import type { Paginated, PaginationParams, Question } from '@/types'

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
