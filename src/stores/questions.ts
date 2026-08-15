import { defineStore } from 'pinia'
import { createQuestion, fetchQuestions } from '@/api/questions'
import type { PaginationParams, Question } from '@/types'

export const useQuestionStore = defineStore('question', {
  state: () => ({
    list: [] as Question[],
    pagination: { page: 1, limit: 9, total: 0, pages: 0 },
    loading: false,
    error: false,
  }),
  actions: {
    async fetchList(params: PaginationParams = {}) {
      this.loading = true
      this.error = false
      try {
        const res = await fetchQuestions({
          page: params.page ?? this.pagination.page,
          limit: params.limit ?? 9,
        })
        this.list = res.data
        this.pagination = res.pagination
      } catch {
        this.error = true
      } finally {
        this.loading = false
      }
    },

    async createQuestion(form: FormData, onProgress?: (percent: number) => void) {
      const res = await createQuestion(form, onProgress)
      this.list.unshift(res)
      return res
    },
  },
})
