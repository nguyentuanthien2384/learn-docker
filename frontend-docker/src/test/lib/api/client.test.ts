import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  apiClient,
  ApiError,
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from '@/lib/api/client'

describe('apiClient', () => {
  beforeEach(() => {
    clearAccessToken()
    vi.restoreAllMocks()
  })

  afterEach(() => {
    clearAccessToken()
  })

  it('manages token in storage', () => {
    expect(getAccessToken()).toBeNull()
    setAccessToken('token-abc')
    expect(getAccessToken()).toBe('token-abc')
    clearAccessToken()
    expect(getAccessToken()).toBeNull()
  })

  it('attaches Authorization header when token is set', async () => {
    setAccessToken('mock-jwt')

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true }),
    })
    globalThis.fetch = fetchMock

    await apiClient.get('/api/test')

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [, init] = fetchMock.mock.calls[0]
    expect(init.headers['Authorization']).toBe('Bearer mock-jwt')
  })

  it('sends JSON body and Content-Type on post requests', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ id: 123 }),
    })
    globalThis.fetch = fetchMock

    await apiClient.post('/api/test', { name: 'demo' })

    const [, init] = fetchMock.mock.calls[0]
    expect(init.method).toBe('POST')
    expect(init.headers['Content-Type']).toBe('application/json')
    expect(init.body).toBe(JSON.stringify({ name: 'demo' }))
  })

  it('throws ApiError with message from server on failed response', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ message: 'Dữ liệu không hợp lệ' }),
    })
    globalThis.fetch = fetchMock

    await expect(apiClient.get('/api/test', { skipRefresh: true })).rejects.toThrow(
      'Dữ liệu không hợp lệ',
    )
    await expect(apiClient.get('/api/test', { skipRefresh: true })).rejects.toBeInstanceOf(ApiError)
  })

  it('attempts to refresh token on 401 response and retries request', async () => {
    setAccessToken('expired-token')

    let callCount = 0
    const fetchMock = vi.fn().mockImplementation((url) => {
      callCount++
      if (url.includes('/api/auth/refresh')) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ accessToken: 'new-refreshed-token' }),
        })
      }
      if (callCount === 1) {
        return Promise.resolve({
          ok: false,
          status: 401,
          json: () => Promise.resolve({ message: 'Unauthorized' }),
        })
      }
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: 'refreshed-ok' }),
      })
    })
    globalThis.fetch = fetchMock

    const res = await apiClient.get<{ data: string }>('/api/snippets')
    expect(res).toEqual({ data: 'refreshed-ok' })
    expect(getAccessToken()).toBe('new-refreshed-token')
  })
})

describe('apiClient refresh rules', () => {
  beforeEach(() => {
    clearAccessToken()
  })

  it('refreshes the access token when /api/auth/me returns 401', async () => {
    setAccessToken('expired')
    const fetchMock = vi.fn().mockImplementation((url: string, init: { headers: Record<string, string> }) => {
      if (url.includes('/api/auth/refresh')) {
        return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ accessToken: 'fresh' }) })
      }
      if (init.headers['Authorization'] === 'Bearer expired') {
        return Promise.resolve({ ok: false, status: 401, json: () => Promise.resolve({ message: 'Unauthorized' }) })
      }
      return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ id: 'u1' }) })
    })
    globalThis.fetch = fetchMock

    await expect(apiClient.get('/api/auth/me')).resolves.toEqual({ id: 'u1' })
    expect(getAccessToken()).toBe('fresh')
  })

  it('does not try to refresh when login itself fails with 401', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ message: 'Email hoặc mật khẩu không chính xác' }),
    })
    globalThis.fetch = fetchMock

    await expect(apiClient.post('/api/auth/login', { email: 'a@b.c', password: 'x' })).rejects.toThrow(
      'Email hoặc mật khẩu không chính xác',
    )
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
