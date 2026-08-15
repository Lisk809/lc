// 通用分页列表状态（从 ProfileView 抽出的公共 composable，批改工作台同样复用）
import { ref } from 'vue'
import type { Paginated } from '@/types'

export function usePagedList<T extends { id: string }>(fetchPage: (page: number) => Promise<Paginated<T>>) {
  const items = ref<T[]>([])
  const pagination = ref({ page: 1, pages: 0, total: 0, limit: 10 })
  const loading = ref(false)
  const error = ref(false)
  const loaded = ref(false)

  async function load(page = 1) {
    loading.value = true
    error.value = false
    try {
      const res = await fetchPage(page)
      items.value = res.data
      pagination.value = res.pagination
      loaded.value = true
    } catch {
      error.value = true
    } finally {
      loading.value = false
    }
  }

  /** 本地移除一条（无需重新拉取），用于批改完成后把条目移出队列 */
  function removeItem(id: string) {
    items.value = items.value.filter((item) => item.id !== id)
    pagination.value.total = Math.max(0, pagination.value.total - 1)
    pagination.value.pages = Math.ceil(pagination.value.total / pagination.value.limit)
  }

  return { items, pagination, loading, error, loaded, load, removeItem }
}
