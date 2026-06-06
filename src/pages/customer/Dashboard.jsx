import { Link } from 'react-router-dom'
import { Wallet, MapPin, CheckCircle, Package, Gift, PackagePlus, History, Clock } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { useRequireAuth } from '@/lib/use-require-auth'
import { useStore, STATUS_LABEL } from '@/lib/mock-store'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

const QUICK_ACTIONS = [
  { label: 'Send Package', Icon: PackagePlus, to: '/customer/book',    color: 'bg-brand' },
  { label: 'Track Order',  Icon: MapPin,      to: '/customer/history', color: 'bg-purple-500' },
  { label: 'History',      Icon: History,     to: '/customer/history', color: 'bg-success' },
  { label: 'Schedule',     Icon: Clock,       to: '/customer/book',    color: 'bg-orange-400' },
]

export default function CustomerDashboard() {
  const user = useRequireAuth('customer')
  const deliveries = useStore((s) => (user ? s.deliveries.filter((d) => d.customerId === user.id) : []))
  const active = deliveries.filter((d) => d.status !== 'delivered' && d.status !== 'cancelled')
  const completed = deliveries.filter((d) => d.status === 'delivered')

  if (!user) return null

  return (
    <AppShell>
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 max-w-7xl mx-auto">

        {/* Left sidebar */}
        <section className="lg:col-span-4 space-y-6">
          {/* Welcome card */}
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

          {/* Gradient stat cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-gradient-to-br from-brand to-blue-400 p-4 text-white shadow-lg">
              <Package className="h-5 w-5 opacity-80" />
              <p className="mt-3 font-display text-3xl font-bold">{active.length}</p>
              <p className="mt-1 text-xs text-white/70">Active Orders</p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-green-400 p-4 text-white shadow-lg">
              <CheckCircle className="h-5 w-5 opacity-80" />
              <p className="mt-3 font-display text-3xl font-bold">{completed.length}</p>
              <p className="mt-1 text-xs text-white/70">Completed</p>
            </div>
          </div>
        </section>

        {/* Right main column */}
        <section className="lg:col-span-8 space-y-6">
          {/* Promo banner */}
          <div className="rounded-2xl bg-gradient-to-r from-brand to-blue-400 p-5 text-white shadow-lg overflow-hidden">
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-400 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider mb-2">
                  <Gift className="h-3 w-3" /> Limited Offer
                </span>
                <p className="font-display text-lg font-bold">Get 20% Off</p>
                <p className="text-sm text-white/70 mt-0.5">On your next 3 deliveries</p>
              </div>
              <button className="shrink-0 rounded-full bg-white px-4 py-1.5 text-xs font-bold text-brand hover:bg-white/90 transition-colors">
                Claim Now
              </button>
            </div>
          </div>

          {/* Active deliveries */}
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

          {/* Quick Actions */}
          <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
            <h3 className="font-display text-sm font-bold uppercase tracking-wider mb-5">Quick Actions</h3>
            <div className="grid grid-cols-4 gap-3">
              {QUICK_ACTIONS.map(({ label, Icon, to, color }) => (
                <Link key={label} to={to} className="flex flex-col items-center gap-2 group">
                  <div className={`${color} flex h-14 w-14 items-center justify-center rounded-2xl shadow-md group-hover:scale-105 transition-transform`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xs font-medium text-slate-600 text-center leading-tight">{label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Bottom stat cards */}
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
              value={`${completed.length}`}
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
