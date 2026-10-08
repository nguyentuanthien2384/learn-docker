import { apiClient } from '@/lib/api/client'

export type BackendMode = 'offline' | 'database'

interface StatusResponse {
  status?: string
}

/**
 * `/api/status` chỉ tồn tại khi backend chạy chế độ Offline Mock (DB_ENABLED=false).
 * Có phản hồi offline_mode => dữ liệu là giả; lỗi/404 => backend đang chạy với database thật.
 */
export async function getBackendMode(): Promise<BackendMode> {
  try {
    const res = await apiClient.get<StatusResponse>('/api/status', { skipAuth: true, skipRefresh: true })
    return res?.status === 'offline_mode' ? 'offline' : 'database'
  } catch {
    return 'database'
  }
}
