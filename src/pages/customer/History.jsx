import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { ArrowLeft, Clock, Package, FileText, CheckCircle } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useRequireAuth } from '@/lib/use-require-auth'
import { useStore, STATUS_LABEL } from '@/lib/mock-store'

export default function History() {
  const user = useRequireAuth()
  const navigate = useNavigate()
  const deliveries = useStore((s) => (user ? s.deliveries.filter((d) => d.customerId === user.id) : []))
  const [activeDelivery, setActiveDelivery] = useState(null)
  const [open, setOpen] = useState(false)

  if (!user) return null

  const pending = deliveries.filter((d) => d.status === 'pending')
  const active = deliveries.filter((d) => d.status !== 'delivered')
  const completed = deliveries.filter((d) => d.status === 'delivered')

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
      <main className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
        <button
          onClick={() => navigate('/customer')}
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-navy transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </button>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">Delivery history</h1>
            <p className="mt-2 text-sm text-slate-500">Browse current shipments, pending deliveries, and invoice-ready orders.</p>
          </div>
          <Link
            to="/customer/book"
            className="inline-flex items-center justify-center rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand/20 hover:bg-brand-hover"
          >
            + Book new delivery
          </Link>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <StatCard icon={Package} label="Pending shipments" value={pending.length} tone="bg-orange-500/10 text-orange-600" />
              <StatCard icon={Clock} label="Current deliveries" value={active.length} tone="bg-brand/10 text-brand" />
              <StatCard icon={CheckCircle} label="Completed" value={completed.length} tone="bg-emerald-500/10 text-emerald-600" />
            </div>

            <div className="rounded-[32px] border border-slate-200 bg-white shadow-sm">
              <div className="px-6 py-5 border-b border-slate-200">
                <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Your shipments</h2>
                <p className="mt-2 text-sm text-slate-500">Tap a row to view invoice details or jump into tracking.</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="text-left px-6 py-5 font-semibold text-slate-900">Order</th>
                      <th className="hidden sm:table-cell text-left px-6 py-5 font-semibold text-slate-900">Route</th>
                      <th className="hidden md:table-cell text-left px-6 py-5 font-semibold text-slate-900">Type</th>
                      <th className="text-left px-6 py-5 font-semibold text-slate-900">Status</th>
                      <th className="text-right px-6 py-5 font-semibold text-slate-900">Price</th>
                      <th className="px-6 py-5" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {deliveries.map((d) => (
                      <tr
                        key={d.id}
                        onClick={() => openInvoice(d)}
                        className="cursor-pointer bg-white hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-5 font-semibold text-slate-900">{d.id}</td>
                        <td className="hidden sm:table-cell px-6 py-5 text-slate-600">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="truncate">{d.pickup.address}</span>
                            <span className="text-slate-400 flex-shrink-0">→</span>
                            <span className="truncate">{d.dropoff.address}</span>
                          </div>
                        </td>
                        <td className="hidden md:table-cell px-6 py-5 text-slate-600 font-medium">{d.packageType}</td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex rounded-full px-3 py-1 text-[10px] font-semibold uppercase ${
                            d.status === 'pending'
                              ? 'bg-orange-100 text-orange-700'
                              : d.status === 'delivered'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-brand/10 text-brand'
                          }`}>
                            {STATUS_LABEL[d.status]}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right font-semibold text-slate-900">₦{d.price}</td>
                        <td className="px-6 py-5 text-right text-brand font-semibold text-sm hover:underline">View</td>
                      </tr>
                    ))}
                    {deliveries.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-14 text-center text-slate-500">
                          No deliveries yet.{' '}
                          <Link to="/customer/book" className="text-brand font-semibold hover:underline">
                            Book one now
                          </Link>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-[32px] border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Pending shipments</p>
              <p className="mt-3 text-sm text-slate-600">Orders waiting for confirmation or pickup are listed here.</p>
              <div className="mt-5 space-y-4">
                {pending.slice(0, 3).map((delivery) => (
                  <div key={delivery.id} className="rounded-[24px] bg-white p-4 shadow-sm">
                    <p className="text-sm font-semibold text-slate-900">{delivery.id}</p>
                    <p className="mt-2 text-xs text-slate-500">{delivery.pickup.address} → {delivery.dropoff.address}</p>
                    <p className="mt-3 text-xs uppercase tracking-[0.2em] text-orange-500">{STATUS_LABEL[delivery.status]}</p>
                  </div>
                ))}
                {pending.length === 0 && <p className="text-sm text-slate-500">You have no pending shipments right now.</p>}
              </div>
            </div>

            <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Invoice help</p>
              <p className="mt-3 text-sm text-slate-600">Click any row to open a detailed invoice modal with a tracking CTA for that order.</p>
            </div>
          </aside>
        </div>

        <Dialog open={open} onOpenChange={(value) => setOpen(value)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{activeDelivery?.trackingId ?? 'Shipment invoice'}</DialogTitle>
              <DialogDescription>Review your delivery details and confirm your next step.</DialogDescription>
            </DialogHeader>
            {activeDelivery ? (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-3xl bg-slate-50 p-5">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Order</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">{activeDelivery.id}</p>
                    <p className="mt-2 text-sm text-slate-600">{activeDelivery.pickup.address} → {activeDelivery.dropoff.address}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-5">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Status</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">{STATUS_LABEL[activeDelivery.status]}</p>
                    <p className="mt-2 text-sm text-slate-600">ETA: {activeDelivery.etaMinutes} min</p>
                  </div>
                </div>

                <div className="rounded-3xl bg-white p-5 shadow-sm">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Package type</p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">{activeDelivery.packageType}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Distance</p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">{activeDelivery.distanceKm} km</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Total</p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">₦{activeDelivery.price}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl bg-slate-50 p-5 text-sm text-slate-600">
                  <p className="font-semibold text-slate-900">Invoice details</p>
                  <p className="mt-3">Your order is ready to view as an invoice. Use the button below to open tracking and confirm the delivery progress.</p>
                </div>
              </div>
            ) : (
              <div className="py-10 text-center text-slate-500">Select a shipment to see invoice details.</div>
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
                  className="rounded-3xl bg-brand px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand/20 hover:bg-brand-hover"
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

function StatCard({ icon: Icon, label, value, tone }) {
  return (
    <div className={`rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm ${tone}`}> 
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-900">{label}</p>
        <Icon className="h-5 w-5 text-slate-400" />
      </div>
      <p className="mt-4 text-3xl font-semibold text-slate-900">{value}</p>
    </div>
  )
}
