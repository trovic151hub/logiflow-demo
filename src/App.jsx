import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Index from './pages/Index'
import Onboarding from './pages/Onboarding'
import Auth from './pages/Auth'
import ChooseRole from './pages/ChooseRole'
import CustomerDashboard from './pages/customer/Dashboard'
import Book from './pages/customer/Book'
import Track from './pages/customer/Track'
import History from './pages/customer/History'
import RiderDashboard from './pages/rider/Dashboard'
import Earnings from './pages/rider/Earnings'
import RiderJob from './pages/rider/Job'

const queryClient = new QueryClient()

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
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
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/choose-role" element={<ChooseRole />} />
          <Route path="/customer" element={<CustomerDashboard />} />
          <Route path="/customer/book" element={<Book />} />
          <Route path="/customer/history" element={<History />} />
          <Route path="/customer/track/:id" element={<Track />} />
          <Route path="/rider" element={<RiderDashboard />} />
          <Route path="/rider/earnings" element={<Earnings />} />
          <Route path="/rider/job/:id" element={<RiderJob />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
