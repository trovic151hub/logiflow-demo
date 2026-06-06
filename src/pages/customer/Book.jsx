import { useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { MapPin, Zap, Package, Leaf, ArrowLeft } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { useRequireAuth } from '@/lib/use-require-auth'
import { createDelivery } from '@/lib/mock-store'

const LAGOS = { lat: 6.5244, lng: 3.3792 }

function randomNear(base, spread = 0.08) {
  return { lat: base.lat + (Math.random() - 0.5) * spread, lng: base.lng + (Math.random() - 0.5) * spread }
}

function distance(a, b) {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}

const PACKAGE_TYPES = [
  { id: 'Express', label: 'Express', description: 'Fast delivery', Icon: Zap, surcharge: 4, color: 'text-yellow-500' },
  { id: 'Cargo', label: 'Cargo', description: 'Heavy items', Icon: Package, surcharge: 8, color: 'text-blue-500' },
  { id: 'Electric', label: 'Electric', description: 'Eco-friendly', Icon: Leaf, surcharge: 2, color: 'text-green-500' },
]

export default function Book() {
  const user = useRequireAuth('customer')
  const navigate = useNavigate()
  const [pickup, setPickup] = useState('Lekki Phase 1')
  const [dropoff, setDropoff] = useState('Victoria Island')
  const [pkg, setPkg] = useState('Express')
  const [note, setNote] = useState('')

  const pickupCoords = useMemo(() => randomNear(LAGOS), [])
  const dropoffCoords = useMemo(() => randomNear(LAGOS), [])
  const km = useMemo(() => Math.round(distance(pickupCoords, dropoffCoords) * 10) / 10, [pickupCoords, dropoffCoords])
  const selectedType = PACKAGE_TYPES.find((p) => p.id === pkg)
  const price = Math.round(km * 3 + selectedType.surcharge)
  const eta = Math.max(5, Math.round(km * 4))

  if (!user) return null

  function handleSubmit(e) {
    e.preventDefault()
    const d = createDelivery({
      customerId: user.id,
      customerName: user.name,
      pickup: { address: pickup, coords: pickupCoords },
      dropoff: { address: dropoff, coords: dropoffCoords },
      packageType: pkg,
    })
    navigate('/customer/track/' + d.id)
  }

  return (
    <AppShell>
      <main className="p-6 max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/customer')}
          className="mb-4 flex items-center gap-1 text-sm text-slate-500 hover:text-navy transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </button>

        <h1 className="font-display text-3xl font-bold">Book a delivery</h1>
        <p className="mt-2 text-sm text-slate-500">Fastest last-mile logistics across the city.</p>

        <form onSubmit={handleSubmit} className="mt-8 rounded-2xl border border-surface-200 bg-white p-6 shadow-sm space-y-5">

          {/* Pickup */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Pickup location</label>
            <div className="flex items-center gap-3 rounded-xl border border-surface-200 bg-surface-100 px-4 py-3">
              <MapPin className="h-4 w-4 shrink-0 text-brand" />
              <input
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                required
                placeholder="Enter pickup address"
                className="w-full bg-transparent text-sm font-medium outline-none"
              />
            </div>
          </div>

          {/* Dropoff */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Dropoff point</label>
            <div className="flex items-center gap-3 rounded-xl border border-surface-200 bg-surface-100 px-4 py-3">
              <MapPin className="h-4 w-4 shrink-0 text-success" />
              <input
                value={dropoff}
                onChange={(e) => setDropoff(e.target.value)}
                required
                placeholder="Where to?"
                className="w-full bg-transparent text-sm font-medium outline-none"
              />
            </div>
          </div>

          {/* Package type */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Package type</label>
            <div className="grid grid-cols-3 gap-2">
              {PACKAGE_TYPES.map(({ id, label, description, Icon, surcharge, color }) => {
                const selected = pkg === id
                const optPrice = Math.round(km * 3 + surcharge)
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setPkg(id)}
                    className={`flex flex-col items-center gap-2 rounded-xl p-3 transition-colors ${
                      selected ? 'border-2 border-brand bg-brand/5' : 'border border-surface-200 hover:border-brand/30'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${selected ? color : 'text-slate-400'}`} />
                    <span className={`text-[10px] font-bold uppercase ${selected ? 'text-navy' : 'text-slate-400'}`}>{label}</span>
                    <span className="text-[10px] text-slate-400">{description}</span>
                    <span className="text-sm font-bold">₦{optPrice}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Note for rider */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Note for rider <span className="normal-case font-normal text-slate-400">(optional)</span>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder='e.g. "Call on arrival" or "Leave at the gate"'
              rows={2}
              className="w-full rounded-xl border border-surface-200 bg-surface-100 px-4 py-3 text-sm outline-none resize-none placeholder:text-slate-400 focus:border-brand/50"
            />
          </div>

          {/* Summary */}
          <div className="rounded-xl bg-surface-100 p-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-slate-500">Distance</p>
              <p className="font-display font-bold">{km} km</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">ETA</p>
              <p className="font-display font-bold">{eta} min</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Total</p>
              <p className="font-display font-bold text-brand">₦{price}</p>
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-brand py-4 font-bold text-white shadow-lg shadow-brand/20 hover:bg-brand-hover active:scale-[0.98] transition-all"
          >
            Confirm order
          </button>
        </form>
      </main>
    </AppShell>
  )
}
