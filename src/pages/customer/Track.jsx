import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Phone, X, CheckCircle, ArrowLeft, ClipboardList, UserCheck, Package, Truck, Copy, MapPinned, LoaderCircle, MapPin, Search } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { DeliveryMap } from '@/components/delivery-map'
import { TripCard } from '@/components/trip-card'
import { useRequireAuth } from '@/lib/use-require-auth'
import { useStore, advanceCourier, updateDeliveryStatus, STATUS_LABEL } from '@/lib/mock-store'

function formatTime(ts) {
  if (!ts) return null
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function Track() {
  const user = useRequireAuth()
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [copied, setCopied] = useState(false)
  const [lookupSettled, setLookupSettled] = useState(false)
  const [trackingCode, setTrackingCode] = useState('')
  const deliveries = useStore((s) => (user ? s.deliveries.filter((d) => d.customerId === user.id) : []))
  const delivery = useStore((s) => s.deliveries.find((d) => d.id === id || d.trackingId === id))
  const trackingId = location.state?.trackingId ?? delivery?.trackingId ?? id
  const deliveryId = delivery?.id
  const searchParams = new URLSearchParams(location.search)
  const requestedTab = searchParams.get('tab')

  useEffect(() => {
    if (!delivery) return
    if (!deliveryId) return
    if (delivery.status === 'cancelled') return
    if (delivery.status === 'pending') {
      const t = setTimeout(() => updateDeliveryStatus(deliveryId, 'accepted', 'u-rider-1', 'Marcus Chen'), 800)
      return () => clearTimeout(t)
    }
    if (delivery.status === 'accepted') {
      const t = setTimeout(() => updateDeliveryStatus(deliveryId, 'picked_up'), 3000)
      return () => clearTimeout(t)
    }
    if (delivery.status === 'picked_up') {
      const t = setTimeout(() => updateDeliveryStatus(deliveryId, 'in_transit'), 2000)
      return () => clearTimeout(t)
    }
    if (delivery.status === 'in_transit') {
      let frac = 0
      const iv = setInterval(() => {
        frac += 0.05
        if (frac >= 1) {
          clearInterval(iv)
          updateDeliveryStatus(deliveryId, 'delivered')
        } else {
          advanceCourier(deliveryId, frac)
        }
      }, 600)
      return () => clearInterval(iv)
    }
  }, [delivery?.status, deliveryId])

  useEffect(() => {
    setLookupSettled(false)
    const timeout = window.setTimeout(() => setLookupSettled(true), 600)
    return () => window.clearTimeout(timeout)
  }, [id])

  useEffect(() => {
    if (!copied) return
    const timeout = window.setTimeout(() => setCopied(false), 1800)
    return () => window.clearTimeout(timeout)
  }, [copied])

  function handleCopy() {
    if (!trackingId) return
    navigator.clipboard?.writeText(trackingId).then(() => setCopied(true))
  }

  function handleTrackLookup(event) {
    event.preventDefault()
    const value = trackingCode.trim()
    if (!value) return
    navigate(`/customer/track/${encodeURIComponent(value)}`, { state: { trackingId: value } })
  }

  if (!user) return null

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1)
    } else {
      navigate('/customer')
    }
  }

  if (!id) {
    const orderedDeliveries = [...deliveries].sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
    const tabDefinitions = [
      {
        key: 'in_transit',
        label: 'In transit',
        items: orderedDeliveries.filter((item) => item.status === 'in_transit'),
      },
      {
        key: 'active',
        label: 'Active',
        items: orderedDeliveries.filter((item) => item.status !== 'delivered' && item.status !== 'cancelled'),
      },
      {
        key: 'delivered',
        label: 'Delivered',
        items: orderedDeliveries.filter((item) => item.status === 'delivered'),
      },
    ]
    const visibleTabs = tabDefinitions.filter((tab) => tab.items.length > 0)
    const activeTab = visibleTabs.some((tab) => tab.key === requestedTab)
      ? requestedTab
      : visibleTabs[0]?.key
    const displayedDeliveries = activeTab
      ? visibleTabs.find((tab) => tab.key === activeTab)?.items ?? []
      : orderedDeliveries

    return (
      <AppShell>
        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col gap-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em]  text-center text-slate-400">Track hub</p>
            <h1 className="text-2xl text-center font-bold text-slate-900">Track a delivery</h1>
           <p className="text-sm  text-center text-slate-500">Enter a tracking code or open any order to view its live status and route.</p>
          </div>

          <form onSubmit={handleTrackLookup} className="mb-6 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:flex sm:items-center sm:gap-3">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={trackingCode}
                onChange={(event) => setTrackingCode(event.target.value)}
                placeholder="Enter tracking code"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white"
              />
            </div>
            <button type="submit" className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 sm:mt-0 sm:w-auto">
              Track now
            </button>
          </form>

          {visibleTabs.length > 0 && (
            <div className="mb-5 grid grid-cols-3 gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
              {visibleTabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => navigate(`/customer/track?tab=${tab.key}`)}
                  className={`min-w-0 rounded-xl px-2 py-2.5 text-center text-[11px] font-bold transition-colors sm:text-sm ${
                    activeTab === tab.key
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span className="block truncate">{tab.label}</span>
                  <span className={`mt-0.5 block text-[10px] ${activeTab === tab.key ? 'text-white/70' : 'text-slate-400'}`}>
                    {tab.items.length}
                  </span>
                </button>
              ))}
            </div>
          )}

          <div className="space-y-3">
            {orderedDeliveries.length === 0 ? (
               <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <MapPin className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-slate-900">No activity yet</h2>

            <p className="mt-2 text-sm text-slate-500">Your shipment updates will appear here once a booking is created.</p>
          </div>
            ) : (
              displayedDeliveries.map((item) => (
                <TripCard key={item.id} delivery={item} actionTo={`/customer/track/${item.id}`} />
              ))
            )}
          </div>
        </main>
      </AppShell>
    )
  }

  if (!delivery && !lookupSettled)
    return (
      <AppShell>
        <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-6 py-12 text-center">
          <LoaderCircle className="h-10 w-10 animate-spin text-blue-600" />
          <p className="mt-4 text-sm font-semibold text-slate-600">Loading tracking details...</p>
        </main>
      </AppShell>
    )

  if (!delivery)
    return (
      <AppShell>
        <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-6 py-12 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-500">
            <MapPinned className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">No shipment found</h1>
          <p className="mt-2 text-sm text-slate-500">This tracking link does not match a live delivery yet.</p>
          <button onClick={handleBack} className="mt-6 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900">
            <ArrowLeft className="h-4 w-4" />
          </button>
        </main>
      </AppShell>
    )

  const isCancelled = delivery.status === 'cancelled'
  const isDelivered = delivery.status === 'delivered'
  const riderAssigned = !!delivery.riderName
  const canCancel = delivery.status === 'pending'
  const canContact = riderAssigned && !isDelivered && !isCancelled

  const steps = [
    { key: 'pending', label: 'Order placed', Icon: ClipboardList },
    { key: 'accepted', label: 'Rider accepted', Icon: UserCheck },
    { key: 'picked_up', label: 'Picked up', Icon: Package },
    { key: 'in_transit', label: 'In transit', Icon: Truck },
    { key: 'delivered', label: 'Delivered', Icon: CheckCircle },
  ]
  const currentIdx = steps.findIndex((s) => s.key === delivery.status)

  function handleCancel() {
    updateDeliveryStatus(delivery.id, 'cancelled')
  }

  const banner = isDelivered ? (
    <div className="flex items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
      <CheckCircle className="h-8 w-8 shrink-0 text-emerald-600" />
      <div>
        <p className="font-bold text-emerald-700 text-lg">Package delivered!</p>
        <p className="text-sm text-slate-600 mt-0.5">Your delivery has been completed successfully.</p>
      </div>
    </div>
  ) : isCancelled ? (
    <div className="flex items-center gap-4 rounded-2xl bg-red-50 border border-red-200 p-5">
      <X className="h-8 w-8 shrink-0 text-red-500" />
      <div>
        <p className="font-bold text-red-600 text-lg">Order cancelled</p>
        <p className="text-sm text-slate-600 mt-0.5">This delivery has been cancelled.</p>
      </div>
    </div>
  ) : null

  function DetailPanel() {
    return (
      <>
        {/* Status card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Status</p>
              <p className={`mt-1 font-display text-2xl font-bold ${isCancelled ? 'text-red-500' : isDelivered ? 'text-emerald-600' : 'text-blue-600'}`}>
                {STATUS_LABEL[delivery.status]}
              </p>
            </div>
            <button onClick={handleCopy} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50">
              <Copy className="h-3.5 w-3.5" /> {copied ? 'Copied' : 'Copy ID'}
            </button>
          </div>
          <p className="mt-2 text-sm text-slate-500">Tracking ID · {trackingId}</p>
          {!isDelivered && !isCancelled && (
            <p className="mt-1 text-sm text-slate-500">ETA · {delivery.etaMinutes} min</p>
          )}

          {!isCancelled && (
            <ol className="mt-6 space-y-3">
              {steps.map((s, i) => {
                const done = i <= currentIdx
                const isCurrent = i === currentIdx && !isDelivered
                const timestamp = delivery.statusTimestamps?.[s.key]
                const { Icon } = s
                return (
                  <li key={s.key} className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors ${
                        done
                          ? isDelivered
                            ? 'bg-emerald-600 text-white'
                            : 'bg-blue-600 text-white'
                          : 'bg-slate-200 text-slate-400'
                      } ${isCurrent ? 'ring-4 ring-blue-600/20' : ''}`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <div className="min-w-0">
                      <p className={`text-sm ${done ? 'font-bold text-slate-900' : 'text-slate-400'}`}>{s.label}</p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-slate-400">
                        {timestamp ? formatTime(timestamp) : isCurrent ? 'In progress' : 'Pending'}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ol>
          )}
        </div>

        {/* Courier card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Your courier</p>
          <div className="mt-3 flex items-center gap-4">
            <div className="size-12 rounded-xl bg-blue-50 flex items-center justify-center font-bold text-blue-600">
              {(delivery.riderName ?? '—').split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold">{delivery.riderName ?? 'Awaiting rider…'}</p>
              {riderAssigned && (
                <p className="text-xs text-amber-500">★ 4.9 <span className="text-slate-400">(1,240 trips)</span></p>
              )}
            </div>
            {canContact && (
              <button
                className="flex items-center justify-center size-10 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                title="Contact rider"
                onClick={() => alert('In a real app, this would open a chat or call the rider.')}
              >
                <Phone className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Delivery details card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">From</p>
            <p className="text-sm font-medium">{delivery.pickup.address}</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">To</p>
            <p className="text-sm font-medium">{delivery.dropoff.address}</p>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-slate-200">
            <span className="text-xs text-slate-500">{delivery.packageType} · {delivery.distanceKm} km</span>
            <span className="font-display font-bold">₦{delivery.price}</span>
          </div>
        </div>

        {/* Cancel button — only for pending */}
        {canCancel && (
          <button
            onClick={handleCancel}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-200 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
          >
            <X className="h-4 w-4" /> Cancel order
          </button>
        )}
      </>
    )
  }

  const livePill = (
    <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-xl ring-1 ring-black/5">
      <div className={`size-2 rounded-full ${isCancelled ? 'bg-red-400' : isDelivered ? 'bg-emerald-500' : 'bg-emerald-500 animate-pulse'}`} />
      <span className="text-xs font-bold">Live · {delivery.id}</span>
    </div>
  )

  return (
    <AppShell>
      {/* ── Mobile: full-bleed map with a docked bottom sheet ── */}
      <div className="lg:hidden">
        <div className="fixed inset-0 z-0">
          <DeliveryMap
            pickup={delivery.pickup.coords}
            dropoff={delivery.dropoff.coords}
            courier={delivery.courierPosition}
            className="h-full"
          />
        </div>

        <div className="relative z-10 flex items-center justify-between p-4">
          <button
            type="button"
            onClick={handleBack}
            aria-label="Go back"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          {livePill}
        </div>

        {banner && <div className="relative z-10 mx-4">{banner}</div>}

        <div className="fixed inset-x-0 bottom-20 z-10 max-h-[62vh] overflow-y-auto rounded-t-3xl bg-white shadow-2xl">
          <div className="flex justify-center pt-3 pb-1">
            <div className="h-1 w-10 rounded-full bg-slate-300" />
          </div>
          <div className="space-y-4 px-4 pb-6 pt-2">
            <DetailPanel />
          </div>
        </div>
      </div>

      {/* ── Desktop: side-by-side grid ── */}
      <main className="hidden px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto lg:block">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Go back"
          className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        {banner && <div className="mb-6">{banner}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <section className="lg:col-span-8 relative h-[50vh] sm:h-[60vh] lg:h-[70vh]">
            <DeliveryMap
              pickup={delivery.pickup.coords}
              dropoff={delivery.dropoff.coords}
              courier={delivery.courierPosition}
              className="h-full"
            />
            <div className="absolute top-6 left-6">{livePill}</div>
          </section>

          <aside className="lg:col-span-4 space-y-6">
            <DetailPanel />
          </aside>
        </div>
      </main>
    </AppShell>
  )
}
