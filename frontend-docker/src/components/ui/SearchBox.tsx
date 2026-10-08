import { useEffect, useState } from 'react'

interface SearchBoxProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  delayMs?: number
}

/** Ô tìm kiếm có debounce, chỉ gọi onChange khi người dùng ngừng gõ. */
export function SearchBox({ value, onChange, placeholder, delayMs = 350 }: SearchBoxProps) {
  const [draft, setDraft] = useState(value)

  useEffect(() => {
    setDraft(value)
  }, [value])

  useEffect(() => {
    if (draft === value) return
    const timer = setTimeout(() => onChange(draft), delayMs)
    return () => clearTimeout(timer)
  }, [draft, value, delayMs, onChange])

  return (
    <input
      type="search"
      aria-label="Tìm kiếm"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      placeholder={placeholder}
      className="flex-1 min-w-[180px] px-3 py-2 rounded-[9px] bg-panel2 border border-bd2 text-tx text-[13px] outline-none focus:border-acc"
    />
  )
}
