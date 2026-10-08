import { useRef, useState, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { TextAreaField, TextField } from '@/components/ui/FormField'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export function ProfilePage() {
  const navigate = useNavigate()
  const { profile, updateProfile, uploadAvatar } = useAuth()
  const [draft, setDraft] = useState(profile)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      await updateProfile({
        name: draft.name,
        bio: draft.bio,
      })
      setSaved(true)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể lưu hồ sơ'
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const avatarUrl = await uploadAvatar(file)
      setDraft((d) => ({ ...d, avatarUrl }))
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể tải ảnh đại diện'
      setError(msg)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col gap-5 max-w-[640px]">
      <div className="flex flex-col gap-2">
        <div className="text-2xl font-semibold tracking-tight text-tx">Hồ sơ</div>
        <div className="text-mut [text-wrap:pretty]">
          Cập nhật tên hiển thị, ảnh đại diện và giới thiệu ngắn gắn với snippet công khai của bạn.
        </div>
      </div>
      <div className="rounded-2xl border border-bd bg-panel bg-grad-soft p-[22px] flex flex-col gap-4">
        <div className="flex items-center gap-3.5 flex-wrap">
          <div className="relative group">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-[54px] h-[54px] shrink-0 rounded-full object-cover border border-bd2 shadow-glow"
              />
            ) : (
              <div className="w-[54px] h-[54px] shrink-0 rounded-full bg-grad shadow-glow text-acc-ink flex items-center justify-center text-lg font-bold">
                {initialsOf(draft.name) || '?'}
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="text-base font-semibold text-tx">{profile.name}</div>
            <div className="font-mono text-xs text-mut2">{profile.email}</div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="text-xs text-acc hover:underline text-left cursor-pointer mt-1"
            >
              {uploading ? 'Đang tải lên...' : 'Đổi ảnh đại diện'}
            </button>
          </div>
        </div>

        <div className="grid [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))] gap-3.5">
          <TextField
            label="Tên hiển thị"
            value={draft.name}
            onChange={(e) => {
              setDraft((d) => ({ ...d, name: e.target.value }))
              setSaved(false)
            }}
          />
          <TextField
            label="Email"
            className="font-mono"
            value={draft.email}
            disabled
          />
        </div>
        <TextAreaField
          label="Giới thiệu ngắn"
          value={draft.bio}
          onChange={(e) => {
            setDraft((d) => ({ ...d, bio: e.target.value }))
            setSaved(false)
          }}
          rows={3}
          placeholder="Một dòng về bạn, hiện dưới mỗi snippet công khai"
        />

        {error ? (
          <div className="px-3 py-2 rounded-lg bg-err-bg border border-err-bd text-err text-xs">
            {error}
          </div>
        ) : null}

        <div className="flex gap-2.5 items-center flex-wrap">
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu hồ sơ'}
          </Button>
          <Button onClick={() => navigate('/dashboard')}>Của tôi</Button>
          {saved ? <span className="text-[13px] text-acc">Đã lưu hồ sơ.</span> : null}
        </div>
      </div>
    </div>
  )
}
