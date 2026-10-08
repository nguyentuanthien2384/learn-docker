import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { ErrorNotice } from '@/components/ui/ErrorNotice'
import { useSnippets } from '@/context/SnippetsContext'
import { snippetsApi } from '@/lib/api/snippetsApi'
import { usePagedSnippets } from '@/features/snippets/hooks/usePagedSnippets'
import { copyToClipboard } from '@/lib/clipboard'
import { cn } from '@/lib/cn'
import { extractVariableNames, fillPromptContent, segmentPromptContent, type PromptValues } from '@/lib/promptVariables'
import { isPromptSnippet, type PromptSnippet, type Snippet } from '@/types/snippet'

const PROMPT_LIST_LIMIT = 100

export function PromptLabPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { fetchById } = useSnippets()
  const [valuesById, setValuesById] = useState<Record<string, PromptValues>>({})
  const [copied, setCopied] = useState(false)
  const [routed, setRouted] = useState<{ id: string; snippet?: Snippet } | null>(null)

  const { data, loading, error, reload } = usePagedSnippets(
    () => snippetsApi.getSnippets({ type: 'prompt', limit: PROMPT_LIST_LIMIT, sort: 'latest' }),
    'prompt-lab',
  )
  const prompts = data.filter((s): s is PromptSnippet => isPromptSnippet(s))
  const inList = id ? prompts.some((p) => p.id === id) : true

  // Prompt được mở bằng link trực tiếp nhưng không nằm trong danh sách (vd: riêng tư của chính mình)
  useEffect(() => {
    if (loading || inList || !id) return
    let cancelled = false
    fetchById(id).then((snippet) => {
      if (!cancelled) setRouted({ id, snippet })
    })
    return () => {
      cancelled = true
    }
  }, [id, loading, inList, fetchById])

  const routedPrompt = routed && routed.id === id && routed.snippet && isPromptSnippet(routed.snippet) ? routed.snippet : undefined
  const activeId = id ?? prompts[0]?.id
  const active = prompts.find((p) => p.id === activeId) ?? routedPrompt
  const resolvingRoute = Boolean(id) && !inList && routed?.id !== id

  if (!active) {
    if (error) {
      return <ErrorNotice message={error} onRetry={reload} />
    }
    if (loading || resolvingRoute) {
      return (
        <div className="flex justify-center items-center py-12 text-mut text-sm">
          Đang tải dữ liệu prompts...
        </div>
      )
    }
    return <Navigate to="/prompts" replace />
  }

  const values = valuesById[active.id] ?? {}
  const variableNames = extractVariableNames(active.content)

  const setValue = (name: string, value: string) => {
    setValuesById((current) => ({ ...current, [active.id]: { ...current[active.id], [name]: value } }))
  }

  const handleCopy = async () => {
    await copyToClipboard(fillPromptContent(active.content, values))
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  const incomplete = variableNames.some((name) => !(values[name] || '').trim())

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div className="text-2xl font-semibold tracking-tight text-tx">Prompt Lab</div>
        <div className="text-mut max-w-[70ch] [text-wrap:pretty]">
          Chọn một prompt, điền các biến, xem bản hoàn chỉnh rồi copy. Biến được khai báo trong nội dung prompt bằng cặp ngoặc nhọn kép.
        </div>
      </div>

      <div className="grid [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))] gap-[18px] items-start">
        <div className="min-w-0 flex flex-col gap-2.5">
          <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-mut2">Chọn prompt</div>
          {prompts.map((prompt) => {
            const selected = prompt.id === active.id
            return (
              <div
                key={prompt.id}
                onClick={() => navigate(`/lab/${prompt.id}`)}
                className={cn(
                  'rounded-xl p-3.5 cursor-pointer flex flex-col gap-1.5 border',
                  selected ? 'border-vio bg-vio-s2' : 'border-bd bg-panel hover:border-bd3',
                )}
              >
                <div className="text-[14.5px] font-semibold text-tx">{prompt.title}</div>
                <div className={cn('text-[12.5px] font-mono', selected ? 'text-vio-tx' : 'text-mut2')}>
                  {extractVariableNames(prompt.content)
                    .map((n) => `{{${n}}}`)
                    .join('  ')}
                </div>
              </div>
            )
          })}
        </div>

        <div className="min-w-0 rounded-[14px] border border-bd bg-panel p-[18px] flex flex-col gap-3.5">
          <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-mut2">Điền biến</div>
          {variableNames.map((name) => {
            const meta = active.variables[name]
            return (
              <div key={name} className="flex flex-col gap-1.5">
                <label htmlFor={`var-${name}`} className="font-mono text-xs text-vio">
                  {`{{${name}}}`}
                </label>
                <textarea
                  id={`var-${name}`}
                  value={values[name] || ''}
                  onChange={(e) => setValue(name, e.target.value)}
                  placeholder={meta?.placeholder}
                  rows={meta?.rows ?? 2}
                  className="px-3 py-2.5 rounded-[9px] bg-code border border-bd2 text-tx text-[13px] font-mono outline-none resize-y focus:border-vio"
                />
              </div>
            )
          })}
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleCopy}
              className="flex-1 min-w-[140px] py-[11px] rounded-[9px] border-0 bg-grad-vio-acc text-vio-ink shadow-glow text-[13.5px] font-bold cursor-pointer hover:brightness-110"
            >
              {copied ? 'Đã copy' : 'Copy prompt'}
            </button>
            <Button onClick={() => setValuesById((current) => ({ ...current, [active.id]: {} }))}>Xóa</Button>
          </div>
          {incomplete ? <div className="text-[12.5px] text-warn">Còn biến chưa điền, phần đó vẫn giữ nguyên trong bản hoàn chỉnh.</div> : null}
        </div>

        <div className="min-w-0 rounded-[14px] border border-bd bg-code overflow-hidden">
          <div className="px-3.5 py-2.5 border-b border-bd bg-panel2 font-mono text-xs text-mut">Bản hoàn chỉnh</div>
          <div className="p-4 font-mono text-[13px] leading-[1.75] whitespace-pre-wrap break-words">
            {segmentPromptContent(active.content, values).map((segment) =>
              segment.isVariable ? (
                <span key={segment.key} className="rounded bg-vio-s1 text-vio-tx px-1 py-px">
                  {segment.text}
                </span>
              ) : (
                <span key={segment.key} className="text-tx3">
                  {segment.text}
                </span>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
