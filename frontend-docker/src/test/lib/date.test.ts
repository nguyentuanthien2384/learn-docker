import { describe, expect, it } from 'vitest'
import { formatRelativeTime } from '@/lib/date'

describe('formatRelativeTime', () => {
  it('returns "vừa xong" for undefined or recent timestamps', () => {
    expect(formatRelativeTime(undefined)).toBe('vừa xong')
    expect(formatRelativeTime(new Date())).toBe('vừa xong')
    expect(formatRelativeTime(new Date(Date.now() - 30 * 1000).toISOString())).toBe('vừa xong')
  })

  it('formats minutes, hours, days, weeks, months, years', () => {
    const now = Date.now()
    expect(formatRelativeTime(new Date(now - 5 * 60 * 1000).toISOString())).toBe('5 phút')
    expect(formatRelativeTime(new Date(now - 3 * 3600 * 1000).toISOString())).toBe('3 giờ')
    expect(formatRelativeTime(new Date(now - 2 * 86400 * 1000).toISOString())).toBe('2 ngày')
    expect(formatRelativeTime(new Date(now - 14 * 86400 * 1000).toISOString())).toBe('2 tuần')
    expect(formatRelativeTime(new Date(now - 65 * 86400 * 1000).toISOString())).toBe('2 tháng')
    expect(formatRelativeTime(new Date(now - 400 * 86400 * 1000).toISOString())).toBe('1 năm')
  })

  it('preserves non-date strings', () => {
    expect(formatRelativeTime('2 ngày')).toBe('2 ngày')
    expect(formatRelativeTime('hôm qua')).toBe('hôm qua')
  })
})
