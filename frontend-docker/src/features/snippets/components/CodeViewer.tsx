import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { copyToClipboard } from '@/lib/clipboard'
import { cn } from '@/lib/cn'
import type { CodeLine } from '@/types/snippet'

interface CodeViewerProps {
  filename: string
  lines: CodeLine[]
  showLineNumbers?: boolean
  showExplainPanel?: boolean
}

export function CodeViewer({ filename, lines, showLineNumbers = true, showExplainPanel = true }: CodeViewerProps) {
  const [selectedLine, setSelectedLine] = useState(0)
  const [copied, setCopied] = useState(false)
  const selected = lines[selectedLine] ?? { code: '', explanation: '' }

  const handleCopy = async () => {
    await copyToClipboard(lines.map((l) => l.code).join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className="grid [grid-template-columns:repeat(auto-fit,minmax(300px,1fr))] gap-[18px] items-start">
      <div className="min-w-0 rounded-[14px] border border-bd bg-code overflow-hidden">
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-bd bg-panel2">
          <div className="font-mono text-xs text-mut">{filename}</div>
          <div className="flex-1" />
          <Button size="sm" onClick={handleCopy} className="border border-bd2 text-tx2 font-mono text-[11.5px] hover:border-acc hover:text-acc">
            {copied ? 'Đã copy' : 'Copy'}
          </Button>
        </div>
        <div className="py-2.5">
          {lines.map((line, index) => {
            const isSelected = index === selectedLine
            return (
              <div
                key={index}
                onClick={() => setSelectedLine(index)}
                className={cn(
                  'flex gap-3.5 px-3.5 py-0.5 cursor-pointer border-l-2',
                  isSelected ? 'bg-acc-s2 border-acc' : 'border-transparent hover:bg-hov',
                )}
              >
                {showLineNumbers ? (
                  <span className={cn('font-mono text-[12.5px] w-[22px] text-right shrink-0 select-none', isSelected ? 'text-acc' : 'text-mut3')}>
                    {index + 1}
                  </span>
                ) : null}
                <span className={cn('font-mono text-[13px] whitespace-pre-wrap break-words', isSelected ? 'text-tx' : 'text-tx3')}>
                  {line.code || ' '}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {showExplainPanel ? (
        <div className="min-w-0 sticky top-[76px] rounded-[14px] border border-bd bg-panel p-[18px] flex flex-col gap-3.5">
          <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-mut2">Giải thích dòng</div>
          <div className="font-mono text-[12.5px] text-acc bg-code border border-bd rounded-lg px-3 py-2.5 whitespace-pre-wrap break-words">
            {selected.code || ' '}
          </div>
          <div className="text-sm text-tx2 [text-wrap:pretty]">{selected.explanation}</div>
          <div className="h-px bg-bd" />
          <div className="text-[12.5px] text-mut2 [text-wrap:pretty]">Bấm vào bất kỳ dòng code bên cạnh để xem chú giải của dòng đó.</div>
        </div>
      ) : null}
    </div>
  )
}
