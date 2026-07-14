import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
  ArrowLeft,
  CheckCircle,
  ChevronRight,
  Clock,
  MapPin,
  Package,
  ReceiptText,
  Route as RouteIcon,
  Scale,
} from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useRequireAuth } from '@/lib/use-require-auth'
import { STATUS_LABEL, useStore } from '@/lib/mock-store'

const STATUS_STYLES = {
  pending: { badge: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500', rail: 'bg-orange-500' },
  delivered: { badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500', rail: 'bg-emerald-500' },
}
const DEFAULT_STATUS_STYLE = { badge: 'bg-brand/10 text-brand', dot: 'bg-brand', rail: 'bg-brand' }

function statusStyle(status) {
  return STATUS_STYLES[status] || DEFAULT_STATUS_STYLE
}

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

  const pending = deliveries.filter((d) => d.status === 'pending')
  const active = deliveries.filter((d) => d.status !== 'delivered' && d.status !== 'cancelled')
  const completed = deliveries.filter((d) => d.status === 'delivered')
  const sortedDeliveries = [...deliveries].sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))

  function handleBack() {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1)
    } else {
      navigate('/customer')
    }
  }

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
      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Go back"
          className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-[#102A6B]"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <div className="text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">History</p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-[#102A6B]">Delivery history</h1>
        </div>

        <div className="mt-6 flex flex-wrap gap-3 sm:gap-4">
          <StatCard icon={Package} label="Pending" value={pending.length} tone="text-orange-600 bg-orange-500/10" />
          <StatCard icon={Clock} label="In progress" value={active.length} tone="text-brand bg-brand/10" />
          <StatCard icon={CheckCircle} label="Completed" value={completed.length} tone="text-emerald-600 bg-emerald-500/10" />
        </div>

        <section className="mt-6 space-y-3">
          {deliveries.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <Package className="h-6 w-6" />
              </div>
              <p className="mt-4 text-sm text-slate-500">
                No deliveries yet.{' '}
                <Link to="/customer/book" className="font-semibold text-brand hover:underline">
                  Book one now
                </Link>
              </p>
            </div>
          ) : (
            sortedDeliveries.map((delivery) => (
              <HistoryBlock key={delivery.id} delivery={delivery} onClick={() => openInvoice(delivery)} />
            ))
          )}
        </section>

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
                  className="rounded-3xl bg-[#102A6B] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/20 hover:bg-[#0B1F52]"
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

function HistoryBlock({ delivery, onClick }) {
  const style = statusStyle(delivery.status)
  const booked = formatDateTime(delivery.createdAt)

  return (
    <button
      type="button"
      onClick={onClick}
      className="group w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-blue-100 hover:bg-blue-50/40 hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${style.badge}`}>
          <Package className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-bold text-[#102A6B]">{delivery.id}</p>
            <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${style.badge}`}>
              {STATUS_LABEL[delivery.status]}
            </span>
          </div>
          <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
            <span className="flex min-w-0 items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-brand" />
              <span className="truncate">{delivery.pickup?.address}</span>
            </span>
            <span className="flex min-w-0 items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-emerald-500" />
              <span className="truncate">{delivery.dropoff?.address}</span>
            </span>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> {booked ?? 'Not recorded'}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <RouteIcon className="h-3.5 w-3.5" /> {delivery.distanceKm} km
            </span>
            <span className="inline-flex items-center gap-1.5 font-bold text-[#102A6B]">
              <ReceiptText className="h-3.5 w-3.5" /> NGN {delivery.price}
            </span>
          </div>
        </div>
        <ChevronRight className="mt-3 h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-brand" />
      </div>
    </button>
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
        <p className="text-lg font-semibold text-[#102A6B]">NGN {d.price}</p>
      </div>

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
                <p className={`text-sm font-semibold ${step.done ? 'text-[#102A6B]' : 'text-slate-400'}`}>{step.label}</p>
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
          <p className="mt-2 text-sm font-semibold text-[#102A6B]">{d.pickup?.address}</p>
        </div>
        <div className="rounded-3xl bg-slate-50 p-5">
          <p className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-400">
            <MapPin className="h-3.5 w-3.5" /> Drop-off
          </p>
          <p className="mt-2 text-sm font-semibold text-[#102A6B]">{d.dropoff?.address}</p>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-5 shadow-sm">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Detail icon={Package} label="Package" value={d.packageType} />
          {d.weightKg != null && <Detail icon={Scale} label="Weight" value={`${d.weightKg} kg`} />}
          <Detail icon={RouteIcon} label="Distance" value={`${d.distanceKm} km`} />
          <Detail icon={Clock} label="ETA" value={d.etaMinutes != null ? `${d.etaMinutes} min` : 'Not set'} />
        </div>
      </div>
    </div>
  )
}

function Detail({ icon: Icon, label, value }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-[#102A6B]">
        <Icon className="h-3.5 w-3.5 text-slate-400" /> {value}
      </p>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, tone }) {
  return (
    <div className="min-w-[112px] flex-1 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className={`inline-flex h-9 w-9 items-center justify-center rounded-2xl ${tone}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-3 text-2xl font-semibold text-[#102A6B]">{value}</p>
      <p className="mt-1 text-xs font-medium uppercase tracking-widest text-slate-500">{label}</p>
    </div>
  )
}
