import { defineStore } from 'pinia'
import { createExam, fetchExams } from '@/api/exams'
import type { Exam, PaginationParams } from '@/types'

export const useExamStore = defineStore('exam', {
  state: () => ({
    list: [] as Exam[],
    pagination: { page: 1, limit: 9, total: 0, pages: 0 },
    loading: false,
    error: false,
  }),
  actions: {
    async fetchList(params: PaginationParams = {}) {
      this.loading = true
      this.error = false
      try {
        const res = await fetchExams({
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

    async createExam(form: FormData, onProgress?: (percent: number) => void) {
      const res = await createExam(form, onProgress)
      this.list.unshift(res)
      return res
    },
  },
})
