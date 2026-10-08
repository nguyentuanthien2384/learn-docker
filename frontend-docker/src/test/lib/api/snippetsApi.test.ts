import { describe, expect, it, vi, beforeEach } from 'vitest'
import {
  toFrontendSnippet,
  toCreateSnippetDto,
  toUpdateSnippetDto,
  linesFromContent,
  snippetsApi,
  type BackendSnippetDto,
} from '@/lib/api/snippetsApi'
import { apiClient } from '@/lib/api/client'
import type { Snippet } from '@/types/snippet'

describe('snippetsApi mappers', () => {
  it('converts lines from content string', () => {
    const lines = linesFromContent('FROM node\nWORKDIR /app')
    expect(lines).toEqual([
      { code: 'FROM node', explanation: '' },
      { code: 'WORKDIR /app', explanation: '' },
    ])
  })

  it('maps backend docker_code snippet to frontend CodeSnippet', () => {
    const backendDto: BackendSnippetDto = {
      id: 'uuid-1',
      type: 'docker_code',
      title: 'Multi-stage Dockerfile',
      description: 'Test description',
      isPublic: true,
      filename: 'Dockerfile',
      starsCount: 15,
      hasStarred: true,
      tags: ['dockerfile', 'nestjs'],
      lines: [{ code: 'FROM alpine', explanation: 'base' }],
      author: {
        id: 'u-1',
        name: 'Hỏi Dân IT',
        avatarUrl: '/avatars/test.webp',
      },
      createdAt: '2026-09-20T00:00:00.000Z',
      updatedAt: '2026-09-20T00:00:00.000Z',
    }

    const frontend = toFrontendSnippet(backendDto)
    expect(frontend.id).toBe('uuid-1')
    expect(frontend.type).toBe('code')
    expect(frontend.title).toBe('Multi-stage Dockerfile')
    expect(frontend.author).toBe('Hỏi Dân IT')
    expect(frontend.stars).toBe(15)
    expect(frontend.hasStarred).toBe(true)
    if (frontend.type === 'code') {
      expect(frontend.filename).toBe('Dockerfile')
      expect(frontend.lines).toEqual([{ code: 'FROM alpine', explanation: 'base' }])
    }
  })

  it('maps backend ai_prompt snippet to frontend PromptSnippet', () => {
    const backendDto: BackendSnippetDto = {
      id: 'uuid-2',
      type: 'ai_prompt',
      title: 'Prompt Gen',
      description: 'Generates Dockerfile',
      isPublic: true,
      starsCount: 8,
      hasStarred: false,
      tags: ['ai-prompt'],
      content: 'Write a Dockerfile for {{stack}}',
      variables: {
        stack: { placeholder: 'Node.js', rows: 1 },
      },
      author: {
        id: 'u-2',
        name: 'Dev',
      },
      createdAt: '2026-09-20T00:00:00.000Z',
      updatedAt: '2026-09-20T00:00:00.000Z',
    }

    const frontend = toFrontendSnippet(backendDto)
    expect(frontend.type).toBe('prompt')
    if (frontend.type === 'prompt') {
      expect(frontend.content).toBe('Write a Dockerfile for {{stack}}')
      expect(frontend.variables.stack.placeholder).toBe('Node.js')
    }
  })

  it('maps form values to create and update DTOs', () => {
    const createDto = toCreateSnippetDto({
      type: 'code',
      title: 'Test',
      description: 'Desc',
      tags: ['docker'],
      content: 'FROM node:20',
      isPublic: true,
    })
    expect(createDto.type).toBe('docker_code')
    expect(createDto.filename).toBe('Dockerfile')
    expect(createDto.lines).toHaveLength(1)

    const updateDto = toUpdateSnippetDto({
      type: 'prompt',
      title: 'Prompt Updated',
      description: 'Desc Updated',
      tags: ['prompt'],
      content: 'Hello {{user}}',
      isPublic: false,
    })
    expect(updateDto.title).toBe('Prompt Updated')
    expect(updateDto.content).toBe('Hello {{user}}')
    expect(updateDto.variables?.user).toBeDefined()
  })
})

