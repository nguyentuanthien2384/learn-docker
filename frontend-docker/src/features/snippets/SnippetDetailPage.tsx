import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { TagPill, TypeBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'
import { useSnippets } from '@/context/SnippetsContext'
import { isCodeSnippet, type Snippet } from '@/types/snippet'
import { CodeViewer } from '@/features/snippets/components/CodeViewer'

export function SnippetDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { getById, fetchById, toggleStar } = useSnippets()
  const cached = id ? getById(id) : undefined
  const [fetchedSnippet, setFetchedSnippet] = useState<Snippet | undefined>(undefined)
  const [loading, setLoading] = useState(Boolean(id && !cached))
  const snippet = cached ?? fetchedSnippet

  useEffect(() => {
    if (!id || cached) return
    let cancelled = false
    fetchById(id)
      .then((found) => {
        if (!cancelled) setFetchedSnippet(found)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id, cached, fetchById])

  if (loading) {
    return (
      <div className="flex flex-col gap-4 py-8 items-center justify-center text-mut text-sm">
        Đang tải thông tin snippet...
      </div>
    )
  }

  if (!snippet || !isCodeSnippet(snippet)) return <Navigate to="/docker" replace />

  return (
    <div className="flex flex-col gap-[18px]">
      <div className="flex items-center justify-between gap-3">
        <Button size="sm" onClick={() => navigate('/docker')} className="self-start text-[12.5px]">
          ← Quay lại
        </Button>
        <Button
          size="sm"
          onClick={() => (isAuthenticated ? toggleStar(snippet.id) : navigate('/auth'))}
          className="text-[12.5px] border-acc text-acc"
        >
          {snippet.hasStarred ? '★ Đã gắn sao' : '☆ Gắn sao'} ({snippet.stars})
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2.5 flex-wrap">
          <TypeBadge type={snippet.type} className="text-[11.5px]" />
          {snippet.tags.map((tag) => (
            <TagPill key={tag} name={tag} className="text-[11.5px]" />
          ))}
        </div>
        <div className="text-[26px] font-semibold tracking-tight text-tx [text-wrap:pretty]">{snippet.title}</div>
        <div className="text-mut max-w-[74ch] [text-wrap:pretty]">{snippet.description}</div>
        <div className="font-mono text-[12.5px] text-mut3">
          {snippet.authorId ? (
            <Link to={`/users/${snippet.authorId}`} className="hover:text-acc">
              @{snippet.author}
            </Link>
          ) : (
            <>@{snippet.author}</>
          )}{' '}
          · {snippet.updatedAt} · ★ {snippet.stars}
        </div>
      </div>

      <CodeViewer filename={snippet.filename} lines={snippet.lines} />
    </div>
  )
}
