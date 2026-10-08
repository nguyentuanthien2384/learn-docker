import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ErrorNotice } from '@/components/ui/ErrorNotice'
import { Pagination } from '@/components/ui/Pagination'
import { snippetsApi } from '@/lib/api/snippetsApi'
import { usersApi } from '@/lib/api/usersApi'
import { formatRelativeTime } from '@/lib/date'
import type { AuthorProfile } from '@/types/snippet'
import { SnippetCard } from '@/features/snippets/components/SnippetCard'
import { usePagedSnippets } from '@/features/snippets/hooks/usePagedSnippets'

const PAGE_SIZE = 12

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

/** Trang hồ sơ công khai của tác giả: GET /api/users/:id + snippet công khai theo author_id. */
export function AuthorPage() {
  const { id = '' } = useParams<{ id: string }>()
  const [page, setPage] = useState(1)
  const [profile, setProfile] = useState<AuthorProfile | null>(null)
  const [profileError, setProfileError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setProfile(null)
    setProfileError(null)
    setPage(1)
    usersApi
      .getProfile(id)
      .then((res) => {
        if (!cancelled) setProfile(res)
      })
      .catch((err: unknown) => {
        if (!cancelled) setProfileError(err instanceof Error ? err.message : 'Không thể tải hồ sơ')
      })
    return () => {
      cancelled = true
    }
  }, [id])

  const snippets = usePagedSnippets(
    () => snippetsApi.getSnippets({ author_id: id, page, limit: PAGE_SIZE, sort: 'latest' }),
    `author:${id}:${page}`,
  )

  if (profileError) return <ErrorNotice message={profileError} />
  if (!profile) return <div className="text-mut text-sm py-8 text-center">Đang tải hồ sơ...</div>

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-bd bg-panel bg-grad-soft p-[22px] flex items-center gap-4 flex-wrap">
        {profile.avatarUrl ? (
          <img
            src={profile.avatarUrl}
            alt={profile.name}
            className="w-[64px] h-[64px] shrink-0 rounded-full object-cover border border-bd2 shadow-glow"
          />
        ) : (
          <div className="w-[64px] h-[64px] shrink-0 rounded-full bg-grad shadow-glow text-acc-ink flex items-center justify-center text-xl font-bold">
            {initialsOf(profile.name) || '?'}
          </div>
        )}
        <div className="flex flex-col gap-1">
          <div className="text-xl font-semibold text-tx">{profile.name}</div>
          {profile.bio ? <div className="text-mut text-sm max-w-[64ch] [text-wrap:pretty]">{profile.bio}</div> : null}
          {profile.createdAt ? (
            <div className="font-mono text-xs text-mut3">Tham gia {formatRelativeTime(profile.createdAt)}</div>
          ) : null}
        </div>
      </div>

      <div className="flex items-baseline gap-2.5">
        <div className="text-[17px] font-semibold text-tx">Snippet công khai</div>
        <div className="font-mono text-[12.5px] text-mut2">{snippets.loading ? '' : `${snippets.total} snippet`}</div>
      </div>

      {snippets.error ? <ErrorNotice message={snippets.error} onRetry={snippets.reload} /> : null}
      {!snippets.loading && !snippets.error && snippets.data.length === 0 ? (
        <div className="rounded-[13px] border border-dashed border-bd2 p-9 text-center text-mut2 text-[13.5px]">
          Tác giả chưa có snippet công khai.
        </div>
      ) : null}
      <div className="grid [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))] gap-3.5">
        {snippets.data.map((snippet) => (
          <SnippetCard key={snippet.id} snippet={snippet} variant="grid" />
        ))}
      </div>
      <Pagination page={page} totalPages={snippets.totalPages} onChange={setPage} />
    </div>
  )
}
