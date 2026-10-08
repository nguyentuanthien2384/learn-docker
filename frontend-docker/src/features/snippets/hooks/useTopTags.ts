import { useEffect, useState } from 'react'
import { tagsApi, type TagResponse } from '@/lib/api/tagsApi'

/** Tag phổ biến từ GET /api/tags, kèm usageCount do backend đếm. */
export function useTopTags(limit: number) {
  const [tags, setTags] = useState<TagResponse[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    tagsApi
      .getTopTags(limit)
      .then((res) => {
        if (!cancelled) setTags(res)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Không thể tải danh sách tag')
      })
    return () => {
      cancelled = true
    }
  }, [limit])

  return { tags, error }
}
