import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TypeBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ErrorNotice } from '@/components/ui/ErrorNotice'
import { Pagination } from '@/components/ui/Pagination'
import { snippetsApi } from '@/lib/api/snippetsApi'
import { SnippetCard } from '@/features/snippets/components/SnippetCard'
import { usePagedSnippets } from '@/features/snippets/hooks/usePagedSnippets'
import { cn } from '@/lib/cn'
import { useSnippets } from '@/context/SnippetsContext'
import { useAuth } from '@/context/AuthContext'

type Tab = 'mine' | 'starred'

const STARRED_PAGE_SIZE = 12

export function DashboardPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { mySnippets, refreshMySnippets, deleteSnippet, loading } = useSnippets()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [tab, setTab] = useState<Tab>('mine')
  const [starredPage, setStarredPage] = useState(1)
  const starred = usePagedSnippets(
    () => snippetsApi.getMyStars({ page: starredPage, limit: STARRED_PAGE_SIZE }),
    `stars:${starredPage}`,
  )

  useEffect(() => {
    if (isAuthenticated) {
      refreshMySnippets()
    }
  }, [isAuthenticated, refreshMySnippets])

  const stats = useMemo(() => {
    const total = mySnippets.length
    const pub = mySnippets.filter((s) => s.isPublic).length
    const priv = total - pub
    const totalStars = mySnippets.reduce((sum, s) => sum + s.stars, 0)
    return [
      { label: 'Snippet của tôi', value: String(total) },
      { label: 'Công khai', value: String(pub) },
      { label: 'Riêng tư', value: String(priv) },
      { label: 'Tổng lượt sao', value: String(totalStars) },
    ]
  }, [mySnippets])

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Bạn có chắc muốn xoá snippet "${title}" không?`)) return
    setDeletingId(id)
    try {
      await deleteSnippet(id)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end gap-4 flex-wrap">
        <div className="flex flex-col gap-1.5">
          <div className="text-2xl font-semibold tracking-tight text-tx">Snippet của tôi</div>
          <div className="text-mut">Quản lý toàn bộ snippet công khai và riêng tư của bạn.</div>
        </div>
        <div className="flex-1" />
        <Button variant="primary" onClick={() => navigate('/create')}>
          + Tạo snippet mới
        </Button>
        <Button onClick={() => navigate('/profile')}>Cập nhật hồ sơ</Button>
      </div>

      <div className="grid [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))] gap-3.5">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-[13px] border border-bd bg-panel p-4">
            <div className="text-xs text-mut2">{stat.label}</div>
            <div className="font-mono text-[26px] font-semibold mt-1.5 text-tx">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-1 p-1 rounded-[10px] bg-panel2 border border-bd2 self-start">
        {(
          [
            { key: 'mine', label: 'Snippet của tôi' },
            { key: 'starred', label: 'Đã gắn sao' },
          ] as const
        ).map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setTab(item.key)}
            className={cn(
              'px-4 py-2 rounded-[7px] border-0 text-[13px] cursor-pointer',
              tab === item.key ? 'bg-pill2 text-tx font-semibold' : 'bg-transparent text-mut font-medium hover:text-tx',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'starred' ? (
        <div className="flex flex-col gap-3.5">
          {starred.error ? <ErrorNotice message={starred.error} onRetry={starred.reload} /> : null}
          {starred.loading ? <div className="text-mut text-sm">Đang tải...</div> : null}
          {!starred.loading && !starred.error && starred.data.length === 0 ? (
            <div className="rounded-[13px] border border-dashed border-bd2 p-9 text-center text-mut2 text-[13.5px]">
              Bạn chưa gắn sao snippet nào.
            </div>
          ) : null}
          <div className="grid [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))] gap-3.5">
            {starred.data.map((snippet) => (
              <SnippetCard key={snippet.id} snippet={snippet} variant="grid" />
            ))}
          </div>
          <Pagination page={starredPage} totalPages={starred.totalPages} onChange={setStarredPage} />
        </div>
      ) : (
      <div className="rounded-[14px] border border-bd bg-panel overflow-hidden">
        <div className="px-[18px] py-3.5 border-b border-bd flex items-center gap-2.5">
          <div className="text-[15px] font-semibold text-tx">Danh sách</div>
          <div className="flex-1" />
          <div className="font-mono text-[11.5px] text-mut2">{mySnippets.length} snippet</div>
        </div>

        {mySnippets.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center gap-3">
            <div className="text-mut text-sm">
              {loading ? 'Đang tải danh sách snippet...' : 'Bạn chưa có snippet nào.'}
            </div>
            {!loading ? (
              <Button size="sm" variant="primary" onClick={() => navigate('/create')}>
                Tạo snippet đầu tiên
              </Button>
            ) : null}
          </div>
        ) : (
          mySnippets.map((snippet) => (
            <div
              key={snippet.id}
              className="flex items-center gap-3.5 px-[18px] py-3 border-b border-rowbd flex-wrap hover:bg-hov"
            >
              <TypeBadge type={snippet.type} />
              <button
                type="button"
                onClick={() => navigate(snippet.type === 'prompt' ? `/lab/${snippet.id}` : `/docker/${snippet.id}`)}
                className="flex-1 min-w-[160px] text-sm font-medium text-left cursor-pointer text-tx hover:text-acc"
              >
                {snippet.title}
              </button>
              <span className="shrink-0 font-mono text-[11.5px] text-mut2">
                {snippet.isPublic ? 'Công khai' : 'Riêng tư'}
              </span>
              <span className="shrink-0 font-mono text-[11.5px] text-mut2">{snippet.updatedAt}</span>
              <span className="shrink-0 font-mono text-[11.5px] text-mut2">★ {snippet.stars}</span>
              <Button size="sm" onClick={() => navigate(`/create/${snippet.id}`)} className="text-[11.5px]">
                Sửa
              </Button>
              <Button
                size="sm"
                onClick={() => handleDelete(snippet.id, snippet.title)}
                disabled={deletingId === snippet.id}
                className="text-[11.5px] text-err hover:border-err"
              >
                {deletingId === snippet.id ? 'Đang xoá...' : 'Xoá'}
              </Button>
            </div>
          ))
        )}
      </div>
      )}
    </div>
  )
}
