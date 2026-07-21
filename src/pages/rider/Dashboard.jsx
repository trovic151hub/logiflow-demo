import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, Star, Trophy, AlertCircle, ChevronRight, GripHorizontal, X } from 'lucide-react'
import { toast } from 'sonner'
import { AppShell } from '@/components/app-shell'
import { TripCard } from '@/components/trip-card'
import { useRequireAuth } from '@/lib/use-require-auth'
import { useStore, updateDeliveryStatus } from '@/lib/mock-store'
import { RiderMap } from '@/components/rider-map'

const MAP_COLLAPSED = 36
const MAP_DEFAULT = 260
const MAP_MAX = 560

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

// ---------- Hoisted presentational pieces (never define these inside the component body) ----------

function OnlineBadge({ light, jobCount }) {
  return (
    <div
      className={
        'flex items-center gap-2 rounded-full border px-3 py-1.5 shadow-sm ' +
        (light ? 'border-white/20 bg-black/35 backdrop-blur-md' : 'border-slate-200 bg-slate-50')
      }
    >
      <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
      <span className={'text-xs font-bold uppercase tracking-wider ' + (light ? 'text-white' : 'text-slate-600')}>
        Online
      </span>
      {typeof jobCount === 'number' && (
        <>
          <span className={'h-3 w-px ' + (light ? 'bg-white/30' : 'bg-slate-300')} />
          <span className={'text-xs font-bold ' + (light ? 'text-white' : 'text-slate-600')}>
            {jobCount} nearby
          </span>
        </>
      )}
    </div>
  )
}

function PaymentBanner({ onDismiss }) {
  return (
    <div className="relative rounded-2xl border border-amber-200 bg-amber-50 pr-10 text-amber-800">
      <Link to="/rider/account" className="flex items-center justify-between gap-3 px-5 py-4 transition hover:bg-amber-100/60 rounded-2xl">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div>
            <p className="text-sm font-bold">Complete your payment &amp; verification details</p>
            <p className="text-xs text-amber-700">Add your vehicle, license, and bank details to start receiving payouts.</p>
          </div>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0" />
      </Link>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          onDismiss()
        }}
        className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full text-amber-600 transition hover:bg-amber-200/70"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

function EarningsCard({ amount, count }) {
  return (
    <div className="rounded-2xl border border-surface-200 bg-slate-900 text-white p-6 shadow-lg">
      <p className="text-xs font-bold uppercase tracking-wider text-white/60">Today&apos;s earnings</p>
      <p className="mt-1 font-display text-4xl font-bold">₦{amount}</p>
      <p className="mt-2 text-xs text-emerald-400 font-medium">+ {count} deliveries completed</p>
    </div>
  )
}

function GreetingEarningsCard({ name, amount, count }) {
  return (
    <div className="rounded-2xl border border-surface-200 bg-slate-900 text-white p-6 shadow-lg">
      <p className="font-display text-lg font-bold">
        {getGreeting()}, {name}
      </p>
      <p className="mt-4 text-xs font-bold uppercase tracking-wider text-white/60">Today&apos;s earnings</p>
      <p className="mt-1 font-display text-4xl font-bold">₦{amount}</p>
      <p className="mt-2 text-xs text-emerald-400 font-medium">+ {count} deliveries completed</p>
    </div>
  )
}

function StatRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-slate-500">
        <Icon className="h-4 w-4 text-slate-300" />
        <p className="text-xs">{label}</p>
      </div>
      <p className="font-display font-bold">{value}</p>
    </div>
  )
}

function StatsCard({ activeJobs, rating, trips }) {
  return (
    <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm space-y-4">
      <StatRow icon={Briefcase} label="Active jobs" value={activeJobs} />
      <StatRow icon={Star} label="Rating" value={rating} />
      <StatRow icon={Trophy} label="Total trips" value={trips} />
    </div>
  )
}

function SectionCard({ title, subtitle, right, children }) {
  return (
    <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-bold text-slate-900">{title}</h2>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
        {right}
      </div>
      {children}
    </div>
  )
}

