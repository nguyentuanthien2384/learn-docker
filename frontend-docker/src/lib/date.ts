export function formatRelativeTime(dateInput: string | Date | undefined): string {
  if (!dateInput) return 'vừa xong'
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
  const time = date.getTime()
  if (Number.isNaN(time)) {
    // If it's already a relative string like "2 ngày", return as is
    return String(dateInput)
  }

  const now = Date.now()
  const diffSeconds = Math.floor((now - time) / 1000)

  if (diffSeconds < 60) return 'vừa xong'
  const diffMinutes = Math.floor(diffSeconds / 60)
  if (diffMinutes < 60) return `${diffMinutes} phút`
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} giờ`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays} ngày`
  const diffWeeks = Math.floor(diffDays / 7)
  if (diffWeeks < 4) return `${diffWeeks} tuần`
  const diffMonths = Math.floor(diffDays / 30)
  if (diffMonths < 12) return `${diffMonths} tháng`
  const diffYears = Math.floor(diffDays / 365)
  return `${diffYears} năm`
}
