import { apiClient, resolveApiUrl } from '@/lib/api/client'
import { formatRelativeTime } from '@/lib/date'
import { extractVariableNames } from '@/lib/promptVariables'
import {
  isCodeSnippet,
  type CodeLine,
  type PromptVariableMeta,
  type Snippet,
  type SnippetFormValues,
} from '@/types/snippet'

export interface BackendSnippetDto {
  id: string
  type: 'docker_code' | 'ai_prompt'
  title: string
  description?: string
  isPublic: boolean
  filename?: string | null
  content?: string | null
  variables?: Record<string, { placeholder?: string; rows?: number }>
  starsCount: number
  hasStarred?: boolean
  tags: string[]
  lines?: { code: string; explanation?: string }[]
  author?: {
    id: string
    name: string
    avatarUrl?: string | null
  }
  createdAt: string
  updatedAt: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface QuerySnippetsParams {
  page?: number
  limit?: number
  type?: 'code' | 'prompt'
  tag?: string
  author_id?: string
  search?: string
  sort?: 'latest' | 'stars'
}

const NEWLINE = '\n'

export function linesFromContent(content: string): CodeLine[] {
  return content.split('\n').map((code) => ({ code, explanation: '' }))
}

export function variablesFromContent(content: string): Record<string, PromptVariableMeta> {
  const meta: Record<string, PromptVariableMeta> = {}
  for (const name of extractVariableNames(content)) {
    meta[name] = { placeholder: '', rows: 2 }
  }
  return meta
}

export function toFrontendSnippet(dto: BackendSnippetDto): Snippet {
  const base = {
    id: String(dto.id),
    title: dto.title,
    description: dto.description || '',
    author: dto.author?.name || 'anonymous',
    authorId: dto.author?.id,
    authorAvatarUrl: dto.author?.avatarUrl ? resolveApiUrl(dto.author.avatarUrl) : null,
    updatedAt: formatRelativeTime(dto.updatedAt || dto.createdAt),
    stars: dto.starsCount ?? 0,
    hasStarred: Boolean(dto.hasStarred),
    isPublic: dto.isPublic,
    tags: dto.tags || [],
  }

  if (dto.type === 'docker_code') {
    return {
      ...base,
      type: 'code',
      filename: dto.filename || (base.title.toLowerCase().includes('compose') ? 'docker-compose.yml' : 'Dockerfile'),
      lines: (dto.lines || []).map((l) => ({ code: l.code, explanation: l.explanation || '' })),
    }
  }

  return {
    ...base,
    type: 'prompt',
    content: dto.content || '',
    variables: (dto.variables as Record<string, PromptVariableMeta>) || variablesFromContent(dto.content || ''),
  }
}

function filenameFromContent(content: string): string {
  return content.startsWith('services:') ? 'docker-compose.yml' : 'Dockerfile'
}

export function toCreateSnippetDto(values: SnippetFormValues) {
  const isCode = values.type === 'code'
  return {
    type: isCode ? 'docker_code' : 'ai_prompt',
    title: values.title.trim(),
    description: values.description?.trim() || '',
    isPublic: values.isPublic,
    filename: isCode ? filenameFromContent(values.content) : undefined,
    lines: isCode ? linesFromContent(values.content) : undefined,
    content: !isCode ? values.content : undefined,
    variables: !isCode ? variablesFromContent(values.content) : undefined,
    tags: values.tags,
  }
}

/** Dựng lại các dòng code, giữ phần giải thích cũ cho những dòng có nội dung không đổi. */
export function mergeLines(content: string, previous: CodeLine[]): CodeLine[] {
  const pool = new Map<string, string[]>()
  for (const line of previous) {
    pool.set(line.code, [...(pool.get(line.code) ?? []), line.explanation])
  }
  return content.split(NEWLINE).map((code) => ({ code, explanation: pool.get(code)?.shift() ?? '' }))
}

/** Dựng lại meta biến, giữ placeholder/rows đã lưu cho những biến vẫn còn trong nội dung. */
export function mergeVariables(
  content: string,
  previous: Record<string, PromptVariableMeta>,
): Record<string, PromptVariableMeta> {
  const meta = variablesFromContent(content)
  for (const name of Object.keys(meta)) {
    if (previous[name]) meta[name] = previous[name]
  }
  return meta
}

/**
 * Body cho PUT /api/snippets/:id. Backend chỉ đổi những trường được gửi, nên khi có `existing`
 * ta chỉ gửi lines/content/variables khi nội dung thật sự đổi và không gửi filename,
 * để không làm mất phần giải thích từng dòng, meta biến và tên file đã lưu.
 */
export interface UpdateSnippetBody {
  title: string
  description: string
  isPublic: boolean
  tags: string[]
  filename?: string
  lines?: CodeLine[]
  content?: string
  variables?: Record<string, PromptVariableMeta>
}

export function toUpdateSnippetDto(values: SnippetFormValues, existing?: Snippet): UpdateSnippetBody {
  const common = {
    title: values.title.trim(),
    description: values.description?.trim() || '',
    isPublic: values.isPublic,
    tags: values.tags,
  }

  if (existing && existing.type === values.type) {
    if (isCodeSnippet(existing)) {
      const unchanged = existing.lines.map((l) => l.code).join(NEWLINE) === values.content
      return { ...common, lines: unchanged ? undefined : mergeLines(values.content, existing.lines) }
    }
    const unchanged = existing.content === values.content
    return {
      ...common,
      content: unchanged ? undefined : values.content,
      variables: unchanged ? undefined : mergeVariables(values.content, existing.variables),
    }
  }

  const isCode = values.type === 'code'
  return {
    ...common,
    filename: isCode ? filenameFromContent(values.content) : undefined,
    lines: isCode ? linesFromContent(values.content) : undefined,
    content: !isCode ? values.content : undefined,
    variables: !isCode ? variablesFromContent(values.content) : undefined,
  }
}

function buildQuery(params: QuerySnippetsParams): string {
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  if (params.type) query.set('type', params.type === 'code' ? 'docker_code' : 'ai_prompt')
  if (params.tag) query.set('tag', params.tag)
  if (params.author_id) query.set('author_id', params.author_id)
  if (params.search) query.set('search', params.search)
  if (params.sort) query.set('sort', params.sort)
  const qs = query.toString()
  return qs ? `?${qs}` : ''
}

async function fetchSnippetPage(path: string, params: QuerySnippetsParams): Promise<PaginatedResponse<Snippet>> {
  const res = await apiClient.get<PaginatedResponse<BackendSnippetDto>>(`${path}${buildQuery(params)}`)
  return { ...res, data: (res.data || []).map(toFrontendSnippet) }
}

export const snippetsApi = {
  async getSnippets(params: QuerySnippetsParams = {}): Promise<PaginatedResponse<Snippet>> {
    return fetchSnippetPage('/api/snippets', params)
  },

  async getSnippetById(id: string): Promise<Snippet> {
    const res = await apiClient.get<BackendSnippetDto>(`/api/snippets/${encodeURIComponent(id)}`)
    return toFrontendSnippet(res)
  },

  async getMySnippets(params: QuerySnippetsParams = {}): Promise<PaginatedResponse<Snippet>> {
    return fetchSnippetPage('/api/snippets/my/list', params)
  },

  async getMyStars(params: Pick<QuerySnippetsParams, 'page' | 'limit'> = {}): Promise<PaginatedResponse<Snippet>> {
    return fetchSnippetPage('/api/snippets/my/stars', params)
  },

  async createSnippet(values: SnippetFormValues): Promise<Snippet> {
    const body = toCreateSnippetDto(values)
    const res = await apiClient.post<BackendSnippetDto>('/api/snippets', body)
    return toFrontendSnippet(res)
  },

  async updateSnippet(id: string, values: SnippetFormValues, existing?: Snippet): Promise<Snippet> {
    const body = toUpdateSnippetDto(values, existing)
    const res = await apiClient.put<BackendSnippetDto>(`/api/snippets/${encodeURIComponent(id)}`, body)
    return toFrontendSnippet(res)
  },

  async deleteSnippet(id: string): Promise<void> {
    await apiClient.delete(`/api/snippets/${encodeURIComponent(id)}`)
  },

  async star(id: string): Promise<{ starred: boolean; starsCount: number }> {
    return apiClient.post<{ starred: boolean; starsCount: number }>(`/api/snippets/${encodeURIComponent(id)}/star`)
  },

  async unstar(id: string): Promise<{ starred: boolean; starsCount: number }> {
    return apiClient.delete<{ starred: boolean; starsCount: number }>(`/api/snippets/${encodeURIComponent(id)}/star`)
  },
}
