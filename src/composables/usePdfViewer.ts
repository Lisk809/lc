// PDF.js 在线预览（exam.md §4.2 的 Vue 3 组合式封装）
// - 标准 Canvas 渲染，不依赖第三方 Viewer
// - 通过 fetch → arrayBuffer → getDocument({data}) 加载：规避跨域 Range 请求问题（HF 仅需普通 CORS）
// - 切换文档即销毁旧 PDFDocument，避免批改工作台长时间使用内存溢出
import { onBeforeUnmount, ref, type Ref } from 'vue'
import * as pdfjsLib from 'pdfjs-dist'
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

export function usePdfViewer(
  canvasRef: Ref<HTMLCanvasElement | null>,
  containerRef: Ref<HTMLElement | null>,
) {
  const loading = ref(false)
  const error = ref(false)
  const totalPages = ref(0)
  const currentPage = ref(1)

  let doc: PDFDocumentProxy | null = null
  let renderTask: RenderTask | null = null

  async function loadPDF(url: string) {
    cleanup()
    loading.value = true
    error.value = false
    try {
      const data = await (await fetch(url)).arrayBuffer()
      doc = await pdfjsLib.getDocument({ data }).promise
      totalPages.value = doc.numPages
      currentPage.value = 1
      await renderPage(1)
    } catch {
      error.value = true
    } finally {
      loading.value = false
    }
  }

  async function renderPage(pageNum: number) {
    if (!doc) return
    renderTask?.cancel()
    const page = await doc.getPage(pageNum)
    const base = page.getViewport({ scale: 1 })
    // 自适应容器宽度（exam.md §4.3），钳制在 0.5–2 避免过糊/过大
    const containerWidth = containerRef.value?.clientWidth ?? base.width
    const scale = Math.max(0.5, Math.min(2, containerWidth / base.width))
    const viewport = page.getViewport({ scale })
    const canvas = canvasRef.value
    if (!canvas) return
    canvas.width = viewport.width
    canvas.height = viewport.height
    currentPage.value = pageNum
    renderTask = page.render({ canvasContext: canvas.getContext('2d')!, viewport })
    await renderTask.promise
  }

  function nextPage() {
    if (currentPage.value < totalPages.value) void renderPage(currentPage.value + 1)
  }

  function prevPage() {
    if (currentPage.value > 1) void renderPage(currentPage.value - 1)
  }

  function cleanup() {
    renderTask?.cancel()
    void doc?.destroy()
    doc = null
    totalPages.value = 0
    currentPage.value = 1
  }

  onBeforeUnmount(cleanup)

  return { loadPDF, renderPage, nextPage, prevPage, totalPages, currentPage, loading, error, cleanup }
}
