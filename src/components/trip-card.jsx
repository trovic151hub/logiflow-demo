import { Link } from 'react-router-dom'
import { Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { STATUS_LABEL } from '@/lib/mock-store'
import { cn } from '@/lib/utils'

const STATUS_VARIANT = {
  pending: 'pending',
  accepted: 'progress',
  picked_up: 'progress',
  in_transit: 'progress',
  delivered: 'success',
  cancelled: 'muted',
}

export function TripCard({ delivery, actionLabel, actionTo, onAction, className }) {
  const d = delivery
  const isDelivered = d.status === 'delivered'
  const label = actionLabel ?? (isDelivered ? 'Completed' : 'Track')
  const actionClassName = cn(
    'shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors',
    isDelivered
      ? 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
      : 'bg-blue-600 text-white hover:bg-blue-500',
  )

  return (
    <div className={cn('rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-blue-200', className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-bold text-slate-900">{d.id}</p>
        <Badge variant={STATUS_VARIANT[d.status] ?? 'muted'}>{STATUS_LABEL[d.status] ?? d.status}</Badge>
      </div>

      <div className="mt-3 flex gap-3">
        <div className="flex flex-col items-center pt-1">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">A</span>
          <span className="my-1 w-px flex-1 bg-slate-200" />
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">B</span>
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <p className="truncate text-sm text-slate-700">{d.pickup?.address}</p>
          <p className="truncate text-sm text-slate-700">{d.dropoff?.address}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
          {d.etaMinutes != null && (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {d.etaMinutes}m
            </span>
          )}
          {d.distanceKm != null && <span>{d.distanceKm} km</span>}
          {d.price != null && <span className="font-semibold text-slate-700">₦{d.price}</span>}
        </div>

        {actionTo ? (
          <Link to={actionTo} className={actionClassName}>
            {label}
          </Link>
        ) : onAction ? (
          <button type="button" onClick={onAction} className={actionClassName}>
            {label}
          </button>
        ) : null}
      </div>
    </div>
  )
}
