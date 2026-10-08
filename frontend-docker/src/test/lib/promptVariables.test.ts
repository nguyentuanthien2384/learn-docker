import { describe, expect, it } from 'vitest'
import { extractVariableNames, fillPromptContent, segmentPromptContent } from '@/lib/promptVariables'

describe('extractVariableNames', () => {
  it('returns declared variable names in order, without duplicates', () => {
    const content = 'FROM {{base_image}}\nRUN build {{tech_stack}} again {{base_image}}'
    expect(extractVariableNames(content)).toEqual(['base_image', 'tech_stack'])
  })

  it('returns an empty array when there are no variables', () => {
    expect(extractVariableNames('plain text, no variables here')).toEqual([])
  })
})

describe('fillPromptContent', () => {
  it('substitutes filled variables and leaves blanks as the placeholder token', () => {
    const content = 'Stack: {{tech_stack}}, base: {{base_image}}'
    const result = fillPromptContent(content, { tech_stack: 'NestJS' })
    expect(result).toBe('Stack: NestJS, base: {{base_image}}')
  })

  it('treats a whitespace-only value as unfilled', () => {
    const result = fillPromptContent('{{name}}', { name: '   ' })
    expect(result).toBe('{{name}}')
  })
})

describe('segmentPromptContent', () => {
  it('splits content into text and variable segments', () => {
    const segments = segmentPromptContent('Hello {{name}}!', { name: 'World' })
    expect(segments).toEqual([
      { key: 0, text: 'Hello ', isVariable: false },
      { key: 1, text: 'World', isVariable: true },
      { key: 2, text: '!', isVariable: false },
    ])
  })

  it('keeps the raw token for an unfilled variable segment', () => {
    const segments = segmentPromptContent('{{name}}', {})
    expect(segments).toEqual([{ key: 0, text: '{{name}}', isVariable: true }])
  })
})
