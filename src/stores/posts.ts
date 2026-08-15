import { defineStore } from 'pinia'
import { createPost, createReply, fetchPost, fetchPosts, fetchReplies, togglePostLike } from '@/api/posts'
import type { AxiosError } from 'axios'
import type { PaginationParams, Post, PostSortBy, Reply, SortOrder } from '@/types'

interface PaginationState {
  page: number
  limit: number
  total: number
  pages: number
}

const emptyPagination = (): PaginationState => ({ page: 1, limit: 10, total: 0, pages: 0 })

export const usePostStore = defineStore('post', {
  state: () => ({
    // 列表
    list: [] as Post[],
    pagination: emptyPagination(),
    loading: false,
    error: null as null | 'error',
    sortBy: 'created_at' as PostSortBy,
    order: 'DESC' as SortOrder,
    // 详情
    detail: null as Post | null,
    detailLoading: false,
    detailError: null as null | 'not-found' | 'error',
    // 回复
    replies: [] as Reply[],
    repliesPagination: emptyPagination(),
    repliesLoading: false,
    repliesError: false,
    // 我点赞过的帖子（持久化，乐观更新依据）
    likedIds: [] as string[],
  }),
  actions: {
    async fetchList(params: PaginationParams = {}) {
      this.loading = true
      this.error = null
      try {
        const res = await fetchPosts({
          page: params.page ?? this.pagination.page,
          limit: params.limit ?? 9,
          sortBy: this.sortBy,
          order: this.order,
        })
        this.list = res.data
        this.pagination = res.pagination
      } catch {
        this.error = 'error'
      } finally {
        this.loading = false
      }
    },

    async fetchDetail(id: string) {
      this.detailLoading = true
      this.detailError = null
      try {
        this.detail = await fetchPost(id, { skipToast: true })
      } catch (e) {
        this.detailError = (e as AxiosError).response?.status === 404 ? 'not-found' : 'error'
      } finally {
        this.detailLoading = false
      }
    },

    async fetchReplies(postId: string, params: PaginationParams = {}) {
      this.repliesLoading = true
      this.repliesError = false
      try {
        const res = await fetchReplies(postId, {
          page: params.page ?? 1,
          limit: params.limit ?? 10,
        })
        this.replies = res.data
        this.repliesPagination = res.pagination
      } catch {
        this.repliesError = true
      } finally {
        this.repliesLoading = false
      }
    },

    async createPost(form: FormData, onProgress?: (percent: number) => void) {
      const res = await createPost(form, onProgress)
      const post: Post = { ...res, reply_count: 0, likes_count: 0 }
      this.list.unshift(post)
      return res
    },

    async createReply(postId: string, form: FormData, onProgress?: (percent: number) => void) {
      const res = await createReply(postId, form, onProgress)
      this.replies.unshift({ ...res })
      if (this.detail?.id === postId) this.detail.reply_count += 1
      return res
    },

    /** 点赞 / 取消点赞：乐观更新，失败回滚（调用方节流 500ms） */
    async toggleLike(postId: string) {
      const index = this.likedIds.indexOf(postId)
      const wasLiked = index !== -1
      if (wasLiked) this.likedIds.splice(index, 1)
      else this.likedIds.push(postId)

      const detail = this.detail?.id === postId ? this.detail : null
      const listItem = this.list.find((p) => p.id === postId) ?? null
      if (detail) detail.likes_count = Math.max(0, detail.likes_count + (wasLiked ? -1 : 1))
      if (listItem) listItem.likes_count = Math.max(0, listItem.likes_count + (wasLiked ? -1 : 1))

      try {
        const res = await togglePostLike(postId)
        if (detail) detail.likes_count = res.likes_count
        if (listItem) listItem.likes_count = res.likes_count
      } catch {
        // 回滚
        if (wasLiked) this.likedIds.splice(index, 0, postId)
        else this.likedIds.splice(this.likedIds.indexOf(postId), 1)
        if (detail) detail.likes_count += wasLiked ? 1 : -1
        if (listItem) listItem.likes_count += wasLiked ? 1 : -1
      }
    },
  },
  persist: {
    key: 'lunacho-posts',
    paths: ['likedIds'],
  },
})
