import { BrowserRouter, Routes, Route, Link, useLocation, useNavigationType } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useLayoutEffect } from 'react'
import Index from './pages/Index'
import Onboarding from './pages/Onboarding'
import Auth from './pages/Auth'
import CustomerDashboard from './pages/customer/Dashboard'
import Book from './pages/customer/Book'
import Track from './pages/customer/Track'
import NotificationsPage from './pages/customer/Notifications'
import History from './pages/customer/History'
import Account from './pages/customer/Account'
import Help from './pages/customer/Help'
import RiderDashboard from './pages/rider/Dashboard'
import RiderJob from './pages/rider/Job'

const queryClient = new QueryClient()

function ScrollToTop() {
  const { pathname } = useLocation()
  const navigationType = useNavigationType()

  useLayoutEffect(() => {
    if (navigationType === 'POP') return

    const frame = window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    })

    return () => window.cancelAnimationFrame(frame)
  }, [pathname, navigationType])

  return null
}

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg;-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/customer" element={<CustomerDashboard />} />
          <Route path="/customer/book" element={<Book />} />
          <Route path="/customer/notifications" element={<NotificationsPage />} />
          <Route path="/customer/history" element={<History />} />
          <Route path="/customer/track" element={<Track />} />
          <Route path="/customer/track/:id" element={<Track />} />
          <Route path="/customer/account" element={<Account />} />
          <Route path="/customer/help" element={<Help />} />
          <Route path="/rider" element={<RiderDashboard />} />
          <Route path="/rider/job/:id" element={<RiderJob />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
