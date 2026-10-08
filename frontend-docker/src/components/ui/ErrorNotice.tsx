import { Button } from '@/components/ui/Button'

interface ErrorNoticeProps {
  message: string
  onRetry?: () => void
}

/** Hiển thị lỗi tải dữ liệu từ backend kèm nút thử lại. */
export function ErrorNotice({ message, onRetry }: ErrorNoticeProps) {
  return (
    <div
      role="alert"
      className="px-4 py-3 rounded-[10px] bg-err-bg border border-err-bd text-err text-[13px] flex items-center gap-3 flex-wrap"
    >
      <span className="flex-1 min-w-[200px]">{message}</span>
      {onRetry ? (
        <Button size="sm" onClick={onRetry}>
          Thử lại
        </Button>
      ) : null}
    </div>
  )
}
