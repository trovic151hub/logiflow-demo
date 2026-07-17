import { Link, useNavigate } from 'react-router-dom'
import {
  PackageCheck,
  PackagePlus,
  ArrowRight,
  ScanLine,
  Bell,
  LifeBuoy,
  Search,
  Truck,
  BellRing,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { AppShell } from '@/components/app-shell'
import { TripCard } from '@/components/trip-card'
import { useRequireAuth } from '@/lib/use-require-auth'
import { useStore, STATUS_LABEL } from '@/lib/mock-store'
1
const QUICK_ACTIONS = [
  { label: 'Send Package', to: '/customer/book', image: '/delivery-box.png', caption: 'Book pickup' },
  // { label: 'Receive Package', Icon: PackageCheck,  to: '/customer/receive', bg: '#F0FDF4', icon: '#16A34A' },
  { label: 'Receive Package', to: '/customer/track', image: '/receiver.png', caption: 'View incoming' },
  // { label: 'Order History',   Icon: History,       to: '/customer/history', bg: '#FFFBEB', icon: '#D97706' },
]

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

  const inTransit = deliveries.filter((d) => d.status === 'in_transit')
  const active  = [...deliveries]
    .filter((d) => ['pending', 'accepted', 'picked_up'].includes(d.status))
    .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
  const completed = deliveries.filter((d) => d.status === 'delivered')
  const recentUpdates = [...deliveries]
    .sort((a, b) => {
      const aTime = Math.max(a.createdAt ?? 0, ...Object.values(a.statusTimestamps ?? {}).map((time) => Number(time) || 0))
      const bTime = Math.max(b.createdAt ?? 0, ...Object.values(b.statusTimestamps ?? {}).map((time) => Number(time) || 0))
      return bTime - aTime
    })
    .slice(0, 3)

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
        style={{ maxWidth: '80em', marginTop: '-5.75rem' }}
      >
        
        {/* ── Step 1: Stats + tracking card(HIDDEN) ──────────── */}
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
    zIndex:1300,
   display:'none'
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
  <div className="grid grid-cols-3">
    {[
      {
        label: 'In transit',
        value: inTransit.length,
        caption: 'Moving shipments',
        to: '/customer/track?tab=in_transit',
        bg: '#f4c3bb',
        color: '#b21105',
        dot: '#cf0606',
      },
      {
        label: 'Active',
        value: active.length,
        caption: 'Open orders',
        to: '/customer/track?tab=active',
        bg: '#FEF3C7',
        color: '#B45309',
        dot: '#D97706',
      },
      {
        label: 'Completed',
        value: completed.length,
        caption: 'Finished orders',
        to: '/customer/track?tab=delivered',
        bg: '#DCFCE7',
        color: '#047857',
        dot: '#10B981',
      },
    ].map((stat, index) => (
      <Link
        key={stat.label}
        to={stat.to}
        className="flex min-w-0 flex-col items-center justify-center gap-1.5 px-1.5 py-4 transition-colors hover:bg-slate-50 sm:gap-2 sm:px-6 sm:py-5"
        style={index > 0 ? { borderLeft: '1px solid #F1F5F9' } : undefined}
      >
        <div
          className="flex items-center gap-1 rounded-full px-2 py-1 text-[9px] font-bold whitespace-nowrap sm:px-3 sm:text-xs"
          style={{ background: stat.bg, color: stat.color }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: stat.dot }} />
          {stat.label}
        </div>

        <p className="font-display text-2xl font-extrabold sm:text-4xl" style={{ color: '#1E293B' }}>
          {stat.value}
        </p>

        <p className="text-center text-[10px] leading-tight text-slate-400 sm:text-xs">
          {stat.caption}
        </p>
      </Link>
    ))}
  </div>
</div>

        {/* ── Step 2: Quick actions ────────────────────────────────── */}
        <section className="mb-6 mt-18 w-full">
          <div className="mb-3 flex items-center justify-between px-1 text-white">
            <p className="text-[10px] uppercase tracking-widest font-bold opacity-75">
              Quick actions
            </p>
            <span className="text-[10px] font-semibold opacity-70">Send or receive packages</span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {QUICK_ACTIONS.map(({ label, to, image, caption }) => (
              <Link
                key={label}
                to={to}
                className="group relative min-h-[132px] overflow-hidden rounded-2xl bg-white/15 p-3 text-white shadow-lg shadow-blue-950/10 ring-1 ring-white/20 transition hover:bg-white/20 sm:min-h-[156px] sm:p-4"
              >
              
                <div className="relative flex h-full flex-col justify-between gap-5">
                  <div className='flex w-full justify-center items-center'>
                    <span className="inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl ">
                    <img src={image} alt="" className="h-full w-full  object-cover" />
                  </span>
                  </div>
                  <div>
                    <p className="text-black/75 font-semibold leading-tight text-center sm:text-lg">{label}</p>
                    <p className="mt-1 text-xs font-semibold text-center text-black/65">{caption}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Step 3: Tips carousel ─────────────────────────────────── */}
        <section className="mb-6 w-full hidden">
          <TipsCarousel />
        </section>

        {/* ── Step 4: Active deliveries ─────────────────────────────── */}
        <section className="mb-8 w-full">
          <div className="flex items-center justify-between mb-3 px-1">
            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 flex items-center gap-2">
              Recent updates
              {recentUpdates.length > 0 && (
                <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">
                  {recentUpdates.length}
                </span>
              )}
            </p>
            <Link to="/customer/history" className="text-xs font-bold text-blue-600 hover:underline">
              View all →
            </Link>
          </div>

          {recentUpdates.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white py-12">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                <Truck className="h-7 w-7 text-slate-300" />
              </div>
              <p className="text-sm text-slate-400">No delivery updates yet.</p>
              <Link
                to="/customer/book"
                className="rounded-full bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500"
              >
                Book your first delivery
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {recentUpdates.map((d) => (
                <TripCard key={d.id} delivery={d} actionTo={`/customer/track/${d.id}`} />
              ))}
            </div>
          )}
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
