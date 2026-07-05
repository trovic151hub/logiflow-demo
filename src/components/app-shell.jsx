import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard, PackagePlus, History, Bell, User, LogOut,
  HelpCircle, ChevronDown,
} from 'lucide-react'
import { getCurrentUser, signOut, useStore, resetDemo } from '@/lib/mock-store'

const CUSTOMER_LINKS = [
  { to: '/customer',         label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/customer/book',    label: 'Book',      Icon: PackagePlus     },
  { to: '/customer/history', label: 'History',   Icon: History         },
]

export function AppShell({ children }) {
  const navigate   = useNavigate()
  const session    = useStore((s) => s.session)
  const [mounted, setMounted]       = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => setMounted(true), [])

  const user     = mounted ? getCurrentUser() : null
  const initials = user
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : ''

  const isDashboard = pathname === '/customer'

  return (
    <div className="min-h-screen text-navy flex flex-col pb-20 md:pb-0" style={{ background: '#F8F9FA' }}>

      {/* ── Royal blue header ─────────────────────────────────────────
          Full-height with greeting on Dashboard, compact on all other pages.
      ──────────────────────────────────────────────────────────────── */}
      <header
  className={`
    relative
    top-0
    z-50
    flex
    flex-col
    transition-all
    duration-300
    overflow-visible
    ${
      isDashboard
        ? 'min-h-[220px] sm:min-h-[230px] lg:min-h-[280px]'
        : ''

    }
    ${
      !isDashboard ? 'hidden md:flex' : 'flex'
    }
  `}
  style={{
    background: 'linear-gradient(180deg, #305CDE 100%, #1E3A8A 0%)',
  }}
>
  {/* ── Top bar ── */}
  <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 pt-4 sm:pt-5 pb-3 max-w-7xl mx-auto w-full">
    
    {/* Logo */}
    <Link
      to="/"
      className="font-display text-xl sm:text-2xl font-extrabold tracking-tight"
      style={{ color: '#ffffff' }}
    >
      WORKPLACE
    </Link>

    {/* Right controls */}
    <div className="flex items-center gap-2 sm:gap-3">
      {mounted && session && (
        <>
          {/* Help */}
          <Link
            to="/customer/help"
            className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-colors"
            style={{
              background: 'rgba(255,255,255,0.15)',
              color: '#ffffff',
            }}
            aria-label="Help"
          >
            <HelpCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Help</span>
          </Link>

          {/* Notification bell */}
          <button
            className="relative p-2 rounded-full transition-colors"
            style={{ background: 'rgba(255,255,255,0.15)' }}
            aria-label="Notifications"
          >
            <Bell
              className="h-4 w-4"
              style={{ color: '#ffffff' }}
            />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-400" />
          </button>
        </>
      )}

      {/* User avatar + dropdown */}
      {mounted && user && (
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2 rounded-full px-3 py-1.5 transition-colors"
            style={{
              background: 'rgba(255,255,255,0.15)',
            }}
          >
            <div
              className="h-7 w-7 rounded-full flex items-center justify-center shrink-0"
              style={{
                background: 'rgba(255,255,255,0.25)',
              }}
            >
              <span
                className="text-xs font-bold"
                style={{ color: '#ffffff' }}
              >
                {initials}
              </span>
            </div>

            <span
              className="text-sm font-semibold hidden sm:inline"
              style={{ color: '#ffffff' }}
            >
              Hi, {user.name.split(' ')[0]}
            </span>

            <ChevronDown
              className="h-3.5 w-3.5"
              style={{
                color: 'rgba(255,255,255,0.7)',
              }}
            />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-surface-200 bg-white shadow-lg z-50">
              <div className="px-4 py-3 border-b border-surface-200">
                <p className="text-sm font-bold text-navy">
                  {user.name}
                </p>
                <p className="text-xs text-slate-500">
                  {user.email}
                </p>
              </div>

              <Link
                to="/customer/account"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-surface-100 transition-colors"
              >
                <User className="h-4 w-4 text-slate-500" />
                <span>Manage Account</span>
              </Link>

              <button
                onClick={() => {
                  signOut()
                  navigate('/auth')
                  setProfileOpen(false)
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-surface-200"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  </div>

  {/* ── Desktop nav links ── */}
  {session && (
    <div className="hidden md:flex items-center gap-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full pb-3">
      {CUSTOMER_LINKS.map(({ to, label, Icon }) => {
        const isActive =
          to === '/customer'
            ? pathname === '/customer'
            : pathname.startsWith(to)

        return (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-1.5 text-sm font-semibold pb-1 transition-colors"
            style={{
              color: isActive
                ? '#ffffff'
                : 'rgba(255,255,255,0.65)',
              borderBottom: isActive
                ? '2px solid rgba(255,255,255,0.9)'
                : '2px solid transparent',
            }}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        )
      })}
    </div>
  )}

  {/* ── Dashboard Greeting ── */}
  {isDashboard && user && (
    <div className="px-4 sm:px-6 lg:px-8 pt-3 pb-10 sm:pb-12 lg:pb-14 flex flex-col gap-1.5 text-white max-w-7xl mx-auto w-full">
      <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">
        Good Evening, {user.name.split(' ')[0]}
      </p>

      <p className="text-sm sm:text-base opacity-70">
        Ready to send or receive something?
      </p>
    </div>
  )}
</header>

      {/* ── Page content ─────────────────────────────────────────── */}
      <div className="flex-1">{children}</div>

      {session && <MobileNav pathname={pathname} />}

      <footer className="hidden md:flex border-t border-surface-200 bg-white px-4 sm:px-6 lg:px-8 py-4 text-xs text-slate-400 items-center justify-between max-w-7xl mx-auto w-full">
        <span>DashPoint demo · frontend-only mock data</span>
        <button
          onClick={() => { resetDemo(); navigate('/') }}
          className="text-slate-500 hover:text-brand font-semibold"
        >
          Reset demo
        </button>
      </footer>
    </div>
  )
}

/* ── Mobile bottom nav ─────────────────────────────────────────── */
function MobileNav({ pathname }) {
  const NAV_ITEMS = [
    { to: '/customer',         label: 'Dashboard', Icon: LayoutDashboard },
    { to: '/customer/history', label: 'History',   Icon: History         },
    { to: '/customer/book',    label: 'Book',      Icon: PackagePlus},
    { to: '/customer/history', label: 'Track',     Icon: History         },
    { to: '/customer/account', label: 'Account',   Icon: User            },
  ]

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-surface-200 shadow-[0_-4px_16px_rgba(0,0,0,0.07)]">
      <div className="flex items-end justify-around px-1">
        {NAV_ITEMS.map(({ to, label, Icon, center }) => {
          const isActive =
            to === '/customer'
              ? pathname === '/customer'
              : pathname.startsWith(to) && to !== '/customer'

          if (center) {
            return (
              <Link
                key={label}
                to={to}
                className="relative flex flex-col items-center flex-1 -mt-5 pb-3"
              >
                <div className="h-14 w-14 flex flex-col items-center justify-center rounded-2xl shadow-lg active:scale-95 transition-transform" style={{ background: '#305CDE' }}>
                  <Icon className="h-6 w-6 text-white" />
                  <span className="text-[10px] font-bold text-white mt-0.5">{label}</span>
                </div>
              </Link>
            )
          }

          return (
            <Link
              key={label}
              to={to}
              className="flex flex-col items-center gap-1 py-3 flex-1 transition-colors"
              style={{ color: isActive ? '#305CDE' : '#94a3b8' }}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-bold tracking-wider">{label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}