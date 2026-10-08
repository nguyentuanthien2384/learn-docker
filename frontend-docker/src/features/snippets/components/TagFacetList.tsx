import { cn } from '@/lib/cn'

export interface TagFacet {
  tag: string
  count: number
}

interface TagFacetListProps {
  facets: TagFacet[]
  selectedTag: string | null
  onToggle: (tag: string) => void
}

export function TagFacetList({ facets, selectedTag, onToggle }: TagFacetListProps) {
  return (
    <aside className="max-w-[280px] rounded-[14px] border border-bd bg-panel p-4 flex flex-col gap-3.5">
      <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-mut2">Lọc theo tag</div>
      <div className="flex flex-col gap-[3px]">
        {facets.map(({ tag, count }) => {
          const active = selectedTag === tag
          return (
            <button
              key={tag}
              type="button"
              onClick={() => onToggle(tag)}
              className={cn(
                'w-full flex justify-between gap-2 px-2.5 py-[7px] rounded-lg border-0 font-mono text-[12.5px] text-left cursor-pointer',
                active ? 'bg-acc-s1 text-acc' : 'bg-transparent text-mut hover:bg-rowbd hover:text-tx',
              )}
            >
              <span>#{tag}</span>
              <span className={active ? '' : 'text-mut3'}>{count}</span>
            </button>
          )
        })}
      </div>
    </aside>
  )
}

interface TagChipsProps {
  tags: string[]
  selectedTag: string | null
  onToggle: (tag: string) => void
}

export function TagChips({ tags, selectedTag, onToggle }: TagChipsProps) {
  return (
    <div className="flex gap-[7px] flex-wrap">
      {tags.map((tag) => {
        const active = selectedTag === tag
        return (
          <button
            key={tag}
            type="button"
            onClick={() => onToggle(tag)}
            className={cn(
              'px-3 py-[5px] rounded-full font-mono text-xs cursor-pointer border',
              active ? 'border-acc bg-acc-s1 text-acc' : 'border-bd2 bg-transparent text-mut hover:border-bd3 hover:text-tx',
            )}
          >
            #{tag}
          </button>
        )
      })}
    </div>
  )
}
