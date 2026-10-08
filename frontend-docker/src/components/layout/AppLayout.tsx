import { Outlet } from 'react-router-dom'
import { Footer } from '@/components/layout/Footer'
import { Header } from '@/components/layout/Header'
import { OfflineBanner } from '@/components/layout/OfflineBanner'

export function AppLayout() {
  return (
    <div>
      <OfflineBanner />
      <Header />
      <main className="max-w-[1220px] mx-auto px-5 pt-7 pb-20">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
