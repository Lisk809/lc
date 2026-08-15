import { http } from './http'
import type { UploadResult } from '@/types'

/**
 * POST /api/upload（multipart/form-data，字段名 file）
 * 用于编辑器图片粘贴等通用上传场景；帖子/回复/题目的附件随表单提交。
 */
export function uploadFile(file: File, onProgress?: (percent: number) => void) {
  const form = new FormData()
  form.append('file', file)
  return http.post<UploadResult>('/api/upload', form, {
    onUploadProgress: (e) => {
      if (e.total) onProgress?.(Math.round((e.loaded / e.total) * 100))
    },
  })
}
