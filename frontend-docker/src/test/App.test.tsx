import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from '@/App'

describe('App', () => {
  it('lands on the home page without requiring login', () => {
    render(<App />)
    expect(screen.getAllByText('@hoidanit').length).toBeGreaterThan(0)
    expect(screen.getByText('Học Docker xong thì lưu lại ngay tại đây.')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Đăng nhập' })).not.toBeInTheDocument()
  })
})
