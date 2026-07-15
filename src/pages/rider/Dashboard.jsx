import { Link, useNavigate } from 'react-router-dom'
import { Package, Zap, Leaf, MapPin, Clock, Briefcase, Star, Trophy, AlertCircle, ChevronRight } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { useRequireAuth } from '@/lib/use-require-auth'
import { useStore, updateDeliveryStatus, STATUS_LABEL } from '@/lib/mock-store'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function PackageIcon({ type }) {
  if (type === 'Express') return <Zap className="h-3.5 w-3.5 text-brand" />
  if (type === 'Cargo') return <Package className="h-3.5 w-3.5 text-orange-400" />
  return <Leaf className="h-3.5 w-3.5 text-green-500" />
}

export default function RiderDashboard() {
  const user = useRequireAuth('rider')
  const navigate = useNavigate()
  const incoming = useStore((s) => s.deliveries.filter((d) => d.status === 'pending'))
  const myJobs = useStore((s) =>
    user ? s.deliveries.filter((d) => d.riderId === user.id && d.status !== 'delivered') : [],
  )
  const completed = useStore((s) =>
    user ? s.deliveries.filter((d) => d.riderId === user.id && d.status === 'delivered') : [],
  )
  const todayEarnings = completed.reduce((a, d) => a + d.price, 0)

  if (!user) return null

  const paymentIncomplete =
    !user.vehicleType || !user.plateNumber || !user.licenseNumber || !user.nin || !user.bankName || !user.accountNumber

  function accept(id) {
    updateDeliveryStatus(id, 'accepted', user.id, user.name)
    navigate('/rider/job/' + id)
  }

  function reject(id) {
    updateDeliveryStatus(id, 'cancelled')
  }

  return (
    <AppShell>
      <main className="p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {paymentIncomplete && (
          <Link
            to="/rider/account"
            className="lg:col-span-12 flex items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-800 transition hover:bg-amber-100"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <div>
                <p className="text-sm font-bold">Complete your payment & verification details</p>
                <p className="text-xs text-amber-700">Add your vehicle, license, and bank details to start receiving payouts.</p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0" />
          </Link>
        )}

        <section className="lg:col-span-4 space-y-6">
          <div className="rounded-2xl border border-surface-200 bg-navy text-white p-6 shadow-lg">
            <p className="text-xs font-bold uppercase tracking-wider text-white/60">Today&apos;s earnings</p>
            <p className="mt-1 font-display text-4xl font-bold">₦{todayEarnings}</p>
            <p className="mt-2 text-xs text-success font-medium">+ {completed.length} deliveries completed</p>
          </div>

          <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-500">
                <Briefcase className="h-4 w-4 text-slate-300" />
                <p className="text-xs">Active jobs</p>
              </div>
              <p className="font-display font-bold">{myJobs.length}</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-500">
                <Star className="h-4 w-4 text-slate-300" />
                <p className="text-xs">Rating</p>
              </div>
              <p className="font-display font-bold">{user.rating ?? 5}</p>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-500">
                <Trophy className="h-4 w-4 text-slate-300" />
                <p className="text-xs">Total trips</p>
              </div>
              <p className="font-display font-bold">{user.trips ?? 0}</p>
            </div>
          </div>

          {myJobs.length > 0 && (
            <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
              <h3 className="font-display text-sm font-bold uppercase tracking-wider mb-4">Your active jobs</h3>
              <ul className="space-y-3">
                {myJobs.map((d) => (
                  <li key={d.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold">{d.id}</p>
                      <p className="text-xs text-slate-500">{STATUS_LABEL[d.status]}</p>
                    </div>
                    <Link
                      to={'/rider/job/' + d.id}
                      className="rounded-lg bg-brand px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-hover"
                    >
                      Open
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section className="lg:col-span-8">
          <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display text-xl font-bold">
                  {getGreeting()}, {user.name.split(' ')[0]}
                </h2>
                <p className="text-sm text-slate-500">
                  {incoming.length} job{incoming.length !== 1 ? 's' : ''} available nearby
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-success animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Online</span>
              </div>
            </div>

            {incoming.length === 0 ? (
              <p className="text-center text-slate-500 py-12">No incoming requests right now.</p>
            ) : (
              <ul className="space-y-4">
                {incoming.map((d) => (
                  <li
                    key={d.id}
                    className="rounded-xl border border-surface-200 p-4 hover:border-brand transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <PackageIcon type={d.packageType} />
                          <span className="text-xs font-bold">{d.packageType}</span>
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />{d.distanceKm} km
                          </span>
                        </div>
                        <p className="mt-2 text-sm font-bold">{d.id}</p>
                        <p className="text-xs text-slate-500">{d.pickup.address} → {d.dropoff.address}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-xl font-bold text-brand">₦{d.price}</p>
                        <p className="text-[10px] text-slate-400 flex items-center justify-end gap-1">
                          <Clock className="h-3 w-3" />{d.etaMinutes}m
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => reject(d.id)}
                        className="px-4 py-2 rounded-lg border border-surface-200 text-xs font-bold text-slate-500 hover:bg-surface-100"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => accept(d.id)}
                        className="flex-1 rounded-lg bg-navy py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-brand"
                      >
                        Accept job
                      </button>
                    </div>
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
