import { describe, expect, it } from 'vitest'
import { lintDockerfile } from '@/lib/dockerfileLint'

describe('lintDockerfile', () => {
  it('reports no problems for a valid Dockerfile', () => {
    const result = lintDockerfile('FROM node:20-alpine\nWORKDIR /app\nCMD ["node", "dist/main.js"]')
    expect(result.problems).toEqual([])
  })

  it('flags an instruction that is not written in uppercase', () => {
    const result = lintDockerfile('FROM node:20-alpine\nworkdir /app')
    expect(result.problems).toHaveLength(1)
    expect(result.problems[0].message).toContain('viết hoa')
  })

  it('flags an unknown instruction', () => {
    const result = lintDockerfile('FROM node:20-alpine\nBUILDX something')
    expect(result.problems).toHaveLength(1)
    expect(result.problems[0].word).toBe('BUILDX')
  })

  it('flags a Dockerfile that does not start with FROM', () => {
    const result = lintDockerfile('WORKDIR /app\nFROM node:20-alpine')
    expect(result.problems.some((p) => p.message.includes('bắt đầu bằng FROM'))).toBe(true)
  })

  it('flags an instruction missing its argument', () => {
    const result = lintDockerfile('FROM node:20-alpine\nWORKDIR')
    expect(result.problems.some((p) => p.message.includes('thiếu tham số'))).toBe(true)
  })

  it('does not lint content that is not a Dockerfile (e.g. compose YAML)', () => {
    const result = lintDockerfile('services:\n  api:\n    image: node:20-alpine')
    expect(result.problems).toEqual([])
  })

  it('does not lint empty content', () => {
    expect(lintDockerfile('').problems).toEqual([])
  })
})
