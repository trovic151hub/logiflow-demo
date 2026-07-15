import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { useRequireAuth } from '@/lib/use-require-auth'
import {
  LayoutDashboard, PackagePlus, History, Bell, User, LogOut,
  HelpCircle, ChevronDown,MapPin
} from 'lucide-react'
import { getCurrentUser, signOut, useStore, resetDemo } from '@/lib/mock-store'

const CUSTOMER_LINKS = [
  { to: '/customer',         label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/customer/book',    label: 'Book',      Icon: PackagePlus     },
  { to: '/customer/history', label: 'History',   Icon: History         },
  { to: '/customer/account', label: 'Account',   Icon: User            },
]

const RIDER_LINKS = [
  { to: '/rider',         label: 'Dashboard', Icon: LayoutDashboard },
  { to: '/rider/account', label: 'Account',   Icon: User            },
]

const NOTIFICATION_READ_KEY = 'dashpoint-notifications-read-at'

export function AppShell({ children }) {
  const navigate   = useNavigate()
  const session    = useStore((s) => s.session)
  const [mounted, setMounted]       = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notificationsReadAt, setNotificationsReadAt] = useState(() => {
    if (typeof window === 'undefined') return 0
    return Number(window.localStorage.getItem(NOTIFICATION_READ_KEY)) || 0
  })
  const { pathname } = useLocation()

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    const syncReadState = () => {
      setNotificationsReadAt(Number(window.localStorage.getItem(NOTIFICATION_READ_KEY)) || 0)
    }
    window.addEventListener('storage', syncReadState)
    window.addEventListener('dashpoint:notifications-read', syncReadState)
    return () => {
      window.removeEventListener('storage', syncReadState)
      window.removeEventListener('dashpoint:notifications-read', syncReadState)
    }
  }, [])

  const user     = getCurrentUser()
  const initials = user
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : ''
  const deliveries = useStore((s) => (s.session ? s.deliveries.filter((d) => d.customerId === s.session.userId) : []))
  const notifications = useMemo(() => {
    if (!deliveries.length) return []

    const items = []
    deliveries.forEach((delivery) => {
      if (delivery.createdAt) {
        items.push({
          id: `${delivery.id}-created`,
          title: 'Order booked',
          description: `${delivery.id} was booked and is waiting for the next update.`,
          time: delivery.createdAt,
        })
      }
      const timestamps = delivery.statusTimestamps ?? {}
      if (timestamps.accepted) {
        items.push({
          id: `${delivery.id}-accepted`,
          title: 'Rider accepted',
          description: `${delivery.id} was accepted by your rider.`,
          time: timestamps.accepted,
        })
      }
      if (timestamps.picked_up) {
        items.push({
          id: `${delivery.id}-picked-up`,
          title: 'Picked up',
          description: `${delivery.id} has been picked up and is on the way.`,
          time: timestamps.picked_up,
        })
      }
      if (timestamps.in_transit) {
        items.push({
          id: `${delivery.id}-in-transit`,
          title: 'In transit',
          description: `${delivery.id} is now moving to its destination.`,
          time: timestamps.in_transit,
        })
      }
      if (timestamps.delivered) {
        items.push({
          id: `${delivery.id}-delivered`,
          title: 'Delivered',
          description: `${delivery.id} was completed successfully.`,
          time: timestamps.delivered,
        })
      }
    })

    return items.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 6)
  }, [deliveries])

  const role = session?.role
  const homePath = role === 'rider' ? '/rider' : '/customer'
  const navLinks = role === 'rider' ? RIDER_LINKS : CUSTOMER_LINKS
  const isDashboard = pathname === '/customer'
  const latestNotificationTime = notifications.reduce((latest, item) => Math.max(latest, Number(item.time) || 0), 0)
  const showNotificationDot = notifications.length > 0 && latestNotificationTime > notificationsReadAt

  useEffect(() => {
    if (pathname === '/customer/notifications') {
      setNotificationsOpen(false)
    }
  }, [pathname])

  return (
    <div className="min-h-screen text-navy flex flex-col pb-20 md:pb-0" style={{ background: '#F8F9FA' }}>

      {/* ── Royal blue header ─────────────────────────────────────────
          Full-height with greeting on Dashboard, compact on all other pages.
      ──────────────────────────────────────────────────────────────── */}
      <header
  className={`
    relative
    top-0
    z-[1200]
    flex
    flex-col
    transition-all
    duration-300
    overflow-visible
    ${
      isDashboard
        ? 'min-h-[180px] sm:min-h-[180px] lg:min-h-[200px]'
        : 'hidden md:flex md:min-h-16'
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
      className="flex items-center gap-1 shrink-0"
      style={{ color: '#ffffff' }}
    >
      <img
        src="/logo.png"
        alt="Workspace Logistics & Courier Logo"
        className="h-9 w-auto object-contain brightness-0 invert"
        onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'block'; }}
      />
      <span className="font-display text-lg sm:text-xl mt-3 font-extrabold tracking-tight text-white">WORKSPACE</span>
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
          <div className="relative">
            <button
              onClick={() => {
                setNotificationsOpen(false)
                navigate('/customer/notifications')
              }}
              className="relative p-2 rounded-full transition-colors"
              style={{ background: 'rgba(255,255,255,0.15)' }}
              aria-label="Notifications"
            >
              <Bell
                className="h-4 w-4"
                style={{ color: '#ffffff' }}
              />
              {showNotificationDot && <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-400" />}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl z-50">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-900">Recent activity</p>
                  <button type="button" onClick={() => setNotificationsOpen(false)} className="text-xs font-semibold text-slate-500">
                    Close
                  </button>
                </div>
                {notifications.length > 0 ? (
                  <ul className="space-y-2">
                    {notifications.map((item) => (
                      <li key={item.id} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                        <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                        <p className="mt-1 text-xs text-slate-600">{item.description}</p>
                        <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-slate-400">
                          {new Date(item.time).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="py-2 text-sm text-slate-500">No recent activity yet.</p>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* User avatar + dropdown */}
      {/* {mounted && user && (
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
            <div className="absolute right-0 top-full z-[1400] mt-2 w-48 rounded-xl border border-surface-200 bg-white shadow-lg">
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
      )} */}
    </div>
  </div>

  {/* ── Desktop nav links ── */}
  {session && (
    <div className="hidden md:flex items-center gap-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full pb-3">
      {navLinks.map(({ to, label, Icon }) => {
        const isActive =
          to === homePath
            ? pathname === homePath
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
              background: isActive ? 'rgba(255,255,255,0.14)' : 'transparent',
              borderRadius: '999px',
              padding: '0.45rem 0.75rem',
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
    <div className="px-4 sm:px-6 lg:px-8 pt-3 pb-10 sm:pb-12 lg:pb-14 flex flex-col gap-2 text-white max-w-7xl mx-auto w-full">
      <p className="text-2xl sm:text-3xl lg:text-4xl font-bold">
        Hi, {user.name.split(' ')[0]}
      </p>

      <p className="text-sm sm:text-base opacity-70">
        Ready to send or receive something? Book now.
      </p>
    </div>
  )}
</header>

      {/* ── Page content ─────────────────────────────────────────── */}
      <div className="flex-1">{children}</div>

      {session && <MobileNav pathname={pathname} role={role} />}

      <footer className="hidden md:flex border-t border-surface-200 bg-white px-4 sm:px-6 lg:px-8 py-4 text-xs text-slate-400 items-center justify-between max-w-7xl mx-auto w-full">
        <span>Workspace demo · frontend-only mock data</span>
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
function MobileNav({ pathname, role }) {

  const CUSTOMER_NAV_ITEMS = [
    { to: '/customer',         label: 'Dashboard', Icon: LayoutDashboard },
        { to: '/customer/track',   label:'Track',    Icon: MapPin},
    { to: '/customer/book',    label: 'Send',      Icon: PackagePlus, accent: false, center:true },
    { to: '/customer/history', label: 'History',   Icon: History         },
    { to: '/customer/account', label: 'Account',   Icon: User            },
  ]

  const RIDER_NAV_ITEMS = [
    { to: '/rider',         label: 'Dashboard', Icon: LayoutDashboard },
    { to: '/rider/account', label: 'Account',   Icon: User            },
  ]

  const homePath = role === 'rider' ? '/rider' : '/customer'
  const NAV_ITEMS = role === 'rider' ? RIDER_NAV_ITEMS : CUSTOMER_NAV_ITEMS

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-surface-200 shadow-[0_-4px_16px_rgba(0,0,0,0.07)]">
      <div className="flex items-end justify-around px-1">
        {NAV_ITEMS.map(({ to, label, Icon, center, accent }) => {
          const isActive =
            to === homePath
              ? pathname === homePath
              : pathname.startsWith(to) && to !== homePath

          if (center) {
            return (
              <Link
                key={label}
                to={to}
                className="relative flex flex-col items-center flex-1 -mt-5 pb-2"
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
              className={`flex flex-col items-center gap-1 py-3 flex-1 transition-colors ${accent ? 'px-1' : ''}`}
              style={{ color: isActive ? '#305CDE' : '#94a3b8' }}
            >
              <div className={`flex flex-col rounded-full p-1.5 ${accent ? 'border-2 border-blue-600 bg-blue-50' : ''}`}>
                <Icon className={`h-5 w-5 ${accent ? 'text-blue-600' : ''}`} />
               
              </div>
              <span className={`text-[10px] font-bold tracking-wider ${accent ? 'text-blue-600' : ''}`}>{label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
