import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { RequireAuth } from '@/components/layout/RequireAuth'
import { AuthProvider } from '@/context/AuthContext'
import { SnippetsProvider } from '@/context/SnippetsContext'
import { ThemeProvider } from '@/context/ThemeContext'
import { AuthPage } from '@/features/auth/AuthPage'
import { CreateSnippetPage } from '@/features/create/CreateSnippetPage'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { HomePage } from '@/features/home/HomePage'
import { PromptLabPage } from '@/features/prompt-lab/PromptLabPage'
import { ProfilePage } from '@/features/profile/ProfilePage'
import { SnippetDetailPage } from '@/features/snippets/SnippetDetailPage'
import { SnippetListPage } from '@/features/snippets/SnippetListPage'
import { AuthorPage } from '@/features/users/AuthorPage'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SnippetsProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
              <Route element={<AppLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/docker" element={<SnippetListPage type="code" />} />
                <Route path="/docker/:id" element={<SnippetDetailPage />} />
                <Route path="/prompts" element={<SnippetListPage type="prompt" />} />
                <Route path="/lab/:id?" element={<PromptLabPage />} />
                <Route path="/users/:id" element={<AuthorPage />} />
                <Route element={<RequireAuth />}>
                  <Route path="/create/:id?" element={<CreateSnippetPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                </Route>
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </SnippetsProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