describe('snippetsApi API calls', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('calls getSnippets and returns mapped items', async () => {
    const spy = vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: [
        {
          id: 'snip-1',
          type: 'docker_code',
          title: 'Docker Node',
          isPublic: true,
          starsCount: 10,
          tags: ['node'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
    })

    const res = await snippetsApi.getSnippets({ page: 1, limit: 20 })
    expect(spy).toHaveBeenCalled()
    expect(res.data).toHaveLength(1)
    expect(res.data[0].id).toBe('snip-1')
    expect(res.data[0].type).toBe('code')
  })

  it('calls createSnippet, updateSnippet, deleteSnippet, and star/unstar', async () => {
    const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValue({
      id: 'new-id',
      type: 'docker_code',
      title: 'New',
      isPublic: true,
      starsCount: 0,
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    const putSpy = vi.spyOn(apiClient, 'put').mockResolvedValue({
      id: 'new-id',
      type: 'docker_code',
      title: 'Updated',
      isPublic: true,
      starsCount: 0,
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    const deleteSpy = vi.spyOn(apiClient, 'delete').mockResolvedValue(undefined)

    const created = await snippetsApi.createSnippet({
      type: 'code',
      title: 'New',
      description: '',
      tags: [],
      content: 'FROM alpine',
      isPublic: true,
    })
    expect(postSpy).toHaveBeenCalledWith('/api/snippets', expect.any(Object))
    expect(created.id).toBe('new-id')

    const updated = await snippetsApi.updateSnippet('new-id', {
      type: 'code',
      title: 'Updated',
      description: '',
      tags: [],
      content: 'FROM alpine',
      isPublic: true,
    })
    expect(putSpy).toHaveBeenCalled()
    expect(updated.title).toBe('Updated')

    await snippetsApi.deleteSnippet('new-id')
    expect(deleteSpy).toHaveBeenCalledWith('/api/snippets/new-id')
  })
})

describe('toUpdateSnippetDto with an existing snippet', () => {
  const existingCode: Snippet = {
    id: 's1',
    type: 'code',
    title: 'T',
    description: '',
    author: 'a',
    updatedAt: '',
    stars: 0,
    isPublic: true,
    tags: [],
    filename: 'Dockerfile',
    lines: [
      { code: 'FROM node', explanation: 'base image' },
      { code: 'WORKDIR /app', explanation: 'workdir' },
    ],
  }
  const form = {
    type: 'code' as const,
    title: 'T',
    description: '',
    tags: [],
    isPublic: true,
    content: 'FROM node\nWORKDIR /app',
  }

  it('omits lines and filename when the code is unchanged, so explanations survive', () => {
    const dto = toUpdateSnippetDto(form, existingCode)
    expect(dto.lines).toBeUndefined()
    expect(dto.filename).toBeUndefined()
  })

  it('keeps explanations for lines that did not change when code is edited', () => {
    const dto = toUpdateSnippetDto({ ...form, content: 'FROM node\nRUN npm ci\nWORKDIR /app' }, existingCode)
    expect(dto.lines).toEqual([
      { code: 'FROM node', explanation: 'base image' },
      { code: 'RUN npm ci', explanation: '' },
      { code: 'WORKDIR /app', explanation: 'workdir' },
    ])
  })

  it('keeps stored variable meta for prompts and only adds new variables', () => {
    const existingPrompt: Snippet = {
      id: 'p1',
      type: 'prompt',
      title: 'P',
      description: '',
      author: 'a',
      updatedAt: '',
      stars: 0,
      isPublic: true,
      tags: [],
      content: 'Hi {{name}}',
      variables: { name: { placeholder: 'Eric', rows: 1 } },
    }
    const dto = toUpdateSnippetDto(
      { type: 'prompt', title: 'P', description: '', tags: [], isPublic: true, content: 'Hi {{name}} from {{city}}' },
      existingPrompt,
    )
    expect(dto.variables).toEqual({
      name: { placeholder: 'Eric', rows: 1 },
      city: { placeholder: '', rows: 2 },
    })
  })
})
