import { apiClient } from '@/lib/api/client'

export interface TagResponse {
  id: string
  name: string
  usageCount: number
}

export const tagsApi = {
  async getTopTags(limit = 30, search?: string): Promise<TagResponse[]> {
    const params = new URLSearchParams()
    if (limit) params.set('limit', String(limit))
    if (search) params.set('search', search)
    const queryString = params.toString()
    return apiClient.get<TagResponse[]>(`/api/tags${queryString ? `?${queryString}` : ''}`, {
      skipAuth: true,
    })
  },
}
