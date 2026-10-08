import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from '@/test/renderWithProviders'
import { AuthPage } from '@/features/auth/AuthPage'

function getSubmitButton(): HTMLElement {
  return screen.getAllByRole('button', { name: 'Đăng nhập' }).find((btn) => btn.getAttribute('type') === 'submit')!
}

describe('AuthPage', () => {
  it('shows an error instead of logging in with an invalid email', async () => {
    renderWithProviders(<AuthPage />)
    const user = userEvent.setup()

    await user.type(screen.getByLabelText('Email'), 'not-an-email')
    await user.type(screen.getByLabelText('Mật khẩu'), 'secret123')
    await user.click(getSubmitButton())

    expect(await screen.findByText('Email chưa đúng định dạng.')).toBeInTheDocument()
  })

  it('shows an error when the password is too short', async () => {
    renderWithProviders(<AuthPage />)
    const user = userEvent.setup()

    await user.type(screen.getByLabelText('Email'), 'you@hoidanit.vn')
    await user.type(screen.getByLabelText('Mật khẩu'), '123')
    await user.click(getSubmitButton())

    expect(await screen.findByText('Mật khẩu cần từ 6 đến 72 ký tự.')).toBeInTheDocument()
  })

  it('asks for a display name when registering', async () => {
    renderWithProviders(<AuthPage />)
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: 'Tạo tài khoản' }))
    await user.type(screen.getByLabelText('Email'), 'you@hoidanit.vn')
    await user.type(screen.getByLabelText('Mật khẩu'), 'secret123')
    await user.click(screen.getAllByRole('button', { name: 'Tạo tài khoản' }).find((btn) => btn.getAttribute('type') === 'submit')!)

    expect(await screen.findByText('Vui lòng nhập tên hiển thị.')).toBeInTheDocument()
  })

  it('lets a visitor browse without credentials and keeps them signed out', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/" element={<div>trang chủ</div>} />
      </Routes>,
      { route: '/auth' },
    )
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: 'Xem thử không cần đăng nhập' }))

    await waitFor(() => {
      expect(screen.getByText('trang chủ')).toBeInTheDocument()
    })
  })
})
