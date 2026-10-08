import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { TextAreaField, TextField } from '@/components/ui/FormField'
import { Button } from '@/components/ui/Button'
import { useSnippets } from '@/context/SnippetsContext'
import { cn } from '@/lib/cn'
import { extractVariableNames } from '@/lib/promptVariables'
import { isCodeSnippet, type Snippet, type SnippetFormValues, type SnippetType } from '@/types/snippet'
import { CodeEditor } from '@/features/create/components/CodeEditor'
import { TagPicker } from '@/features/create/components/TagPicker'

const EMPTY_FORM: SnippetFormValues = { type: 'code', title: '', description: '', tags: [], content: '', isPublic: true }

function snippetToFormValues(snippet: Snippet | undefined): SnippetFormValues | null {
  if (!snippet) return null
  return {
    type: snippet.type,
    title: snippet.title,
    description: snippet.description,
    tags: snippet.tags,
    isPublic: snippet.isPublic,
    content: isCodeSnippet(snippet) ? snippet.lines.map((l) => l.code).join('\n') : snippet.content,
  }
}

export function CreateSnippetPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getById, fetchById, createSnippet, updateSnippet, tags: globalTags } = useSnippets()

  const editingId = id ?? null
  const [editingSnippet, setEditingSnippet] = useState<Snippet | undefined>(() =>
    editingId ? getById(editingId) : undefined,
  )

  const [form, setForm] = useState<SnippetFormValues>(() => snippetToFormValues(editingSnippet) ?? EMPTY_FORM)
  const [customTags, setCustomTags] = useState<string[]>([])
  const [titleError, setTitleError] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    if (editingId && !editingSnippet) {
      fetchById(editingId).then((found) => {
        if (found) {
          setEditingSnippet(found)
          setForm(snippetToFormValues(found) ?? EMPTY_FORM)
        }
      })
    }
  }, [editingId, editingSnippet, fetchById])

  useEffect(() => {
    if (editingSnippet) {
      setForm(snippetToFormValues(editingSnippet) ?? EMPTY_FORM)
    }
    setSaved(false)
    setTitleError(false)
  }, [editingSnippet])

  const isPromptForm = form.type === 'prompt'
  const patch = (values: Partial<SnippetFormValues>) => setForm((current) => ({ ...current, ...values }))

  const handleSave = async () => {
    if (!form.title.trim()) {
      setTitleError(true)
      return
    }
    setSaving(true)
    setSaveError(null)
    try {
      if (editingId) {
        await updateSnippet(editingId, form)
      } else {
        await createSnippet(form)
      }
      setSaved(true)
      setTimeout(() => {
        navigate('/dashboard')
      }, 700)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể lưu snippet'
      setSaveError(msg)
    } finally {
      setSaving(false)
    }
  }

  const detectedVars = extractVariableNames(form.content)
  const availableTags = Array.from(new Set([...globalTags, ...customTags]))

  return (
    <div className="flex flex-col gap-5 max-w-[920px]">
      <div className="flex flex-col gap-2">
        <div className="text-2xl font-semibold tracking-tight text-tx">{editingId ? 'Sửa snippet' : 'Tạo snippet'}</div>
        <div className="text-mut [text-wrap:pretty]">
          {editingId ? 'Loại nội dung không đổi được sau khi tạo.' : 'Cùng một form cho cả hai loại nội dung, chỉ đổi phần xử lý bên dưới.'}
        </div>
      </div>

      <div className="grid [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))] gap-[18px] items-start">
        <div className="min-w-0 flex flex-col gap-4">
          <div className="flex flex-col gap-[7px]">
            <label className="text-[13px] text-mut font-medium">Loại nội dung</label>
            <div className="flex gap-2 flex-wrap">
              {(
                [
                  { type: 'code', label: 'Docker code', enumName: 'docker_code' },
                  { type: 'prompt', label: 'AI prompt', enumName: 'ai_prompt' },
                ] as { type: SnippetType; label: string; enumName: string }[]
              ).map((option) => {
                const active = form.type === option.type
                return (
                  <button
                    key={option.type}
                    type="button"
                    onClick={() => patch({ type: option.type })}
                    disabled={Boolean(editingId)}
                    className={cn(
                      'flex-1 min-w-[130px] p-3 rounded-[10px] text-[13.5px] text-left cursor-pointer border disabled:cursor-not-allowed',
                      editingId && !active && 'opacity-40',
                      active ? 'border-acc bg-acc-s2 text-tx font-semibold' : 'border-bd2 bg-panel text-mut font-medium hover:border-bd3 hover:text-tx',
                    )}
                  >
                    <div>{option.label}</div>
                    <div className={cn('font-mono text-[11px] mt-0.5', active ? 'text-acc' : 'text-mut3')}>{option.enumName}</div>
                  </button>
                )
              })}
            </div>
          </div>

          <TextField
            label="Tiêu đề"
            value={form.title}
            onChange={(e) => {
              patch({ title: e.target.value })
              setTitleError(false)
            }}
            placeholder="Ví dụ: Dockerfile multi-stage cho Next.js"
            error={titleError ? 'Tiêu đề không được để trống.' : null}
          />

          <TextAreaField
            label="Mô tả ngắn"
            value={form.description}
            onChange={(e) => patch({ description: e.target.value })}
            rows={2}
            placeholder="Một câu để người khác biết khi nào cần dùng"
          />

          <TagPicker
            allTags={availableTags}
            selected={form.tags}
            onToggle={(tag) =>
              patch({ tags: form.tags.includes(tag) ? form.tags.filter((t) => t !== tag) : [...form.tags, tag] })
            }
            onAddCustomTag={(tag) => {
              setCustomTags((current) => (current.includes(tag) || globalTags.includes(tag) ? current : [...current, tag]))
              if (!form.tags.includes(tag)) patch({ tags: [...form.tags, tag] })
            }}
          />
        </div>

        <div className="min-w-0 flex flex-col gap-3.5">
          <div className="rounded-[13px] border border-bd bg-panel p-4 flex flex-col gap-3">
            <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-mut2">Hiển thị</div>
            <div className="flex gap-2">
              {(
                [
                  { key: 'pub', label: 'Công khai', value: true },
                  { key: 'priv', label: 'riêng tư', value: false },
                ] as const
              ).map((option) => {
                const active = form.isPublic === option.value
                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => patch({ isPublic: option.value })}
                    className={cn(
                      'flex-1 py-2.5 rounded-lg text-[13px] cursor-pointer border',
                      active ? 'border-acc bg-acc-s2 text-tx font-semibold' : 'border-bd2 bg-transparent text-mut hover:text-tx hover:border-bd3',
                    )}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
            <div className="text-[12.5px] text-mut2 [text-wrap:pretty]">
              {form.isPublic ? 'Mọi người xem được, chỉ bạn sửa và xóa được.' : 'Chỉ bạn thấy snippet này.'}
            </div>
          </div>

          {isPromptForm ? (
            <div className="rounded-[13px] border border-vio-bd bg-vio-s2 p-4 flex flex-col gap-2.5">
              <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-vio">Biến phát hiện được</div>
              <div className="flex gap-1.5 flex-wrap">
                {detectedVars.map((name) => (
                  <span key={name} className="font-mono text-xs text-vio-tx bg-vio-s1 rounded px-2 py-[3px]">
                    {`{{${name}}}`}
                  </span>
                ))}
              </div>
              <div className="text-[12.5px] text-mut [text-wrap:pretty]">Mỗi biến trong nội dung sẽ thành một ô nhập trong Prompt Lab.</div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-[7px]">
        <div className="flex items-baseline gap-2.5 flex-wrap">
          <label className="text-[13px] text-mut font-medium">{isPromptForm ? 'Nội dung prompt' : 'Nội dung code'}</label>
          <span className="font-mono text-[11.5px] text-mut3">
            {isPromptForm
              ? 'dùng {{ten_bien}} để tạo biến'
              : editingId
                ? 'Giải thích đã lưu được giữ lại cho những dòng không đổi'
                : 'Tab để thụt lề 2 khoảng trắng'}
          </span>
        </div>
        <CodeEditor
          value={form.content}
          onChange={(content) => patch({ content })}
          filename={isPromptForm ? 'prompt.md' : form.content.startsWith('services:') ? 'docker-compose.yml' : 'Dockerfile'}
          placeholder={isPromptForm ? 'Viết Dockerfile cho dự án của bạn...' : 'FROM node:20-alpine\nWORKDIR /app'}
          hint="gợi ý"
          lintEnabled={!isPromptForm}
        />
      </div>

      <div className="sticky bottom-0 -mx-5 px-5 py-3.5 bg-hdr backdrop-blur-md border-t border-bd flex items-center gap-3 flex-wrap">
        {saveError ? (
          <div className="px-3 py-2 rounded-[9px] border border-err-bd bg-err-bg text-err text-[13px]">
            {saveError}
          </div>
        ) : null}
        {saved ? (
          <div className="px-3 py-2 rounded-[9px] border border-acc-bd bg-acc-s2 text-acc text-[13px]">
            Đã lưu. Đang chuyển hướng...
          </div>
        ) : null}
        <div className="flex-1" />
        <Button onClick={() => navigate('/dashboard')} disabled={saving}>Hủy</Button>
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Đang lưu...' : 'Lưu snippet'}
        </Button>
      </div>
    </div>
  )
}