function IncomingList({ incoming, onAccept, onReject }) {
  if (incoming.length === 0) {
    return <p className="py-10 text-center text-sm text-slate-500">No incoming requests right now.</p>
  }
  return (
    <div className="space-y-4">
      {incoming.map((d) => (
        <TripCard
          key={d.id}
          delivery={d}
          actionLabel="Accept"
          onAction={() => onAccept(d.id)}
          onSecondary={() => onReject(d.id)}
          disableNavigation
        />
      ))}
    </div>
  )
}

function ActiveJobsList({ myJobs }) {
  return (
    <div className="space-y-3">
      {myJobs.map((d) => (
        <TripCard key={d.id} delivery={d} actionLabel="Open" actionTo={'/rider/job/' + d.id} />
      ))}
    </div>
  )
}

// ---------- Main component ----------

export default function RiderDashboard() {
  const user = useRequireAuth('rider')
  const dragStartRef = useRef({ y: 0, height: MAP_DEFAULT })
  const [mapHeight, setMapHeight] = useState(MAP_DEFAULT)
  const [isDragging, setIsDragging] = useState(false)
  const [showDragHint, setShowDragHint] = useState(false)
  const [paymentDismissed, setPaymentDismissed] = useState(false)

  const incoming = useStore((s) => s.deliveries.filter((d) => d.status === 'pending'))
  const myJobs = useStore((s) =>
    user ? s.deliveries.filter((d) => d.riderId === user.id && d.status !== 'delivered') : [],
  )
  const completed = useStore((s) =>
    user ? s.deliveries.filter((d) => d.riderId === user.id && d.status === 'delivered') : [],
  )
  const todayEarnings = completed.reduce((a, d) => a + d.price, 0)

  if (!user) return null

  const firstName = user.name.split(' ')[0]
  const paymentIncomplete =
    !user.vehicleType || !user.plateNumber || !user.licenseNumber || !user.nin || !user.bankName || !user.accountNumber
  const showPaymentBanner = paymentIncomplete && !paymentDismissed
  const mapJobs = [...incoming, ...myJobs]
  const isMapCollapsed = mapHeight <= MAP_COLLAPSED + 2

  function accept(id) {
    updateDeliveryStatus(id, 'accepted', user.id, user.name)
  }

  function reject(id) {
    updateDeliveryStatus(id, 'cancelled')
  }

  function handleMapDragStart(event) {
    dragStartRef.current = { y: event.clientY, height: mapHeight }
    event.currentTarget.setPointerCapture(event.pointerId)
    setShowDragHint(false)
    setIsDragging(true)
  }

  function handleMapDrag(event) {
    if (event.buttons !== 1) return
    const nextHeight = dragStartRef.current.height + (event.clientY - dragStartRef.current.y)
    setMapHeight(Math.min(MAP_MAX, Math.max(MAP_COLLAPSED, nextHeight)))
  }

  function handleMapDragEnd(event) {
    setIsDragging(false)
    event.currentTarget.releasePointerCapture?.(event.pointerId)
  }

  function handleMapHandleClick() {
    // setShowDragHint(true)
    // toast.info('Hold and drag the map handle', {
    //   description: isMapCollapsed ? 'Drag downward to show the map.' : 'Drag up or down to resize the map.',
    // })
  }

  return (
    <AppShell >
      {/* ================= MOBILE ================= */}
      <div className="md:hidden">
        {/* Slidable map: drag the handle down to reveal it, drag up to close it away
            to just the handle strip at the top of the page. */}
        <div className="relative overflow-hidden bg-slate-100" style={{ height: mapHeight }}>
          {!isMapCollapsed && (
            <>
              <RiderMap jobs={mapJobs} />
              <div className="pointer-events-none absolute inset-x-0 top-0 z-[410] bg-gradient-to-b from-slate-950/45 via-slate-950/20 to-transparent px-4 pb-8 pt-3">
                <div className="mx-auto flex max-w-sm items-center justify-center gap-2 rounded-full border border-white/15 bg-slate-950/55 px-3 py-2 text-[11px] font-semibold text-white shadow-lg backdrop-blur-md">
                  <GripHorizontal className="h-4 w-4 text-white/80" />
                  <span>{showDragHint || isDragging ? 'Hold and drag the handle to resize the map' : 'Map view'}</span>
                </div>
              </div>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950/20 to-transparent" />
              <div className="absolute right-3 top-3">
                <OnlineBadge light jobCount={mapJobs.length} />
              </div>
            </>
          )}
          <button
            type="button"
            onClick={handleMapHandleClick}
            onPointerDown={handleMapDragStart}
            onPointerMove={handleMapDrag}
            onPointerUp={handleMapDragEnd}
            onPointerCancel={handleMapDragEnd}
            aria-label={isMapCollapsed ? 'Drag down to view map' : 'Drag to resize map'}
            className="absolute mt-5 bottom-1  left-1/2 flex -translate-x-1/2 cursor-ns-resize items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-600"
          >
            <GripHorizontal className="h-4 w-4" />
            {isMapCollapsed ? 'Show map' : 'Drag to resize'}
          </button>
          {!isMapCollapsed && (
            <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center px-4 pt-3">
              <div className="flex w-full max-w-sm items-center justify-center gap-2 rounded-full border border-slate-200 bg-white/95 px-3 py-2 text-[11px] font-semibold text-slate-600 shadow-sm">
                <GripHorizontal className="h-4 w-4 text-blue-600" />
              
              </div>
            </div>
          )}
        </div>

        {/* Everything below the map hides while the map is actively being dragged. */}
        <div className= 'space-y-4 p-4'>
          {showPaymentBanner && <PaymentBanner onDismiss={() => setPaymentDismissed(true)} />}

          <GreetingEarningsCard name={firstName} amount={todayEarnings} count={completed.length} />
          <StatsCard activeJobs={myJobs.length} rating={user.rating ?? 5} trips={user.trips ?? 0} />

          {myJobs.length > 0 && (
            <SectionCard title="Your active jobs" subtitle={`${myJobs.length} in progress`}>
              <ActiveJobsList myJobs={myJobs} />
            </SectionCard>
          )}

          <SectionCard title="Job requests" subtitle={`${incoming.length} available nearby`}>
            <IncomingList incoming={incoming} onAccept={accept} onReject={reject} />
          </SectionCard>
        </div>
      </div>

      {/* ================= DESKTOP ================= */}
      {/* Sidebar (greeting, earnings, stats, job lists) + map flexed to fill the rest,
          full-height command-centre layout like an Uber/Bolt driver console. */}
      <div className="hidden md:flex md:h-[calc(100vh-72px)] md:gap-6 md:p-6">
        {/* NOTE: adjust the 72px offset above to match AppShell's actual header height */}
        <aside className="flex w-[400px] shrink-0 flex-col gap-5 overflow-y-auto pr-1">
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900">
              {getGreeting()}, {firstName}
            </h1>
            <p className="text-sm text-slate-500">Here&apos;s what&apos;s happening around you.</p>
          </div>

          {showPaymentBanner && <PaymentBanner onDismiss={() => setPaymentDismissed(true)} />}

          <EarningsCard amount={todayEarnings} count={completed.length} />
          <StatsCard activeJobs={myJobs.length} rating={user.rating ?? 5} trips={user.trips ?? 0} />

          {myJobs.length > 0 && (
            <SectionCard title="Your active jobs" subtitle={`${myJobs.length} in progress`}>
              <ActiveJobsList myJobs={myJobs} />
            </SectionCard>
          )}

          <SectionCard title="Job requests" subtitle={`${incoming.length} available nearby`}>
            <IncomingList incoming={incoming} onAccept={accept} onReject={reject} />
          </SectionCard>
        </aside>

        <section className="relative min-w-0 flex-1 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
          <RiderMap jobs={mapJobs} />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-slate-950/25 to-transparent" />
          <div className="absolute right-4 top-4">
            <OnlineBadge light jobCount={mapJobs.length} />
          </div>
        </section>
      </div>
    </AppShell>
  )
}
 