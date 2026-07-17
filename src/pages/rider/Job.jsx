import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ArrowLeft, MapPin, User } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { DeliveryMap } from '@/components/delivery-map'
import { useRequireAuth } from '@/lib/use-require-auth'
import { useStore, updateDeliveryStatus, advanceCourier, STATUS_LABEL } from '@/lib/mock-store'

const NEXT = {
  accepted: { next: 'picked_up', label: 'Mark as picked up' },
  picked_up: { next: 'in_transit', label: 'Start trip' },
  in_transit: { next: 'delivered', label: 'Mark delivered' },
}

export default function RiderJob() {
  const user = useRequireAuth('rider')
  const navigate = useNavigate()
  const { id } = useParams()

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1)
    } else {
      navigate('/rider')
    }
  }
  const delivery = useStore((s) => s.deliveries.find((d) => d.id === id))
  const [autoMove, setAutoMove] = useState(true)

  useEffect(() => {
    if (!delivery || delivery.status !== 'in_transit' || !autoMove) return
    let frac = 0
    const iv = setInterval(() => {
      frac += 0.05
      if (frac >= 1) {
        clearInterval(iv)
      } else {
        advanceCourier(id, frac)
      }
    }, 1500)
    return () => clearInterval(iv)
  }, [delivery?.status, id, autoMove])

  if (!user) return null
  if (!delivery)
    return (
      <AppShell>
        <main className="p-12 text-center text-slate-500">Job not found.</main>
      </AppShell>
    )

  const nextStep = NEXT[delivery.status]

  return (
    <AppShell>
      <main className="p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-8 h-[50vh] sm:h-[60vh] lg:h-[70vh]">
          <DeliveryMap
            pickup={delivery.pickup.coords}
            dropoff={delivery.dropoff.coords}
            courier={delivery.courierPosition}
            className="h-full"
          />
        </section>

        <aside className="lg:col-span-4 space-y-6">
          <button
            type="button"
            onClick={handleBack}
            aria-label="Go back"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Job</p>
            <h2 className="mt-1 font-display text-2xl font-bold">{delivery.id}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {delivery.packageType} · {delivery.distanceKm} km · ₦{delivery.price}
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-blue-600" /> Pickup
                </p>
                <p className="mt-0.5 text-sm font-medium">{delivery.pickup.address}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-emerald-600" /> Dropoff
                </p>
                <p className="mt-0.5 text-sm font-medium">{delivery.dropoff.address}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <User className="h-3 w-3" /> Customer
                </p>
                <p className="mt-0.5 text-sm font-medium">{delivery.customerName}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Current status</p>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase text-blue-600">
                {STATUS_LABEL[delivery.status]}
              </span>
            </div>

            {nextStep ? (
              <button
                onClick={() => {
                  updateDeliveryStatus(id, nextStep.next)
                  if (nextStep.next === 'in_transit') setAutoMove(true)
                }}
                className="w-full rounded-xl bg-blue-600 py-3 font-bold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500"
              >
                {nextStep.label}
              </button>
            ) : delivery.status === 'delivered' ? (
              <div>
                <p className="text-sm text-emerald-600 font-bold">✓ Delivered successfully</p>
                <button
                  onClick={() => navigate('/rider')}
                  className="mt-4 w-full rounded-xl bg-slate-900 py-3 font-bold text-white hover:bg-blue-600"
                >
                  Back to dashboard
                </button>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No action available.</p>
            )}
          </div>
        </aside>
      </main>
    </AppShell>
  )
}
