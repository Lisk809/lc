// ============================================================
// API 数据类型 — 与 api.md v1.2 对齐
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

/** 作者信息（后端 join users 表返回，帖子/回复/题目/公告通用；用户已删除时为 null） */
export interface Author {
  id: string
  username: string
  avatar_url: string | null
}

// ---------------- 认证 ----------------

export interface RegisterPayload {
  username: string
  email: string
  password: string
  /** Cloudflare Turnstile 客户端令牌（必填） */
  turnstile_token: string
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
  /** 本人题目，答案随行返回 */
  answer: string | null
  attachment_url: string | null
  status: QuestionStatus
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
  author: Author | null
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
  author: Author | null
  attachment_url: string | null
  created_at: number
}

export interface Reply {
  id: string
  content: string
  user_id: string
  author: Author | null
  post_id?: string
  attachment_url: string | null
  created_at: number
}

/** POST /api/posts/:id/replies 的 201 响应 */
export interface ReplyCreateResult {
  id: string
  content: string
  user_id: string
  author: Author | null
  post_id: string
  attachment_url: string | null
  created_at: number
}

export interface LikeResult {
  liked: boolean
  likes_count: number
}

// ---------------- 题目 ----------------

export type QuestionStatus = 'draft' | 'published'

export interface Question {
  id: string
  title: string
  content: string
  /** 参考答案（markdown），详情弹窗中默认折叠，点击展开 */
  answer: string | null
  user_id: string
  author: Author | null
  attachment_url: string | null
  /** draft 仅管理员可见且不可提交；published 全站可见 */
  status: QuestionStatus
  created_at: number
}

// ---------------- 提交与批改（在线批改与学情分析系统） ----------------

export type SubmissionStatus = 'pending' | 'graded'

export interface Grade {
  id: string
  submission_id: string
  grader_id: string
  score: number
  comment: string | null
  created_at: number
}

/** 单题提交详情（含批改结果；grade 为 null 表示未批改） */
export interface SubmissionDetail {
  id: string
  question_id: string
  content: string | null
  attachment_url: string | null
  attachment_name: string | null
  status: SubmissionStatus
  grade: Grade | null
  created_at: number
  updated_at: number
}

/** 我的提交列表项（question_title 可能为 null：题目已删除） */
export interface MySubmission {
  id: string
  question_id: string
  question_title: string | null
  status: SubmissionStatus
  score: number | null
  comment: string | null
  created_at: number
  updated_at: number
  graded_at: number | null
}

/** 管理员批改队列条目（学生身份用 username，无学号字段） */
export interface AdminQueueItem {
  id: string
  user_id: string
  username: string
  question_id: string
  question_title: string | null
  content: string | null
  attachment_url: string | null
  attachment_name: string | null
  status: SubmissionStatus
  created_at: number
  updated_at: number
  grade: Grade | null
}

/** POST /api/admin/submissions/:id/grade 响应 */
export interface GradeResult {
  id: string
  submission_id: string
  grader_id: string
  score: number
  comment: string | null
  status: 'graded'
  created_at: number
}

/** GET /api/admin/statistics/overview */
export interface AdminOverview {
  kpis: {
    total_submissions: number
    pending_submissions: number
    graded_submissions: number
    avg_score: number | null
    students: number
  }
  score_distribution: { bucket: string; count: number }[]
  question_difficulty: { question_id: string; title: string | null; avg_score: number; graded_count: number }[]
  trend: { date: string; submitted: number; graded: number }[]
}

/** GET /api/me/statistics */
export interface MyStatistics {
  summary: {
    my_avg: number | null
    global_avg: number | null
    graded_count: number
    total_submissions: number
  }
  per_question: { question_id: string; title: string | null; score: number; global_avg: number | null }[]
  last_grades: { question_id: string; title: string | null; score: number; created_at: number }[]
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
  author: Author | null
  created_at: number
}

// ---------------- UI ----------------

export type ToastType = 'info' | 'success' | 'error'

export interface ToastItem {
  id: number
  message: string
  type: ToastType
}

export type ProfileTab = 'info' | 'posts' | 'questions' | 'files' | 'analytics'
