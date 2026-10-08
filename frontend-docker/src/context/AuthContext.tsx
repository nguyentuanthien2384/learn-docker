import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { authApi } from '@/lib/api/authApi'
import { clearAccessToken, getAccessToken } from '@/lib/api/client'
import type { UserProfile } from '@/types/snippet'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// Khớp ràng buộc của backend (RegisterDto): mật khẩu 6-72 ký tự, tên hiển thị bắt buộc
const MIN_PASSWORD_LENGTH = 6
const MAX_PASSWORD_LENGTH = 72

export type AuthError = 'email' | 'password' | 'name' | 'server'
export type AuthResult = { ok: true } | { ok: false; error: AuthError; message?: string }

interface AuthContextValue {
  isAuthenticated: boolean
  profile: UserProfile
  loading: boolean
  login: (email: string, password: string) => Promise<AuthResult>
  register: (email: string, password: string, name: string) => Promise<AuthResult>
  logout: () => Promise<void>
  updateProfile: (patch: Partial<UserProfile>) => Promise<void>
  uploadAvatar: (file: File) => Promise<string>
}

/** Chưa đăng nhập: không có dữ liệu người dùng giả, giao diện tự hiển thị trạng thái khách. */
const EMPTY_PROFILE: UserProfile = {
  name: '',
  email: '',
  bio: '',
  avatarUrl: null,
}

const AuthContext = createContext<AuthContextValue | null>(null)

function validateCredentials(email: string, password: string, name?: string): AuthResult {
  if (!EMAIL_PATTERN.test(email)) return { ok: false, error: 'email' }
  if (password.length < MIN_PASSWORD_LENGTH || password.length > MAX_PASSWORD_LENGTH) {
    return { ok: false, error: 'password' }
  }
  if (name !== undefined && !name.trim()) return { ok: false, error: 'name' }
  return { ok: true }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => Boolean(getAccessToken()))
  const [profile, setProfile] = useState<UserProfile>(EMPTY_PROFILE)
  const [loading, setLoading] = useState(false)

  // Try restoring profile from backend if access token exists
  useEffect(() => {
    const token = getAccessToken()
    if (!token) return

    let cancelled = false
    authApi
      .getMe()
      .then((user) => {
        if (!cancelled) {
          setProfile(user)
          setIsAuthenticated(true)
        }
      })
      .catch(() => {
        if (!cancelled) {
          clearAccessToken()
          setIsAuthenticated(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      profile,
      loading,
      login: async (email, password) => {
        const validation = validateCredentials(email, password)
        if (!validation.ok) return validation

        setLoading(true)
        try {
          const res = await authApi.login({ email, password })
          setProfile({
            id: res.user.id,
            name: res.user.name,
            email: res.user.email,
            bio: res.user.bio || '',
            avatarUrl: res.user.avatarUrl,
          })
          setIsAuthenticated(true)
          return { ok: true }
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Đăng nhập thất bại'
          return { ok: false, error: 'server', message }
        } finally {
          setLoading(false)
        }
      },
      register: async (email, password, name) => {
        const validation = validateCredentials(email, password, name)
        if (!validation.ok) return validation

        setLoading(true)
        try {
          const res = await authApi.register({ email, password, name: name.trim() })
          setProfile({
            id: res.user.id,
            name: res.user.name,
            email: res.user.email,
            bio: res.user.bio || '',
            avatarUrl: res.user.avatarUrl,
          })
          setIsAuthenticated(true)
          return { ok: true }
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Đăng ký thất bại'
          return { ok: false, error: 'server', message }
        } finally {
          setLoading(false)
        }
      },
      logout: async () => {
        try {
          await authApi.logout()
        } catch {
          // Ignore network errors during logout
        } finally {
          clearAccessToken()
          setIsAuthenticated(false)
          setProfile(EMPTY_PROFILE)
        }
      },
      updateProfile: async (patch) => {
        const updated = await authApi.updateProfile(patch)
        setProfile((current) => ({ ...current, ...updated }))
      },
      uploadAvatar: async (file: File) => {
        const res = await authApi.uploadAvatar(file)
        setProfile((current) => ({ ...current, avatarUrl: res.avatarUrl }))
        return res.avatarUrl
      },
    }),
    [isAuthenticated, profile, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
