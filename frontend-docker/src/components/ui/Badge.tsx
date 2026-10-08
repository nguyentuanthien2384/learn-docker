import type { SnippetType } from '@/types/snippet'
import { cn } from '@/lib/cn'

export function TypeBadge({ type, className }: { type: SnippetType; className?: string }) {
  const isCode = type === 'code'
  return (
    <span
      className={cn(
        'px-2 py-[3px] rounded-md font-mono text-[11px] font-semibold',
        isCode ? 'bg-acc-s1 text-acc' : 'bg-vio-s1 text-vio',
        className,
      )}
    >
      {isCode ? 'Docker code' : 'AI prompt'}
    </span>
  )
}

export function PrivateBadge() {
  return <span className="px-2 py-[3px] rounded-md bg-pill text-mut2 font-mono text-[11px]">riêng tư</span>
}

export function TagPill({ name, className }: { name: string; className?: string }) {
  return <span className={cn('font-mono text-[11px] text-mut2', className)}>#{name}</span>
}
