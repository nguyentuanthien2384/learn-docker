import { useTheme } from '@/context/ThemeContext'
import { cn } from '@/lib/cn'

export function ThemeToggleButton({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
      className={cn(
        'w-9 h-9 shrink-0 grid place-items-center rounded-lg border border-bd2 bg-transparent text-mut cursor-pointer hover:text-tx hover:bg-hov',
        className,
      )}
    >
      {isDark ? (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
          <path d="M20.7 14.6A8.6 8.6 0 0 1 9.4 3.3a8.7 8.7 0 1 0 11.3 11.3z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4.2" />
          <path d="M12 2.6v2.2M12 19.2v2.2M4.2 12H2M22 12h-2.2M6.3 6.3 4.8 4.8M19.2 19.2l-1.5-1.5M17.7 6.3l1.5-1.5M4.8 19.2l1.5-1.5" />
        </svg>
      )}
    </button>
  )
}
