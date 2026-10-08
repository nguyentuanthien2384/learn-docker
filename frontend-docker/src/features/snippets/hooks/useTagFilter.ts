import { useSearchParams } from 'react-router-dom'

export type SnippetSort = 'latest' | 'stars'

type ParamPatch = Record<string, string | null>

/** Giữ bộ lọc danh sách (tag, tìm kiếm, sắp xếp, trang) trên query string để có thể chia sẻ link. */
export function useListParams() {
  const [searchParams, setSearchParams] = useSearchParams()

  const update = (patch: ParamPatch, { keepPage = false } = {}) => {
    const next = new URLSearchParams(searchParams)
    for (const [key, value] of Object.entries(patch)) {
      if (value) next.set(key, value)
      else next.delete(key)
    }
    if (!keepPage) next.delete('page')
    setSearchParams(next, { replace: true })
  }

  const selectedTag = searchParams.get('tag')

  return {
    selectedTag,
    search: searchParams.get('q') ?? '',
    sort: (searchParams.get('sort') === 'stars' ? 'stars' : 'latest') as SnippetSort,
    page: Math.max(1, Number.parseInt(searchParams.get('page') ?? '1', 10) || 1),
    toggleTag: (tag: string) => update({ tag: selectedTag === tag ? null : tag }),
    setSearch: (q: string) => update({ q: q || null }),
    setSort: (sort: SnippetSort) => update({ sort: sort === 'latest' ? null : sort }),
    setPage: (page: number) => update({ page: page > 1 ? String(page) : null }, { keepPage: true }),
  }
}

/** Chỉ cần tag đang chọn (trang chủ). */
export function useTagFilter() {
  const { selectedTag, toggleTag } = useListParams()
  return { selectedTag, toggleTag }
}
