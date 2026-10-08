import { Button } from '@/components/ui/Button'

interface PaginationProps {
  page: number
  totalPages: number
  onChange: (page: number) => void
}

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <nav aria-label="Phân trang" className="flex items-center justify-center gap-3 pt-2">
      <Button size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        ← Trước
      </Button>
      <span className="font-mono text-[12.5px] text-mut2">
        Trang {page} / {totalPages}
      </span>
      <Button size="sm" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        Sau →
      </Button>
    </nav>
  )
}
