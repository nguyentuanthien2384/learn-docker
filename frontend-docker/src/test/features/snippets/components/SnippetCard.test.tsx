import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/renderWithProviders'
import type { CodeSnippet } from '@/types/snippet'
import { SnippetCard } from '@/features/snippets/components/SnippetCard'

const snippet: CodeSnippet = {
  id: '1',
  type: 'code',
  filename: 'Dockerfile',
  author: 'hoidanit',
  updatedAt: '2 ngày',
  stars: 42,
  isPublic: true,
  title: 'Sample Dockerfile',
  description: 'A description',
  tags: ['dockerfile', 'nestjs'],
  lines: [],
}

describe('SnippetCard', () => {
  it('links to the snippet detail page for a code snippet', () => {
    renderWithProviders(<SnippetCard snippet={snippet} />)
    const link = screen.getByRole('link', { name: /Sample Dockerfile/ })
    expect(link).toHaveAttribute('href', '/docker/1')
  })

  it('shows a private badge for a non-public snippet', () => {
    renderWithProviders(<SnippetCard snippet={{ ...snippet, isPublic: false }} />)
    expect(screen.getByText('riêng tư')).toBeInTheDocument()
  })

  it('links prompt snippets to the Prompt Lab', () => {
    renderWithProviders(
      <SnippetCard
        snippet={{
          id: '5',
          type: 'prompt',
          author: 'hoidanit',
          updatedAt: '1 ngày',
          stars: 5,
          isPublic: true,
          title: 'A prompt',
          description: 'desc',
          tags: [],
          content: 'hello {{name}}',
          variables: { name: { placeholder: '', rows: 1 } },
        }}
      />,
    )
    expect(screen.getByRole('link', { name: /A prompt/ })).toHaveAttribute('href', '/lab/5')
  })
})
