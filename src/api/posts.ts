import { http } from './http'
import type { AxiosRequestConfig } from 'axios'
import type {
  LikeResult,
  Paginated,
  PaginationParams,
  Post,
  PostCreateResult,
  PostListParams,
  Reply,
  ReplyCreateResult,
} from '@/types'

/** GET /api/posts */
export function fetchPosts(params: PostListParams) {
  return http.get<Paginated<Post>>('/api/posts', { params })
}

/** GET /api/posts/:id */
export function fetchPost(id: string, config?: AxiosRequestConfig) {
  return http.get<Post>(`/api/posts/${id}`, config)
}

/** POST /api/posts（multipart/form-data：title / content / file） */
export function createPost(form: FormData, onProgress?: (percent: number) => void) {
  return http.post<PostCreateResult>('/api/posts', form, {
    onUploadProgress: (e) => {
      if (e.total) onProgress?.(Math.round((e.loaded / e.total) * 100))
    },
  })
}

/** GET /api/posts/:id/replies */
export function fetchReplies(postId: string, params: PaginationParams) {
  return http.get<Paginated<Reply>>(`/api/posts/${postId}/replies`, { params })
}

/** POST /api/posts/:id/replies（multipart/form-data：content / file） */
export function createReply(
  postId: string,
  form: FormData,
  onProgress?: (percent: number) => void
) {
  return http.post<ReplyCreateResult>(`/api/posts/${postId}/replies`, form, {
    onUploadProgress: (e) => {
      if (e.total) onProgress?.(Math.round((e.loaded / e.total) * 100))
    },
  })
}

/** POST /api/posts/:id/like（点赞 / 取消点赞，幂等切换） */
export function togglePostLike(postId: string) {
  return http.post<LikeResult>(`/api/posts/${postId}/like`)
}
