import { useEffect, useState } from 'react'
import { getBackendMode, type BackendMode } from '@/lib/api/statusApi'

/** Cảnh báo khi backend chạy Offline Mock (DB_ENABLED=false): dữ liệu hiển thị là giả, không được lưu. */
export function OfflineBanner() {
  const [mode, setMode] = useState<BackendMode>('database')

  useEffect(() => {
    let cancelled = false
    getBackendMode().then((result) => {
      if (!cancelled) setMode(result)
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (mode !== 'offline') return null
  return (
    <div role="status" className="bg-panel2 border-b border-bd text-warn text-[12.5px] text-center px-4 py-2">
      Backend đang chạy chế độ Offline Mock: dữ liệu chỉ để xem thử và sẽ không được lưu.
    </div>
  )
}
