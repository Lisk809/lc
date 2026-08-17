// SEO 元信息统一入口：路由切换与动态页面（如帖子详情）共用，
// 同时更新 document.title、description、canonical 与 Open Graph / Twitter 标签。
// 静态默认值（BODY_*）与 index.html 中预渲染的标签保持一致，作为 JS 未执行时的爬虫兜底。

export const SITE_URL = 'https://www.lunacho.top/'
export const SITE_NAME = 'Lunatic ChO'
export const OG_IMAGE_URL = `${SITE_URL}og-image.png`
export const OG_IMAGE_WIDTH = 3600
export const OG_IMAGE_HEIGHT = 1890

export const DEFAULT_TITLE = `${SITE_NAME} · 化竞幻想乡`
export const DEFAULT_DESCRIPTION =
  'Lunatic ChO — 化竞幻想乡（ChO = 化学奥林匹克 · C·H·O）：帖子讨论、题库管理、文件资源共享、官方公告'

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setLinkCanonical(url: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', url)
}

export interface SeoOptions {
  /** 页面标题（不含站点后缀） */
  title?: string
  /** 页面描述（缺失时回落全局默认） */
  description?: string
  /** 路由路径，用于拼 canonical 与 og:url（如 /posts/abc） */
  path?: string
}

/** 应用一套 SEO 元信息；不传任何字段则重置为站点默认值 */
export function applySeo({ title, description, path }: SeoOptions = {}) {
  const fullTitle = title ? `${title} · ${SITE_NAME}` : DEFAULT_TITLE
  const desc = description ?? DEFAULT_DESCRIPTION
  const url = path ? `${SITE_URL}${path.replace(/^\//, '')}` : SITE_URL

  document.title = fullTitle
  setMeta('name', 'description', desc)
  setMeta('property', 'og:title', fullTitle)
  setMeta('property', 'og:description', desc)
  setMeta('property', 'og:url', url)
  setMeta('name', 'twitter:title', fullTitle)
  setMeta('name', 'twitter:description', desc)
  setLinkCanonical(url)
}
