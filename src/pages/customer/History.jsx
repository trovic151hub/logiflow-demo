import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { ArrowLeft, Clock, Package, CheckCircle, ChevronRight, MapPin, Scale, Route as RouteIcon } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useRequireAuth } from '@/lib/use-require-auth'
import { useStore, STATUS_LABEL } from '@/lib/mock-store'

const STATUS_STYLES = {
  pending: { badge: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500', rail: 'bg-orange-500' },
  delivered: { badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500', rail: 'bg-emerald-500' },
}
const DEFAULT_STATUS_STYLE = { badge: 'bg-brand/10 text-brand', dot: 'bg-brand', rail: 'bg-brand' }

function statusStyle(status) {
  return STATUS_STYLES[status] || DEFAULT_STATUS_STYLE
}

// Formats an ISO/date-ish value defensively — several delivery records in the
// mock store may not carry every timestamp field, so this never throws.
function formatDateTime(value) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function History() {
  const user = useRequireAuth()
  const navigate = useNavigate()
  const deliveries = useStore((s) => (user ? s.deliveries.filter((d) => d.customerId === user.id) : []))
  const [activeDelivery, setActiveDelivery] = useState(null)
  const [open, setOpen] = useState(false)

  if (!user) return null

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1)
    } else {
      navigate('/customer')
    }
  }

  const pending = deliveries.filter((d) => d.status === 'pending')
  const active = deliveries.filter((d) => d.status !== 'delivered' && d.status !== 'cancelled')
  const completed = deliveries.filter((d) => d.status === 'delivered')

  // Sort all deliveries newest first so freshly placed orders always appear at top
  const sortedDeliveries = [...deliveries].sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))

  function openInvoice(delivery) {
    setActiveDelivery(delivery)
    setOpen(true)
  }

  function closeInvoice() {
    setOpen(false)
    setActiveDelivery(null)
  }

  return (
    <AppShell>
      <main className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Go back"
          className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-3xl text-center font-bold tracking-tight">Delivery history</h1>
            {/* <p className="mt-2 text-sm text-center text-slate-500">Every shipment you've booked, in one place — tap any row for the full record.</p> */}
          </div>
          {/* <Link
            to="/customer/book"
            className="inline-flex items-center justify-center rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand/20 hover:bg-brand-hover"
          >
            + Book new delivery
          </Link> */}
        </div>

        {/* Stat row — flex-wrap keeps this contained on every screen; if three
            cards can't fit on one line, the row wraps instead of pushing the
            page wider. */}
        <div className="mt-8 flex flex-wrap gap-3 sm:gap-4">
          <StatCard icon={Package} label="Pending" value={pending.length} tone="text-orange-600 bg-orange-500/10" />
          <StatCard icon={Clock} label="In progress" value={active.length} tone="text-brand bg-brand/10" />
          <StatCard icon={CheckCircle} label="Completed" value={completed.length} tone="text-emerald-600 bg-emerald-500/10" />
        </div>

        {/* min-w-0 on both the grid track and the card below is what actually
            stops the table from stretching the whole page: flex/grid items
            default to min-width:auto, so without it the table's intrinsic
            width pushes this container (and the page) wider instead of
            scrolling inside its own box. */}
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="min-w-0 space-y-6">
            <div className="min-w-0 rounded-[32px] border border-slate-200 bg-white shadow-sm">
              <div className="px-6 py-5 border-b border-slate-200">
                <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Your shipments</h2>
                <p className="mt-2 text-sm text-slate-500">Tap any shipment to see its full details, timestamps, and invoice.</p>
              </div>

              {deliveries.length === 0 ? (
                <div className="px-6 py-14 text-center text-slate-500">
                  No deliveries yet.{' '}
                  <Link to="/customer/book" className="text-brand font-semibold hover:underline">
                    Book one now
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="text-left px-6 py-4 font-semibold text-slate-900">Order</th>
                        <th className="text-left px-6 py-4 font-semibold text-slate-900">Route</th>
                        <th className="text-left px-6 py-4 font-semibold text-slate-900">Type</th>
                        <th className="text-left px-6 py-4 font-semibold text-slate-900">Status</th>
                        <th className="text-left px-6 py-4 font-semibold text-slate-900">Booked</th>
                        <th className="text-right px-6 py-4 font-semibold text-slate-900">Price</th>
                        <th className="w-10 px-4 py-4" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {sortedDeliveries.map((d) => {
                        const style = statusStyle(d.status)
                        const booked = formatDateTime(d.createdAt)
                        return (
                          <tr
                            key={d.id}
                            onClick={() => openInvoice(d)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && openInvoice(d)}
                            className="group cursor-pointer bg-white transition-colors hover:bg-slate-50 focus:outline-none focus-visible:bg-slate-50"
                          >
                            <td className="px-6 py-4 font-semibold text-slate-900 whitespace-nowrap">
                              <span className={`mr-2 inline-block h-1.5 w-1.5 rounded-full ${style.dot} align-middle`} />
                              {d.id}
                            </td>
                            <td className="px-6 py-4 text-slate-600">
                              <div className="flex max-w-[260px] items-center gap-2 text-sm">
                                <span className="truncate">{d.pickup?.address}</span>
                                <span className="flex-shrink-0 text-slate-400">→</span>
                                <span className="truncate">{d.dropoff?.address}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-slate-600 font-medium whitespace-nowrap">{d.packageType}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-semibold uppercase ${style.badge}`}>
                                {STATUS_LABEL[d.status]}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{booked ?? '—'}</td>
                            <td className="px-6 py-4 text-right font-semibold text-slate-900 whitespace-nowrap">₦{d.price}</td>
                            <td className="px-4 py-4 text-slate-300 transition-colors group-hover:text-brand">
                              <ChevronRight className="h-4 w-4" />
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>

          <aside className="min-w-0 space-y-6">
            <div className="rounded-[32px] border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Pending shipments</p>
              <p className="mt-3 text-sm text-slate-600">Orders waiting for confirmation or pickup are listed here.</p>
              <div className="mt-5 space-y-4">
                {pending.slice(0, 3).map((delivery) => (
                  <button
                    key={delivery.id}
                    type="button"
                    onClick={() => openInvoice(delivery)}
                    className="block w-full rounded-[24px] bg-white p-4 text-left shadow-sm transition hover:shadow-md"
                  >
                    <p className="text-sm font-semibold text-slate-900">{delivery.id}</p>
                    <p className="mt-2 truncate text-xs text-slate-500">{delivery.pickup?.address} → {delivery.dropoff?.address}</p>
                    <p className="mt-3 text-xs uppercase tracking-[0.2em] text-orange-500">{STATUS_LABEL[delivery.status]}</p>
                  </button>
                ))}
                {pending.length === 0 && <p className="text-sm text-slate-500">You have no pending shipments right now.</p>}
              </div>
            </div>

            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Need the invoice?</p>
              <p className="mt-3 text-sm text-slate-600">Tap any shipment on the left to open its full record — route, timestamps, weight, and price all in one view.</p>
            </div>
          </aside>
        </div>

        <Dialog open={open} onOpenChange={(value) => setOpen(value)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{activeDelivery?.id ?? 'Shipment details'}</DialogTitle>
              <DialogDescription>Full record for this shipment, including the activity log and timestamps.</DialogDescription>
            </DialogHeader>
            {activeDelivery ? (
              <ShipmentDetails delivery={activeDelivery} />
            ) : (
              <div className="py-10 text-center text-slate-500">Select a shipment to see its details.</div>
            )}
            <DialogFooter>
              <button
                type="button"
                onClick={closeInvoice}
                className="rounded-3xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              {activeDelivery && (
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    navigate('/customer/track/' + activeDelivery.id)
                  }}
                  className="rounded-3xl bg-brand px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand/20 hover:bg-brand-hover"
                >
                  Track delivery
                </button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </AppShell>
  )
}

function ShipmentDetails({ delivery: d }) {
  const style = statusStyle(d.status)
  const timestamps = d.statusTimestamps ?? {}
  const booked = formatDateTime(timestamps.pending ?? d.createdAt)
  const accepted = formatDateTime(timestamps.accepted)
  const pickedUp = formatDateTime(timestamps.picked_up)
  const inTransit = formatDateTime(timestamps.in_transit)
  const delivered = formatDateTime(timestamps.delivered)

  const timeline = [
    { label: 'Booked', time: booked, done: Boolean(booked), detail: 'Order submitted and queued for a rider.' },
    { label: 'Accepted', time: accepted, done: Boolean(accepted), detail: 'Your rider confirmed the pickup request.' },
    { label: 'Picked up', time: pickedUp, done: Boolean(pickedUp), detail: 'The package was collected from the pickup point.' },
    { label: 'In transit', time: inTransit, done: Boolean(inTransit), detail: 'The shipment is moving toward the destination.' },
    { label: 'Delivered', time: delivered, done: Boolean(delivered), detail: 'The order was completed successfully.' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-slate-50 p-5">
        <div className="flex items-center gap-3">
          <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-semibold uppercase ${style.badge}`}>
            {STATUS_LABEL[d.status]}
          </span>
          {d.trackingId && <span className="text-xs text-slate-500">Tracking ID: {d.trackingId}</span>}
        </div>
        <p className="text-lg font-semibold text-slate-900">₦{d.price}</p>
      </div>

      {/* Timeline — only rendered stages that have a real timestamp are marked
          complete, so an in-progress shipment never shows a fake delivery time. */}
      <div className="rounded-3xl bg-white p-5 shadow-sm">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Activity log</p>
        <ol className="mt-4 space-y-4">
          {timeline.map((step, i) => (
            <li key={step.label} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <span className={`h-2.5 w-2.5 rounded-full ${step.done ? style.rail : 'bg-slate-200'}`} />
                {i < timeline.length - 1 && <span className="mt-1 h-8 w-px bg-slate-200" />}
              </div>
              <div className="min-w-0">
                <p className={`text-sm font-semibold ${step.done ? 'text-slate-900' : 'text-slate-400'}`}>{step.label}</p>
                <p className="mt-1 text-xs text-slate-500">{step.detail}</p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-slate-400">{step.time ?? 'Not yet recorded'}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl bg-slate-50 p-5">
          <p className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-400">
            <MapPin className="h-3.5 w-3.5" /> Pickup
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-900">{d.pickup?.address}</p>
        </div>
        <div className="rounded-3xl bg-slate-50 p-5">
          <p className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-400">
            <MapPin className="h-3.5 w-3.5" /> Drop-off
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-900">{d.dropoff?.address}</p>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-5 shadow-sm">
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Package</p>
            <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-slate-900">
              <Package className="h-3.5 w-3.5 text-slate-400" /> {d.packageType}
            </p>
          </div>
          {d.weightKg != null && (
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Weight</p>
              <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-slate-900">
                <Scale className="h-3.5 w-3.5 text-slate-400" /> {d.weightKg} kg
              </p>
            </div>
          )}
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Distance</p>
            <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-slate-900">
              <RouteIcon className="h-3.5 w-3.5 text-slate-400" /> {d.distanceKm} km
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">ETA</p>
            <p className="mt-2 text-sm font-semibold text-slate-900">{d.etaMinutes != null ? `${d.etaMinutes} min` : '—'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, tone }) {
  return (
    <div className="min-w-[130px] flex-1 rounded-[28px] border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
      <div className={`inline-flex h-9 w-9 items-center justify-center rounded-2xl ${tone}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-3 text-2xl font-semibold text-slate-900 sm:text-3xl">{value}</p>
      <p className="mt-1 text-xs font-medium uppercase tracking-widest text-slate-500">{label}</p>
    </div>
  )
}