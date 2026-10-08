import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { DockerLogo } from '@/components/ui/DockerLogo'
import { ThemeToggleButton } from '@/components/ui/ThemeToggleButton'
import { useAuth, type AuthError } from '@/context/AuthContext'
import { cn } from '@/lib/cn'

type AuthMode = 'login' | 'register'

const AUTH_SELLING_POINTS = [
  'Dockerfile và compose mẫu, giải thích từng dòng',
  'Prompt có biến, điền form là copy được ngay',
  'Snippet công khai của cộng đồng, riêng tư của bạn',
]

const ERROR_MESSAGE: Record<AuthError, string> = {
  email: 'Email chưa đúng định dạng.',
  password: 'Mật khẩu cần từ 6 đến 72 ký tự.',
  name: 'Vui lòng nhập tên hiển thị.',
  server: 'Đã có lỗi xảy ra.',
}

export function AuthPage() {
  const { isAuthenticated, login, register, loading } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<AuthError | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)

  if (isAuthenticated) return <Navigate to="/" replace />

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)
    setServerError(null)

    const result =
      mode === 'login' ? await login(email, password) : await register(email, password, name)

    if (!result.ok) {
      if (result.error === 'server') {
        setServerError(result.message || 'Đã có lỗi xảy ra.')
      } else {
        setError(result.error)
      }
      return
    }
    navigate('/')
  }

  return (
    <div className="min-h-screen grid [grid-template-columns:repeat(auto-fit,minmax(340px,1fr))] items-stretch">
      <div className="p-12 flex flex-col justify-between gap-12 border-r border-bd">
        <div className="flex items-center gap-2.5">
          <DockerLogo className="w-[30px] h-[23px] shrink-0" />
          <div className="font-bold tracking-tight text-[17px] text-tx">@hoidanit</div>
          <div className="flex-1" />
          <ThemeToggleButton />
        </div>
        <div className="flex flex-col gap-5 max-w-[420px]">
          <div className="font-mono text-xs tracking-[0.12em] uppercase text-acc">Cẩm nang Docker + Kho Prompt</div>
          <div className="text-[34px] leading-[1.15] font-semibold tracking-tight text-tx [text-wrap:pretty]">
            Lưu lại mọi thứ bạn học được về Docker, và mọi prompt đáng dùng lại.
          </div>

          <div className="flex flex-col gap-2.5 mt-2">
            {AUTH_SELLING_POINTS.map((point) => (
              <div key={point} className="flex gap-2.5 items-start">
                <div className="w-[5px] h-[5px] rounded-full bg-acc mt-[9px] shrink-0" />
                <div className="text-tx2 text-sm">{point}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="font-mono text-xs text-mut3">docker · ai · vibecoding · hoidanit</div>
      </div>

      <div className="p-12 flex items-center justify-center">
        <form onSubmit={handleSubmit} noValidate className="w-full max-w-[400px] flex flex-col gap-5">
          <div className="flex gap-1 p-1 rounded-[10px] bg-panel2 border border-bd2">
            {(
              [
                { key: 'login', label: 'Đăng nhập' },
                { key: 'register', label: 'Tạo tài khoản' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setMode(tab.key)
                  setError(null)
                  setServerError(null)
                }}
                className={cn(
                  'flex-1 py-2.5 rounded-[7px] border-0 text-sm cursor-pointer',
                  mode === tab.key ? 'bg-pill2 text-tx font-semibold' : 'bg-transparent text-mut font-medium hover:text-tx',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {mode === 'register' ? (
            <div className="flex flex-col gap-[7px]">
              <label htmlFor="auth-name" className="text-[13px] text-mut font-medium">
                Tên hiển thị
              </label>
              <input
                id="auth-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Hỏi Dân IT"
                className="px-3 py-[11px] rounded-[9px] bg-panel2 border border-bd2 text-tx text-sm outline-none focus:border-acc"
              />
            </div>
          ) : null}

          <div className="flex flex-col gap-[7px]">
            <label htmlFor="auth-email" className="text-[13px] text-mut font-medium">
              Email
            </label>
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError(null)
                setServerError(null)
              }}
              placeholder="you@hoidanit.vn"
              className="px-3 py-[11px] rounded-[9px] bg-panel2 border border-bd2 text-tx text-sm outline-none focus:border-acc"
            />
          </div>
          <div className="flex flex-col gap-[7px]">
            <label htmlFor="auth-password" className="text-[13px] text-mut font-medium">
              Mật khẩu
            </label>
            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError(null)
                setServerError(null)
              }}
              placeholder="••••••••"
              className="px-3 py-[11px] rounded-[9px] bg-panel2 border border-bd2 text-tx text-sm font-mono outline-none focus:border-acc"
            />
          </div>

          {error && error !== 'server' ? (
            <div className="px-3 py-2.5 rounded-[9px] bg-err-bg border border-err-bd text-err text-[13px]">{ERROR_MESSAGE[error]}</div>
          ) : null}

          {serverError ? (
            <div className="px-3 py-2.5 rounded-[9px] bg-err-bg border border-err-bd text-err text-[13px]">{serverError}</div>
          ) : null}

          <Button type="submit" variant="primary" className="mt-1" disabled={loading}>
            {loading ? 'Đang xử lý...' : mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
          </Button>
          <Button type="button" onClick={() => navigate('/')} className="py-[11px] text-[13px]">
            Xem thử không cần đăng nhập
          </Button>
        </form>
      </div>
    </div>
  )
}
