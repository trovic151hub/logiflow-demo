import { Link, useNavigate } from 'react-router-dom'
import { Briefcase, Star, Trophy, AlertCircle, ChevronRight } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { TripCard } from '@/components/trip-card'
import { useRequireAuth } from '@/lib/use-require-auth'
import { useStore, updateDeliveryStatus } from '@/lib/mock-store'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
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
          <div className="rounded-2xl border border-surface-200 bg-slate-900 text-white p-6 shadow-lg">
            <p className="text-xs font-bold uppercase tracking-wider text-white/60">Today&apos;s earnings</p>
            <p className="mt-1 font-display text-4xl font-bold">₦{todayEarnings}</p>
            <p className="mt-2 text-xs text-emerald-400 font-medium">+ {completed.length} deliveries completed</p>
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
            <div>
              <h3 className="font-display text-sm font-bold uppercase tracking-wider mb-4 px-1">Your active jobs</h3>
              <div className="space-y-3">
                {myJobs.map((d) => (
                  <TripCard key={d.id} delivery={d} actionLabel="Open" actionTo={'/rider/job/' + d.id} />
                ))}
              </div>
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
                <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Online</span>
              </div>
            </div>

            {incoming.length === 0 ? (
              <p className="text-center text-slate-500 py-12">No incoming requests right now.</p>
            ) : (
              <div className="space-y-4">
                {incoming.map((d) => (
                  <TripCard
                    key={d.id}
                    delivery={d}
                    onAction={() => accept(d.id)}
                    onSecondary={() => reject(d.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </AppShell>
  )
}
