import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { Bell, Clock3, PackageCheck, Truck } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { useRequireAuth } from '@/lib/use-require-auth'
import { useStore } from '@/lib/mock-store'

function formatTime(value) {
  if (!value) return ''
  return new Date(value).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function NotificationsPage() {
  const user = useRequireAuth()
  const deliveries = useStore((s) => (user ? s.deliveries.filter((d) => d.customerId === user.id) : []))

  const notifications = useMemo(() => {
    if (!deliveries.length) return []

    const items = []
    deliveries.forEach((delivery) => {
      if (delivery.createdAt) {
        items.push({
          id: `${delivery.id}-created`,
          title: 'Order booked',
          description: `${delivery.id} was booked and is waiting for the next update.`,
          time: delivery.createdAt,
          icon: Bell,
        })
      }

      const timestamps = delivery.statusTimestamps ?? {}
      if (timestamps.accepted) {
        items.push({
          id: `${delivery.id}-accepted`,
          title: 'Rider accepted',
          description: `${delivery.id} was accepted by your rider.`,
          time: timestamps.accepted,
          icon: PackageCheck,
        })
      }
      if (timestamps.picked_up) {
        items.push({
          id: `${delivery.id}-picked-up`,
          title: 'Picked up',
          description: `${delivery.id} has been picked up and is on the way.`,
          time: timestamps.picked_up,
          icon: Truck,
        })
      }
      if (timestamps.in_transit) {
        items.push({
          id: `${delivery.id}-in-transit`,
          title: 'In transit',
          description: `${delivery.id} is now moving toward its destination.`,
          time: timestamps.in_transit,
          icon: Truck,
        })
      }
      if (timestamps.delivered) {
        items.push({
          id: `${delivery.id}-delivered`,
          title: 'Delivered',
          description: `${delivery.id} was completed successfully.`,
          time: timestamps.delivered,
          icon: PackageCheck,
        })
      }
    })

    return items.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 12)
  }, [deliveries])

  if (!user) return null

  return (
    <AppShell>
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div className='w-full'>
            <p className="text-[10px] font-bold  uppercase text-center tracking-[0.24em] text-slate-400">Notifications</p>
            <h1 className="text-2xl font-bold  text-center text-slate-900">Recent activity</h1>
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
              <Bell className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-slate-900">No activity yet</h2>
            <p className="mt-2 text-sm text-slate-500">Your shipment updates will appear here once a booking is created.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {notifications.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                          <Clock3 className="h-3 w-3" />
                          {formatTime(item.time)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </main>
    </AppShell>
  )
}
