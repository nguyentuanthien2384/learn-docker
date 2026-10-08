import { apiClient, clearAccessToken, resolveApiUrl, setAccessToken } from '@/lib/api/client'
import type { UserProfile } from '@/types/snippet'

export interface AuthUserResponse {
  id: string
  email: string
  name: string
  bio: string
  avatarUrl: string | null
}

export interface AuthSuccessResponse {
  accessToken: string
  user: AuthUserResponse
}

export interface LoginDto {
  email: string
  password: string
}

export interface RegisterDto {
  email: string
  password: string
  name: string
  bio?: string
}

export const authApi = {
  async login(dto: LoginDto): Promise<AuthSuccessResponse> {
    const res = await apiClient.post<AuthSuccessResponse>('/api/auth/login', dto)
    if (res.accessToken) {
      setAccessToken(res.accessToken)
    }
    return res
  },

  async register(dto: RegisterDto): Promise<AuthSuccessResponse> {
    const res = await apiClient.post<AuthSuccessResponse>('/api/auth/register', dto)
    if (res.accessToken) {
      setAccessToken(res.accessToken)
    }
    return res
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/api/auth/logout')
    } finally {
      clearAccessToken()
    }
  },

  async getMe(): Promise<UserProfile> {
    const user = await apiClient.get<AuthUserResponse>('/api/auth/me')
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      bio: user.bio || '',
      avatarUrl: user.avatarUrl ? resolveApiUrl(user.avatarUrl) : null,
    }
  },

  async updateProfile(dto: Partial<UserProfile>): Promise<UserProfile> {
    const user = await apiClient.patch<AuthUserResponse>('/api/users/profile', dto)
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      bio: user.bio || '',
      avatarUrl: user.avatarUrl ? resolveApiUrl(user.avatarUrl) : null,
    }
  },

  async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    const formData = new FormData()
    formData.append('avatar', file)
    const res = await apiClient.upload<{ avatarUrl: string }>('/api/users/avatar', formData)
    return {
      avatarUrl: resolveApiUrl(res.avatarUrl),
    }
  },
}
