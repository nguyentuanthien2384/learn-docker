import { describe, expect, it } from 'vitest'
import { isValidTag, normalizeTag } from '@/lib/tags'

describe('normalizeTag', () => {
  it('lowercases and replaces spaces with dashes', () => {
    expect(normalizeTag('Build Kit')).toBe('build-kit')
  })

  it('strips characters outside a-z0-9._-', () => {
    expect(normalizeTag('C++ Docker!')).toBe('c-docker')
  })

  it('trims surrounding whitespace', () => {
    expect(normalizeTag('  redis  ')).toBe('redis')
  })
})

describe('isValidTag', () => {
  it('follows the backend rule of 2-30 characters', () => {
    expect(isValidTag('a')).toBe(false)
    expect(isValidTag('ab')).toBe(true)
    expect(isValidTag('a'.repeat(30))).toBe(true)
    expect(isValidTag('a'.repeat(31))).toBe(false)
  })
})
