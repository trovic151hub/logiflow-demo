import { Link } from 'react-router-dom'
import { Wallet, MapPin, CheckCircle } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { useRequireAuth } from '@/lib/use-require-auth'
import { useStore, STATUS_LABEL } from '@/lib/mock-store'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function CustomerDashboard() {
  const user = useRequireAuth('customer')
  const deliveries = useStore((s) => (user ? s.deliveries.filter((d) => d.customerId === user.id) : []))
  const active = deliveries.filter((d) => d.status !== 'delivered' && d.status !== 'cancelled')

  if (!user) return null

  return (
    <AppShell>
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 max-w-7xl mx-auto">
        <section className="lg:col-span-4 space-y-6">
          <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
            <h2 className="font-display text-xl font-bold">
              {getGreeting()}, {user.name.split(' ')[0]}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {active.length > 0
                ? `You have ${active.length} active deliver${active.length === 1 ? 'y' : 'ies'}`
                : 'Ready to send something across town?'}
            </p>
            <Link
              to="/customer/book"
              className="mt-6 inline-flex w-full justify-center rounded-xl bg-brand py-3 font-bold text-white shadow-lg shadow-brand/20 hover:bg-brand-hover"
            >
              + Book new delivery
            </Link>
          </div>

          <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider text-slate-400">
              Stats
            </h3>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="font-display text-2xl font-bold">{deliveries.length}</p>
                <p className="text-xs text-slate-500">Total deliveries</p>
              </div>
              <div>
                <p className="font-display text-2xl font-bold">{active.length}</p>
                <p className="text-xs text-slate-500">In progress</p>
              </div>
            </div>
          </div>
        </section>

        <section className="lg:col-span-8 space-y-6">
          <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                Active deliveries
                {active.length > 0 && (
                  <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold text-white">
                    {active.length}
                  </span>
                )}
              </h3>
              <Link to="/customer/history" className="text-xs font-bold text-brand hover:underline">
                View all →
              </Link>
            </div>
            {active.length === 0 ? (
              <p className="text-sm text-slate-500 py-8 text-center">
                No active deliveries. Book one to get started.
              </p>
            ) : (
              <ul className="divide-y divide-surface-200">
                {active.map((d) => (
                  <li key={d.id} className="py-4 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-bold">{d.id}</p>
                      <p className="text-xs text-slate-500 truncate">
                        {d.pickup.address} → {d.dropoff.address}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="rounded-full bg-brand/10 px-3 py-1 text-[10px] font-bold uppercase text-brand">
                        {STATUS_LABEL[d.status]}
                      </span>
                      <Link
                        to={'/customer/track/' + d.id}
                        className="rounded-lg bg-navy px-3 py-1.5 text-xs font-bold text-white hover:bg-brand"
                      >
                        Track
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              label="This month"
              value={`₦${deliveries.reduce((a, d) => a + d.price, 0)}`}
              sub="spent"
              Icon={Wallet}
            />
            <StatCard
              label="Avg delivery"
              value={`${Math.round((deliveries.reduce((a, d) => a + d.distanceKm, 0) / Math.max(deliveries.length, 1)) * 10) / 10} km`}
              sub="distance"
              Icon={MapPin}
            />
            <StatCard
              label="Completed"
              value={`${deliveries.filter((d) => d.status === 'delivered').length}`}
              sub="orders"
              Icon={CheckCircle}
            />
          </div>
        </section>
      </main>
    </AppShell>
  )
}

function StatCard({ label, value, sub, Icon }) {
  return (
    <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
        {Icon && <Icon className="h-4 w-4 text-slate-300" />}
      </div>
      <p className="mt-1 font-display text-2xl font-bold">{value}</p>
      <p className="mt-2 text-xs text-slate-400">{sub}</p>
    </div>
  )
}
