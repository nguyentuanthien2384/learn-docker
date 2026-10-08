import { Link } from 'react-router-dom'
import { PrivateBadge, TagPill, TypeBadge } from '@/components/ui/Badge'
import type { Snippet } from '@/types/snippet'
import { isPromptSnippet } from '@/types/snippet'

export function snippetHref(snippet: Snippet): string {
  return isPromptSnippet(snippet) ? `/lab/${snippet.id}` : `/docker/${snippet.id}`
}

interface SnippetCardProps {
  snippet: Snippet
  variant?: 'grid' | 'row'
}

export function SnippetCard({ snippet, variant = 'grid' }: SnippetCardProps) {
  const tagLimit = variant === 'grid' ? 2 : 3

  if (variant === 'row') {
    return (
      <Link
        to={snippetHref(snippet)}
        className="rounded-[13px] border border-bd bg-panel px-[18px] py-4 flex flex-col gap-2.5 hover:border-bd3 hover:bg-hov"
      >
        <div className="flex items-center gap-2.5 flex-wrap">
          <TypeBadge type={snippet.type} />
          <div className="text-[15.5px] font-semibold tracking-tight text-tx">{snippet.title}</div>
          <div className="flex-1" />
          <span className="font-mono text-[11.5px] text-mut2">★ {snippet.stars}</span>
        </div>
        <div className="text-[13.5px] text-mut [text-wrap:pretty]">{snippet.description}</div>
        <div className="flex gap-[7px] flex-wrap">
          {snippet.tags.slice(0, tagLimit).map((tag) => (
            <TagPill key={tag} name={tag} />
          ))}
        </div>
      </Link>
    )
  }

  return (
    <Link
      to={snippetHref(snippet)}
      className="rounded-[14px] border border-bd bg-panel p-[18px] flex flex-col gap-3 min-h-[170px] hover:border-bd3 hover:bg-hov"
    >
      <div className="flex items-center gap-2 flex-wrap">
        <TypeBadge type={snippet.type} />
        {!snippet.isPublic ? <PrivateBadge /> : null}
        <div className="flex-1" />
        <span className="font-mono text-[11.5px] text-mut2">★ {snippet.stars}</span>
      </div>
      <div className="text-[15.5px] font-semibold tracking-tight text-tx [text-wrap:pretty]">{snippet.title}</div>
      <div className="text-[13.5px] text-mut [text-wrap:pretty]">{snippet.description}</div>
      <div className="flex-1" />
      <div className="flex gap-1.5 flex-wrap items-center">
        {snippet.tags.slice(0, tagLimit).map((tag) => (
          <TagPill key={tag} name={tag} />
        ))}
        <div className="flex-1" />
        <span className="text-[11.5px] text-mut3">@{snippet.author}</span>
      </div>
    </Link>
  )
}
