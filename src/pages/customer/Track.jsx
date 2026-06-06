import { Link, useParams, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Phone, X, CheckCircle, ArrowLeft, ClipboardList, UserCheck, Package, Truck } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { DeliveryMap } from '@/components/delivery-map'
import { useRequireAuth } from '@/lib/use-require-auth'
import { useStore, advanceCourier, updateDeliveryStatus, STATUS_LABEL } from '@/lib/mock-store'

export default function Track() {
  const user = useRequireAuth('customer')
  const { id } = useParams()
  const navigate = useNavigate()
  const delivery = useStore((s) => s.deliveries.find((d) => d.id === id))

  useEffect(() => {
    if (!delivery) return
    if (delivery.status === 'cancelled') return
    if (delivery.status === 'pending') {
      const t = setTimeout(() => updateDeliveryStatus(id, 'accepted', 'u-rider-1', 'Marcus Chen'), 2500)
      return () => clearTimeout(t)
    }
    if (delivery.status === 'accepted') {
      const t = setTimeout(() => updateDeliveryStatus(id, 'picked_up'), 3000)
      return () => clearTimeout(t)
    }
    if (delivery.status === 'picked_up') {
      const t = setTimeout(() => updateDeliveryStatus(id, 'in_transit'), 2000)
      return () => clearTimeout(t)
    }
    if (delivery.status === 'in_transit') {
      let frac = 0
      const iv = setInterval(() => {
        frac += 0.05
        if (frac >= 1) {
          clearInterval(iv)
          updateDeliveryStatus(id, 'delivered')
        } else {
          advanceCourier(id, frac)
        }
      }, 1500)
      return () => clearInterval(iv)
    }
  }, [delivery?.status, id])

  if (!user) return null
  if (!delivery)
    return (
      <AppShell>
        <main className="p-12 text-center text-slate-500">Delivery not found.</main>
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
    updateDeliveryStatus(id, 'cancelled')
  }

  return (
    <AppShell>
      <main className="p-6 max-w-7xl mx-auto">
        <button
          onClick={() => navigate('/customer')}
          className="mb-4 flex items-center gap-1 text-sm text-slate-500 hover:text-navy transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </button>

        {/* Delivered banner */}
        {isDelivered && (
          <div className="mb-6 flex items-center gap-4 rounded-2xl bg-success/10 border border-success/20 p-5">
            <CheckCircle className="h-8 w-8 shrink-0 text-success" />
            <div>
              <p className="font-bold text-success text-lg">Package delivered!</p>
              <p className="text-sm text-slate-600 mt-0.5">Your delivery has been completed successfully.</p>
            </div>
          </div>
        )}

        {/* Cancelled banner */}
        {isCancelled && (
          <div className="mb-6 flex items-center gap-4 rounded-2xl bg-red-50 border border-red-200 p-5">
            <X className="h-8 w-8 shrink-0 text-red-500" />
            <div>
              <p className="font-bold text-red-600 text-lg">Order cancelled</p>
              <p className="text-sm text-slate-600 mt-0.5">This delivery has been cancelled.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <section className="lg:col-span-8 relative h-[70vh]">
            <DeliveryMap
              pickup={delivery.pickup.coords}
              dropoff={delivery.dropoff.coords}
              courier={delivery.courierPosition}
              className="h-full"
            />
            <div className="absolute top-6 left-6 flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-xl ring-1 ring-black/5">
              <div className={`size-2 rounded-full ${isCancelled ? 'bg-red-400' : isDelivered ? 'bg-success' : 'bg-success animate-pulse'}`} />
              <span className="text-xs font-bold">Live · {delivery.id}</span>
            </div>
          </section>

          <aside className="lg:col-span-4 space-y-6">
            {/* Status card */}
            <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Status</p>
              <p className={`mt-1 font-display text-2xl font-bold ${isCancelled ? 'text-red-500' : isDelivered ? 'text-success' : 'text-brand'}`}>
                {STATUS_LABEL[delivery.status]}
              </p>
              {!isDelivered && !isCancelled && (
                <p className="mt-1 text-sm text-slate-500">ETA · {delivery.etaMinutes} min</p>
              )}

              {!isCancelled && (
                <ol className="mt-6 space-y-3">
                  {steps.map((s, i) => {
                    const done = i <= currentIdx
                    const isCurrent = i === currentIdx && !isDelivered
                    const { Icon } = s
                    return (
                      <li key={s.key} className="flex items-center gap-3">
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors ${
                            done
                              ? isDelivered
                                ? 'bg-success text-white'
                                : 'bg-brand text-white'
                              : 'bg-surface-200 text-slate-400'
                          } ${isCurrent ? 'ring-4 ring-brand/20' : ''}`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        <span className={`text-sm ${done ? 'font-bold text-navy' : 'text-slate-400'}`}>{s.label}</span>
                      </li>
                    )
                  })}
                </ol>
              )}
            </div>

            {/* Courier card */}
            <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Your courier</p>
              <div className="mt-3 flex items-center gap-4">
                <div className="size-12 rounded-xl bg-brand/10 flex items-center justify-center font-bold text-brand">
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
                    className="flex items-center justify-center size-10 rounded-full bg-success/10 text-success hover:bg-success/20 transition-colors"
                    title="Contact rider"
                    onClick={() => alert('In a real app, this would open a chat or call the rider.')}
                  >
                    <Phone className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Delivery details card */}
            <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm space-y-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">From</p>
                <p className="text-sm font-medium">{delivery.pickup.address}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">To</p>
                <p className="text-sm font-medium">{delivery.dropoff.address}</p>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-surface-200">
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
          </aside>
        </div>
      </main>
    </AppShell>
  )
}
