import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { ErrorNotice } from '@/components/ui/ErrorNotice'
import { snippetsApi } from '@/lib/api/snippetsApi'
import { SnippetCard } from '@/features/snippets/components/SnippetCard'
import { TagChips } from '@/features/snippets/components/TagFacetList'
import { usePagedSnippets } from '@/features/snippets/hooks/usePagedSnippets'
import { useTagFilter } from '@/features/snippets/hooks/useTagFilter'
import { useTopTags } from '@/features/snippets/hooks/useTopTags'

const FEED_SIZE = 12
const TOP_TAGS_SHOWN = 9
const TAG_POOL_SIZE = 100

export function HomePage() {
  const navigate = useNavigate()
  const { selectedTag, toggleTag } = useTagFilter()

  const feed = usePagedSnippets(
    () => snippetsApi.getSnippets({ limit: FEED_SIZE, sort: 'latest', tag: selectedTag ?? undefined }),
    `feed:${selectedTag ?? ''}`,
  )
  // Chỉ cần `total` từ backend nên yêu cầu 1 bản ghi mỗi loại
  const codeCount = usePagedSnippets(() => snippetsApi.getSnippets({ type: 'code', limit: 1 }), 'count:code')
  const promptCount = usePagedSnippets(() => snippetsApi.getSnippets({ type: 'prompt', limit: 1 }), 'count:prompt')
  const { tags } = useTopTags(TAG_POOL_SIZE)

  const show = (value: number, ready: boolean) => (ready ? String(value) : '–')
  const stats = [
    { label: 'Docker snippet', value: show(codeCount.total, !codeCount.loading && !codeCount.error) },
    { label: 'Prompt', value: show(promptCount.total, !promptCount.loading && !promptCount.error) },
    { label: 'Tag', value: show(tags.length, tags.length > 0) },
  ]

  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-[18px] border border-bd bg-panel bg-grad-soft p-8 grid [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))] gap-7 items-center">
        <div className="flex flex-col gap-3.5">
          <div className="font-mono text-[11.5px] tracking-[0.14em] uppercase text-acc">Learn &amp; Save</div>
          <div className="text-[30px] font-semibold tracking-tight leading-tight text-tx [text-wrap:pretty]">
            Học Docker xong thì lưu lại ngay tại đây.
          </div>
          <div className="text-mut max-w-[46ch] [text-wrap:pretty]">
            Hai loại nội dung: code Docker có chú giải từng dòng, và prompt AI có biến động để bạn tái sử dụng.
          </div>
          <div className="flex gap-2.5 flex-wrap mt-1.5">
            <Button variant="primary" onClick={() => navigate('/docker')}>
              Mở Docker Toolkit
            </Button>
            <Button variant="ghost" onClick={() => navigate('/prompts')}>
              Mở Prompt Lab
            </Button>
          </div>
        </div>
        <div className="grid [grid-template-columns:repeat(auto-fit,minmax(120px,1fr))] gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl border border-bd2 bg-panel2 p-3.5">
              <div className="font-mono text-[22px] font-semibold text-tx">{stat.value}</div>
              <div className="text-xs text-mut2 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex items-baseline gap-2.5 flex-wrap">
          <div className="text-[17px] font-semibold text-tx">Mới cập nhật</div>
          <div className="text-[13px] text-mut2">snippet công khai của cộng đồng</div>
        </div>
        <TagChips tags={tags.slice(0, TOP_TAGS_SHOWN).map((t) => t.name)} selectedTag={selectedTag} onToggle={toggleTag} />

        {feed.error ? <ErrorNotice message={feed.error} onRetry={feed.reload} /> : null}
        {feed.loading ? <div className="text-mut text-sm">Đang tải snippet...</div> : null}
        {!feed.loading && !feed.error && feed.data.length === 0 ? (
          <div className="rounded-[13px] border border-dashed border-bd2 p-9 text-center text-mut2 text-[13.5px]">
            Chưa có snippet nào.
          </div>
        ) : null}

        <div className="grid [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))] gap-3.5">
          {feed.data.map((snippet) => (
            <SnippetCard key={snippet.id} snippet={snippet} variant="grid" />
          ))}
        </div>
      </section>
    </div>
  )
}
