import { useState, type KeyboardEvent } from 'react'
import { MAX_TAGS_PER_SNIPPET, TAG_MAX_LENGTH, TAG_MIN_LENGTH, isValidTag, normalizeTag } from '@/lib/tags'
import { cn } from '@/lib/cn'

interface TagPickerProps {
  allTags: string[]
  selected: string[]
  onToggle: (tag: string) => void
  onAddCustomTag: (tag: string) => void
}

export function TagPicker({ allTags, selected, onToggle, onAddCustomTag }: TagPickerProps) {
  const [newTag, setNewTag] = useState('')
  const [error, setError] = useState<string | null>(null)
  const limitReached = selected.length >= MAX_TAGS_PER_SNIPPET

  const commit = () => {
    const normalized = normalizeTag(newTag)
    if (!normalized) return
    if (!isValidTag(normalized)) {
      setError(`Tag phải dài từ ${TAG_MIN_LENGTH} đến ${TAG_MAX_LENGTH} ký tự.`)
      return
    }
    if (limitReached && !selected.includes(normalized)) {
      setError(`Mỗi snippet chỉ được gắn tối đa ${MAX_TAGS_PER_SNIPPET} tag.`)
      return
    }
    setError(null)
    onAddCustomTag(normalized)
    setNewTag('')
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      commit()
    }
  }

  return (
    <div className="flex flex-col gap-[7px]">
      <label htmlFor="new-tag" className="text-[13px] text-mut font-medium">
        Tag ({selected.length}/{MAX_TAGS_PER_SNIPPET})
      </label>
      <div className="flex gap-[7px] flex-wrap">
        {allTags.map((tag) => {
          const active = selected.includes(tag)
          return (
            <button
              key={tag}
              type="button"
              onClick={() => onToggle(tag)}
              disabled={!active && limitReached}
              className={cn(
                'px-3 py-[5px] rounded-full font-mono text-xs cursor-pointer border disabled:opacity-40 disabled:cursor-not-allowed',
                active ? 'border-acc bg-acc-s1 text-acc' : 'border-bd2 bg-transparent text-mut hover:border-bd3 hover:text-tx',
              )}
            >
              #{tag}
              {active ? ' ×' : ''}
            </button>
          )
        })}
      </div>
      <div className="flex gap-2 items-center flex-wrap mt-1">
        <input
          id="new-tag"
          value={newTag}
          onChange={(e) => {
            setNewTag(e.target.value)
            setError(null)
          }}
          onKeyDown={handleKeyDown}
          placeholder="Tag mới, ví dụ: buildkit"
          className="flex-1 min-w-[160px] px-3 py-2 rounded-full bg-panel2 border border-bd2 text-tx font-mono text-xs outline-none focus:border-acc"
        />
        {newTag.trim() ? (
          <button
            type="button"
            onClick={commit}
            className="px-3.5 py-2 rounded-full border border-acc bg-acc-s1 text-acc font-mono text-xs font-semibold cursor-pointer hover:brightness-110"
          >
            + Thêm tag
          </button>
        ) : null}
      </div>
      {error ? <div className="text-[12.5px] text-err">{error}</div> : null}
      <div className="text-[12px] text-mut3">Tag mới tự động viết thường, thay khoảng trắng bằng dấu gạch ngang.</div>
    </div>
  )
}
