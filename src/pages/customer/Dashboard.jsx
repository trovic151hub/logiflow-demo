import { Link, useNavigate } from 'react-router-dom'
import {
  Package,
  PackagePlus,
  PackageCheck,
  PackageSearch,
  History,
  Clock,
  ArrowRight,
  ScanLine,
  Bell,
  LifeBuoy,
  MapPin,
  Search,
  Truck,
  BellRing,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { AppShell } from '@/components/app-shell'
import { useRequireAuth } from '@/lib/use-require-auth'
import { useStore, STATUS_LABEL } from '@/lib/mock-store'

const QUICK_ACTIONS = [
  { label: 'Send Package',    Icon: PackagePlus,   to: '/customer/book',    bg: '#EFF6FF', icon: '#2563EB' },
  { label: 'Receive Package', Icon: PackageCheck,  to: '/customer/receive', bg: '#F0FDF4', icon: '#16A34A' },
  { label: 'Track Order',     Icon: PackageSearch, to: '/customer/history', bg: '#F5F3FF', icon: '#7C3AED' },
  { label: 'Order History',   Icon: History,       to: '/customer/history', bg: '#FFFBEB', icon: '#D97706' },
]

const STATUS_BADGE = {
  pending:    'bg-amber-50 text-amber-700',
  assigned:   'bg-blue-50 text-blue-700',
  picked_up:  'bg-blue-50 text-blue-700',
  in_transit: 'bg-blue-50 text-blue-700',
  delivered:  'bg-emerald-50 text-emerald-700',
  cancelled:  'bg-slate-100 text-slate-500',
}

const TIPS = [
  {
    Icon: PackagePlus,
    color: '#EFF6FF',
    iconColor: '#2563EB',
    title: 'Book a delivery in seconds',
    body: 'Tap "Send Package", enter pickup and drop-off addresses, choose a package size and confirm — your rider gets assigned instantly.',
    action: { label: 'Book now', to: '/customer/book' },
  },
  {
    Icon: ScanLine,
    color: '#F5F3FF',
    iconColor: '#7C3AED',
    title: 'Track your order live',
    body: 'Once a rider is assigned, use "Track Order" to follow your package in real time from pickup to your door.',
    action: { label: 'Track an order', to: '/customer/history' },
  },
  {
    Icon: PackageCheck,
    color: '#F0FDF4',
    iconColor: '#16A34A',
    title: 'Expecting a package?',
    body: 'Use "Receive Package" to share your saved address with a sender — no typing needed, just copy and send the link.',
    action: { label: 'Set up receive', to: '/customer/receive' },
  },
  {
    Icon: Bell,
    color: '#FFFBEB',
    iconColor: '#D97706',
    title: 'Stay in the loop',
    body: 'Enable notifications so you get instant updates when your rider picks up, is nearby, or has delivered your package.',
    action: null,
  },
  {
    Icon: LifeBuoy,
    color: '#FFF1F2',
    iconColor: '#E11D48',
    title: 'Something went wrong?',
    body: 'If a package is late, damaged, or missing, tap "Report an issue" and our support team will follow up within the hour.',
    action: { label: 'Get help', to: '/customer/support/issue' },
  },
]

export default function CustomerDashboard() {
  const navigate  = useNavigate()
  const user      = useRequireAuth()
  const deliveries = useStore((s) =>
    user ? s.deliveries.filter((d) => d.customerId === user.id) : []
  )
  const [trackingId, setTrackingId] = useState('')
  const [noticeOpen, setNoticeOpen] = useState(false)
  const [trackedDelivery, setTrackedDelivery] = useState(null)

  const active  = [...deliveries]
    .filter((d) => d.status !== 'delivered' && d.status !== 'cancelled')
    .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
  const pending = deliveries.filter((d) => d.status === 'pending')

  if (!user) return null

  function handleTrack(e) {
    e.preventDefault()
    const value = trackingId.trim()
    if (!value) return

    const matched = deliveries.find((item) => item.id === value || item.trackingId === value)
    if (matched) {
      setTrackingId('')
      navigate(`/customer/track/${matched.id}`, { state: { trackingId: matched.trackingId } })
      return
    }

    navigate(`/customer/track/${value}`, { state: { trackingId: value } })
  }

  return (
    <AppShell>
      {/*
        ── Layout strategy ──────────────────────────────────────────
        Overlapping stats card uses negative margin-top to sit half
        over the blue header, half over the gray content area.
        max-w-3xl on mobile/tablet, expanding to max-w-5xl on lg and
        max-w-7xl on xl for proper large-screen margins.
      ─────────────────────────────────────────────────────────────── */}
      <main
        className="w-full mx-auto flex flex-col items-center px-4 sm:px-6 lg:px-8 pb-10"
        style={{ maxWidth: '80em', marginTop: '-2.5rem' }}
      >
        
        {/* ── Step 1: Stats + tracking card ──────────── */}
<div
  className="
    w-full
    max-w-xl
    rounded-2xl
    bg-white
    shadow-xl
    overflow-hidden
    mb-6

  "
  style={{
    border: '1px solid #f0e2e3',
    zIndex:999
  }}
>
  {/* Tracking input row */}
  <div
    className="px-4 sm:px-5 pt-4 sm:pt-5 pb-4"
    style={{ borderBottom: '1px solid #F1F5F9' }}
  >
    <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2">
      Track a shipment
    </p>

    <form
      onSubmit={handleTrack}
      className="flex items-center gap-2"
    >
      <div className="relative flex-1 min-w-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />

        <input
          type="text"
          value={trackingId}
          onChange={(e) => setTrackingId(e.target.value)}
          placeholder="Enter tracking ID"
          className="
            w-full
            rounded-xl
            border
            border-slate-200
            bg-slate-50
            pl-9
            pr-3
            py-2.5
            text-sm
            text-slate-700
            placeholder:text-slate-400
            focus:outline-none
            focus:ring-2
            focus:border-transparent
            transition-all
          "
          style={{ '--tw-ring-color': '#305CDE' }}
        />
      </div>

      <button
        type="submit"
        className="
          shrink-0
          rounded-xl
          px-4
          sm:px-5
          py-2.5
          text-sm
          font-bold
          text-white
          transition-opacity
          hover:opacity-90
        "
        style={{ background: '#305CDE' }}
      >
        Track
      </button>
    </form>
  </div>

  {/* Stats Row */}
  <div className="grid grid-cols-2">
    {/* Active Transit */}
    <div className="flex flex-col items-center justify-center gap-2 px-4 sm:px-6 py-4 sm:py-5">
      <div
        className="
          flex
          items-center
          gap-1.5
          rounded-full
          px-3
          py-1
          text-[11px]
          sm:text-xs
          font-bold
        "
        style={{
          background: '#DCFCE7',
          color: '#15803D',
        }}
      >
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: '#16A34A' }}
        />
        Active transit
      </div>

      <p
        className="
          font-display
          text-3xl
          sm:text-4xl
          font-extrabold
        "
        style={{ color: '#1E293B' }}
      >
        {active.length}
      </p>

      <p className="text-[11px] sm:text-xs text-slate-400 text-center">
        Moving shipments
      </p>
    </div>

    {/* Awaiting */}
    <div
      className="flex flex-col items-center justify-center gap-2 px-4 sm:px-6 py-4 sm:py-5"
      style={{ borderLeft: '1px solid #F1F5F9' }}
    >
      <div
        className="
          flex
          items-center
          gap-1.5
          rounded-full
          px-3
          py-1
          text-[11px]
          sm:text-xs
          font-bold
        "
        style={{
          background: '#FEF3C7',
          color: '#B45309',
        }}
      >
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: '#D97706' }}
        />
        Awaiting
      </div>

      <p
        className="
          font-display
          text-3xl
          sm:text-4xl
          font-extrabold
        "
        style={{ color: '#1E293B' }}
      >
        {pending.length}
      </p>

      <p className="text-[11px] sm:text-xs text-slate-400 text-center">
        Pending shipments
      </p>
    </div>
  </div>
