import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { useRequireAuth } from '@/lib/use-require-auth'
import { useStore, STATUS_LABEL } from '@/lib/mock-store'

export default function History() {
  const user = useRequireAuth('customer')
  const navigate = useNavigate()
  const deliveries = useStore((s) => (user ? s.deliveries.filter((d) => d.customerId === user.id) : []))
  if (!user) return null

  return (
    <AppShell>
      <main className="p-6 max-w-6xl mx-auto">
        <button
          onClick={() => navigate('/customer')}
          className="mb-4 flex items-center gap-1 text-sm text-slate-500 hover:text-navy transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </button>

        <h1 className="font-display text-3xl font-bold">Delivery history</h1>
        <p className="mt-2 text-sm text-slate-500">All your past and current deliveries.</p>

        <div className="mt-8 rounded-2xl border border-surface-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-100 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="text-left px-4 sm:px-6 py-3 font-bold">Order</th>
                  <th className="hidden sm:table-cell text-left px-6 py-3 font-bold">Route</th>
                  <th className="hidden sm:table-cell text-left px-6 py-3 font-bold">Type</th>
                  <th className="text-left px-4 sm:px-6 py-3 font-bold">Status</th>
                  <th className="text-right px-4 sm:px-6 py-3 font-bold">Price</th>
                  <th></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-200">
                {deliveries.map((d) => (
                  <tr key={d.id} className="hover:bg-surface-100">
                    <td className="px-4 sm:px-6 py-4 font-bold">{d.id}</td>
                    <td className="hidden sm:table-cell px-6 py-4 text-slate-600 max-w-xs truncate">{d.pickup.address} → {d.dropoff.address}</td>
                    <td className="hidden sm:table-cell px-6 py-4 text-slate-600">{d.packageType}</td>
                    <td className="px-4 sm:px-6 py-4">
                      <span className="rounded-full bg-brand/10 px-3 py-1 text-[10px] font-bold uppercase text-brand">
                        {STATUS_LABEL[d.status]}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-right font-bold">₦{d.price}</td>
                    <td className="px-4 sm:px-6 py-4 text-right">
                      <Link
                        to={'/customer/track/' + d.id}
                        className="text-xs font-bold text-brand hover:underline"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
                {deliveries.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                      No deliveries yet.{' '}
                      <Link to="/customer/book" className="text-brand font-bold hover:underline">
                        Book one
                      </Link>
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
