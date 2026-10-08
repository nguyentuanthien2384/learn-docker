const ACCESS_TOKEN_KEY = 'snippetverse_access_token'

export class ApiError extends Error {
  status: number
  details?: unknown

  constructor(status: number, message: string, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

let inMemoryToken: string | null = null

export function getAccessToken(): string | null {
  if (inMemoryToken) return inMemoryToken
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY)
  } catch {
    return null
  }
}

export function setAccessToken(token: string | null): void {
  inMemoryToken = token
  try {
    if (token) {
      localStorage.setItem(ACCESS_TOKEN_KEY, token)
    } else {
      localStorage.removeItem(ACCESS_TOKEN_KEY)
    }
  } catch {
    // Ignore storage errors in test / restricted environments
  }
}

export function clearAccessToken(): void {
  setAccessToken(null)
}

interface RequestOptions extends RequestInit {
  skipAuth?: boolean
  skipRefresh?: boolean
}

// Các endpoint này tự xử lý 401; riêng /api/auth/me vẫn cần refresh khi access token hết hạn
const NO_REFRESH_ENDPOINTS = ['/api/auth/login', '/api/auth/register', '/api/auth/refresh', '/api/auth/logout']

let isRefreshing = false
let refreshSubscribers: ((token: string | null) => void)[] = []

function subscribeTokenRefresh(cb: (token: string | null) => void) {
  refreshSubscribers.push(cb)
}

function onRefreshed(token: string | null) {
  refreshSubscribers.forEach((cb) => cb(token))
  refreshSubscribers = []
}

export const API_BASE_URL = (
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
  'http://localhost:3000'
).replace(/\/+$/, '')

export function resolveApiUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE_URL}${normalized}`
}

async function tryRefreshToken(): Promise<string | null> {
  try {
    const res = await fetch(resolveApiUrl('/api/auth/refresh'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    })
    if (!res.ok) {
      clearAccessToken()
      return null
    }
    const data = await res.json()
    if (data?.accessToken) {
      setAccessToken(data.accessToken)
      return data.accessToken
    }
    return null
  } catch {
    clearAccessToken()
    return null
  }
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { skipAuth, skipRefresh, headers = {}, ...rest } = options

  const reqHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...(headers as Record<string, string>),
  }

  // Auto attach content-type if body is JSON
  if (rest.body && !(rest.body instanceof FormData) && !reqHeaders['Content-Type']) {
    reqHeaders['Content-Type'] = 'application/json'
  }

  const token = getAccessToken()
  if (!skipAuth && token && !reqHeaders['Authorization']) {
    reqHeaders['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(resolveApiUrl(endpoint), {
    ...rest,
    headers: reqHeaders,
    credentials: 'include',
  })

  // Handle 401 Unauthorized with token refresh (only once)
  if (res.status === 401 && !skipRefresh && !NO_REFRESH_ENDPOINTS.some((path) => endpoint.startsWith(path))) {
    if (!isRefreshing) {
      isRefreshing = true
      const newToken = await tryRefreshToken()
      isRefreshing = false
      onRefreshed(newToken)

      if (newToken) {
        return request<T>(endpoint, {
          ...options,
          skipRefresh: true,
        })
      }
    } else {
      // Wait for the ongoing refresh
      const retryPromise = new Promise<T>((resolve, reject) => {
        subscribeTokenRefresh((newToken) => {
          if (newToken) {
            request<T>(endpoint, { ...options, skipRefresh: true })
              .then(resolve)
              .catch(reject)
          } else {
            reject(new ApiError(401, 'Phiên đăng nhập đã hết hạn.'))
          }
        })
      })
      return retryPromise
    }
  }

  if (!res.ok) {
    let errorMessage = `Yêu cầu thất bại (HTTP ${res.status})`
    let details: unknown = null
    try {
      const errorJson = await res.json()
      details = errorJson
      if (typeof errorJson?.message === 'string') {
        errorMessage = errorJson.message
      } else if (Array.isArray(errorJson?.message)) {
        errorMessage = errorJson.message.join(', ')
      }
    } catch {
      // Non-JSON error body
    }
    throw new ApiError(res.status, errorMessage, details)
  }

  // If response has no content (204 No Content)
  if (res.status === 204) {
    return undefined as unknown as T
  }

  return res.json() as Promise<T>
}

export const apiClient = {
  get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, { ...options, method: 'GET' })
  },
  post<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    })
  },
  put<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    })
  },
  patch<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body instanceof FormData ? body : body !== undefined ? JSON.stringify(body) : undefined,
    })
  },
  delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, { ...options, method: 'DELETE' })
  },
  upload<T>(endpoint: string, formData: FormData, options?: RequestOptions): Promise<T> {
    return request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: formData,
    })
  },
}
