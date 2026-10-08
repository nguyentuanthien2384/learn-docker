import { ErrorNotice } from '@/components/ui/ErrorNotice'
import { Pagination } from '@/components/ui/Pagination'
import { SearchBox } from '@/components/ui/SearchBox'
import { snippetsApi } from '@/lib/api/snippetsApi'
import type { SnippetType } from '@/types/snippet'
import { SnippetCard } from '@/features/snippets/components/SnippetCard'
import { TagFacetList } from '@/features/snippets/components/TagFacetList'
import { usePagedSnippets } from '@/features/snippets/hooks/usePagedSnippets'
import { useListParams, type SnippetSort } from '@/features/snippets/hooks/useTagFilter'
import { useTopTags } from '@/features/snippets/hooks/useTopTags'

const PAGE_SIZE = 12
const FACET_LIMIT = 30

const COPY: Record<SnippetType, { title: string; subtitle: string }> = {
  code: {
    title: 'Docker Toolkit',
    subtitle: 'Dockerfile, compose và lệnh terminal hay dùng nhưng khó nhớ. Bấm vào từng dòng để đọc giải thích.',
  },
  prompt: {
    title: 'Prompt Library',
    subtitle: 'Prompt đã tinh chỉnh cho công việc với Docker. Mở Prompt Lab để điền biến.',
  },
}

const SORT_OPTIONS: { value: SnippetSort; label: string }[] = [
  { value: 'latest', label: 'Mới nhất' },
  { value: 'stars', label: 'Nhiều sao nhất' },
]

export function SnippetListPage({ type }: { type: SnippetType }) {
  const { selectedTag, search, sort, page, toggleTag, setSearch, setSort, setPage } = useListParams()
  const { tags } = useTopTags(FACET_LIMIT)
  const copy = COPY[type]

  const params = { type, tag: selectedTag ?? undefined, search: search || undefined, sort, page, limit: PAGE_SIZE }
  const result = usePagedSnippets(() => snippetsApi.getSnippets(params), JSON.stringify(params))

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div className="text-2xl font-semibold tracking-tight text-tx">{copy.title}</div>
        <div className="text-mut max-w-[64ch] [text-wrap:pretty]">{copy.subtitle}</div>
      </div>
      <div className="grid [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))] gap-5 items-start">
        <TagFacetList
          facets={tags.map((t) => ({ tag: t.name, count: t.usageCount }))}
          selectedTag={selectedTag}
          onToggle={toggleTag}
        />

        <div className="min-w-0 flex flex-col gap-2.5">
          <div className="flex gap-2.5 flex-wrap items-center">
            <SearchBox value={search} onChange={setSearch} placeholder="Tìm theo tiêu đề, mô tả, nội dung..." />
            <select
              aria-label="Sắp xếp"
              value={sort}
              onChange={(e) => setSort(e.target.value as SnippetSort)}
              className="px-3 py-2 rounded-[9px] bg-panel2 border border-bd2 text-tx text-[13px] outline-none focus:border-acc cursor-pointer"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="font-mono text-[13px] text-mut2">
            {result.loading ? 'Đang tải...' : `${result.total} kết quả`}
          </div>

          {result.error ? <ErrorNotice message={result.error} onRetry={result.reload} /> : null}

          {result.data.map((snippet) => (
            <SnippetCard key={snippet.id} snippet={snippet} variant="row" />
          ))}
          {!result.loading && !result.error && result.data.length === 0 ? (
            <div className="rounded-[13px] border border-dashed border-bd2 p-9 text-center text-mut2 text-[13.5px]">
              Không có snippet nào khớp.
            </div>
          ) : null}

          <Pagination page={page} totalPages={result.totalPages} onChange={setPage} />
        </div>
      </div>
    </div>
  )
}