</div>

        {/* ── Step 2: Quick actions ────────────────────────────────── */}
        <section className="mb-6 w-full">
          <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-3 px-1">
            Quick actions
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
            {QUICK_ACTIONS.map(({ label, Icon, to, bg, icon }) => (
              <Link
                key={label}
                to={to}
                className="flex flex-col items-center gap-2.5 rounded-2xl bg-white p-4 transition-shadow hover:shadow-md"
                style={{ border: '1px solid #E2E8F0' }}
              >
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl"
                  style={{ background: bg }}
                >
                  <Icon className="h-5 w-5" style={{ color: icon }} />
                </div>
                <span className="text-xs font-semibold text-slate-600 text-center leading-tight">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Step 3: Tips carousel ─────────────────────────────────── */}
        <section className="mb-6 w-full">
          <TipsCarousel />
        </section>

        {/* ── Step 4: Active deliveries ─────────────────────────────── */}
        <section className="mb-8 w-full">
          <div className="flex items-center justify-between mb-3 px-1">
            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 flex items-center gap-2">
              Active deliveries
              {active.length > 0 && (
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                  style={{ background: '#305CDE' }}
                >
                  {active.length}
                </span>
              )}
            </p>
            <Link to="/customer/track" className="text-xs font-bold hover:underline" style={{ color: '#305CDE' }}>
              View all →
            </Link>
          </div>

          <div
            className="rounded-2xl  bg-white"
            style={{ border: '1px solid #E2E8F0' }}
          >
            {active.length === 0 ? (
              <div className="flex flex-col items-center py-12 gap-3">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl"
                  style={{ background: '#F1F5F9' }}
                >
                  <Truck className="h-7 w-7 text-slate-300" />
                </div>
                <p className="text-sm text-slate-400">No active deliveries right now.</p>
                <Link
                  to="/customer/book"
                  className="rounded-xl px-4 py-2 text-xs font-bold text-white hover:opacity-90"
                  style={{ background: '#305CDE' }}
                >
                  Book your first delivery
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-slate-50">
                {active.map((d) => (
                  <li key={d.id} className="px-5 py-4 flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-slate-800">{d.id}</p>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                            STATUS_BADGE[d.status] ?? 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {STATUS_LABEL[d.status]}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500 truncate flex items-center gap-1">
                        <MapPin className="h-3 w-3 shrink-0" />
                        {d.pickup.address} → {d.dropoff.address}
                      </p>
                      {d.estimatedDelivery && (
                        <p className="mt-1 text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="h-3 w-3 shrink-0" />
                          Est. arrival: {d.estimatedDelivery}
                        </p>
                      )}
                    </div>
                    <Link
                      to={`/customer/track/${d.id}`}
                      className="shrink-0 rounded-lg border border-slate-200 bg-black text-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Track
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>

    </AppShell>
  )
}

function DeliveryMapPreview({ pickup, dropoff }) {
  return (
    <div className="h-full w-full">
      <iframe
        title="Route preview"
        src={`https://www.google.com/maps?q=${pickup.lat},${pickup.lng},${dropoff.lat},${dropoff.lng}&z=12&output=embed`}
        className="h-full w-full"
        loading="lazy"
      />
    </div>
  )
}

/* ── TipsCarousel ──────────────────────────────────────────────── */
function TipsCarousel() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setActive((i) => (i + 1) % TIPS.length), 4500)
    return () => clearInterval(t)
  }, [])

  const tip = TIPS[active]
  const navigate = useNavigate()

  return (
    <div
      className="rounded-2xl bg-white p-5 overflow-hidden"
      style={{ border: '1px solid #E2E8F0' }}
    >
      <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-4">
        Tips &amp; how-to
      </p>

      <div className="flex items-start gap-4 min-h-[80px]">
        <div
          className="shrink-0 flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ background: tip.color }}
        >
          <tip.Icon className="h-5 w-5" style={{ color: tip.iconColor }} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-800 leading-snug">{tip.title}</p>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">{tip.body}</p>
          {tip.action && (
            <Link
              to={tip.action.to}
              className="mt-2.5 inline-flex items-center gap-1 text-xs font-bold hover:underline"
              style={{ color: '#305CDE' }}
              onClick={(event) => {
                if (tip.action.to === '/customer/support/issue') {
                  event.preventDefault()
                  navigate('/customer/help')
                }
              }}
            >
              {tip.action.label} <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {TIPS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === active ? '20px' : '6px',
                height: '6px',
                background: i === active ? '#305CDE' : '#E2E8F0',
              }}
              aria-label={`Tip ${i + 1}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActive((i) => (i - 1 + TIPS.length) % TIPS.length)}
            className="flex h-6 w-6 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50"
            aria-label="Previous tip"
          >
            <ArrowRight className="h-3 w-3 rotate-180" />
          </button>
          <button
            onClick={() => setActive((i) => (i + 1) % TIPS.length)}
            className="flex h-6 w-6 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50"
            aria-label="Next tip"
          >
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  )
}