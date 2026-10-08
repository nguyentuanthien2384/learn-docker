import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { snippetsApi } from '@/lib/api/snippetsApi'
import { tagsApi } from '@/lib/api/tagsApi'
import { useAuth } from '@/context/AuthContext'
import type { Snippet, SnippetFormValues } from '@/types/snippet'

const TOP_TAGS_LIMIT = 40
const MY_SNIPPETS_PAGE_SIZE = 100
const MY_SNIPPETS_MAX_PAGES = 10

interface SnippetsContextValue {
  /** Cache các snippet đã tải theo id. Danh sách theo trang do từng màn hình tự truy vấn qua API. */
  snippets: Snippet[]
  mySnippets: Snippet[]
  tags: string[]
  loading: boolean
  error: string | null
  getById: (id: string) => Snippet | undefined
  fetchById: (id: string) => Promise<Snippet | undefined>
  createSnippet: (values: SnippetFormValues) => Promise<Snippet>
  updateSnippet: (id: string, values: SnippetFormValues) => Promise<Snippet>
  deleteSnippet: (id: string) => Promise<void>
  toggleStar: (id: string) => Promise<void>
  refresh: () => Promise<void>
  refreshMySnippets: () => Promise<void>
}

const SnippetsContext = createContext<SnippetsContextValue | null>(null)

function upsert(list: Snippet[], snippet: Snippet): Snippet[] {
  return [snippet, ...list.filter((s) => s.id !== snippet.id)]
}

export function SnippetsProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  const [snippets, setSnippets] = useState<Snippet[]>([])
  const [mySnippets, setMySnippets] = useState<Snippet[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadTags = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const tagsRes = await tagsApi.getTopTags(TOP_TAGS_LIMIT)
      setTags(tagsRes.map((t) => t.name))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách tag')
    } finally {
      setLoading(false)
    }
  }, [])

  /** Tải toàn bộ snippet của tôi (theo từng trang) để số liệu Dashboard chính xác. */
  const loadMySnippets = useCallback(async () => {
    if (!isAuthenticated) {
      setMySnippets([])
      return
    }
    try {
      const all: Snippet[] = []
      for (let page = 1; page <= MY_SNIPPETS_MAX_PAGES; page++) {
        const res = await snippetsApi.getMySnippets({ page, limit: MY_SNIPPETS_PAGE_SIZE })
        all.push(...res.data)
        if (page >= res.totalPages) break
      }
      setMySnippets(all)
    } catch {
      // Phiên hết hạn hoặc backend lỗi: Dashboard hiển thị danh sách rỗng
    }
  }, [isAuthenticated])

  useEffect(() => {
    loadTags()
  }, [loadTags])

  useEffect(() => {
    loadMySnippets()
  }, [loadMySnippets])

  const getById = useCallback(
    (id: string): Snippet | undefined => {
      const stringId = String(id)
      return mySnippets.find((s) => s.id === stringId) || snippets.find((s) => s.id === stringId)
    },
    [snippets, mySnippets],
  )

  const fetchById = useCallback(
    async (id: string): Promise<Snippet | undefined> => {
      const cached = getById(id)
      if (cached) return cached
      try {
        const fetched = await snippetsApi.getSnippetById(id)
        setSnippets((current) => (current.some((s) => s.id === fetched.id) ? current : [fetched, ...current]))
        return fetched
      } catch {
        return undefined
      }
    },
    [getById],
  )

  const mergeTags = (values: SnippetFormValues) => {
    if (values.tags.length > 0) {
      setTags((current) => Array.from(new Set([...current, ...values.tags])))
    }
  }

  const createSnippet = useCallback(async (values: SnippetFormValues): Promise<Snippet> => {
    const created = await snippetsApi.createSnippet(values)
    setSnippets((current) => upsert(current, created))
    setMySnippets((current) => upsert(current, created))
    mergeTags(values)
    return created
  }, [])

  const updateSnippet = useCallback(
    async (id: string, values: SnippetFormValues): Promise<Snippet> => {
      const updated = await snippetsApi.updateSnippet(id, values, getById(id))
      const replace = (list: Snippet[]) => list.map((s) => (s.id === id ? updated : s))
      setSnippets(replace)
      setMySnippets(replace)
      mergeTags(values)
      return updated
    },
    [getById],
  )

  const deleteSnippet = useCallback(async (id: string): Promise<void> => {
    await snippetsApi.deleteSnippet(id)
    setSnippets((current) => current.filter((s) => s.id !== id))
    setMySnippets((current) => current.filter((s) => s.id !== id))
  }, [])

  const toggleStar = useCallback(
    async (id: string): Promise<void> => {
      const target = getById(id)
      if (!target) return

      const wasStarred = Boolean(target.hasStarred)
      const patch = (hasStarred: boolean, stars: number) => (list: Snippet[]) =>
        list.map((s) => (s.id === id ? { ...s, hasStarred, stars } : s))
      const apply = (hasStarred: boolean, stars: number) => {
        setSnippets(patch(hasStarred, stars))
        setMySnippets(patch(hasStarred, stars))
      }

      // Cập nhật lạc quan, sau đó đồng bộ số sao thật do backend trả về
      apply(!wasStarred, Math.max(0, target.stars + (wasStarred ? -1 : 1)))
      try {
        const res = wasStarred ? await snippetsApi.unstar(id) : await snippetsApi.star(id)
        apply(res.starred, res.starsCount)
      } catch {
        apply(wasStarred, target.stars)
      }
    },
    [getById],
  )

  const value = useMemo<SnippetsContextValue>(
    () => ({
      snippets,
      mySnippets,
      tags,
      loading,
      error,
      getById,
      fetchById,
      createSnippet,
      updateSnippet,
      deleteSnippet,
      toggleStar,
      refresh: loadTags,
      refreshMySnippets: loadMySnippets,
    }),
    [
      snippets,
      mySnippets,
      tags,
      loading,
      error,
      getById,
      fetchById,
      createSnippet,
      updateSnippet,
      deleteSnippet,
      toggleStar,
      loadTags,
      loadMySnippets,
    ],
  )

  return <SnippetsContext.Provider value={value}>{children}</SnippetsContext.Provider>
}

export function useSnippets(): SnippetsContextValue {
  const context = useContext(SnippetsContext)
  if (!context) throw new Error('useSnippets must be used within a SnippetsProvider')
  return context
}
