import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { SnippetsProvider } from '@/context/SnippetsContext'
import { ThemeProvider } from '@/context/ThemeContext'

/** Wraps a component with the same providers App.tsx uses, for tests that need routing/auth/data context. */
export function renderWithProviders(ui: ReactElement, { route = '/' }: { route?: string } = {}) {
  return render(
    <ThemeProvider>
      <AuthProvider>
        <SnippetsProvider>
          <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
        </SnippetsProvider>
      </AuthProvider>
    </ThemeProvider>,
  )
}
