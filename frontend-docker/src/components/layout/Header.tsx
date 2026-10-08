import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/Button'
import { DockerLogo } from '@/components/ui/DockerLogo'
import { ThemeToggleButton } from '@/components/ui/ThemeToggleButton'

interface NavItem {
  key: string
  label: string
  to: string
  isActive: (pathname: string) => boolean
}

const NAV_ITEMS: NavItem[] = [
  { key: 'home', label: 'Trang chủ', to: '/', isActive: (p) => p === '/' },
  { key: 'docker', label: 'Docker Toolkit', to: '/docker', isActive: (p) => p.startsWith('/docker') },
  { key: 'prompts', label: 'Prompt Lab', to: '/prompts', isActive: (p) => p.startsWith('/prompts') || p.startsWith('/lab') },
]

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export function Header() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { profile, logout } = useAuth()
  const signedIn = Boolean(profile.email)
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-20 bg-hdr backdrop-blur-md border-b border-bd">
      <div className="max-w-[1220px] mx-auto px-5 py-3 flex items-center gap-3.5 flex-wrap">
        <Link to="/" className="flex items-center gap-2.5">
          <DockerLogo className="w-[26px] h-[20px] shrink-0" />
          <div className="font-bold text-[15px] tracking-tight text-tx">@hoidanit</div>
        </Link>

        <nav className="flex gap-0.5 flex-wrap ml-1.5">
          {NAV_ITEMS.map((item) => {
            const active = item.isActive(pathname)
            return (
              <Link
                key={item.key}
                to={item.to}
                className={cn(
                  'px-3 py-[7px] rounded-lg text-[13.5px]',
                  active ? 'bg-pill text-tx font-semibold' : 'text-mut font-medium hover:text-tx hover:bg-hov',
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex-1 min-w-[80px]" />

        <div className="flex items-center gap-2.5 flex-wrap">
          <ThemeToggleButton />
          <Button variant="primary" size="sm" onClick={() => navigate(signedIn ? '/create' : '/auth')}>
            Tạo snippet
          </Button>
          <div
            className="relative shrink-0"
            onMouseEnter={() => setMenuOpen(true)}
            onMouseLeave={() => setMenuOpen(false)}
          >
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="w-8 h-8 rounded-full overflow-hidden bg-grad shadow-glow text-acc-ink flex items-center justify-center text-xs font-bold cursor-pointer border border-bd2"
            >
              {signedIn && profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                (signedIn && initialsOf(profile.name)) || '?'
              )}
            </button>
            {menuOpen ? (
              <div className="absolute top-9 right-0 w-[236px] p-2 z-40 rounded-xl bg-panel border border-bd2 shadow-[0_22px_48px_-18px_rgba(0,0,0,0.65)] flex flex-col gap-0.5">
                <div className="px-2.5 pt-2 pb-2.5 mb-1 flex flex-col gap-0.5 border-b border-bd">
                  <div className="text-[13.5px] font-semibold text-tx">{signedIn ? profile.name : 'Khách'}</div>
                  {signedIn ? <div className="font-mono text-[11.5px] text-mut2">{profile.email}</div> : null}
                </div>
                {!signedIn ? (
                  <Link
                    to="/auth"
                    onClick={() => setMenuOpen(false)}
                    className="w-full px-2.5 py-2.5 rounded-[9px] text-tx2 text-[13.5px] flex items-center justify-between gap-2.5 hover:bg-hov hover:text-tx"
                  >
                    <span>Đăng nhập / Tạo tài khoản</span>
                    <span className="font-mono text-[11px] text-mut3">auth</span>
                  </Link>
                ) : null}
                {signedIn ? (
                <>
                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="w-full px-2.5 py-2.5 rounded-[9px] text-tx2 text-[13.5px] flex items-center justify-between gap-2.5 hover:bg-hov hover:text-tx"
                >
                  <span>Cập nhật hồ sơ</span>
                  <span className="font-mono text-[11px] text-mut3">profile</span>
                </Link>
                <Link
                  to="/dashboard"
                  onClick={() => setMenuOpen(false)}
                  className="w-full px-2.5 py-2.5 rounded-[9px] text-tx2 text-[13.5px] flex items-center justify-between gap-2.5 hover:bg-hov hover:text-tx"
                >
                  <span>Của tôi</span>
                  <span className="font-mono text-[11px] text-mut3">snippets</span>
                </Link>
                <div className="h-px bg-bd my-1" />
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    logout()
                    navigate('/')
                  }}
                  className="w-full px-2.5 py-2.5 rounded-[9px] border-0 bg-transparent text-mut text-[13.5px] text-left cursor-pointer hover:bg-err-bg hover:text-err"
                >
                  Đăng xuất
                </button>
                </>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  )
}
