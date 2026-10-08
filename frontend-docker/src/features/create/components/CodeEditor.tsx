import { useMemo, useState, type KeyboardEvent, type SyntheticEvent } from 'react'
import { tokenizeCode, suggestInstructions, type CodeToken } from '@/lib/codeTokenizer'
import { lintDockerfile, type LintResult } from '@/lib/dockerfileLint'
import { cn } from '@/lib/cn'

const TOKEN_CLASS: Record<CodeToken['kind'], string> = {
  keyword: 'text-acc font-semibold',
  string: 'text-warn',
  comment: 'text-mut3 italic',
  variable: 'text-vio font-semibold',
  yamlKey: 'text-vio-tx',
  error: 'text-err underline decoration-wavy decoration-err underline-offset-4',
  text: 'text-tx2',
}

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  filename: string
  placeholder: string
  hint: string
  lintEnabled: boolean
}

export function CodeEditor({ value, onChange, filename, placeholder, hint, lintEnabled }: CodeEditorProps) {
  const [caret, setCaret] = useState(value.length)

  const lint: LintResult = useMemo(() => (lintEnabled ? lintDockerfile(value) : { byLine: {}, problems: [] }), [lintEnabled, value])
  const tokens = useMemo(() => tokenizeCode(value, lint.byLine), [value, lint.byLine])
  const suggestions = useMemo(() => suggestInstructions(value, caret), [value, caret])

  const lineCount = Math.max(value.split('\n').length, 14)
  const lines = Array.from({ length: lineCount }, (_, i) => i + 1)

  const applySuggestion = (wordStart: number, wordLength: number, word: string) => {
    const next = value.slice(0, wordStart) + word + ' ' + value.slice(wordStart + wordLength)
    onChange(next)
    setCaret(wordStart + word.length + 1)
  }

  const handleSelect = (event: SyntheticEvent<HTMLTextAreaElement>) => {
    setCaret(event.currentTarget.selectionStart)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Tab') return
    event.preventDefault()
    const el = event.currentTarget
    const start = el.selectionStart
    const end = el.selectionEnd
    const next = value.slice(0, start) + '  ' + value.slice(end)
    onChange(next)
    requestAnimationFrame(() => {
      el.selectionStart = el.selectionEnd = start + 2
    })
  }

  return (
    <div className="rounded-xl border border-bd2 bg-code overflow-hidden">
      <div className="flex items-center gap-2.5 px-3.5 py-2 border-b border-bd bg-panel2">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="font-mono text-[11.5px] text-mut ml-1">{filename}</div>
        <div className="flex-1" />
        <div className="font-mono text-[11px] text-mut3">
          {value.split('\n').length} dòng · {value.length} ký tự
        </div>
      </div>
      <div className="flex items-stretch">
        <div className="shrink-0 py-3 px-2.5 bg-panel2 border-r border-bd text-right select-none">
          {lines.map((n) => (
            <div key={n} className="font-mono text-[13px] leading-[1.7] text-mut3">
              {n}
            </div>
          ))}
        </div>
        <div className="relative flex-1 min-w-0">
          <div
            aria-hidden="true"
            className="absolute inset-0 px-3 py-3 font-mono text-[13px] leading-[1.7] whitespace-pre-wrap break-words pointer-events-none overflow-hidden"
          >
            {tokens.map((token) => (
              <span key={token.key} className={TOKEN_CLASS[token.kind]}>
                {token.text}
              </span>
            ))}
          </div>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onSelect={handleSelect}
            rows={lineCount}
            spellCheck={false}
            placeholder={placeholder}
            className="relative w-full px-3 py-3 bg-transparent border-0 text-transparent caret-tx text-[13px] font-mono leading-[1.7] outline-none resize-none break-words"
          />
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap px-3 py-2 border-t border-bd bg-panel2 min-h-[38px]">
        <span className="font-mono text-[11px] text-mut3">{hint}</span>
        {lint.problems.length > 0 ? (
          <span className="px-2 py-[3px] rounded-md bg-err-bg border border-err-bd text-err font-mono text-[11px]">
            {lint.problems.length} cảnh báo cú pháp
          </span>
        ) : null}
        {suggestions.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => applySuggestion(s.wordStart, s.wordLength, s.label)}
            className="flex items-baseline gap-2 px-2.5 py-1 rounded-md border border-bd2 bg-panel cursor-pointer hover:border-acc"
          >
            <span className="font-mono text-[12px] text-acc font-semibold">{s.label}</span>
            <span className="text-[11px] text-mut2">{s.hint}</span>
          </button>
        ))}
      </div>
      {lint.problems.length > 0 ? (
        <div className="border-t border-bd bg-panel px-3.5 py-3 flex flex-col gap-1.5">
          {lint.problems.map((problem) => (
            <div key={problem.key} className={cn('flex gap-2.5 items-baseline')}>
              <span className="font-mono text-[11.5px] text-err shrink-0">dòng {problem.line}</span>
              <span className="text-[12.5px] text-tx2">{problem.message}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
