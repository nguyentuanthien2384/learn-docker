import { apiClient, resolveApiUrl } from '@/lib/api/client'
import type { AuthorProfile } from '@/types/snippet'

interface PublicProfileDto {
  id: string
  name: string
  bio: string
  avatarUrl: string | null
  createdAt?: string
}

export const usersApi = {
  async getProfile(id: string): Promise<AuthorProfile> {
    const user = await apiClient.get<PublicProfileDto>(`/api/users/${encodeURIComponent(id)}`, { skipAuth: true })
    return {
      id: user.id,
      name: user.name,
      bio: user.bio || '',
      avatarUrl: user.avatarUrl ? resolveApiUrl(user.avatarUrl) : null,
      createdAt: user.createdAt,
    }
  },
}
