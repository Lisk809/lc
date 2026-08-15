// ============================================================
// API 数据类型 — 与 api.md v1.1 对齐
// ============================================================

/** 通用分页响应 */
export interface Paginated<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface PaginationParams {
  page?: number
  limit?: number
}

/** 错误响应体：{ "error": "..." } */
export interface ApiErrorBody {
  error?: string
}

// ---------------- 认证 ----------------

export interface RegisterPayload {
  username: string
  email: string
  password: string
}

export interface LoginPayload {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  user: {
    id: string
    username: string
    email: string
  }
}

// ---------------- 用户 ----------------

export interface Badge {
  id: string
  name: string
  description: string
  icon_url: string | null
  awarded_at: number
}

export interface Me {
  id: string
  username: string
  avatar: string | null
  bio: string
  created_at: number
  is_admin: boolean
  badges: Badge[]
}

export interface UpdateProfilePayload {
  bio?: string
  avatar?: string
}

export interface MyPost {
  id: string
  title: string
  content: string
  reply_count: number
  attachment_url: string | null
  created_at: number
}

export interface MyQuestion {
  id: string
  title: string
  content: string
  options: string[]
  /** 仅作者本人可见（/api/me/questions） */
  answer: string | null
  attachment_url: string | null
  created_at: number
}

export interface UserFile {
  id: string
  file_name: string
  file_path: string
  file_url: string
  file_size: number
  mime_type: string
  created_at: number
}

// ---------------- 帖子 ----------------

export type PostSortBy = 'created_at' | 'likes_count' | 'reply_count' | 'updated_at'
export type SortOrder = 'ASC' | 'DESC'

export interface PostListParams extends PaginationParams {
  userId?: string
  sortBy?: PostSortBy
  order?: SortOrder
}

export interface Post {
  id: string
  title: string
  content: string
  user_id: string
  reply_count: number
  likes_count: number
  attachment_url: string | null
  created_at: number
}

/** POST /api/posts 的 201 响应（不含计数） */
export interface PostCreateResult {
  id: string
  title: string
  content: string
  user_id: string
  attachment_url: string | null
  created_at: number
}

export interface Reply {
  id: string
  content: string
  user_id: string
  post_id?: string
  attachment_url: string | null
  created_at: number
}

/** POST /api/posts/:id/replies 的 201 响应 */
export interface ReplyCreateResult {
  id: string
  content: string
  user_id: string
  post_id: string
  attachment_url: string | null
  created_at: number
}

export interface LikeResult {
  liked: boolean
  likes_count: number
}

// ---------------- 题目 ----------------

export interface Question {
  id: string
  title: string
  content: string
  options: string[]
  /** 仅作者可见，非作者为 null（后端保证） */
  answer: string | null
  user_id: string
  attachment_url: string | null
  created_at: number
}

// ---------------- 文件 ----------------

export interface UploadResult {
  success: boolean
  fileId: string
  path: string
  url: string
  size: number
  fileName: string
}

// ---------------- 公告 ----------------

export interface Announcement {
  id: string
  title: string
  content: string
  author_id: string
  created_at: number
}

// ---------------- UI ----------------

export type ToastType = 'info' | 'success' | 'error'

export interface ToastItem {
  id: number
  message: string
  type: ToastType
}

export type ProfileTab = 'info' | 'posts' | 'questions' | 'files'
