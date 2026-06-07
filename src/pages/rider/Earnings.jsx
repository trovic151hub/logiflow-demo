import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Wallet, Package, TrendingUp } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { useRequireAuth } from '@/lib/use-require-auth'
import { useStore } from '@/lib/mock-store'

export default function Earnings() {
  const user = useRequireAuth('rider')
  const navigate = useNavigate()
  const completed = useStore((s) =>
    user ? s.deliveries.filter((d) => d.riderId === user.id && d.status === 'delivered') : [],
  )
  if (!user) return null

  const total = completed.reduce((a, d) => a + d.price, 0)
  const avg = completed.length ? Math.round(total / completed.length) : 0

  return (
    <AppShell>
      <main className="p-6 max-w-6xl mx-auto">
        <button
          onClick={() => navigate('/rider')}
          className="mb-4 flex items-center gap-1 text-sm text-slate-500 hover:text-navy transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </button>

        <h1 className="font-display text-3xl font-bold">Earnings</h1>
        <p className="mt-2 text-sm text-slate-500">Your completed deliveries and payouts.</p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Total earned" value={`₦${total}`} sub="all time" highlight Icon={Wallet} />
          <StatCard label="Deliveries" value={`${completed.length}`} sub="completed" Icon={Package} />
          <StatCard label="Avg per trip" value={`₦${avg}`} sub="payout" Icon={TrendingUp} />
        </div>

        <div className="mt-8 rounded-2xl border border-surface-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-100 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="text-left px-4 sm:px-6 py-3 font-bold">Order</th>
                  <th className="hidden sm:table-cell text-left px-6 py-3 font-bold">Route</th>
                  <th className="hidden sm:table-cell text-left px-6 py-3 font-bold">Distance</th>
                  <th className="text-right px-4 sm:px-6 py-3 font-bold">Payout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200">
                {completed.map((d) => (
                  <tr key={d.id}>
                    <td className="px-4 sm:px-6 py-4 font-bold">{d.id}</td>
                    <td className="hidden sm:table-cell px-6 py-4 text-slate-600 max-w-xs truncate">{d.pickup.address} → {d.dropoff.address}</td>
                    <td className="hidden sm:table-cell px-6 py-4 text-slate-600">{d.distanceKm} km</td>
                    <td className="px-4 sm:px-6 py-4 text-right font-bold text-success">+₦{d.price}</td>
                  </tr>
                ))}
                {completed.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-slate-500">
                      No completed deliveries yet. Accept a job to start earning.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </AppShell>
  )
}

function StatCard({ label, value, sub, highlight, Icon }) {
  return (
    <div
      className={`rounded-2xl p-6 shadow-sm border ${
        highlight ? 'bg-navy text-white border-navy' : 'bg-white border-surface-200'
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <p className={`text-xs font-bold uppercase tracking-wider ${highlight ? 'text-white/60' : 'text-slate-400'}`}>
          {label}
        </p>
        {Icon && <Icon className={`h-4 w-4 ${highlight ? 'text-white/40' : 'text-slate-300'}`} />}
      </div>
      <p className="mt-1 font-display text-2xl font-bold">{value}</p>
      <p className={`mt-2 text-xs ${highlight ? 'text-white/60' : 'text-slate-400'}`}>{sub}</p>
    </div>
  )
}
