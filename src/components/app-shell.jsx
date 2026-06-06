import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { LayoutDashboard, PackagePlus, History, Wallet } from 'lucide-react'
import { getCurrentUser, signOut, useStore, resetDemo } from '@/lib/mock-store'

const CUSTOMER_LINKS = [
  { to: '/customer', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/customer/book', label: 'Book', Icon: PackagePlus },
  { to: '/customer/history', label: 'History', Icon: History },
]
const RIDER_LINKS = [
  { to: '/rider', label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/rider/earnings', label: 'Earnings', Icon: Wallet },
]

export function AppShell({ children }) {
  const navigate = useNavigate()
  const session = useStore((s) => s.session)
  const [mounted, setMounted] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => setMounted(true), [])

  const user = mounted ? getCurrentUser() : null
  const links = session?.role === 'rider' ? RIDER_LINKS : CUSTOMER_LINKS
  const initials = user
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : ''

  return (
    <div className="min-h-screen bg-surface-100 text-navy flex flex-col">
      <nav className="sticky top-0 z-50 border-b border-surface-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="font-display text-2xl font-bold tracking-tight text-brand">
              DASHPOINT
            </Link>
            {session && (
              <div className="hidden gap-6 md:flex">
                {links.map(({ to, label, Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`flex items-center gap-1.5 text-sm font-medium pb-1 transition-colors ${
                      pathname === to
                        ? 'text-navy border-b-2 border-brand'
                        : 'text-slate-500 hover:text-navy'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {mounted && session && (
              <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-bold text-brand flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" />
                {session.role === 'rider' ? 'Rider Online' : 'Customer'}
              </span>
            )}

            {mounted && user ? (
              <>
                <div className="hidden sm:flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-brand/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-brand">{initials}</span>
                  </div>
                  <span className="text-sm font-bold">{user.name.split(' ')[0]}</span>
                </div>
                <button
                  onClick={() => {
                    signOut()
                    navigate('/auth')
                  }}
                  className="rounded-lg border border-surface-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-surface-100"
                >
                  Sign out
                </button>
              </>
            ) : mounted ? (
              <Link
                to="/auth"
                className="rounded-lg bg-brand px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-brand-hover"
              >
                Sign in
              </Link>
            ) : null}

            {session && (
              <button
                onClick={() => setMobileOpen((o) => !o)}
                className="md:hidden flex flex-col justify-center gap-1.5 p-1"
                aria-label="Toggle menu"
              >
                <span className={`block h-0.5 w-5 bg-navy transition-transform ${mobileOpen ? 'translate-y-2 rotate-45' : ''}`} />
                <span className={`block h-0.5 w-5 bg-navy transition-opacity ${mobileOpen ? 'opacity-0' : ''}`} />
                <span className={`block h-0.5 w-5 bg-navy transition-transform ${mobileOpen ? '-translate-y-2 -rotate-45' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {session && mobileOpen && (
          <div className="md:hidden border-t border-surface-200 pt-4 mt-4 flex flex-col gap-3">
            {links.map(({ to, label, Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 text-sm font-medium py-1 ${
                  pathname === to ? 'text-navy font-bold' : 'text-slate-500'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      <div className="flex-1">{children}</div>

      <footer className="border-t border-surface-200 bg-white px-6 py-4 text-xs text-slate-400 flex items-center justify-between">
        <span>DashPoint demo · frontend-only mock data</span>
        <button
          onClick={() => {
            resetDemo()
            navigate('/')
          }}
          className="text-slate-500 hover:text-brand font-semibold"
        >
          Reset demo
        </button>
      </footer>
    </div>
  )
}
