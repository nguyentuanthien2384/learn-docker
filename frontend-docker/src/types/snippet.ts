export type SnippetType = 'code' | 'prompt'

export interface CodeLine {
  code: string
  explanation: string
}

export interface PromptVariableMeta {
  placeholder: string
  rows: number
}

interface SnippetBase {
  id: string
  title: string
  description: string
  author: string
  authorId?: string
  authorAvatarUrl?: string | null
  updatedAt: string
  stars: number
  hasStarred?: boolean
  isPublic: boolean
  tags: string[]
}

export interface CodeSnippet extends SnippetBase {
  type: 'code'
  filename: string
  lines: CodeLine[]
}

export interface PromptSnippet extends SnippetBase {
  type: 'prompt'
  content: string
  variables: Record<string, PromptVariableMeta>
}

export type Snippet = CodeSnippet | PromptSnippet

export function isCodeSnippet(snippet: Snippet): snippet is CodeSnippet {
  return snippet.type === 'code'
}

export function isPromptSnippet(snippet: Snippet): snippet is PromptSnippet {
  return snippet.type === 'prompt'
}

export interface UserProfile {
  id?: string
  name: string
  email: string
  bio: string
  avatarUrl?: string | null
}

export interface SnippetFormValues {
  type: SnippetType
  title: string
  description: string
  tags: string[]
  content: string
  isPublic: boolean
}

/** Hồ sơ công khai của tác giả (GET /api/users/:id), không có email. */
export interface AuthorProfile {
  id: string
  name: string
  bio: string
  avatarUrl: string | null
  createdAt?: string
}
