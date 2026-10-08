import { useEffect, useState } from 'react'
import type { PaginatedResponse } from '@/lib/api/snippetsApi'
import type { Snippet } from '@/types/snippet'

interface PagedState {
  data: Snippet[]
  total: number
  totalPages: number
  loading: boolean
  error: string | null
}

const INITIAL_STATE: PagedState = { data: [], total: 0, totalPages: 0, loading: true, error: null }

/**
 * Tải một trang snippet từ backend. Tải lại mỗi khi `key` đổi (thường là JSON của tham số truy vấn)
 * hoặc khi gọi `reload()`. Kết quả cũ bị bỏ nếu tham số đã đổi trong lúc chờ.
 */
export function usePagedSnippets(load: () => Promise<PaginatedResponse<Snippet>>, key: string) {
  const [state, setState] = useState<PagedState>(INITIAL_STATE)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let cancelled = false
    setState((current) => ({ ...current, loading: true, error: null }))
    load()
      .then((res) => {
        if (cancelled) return
        setState({ data: res.data, total: res.total, totalPages: res.totalPages, loading: false, error: null })
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const message = err instanceof Error ? err.message : 'Không thể tải danh sách snippet'
        setState({ ...INITIAL_STATE, loading: false, error: message })
      })
    return () => {
      cancelled = true
    }
  }, [key, reloadToken])

  return { ...state, reload: () => setReloadToken((token) => token + 1) }
}
