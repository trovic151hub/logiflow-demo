import { useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { ShoppingBag, Store, Truck, ChevronRight, ChevronLeft } from 'lucide-react'
import { signUp } from '@/lib/mock-store'

const ROLES = [
  {
    label: 'Buyer / Customer',
    description: 'Send packages and track deliveries',
    Icon: ShoppingBag,
    iconBg: 'bg-blue-500',
    role: 'customer',
  },
  // {
  //   label: 'Seller / Vendor',
  //   description: 'Manage orders and sell products',
  //   Icon: Store,
  //   iconBg: 'bg-purple-500',
  //   role: 'customer',
  // },
  {
    label: 'Courier / Rider',
    description: 'Deliver packages and earn money',
    Icon: Truck,
    iconBg: 'bg-teal-500',
    role: 'rider',
  },
]

export default function ChooseRole() {
  const navigate = useNavigate()
  const { state } = useLocation()

  useEffect(() => {
    if (!state?.name || !state?.email) {
      navigate('/auth', { replace: true })
    }
  }, [state, navigate])

  function handleSelect(role) {
    const user = signUp(state.name, state.email, role)
    navigate(user.role === 'rider' ? '/rider' : '/customer', { replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-12 w-full">
      <Link to="/auth" className="self-start mb-2 flex items-center gap-1 text-sm text-slate-400 hover:text-navy transition-colors">
        <ChevronLeft className="h-4 w-4" /> Back
      </Link>

      <h1 className="font-display text-xl sm:text-2xl font-bold text-navy">Choose Your Role</h1>
      <p className="mt-2 text-sm text-slate-500">Select how you want to use DASHPOINT</p>

      <div className="mt-10 flex w-full max-w-sm flex-col gap-4">
        {ROLES.map(({ label, description, Icon, iconBg, role }) => (
          <button
            key={label}
            onClick={() => handleSelect(role)}
            className="flex items-center gap-4 rounded-2xl border border-surface-200 bg-white p-4 text-left transition-colors hover:border-brand/30 hover:bg-brand/5"
          >
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${iconBg}`}
            >
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-navy">{label}</p>
              <p className="text-xs text-slate-500">{description}</p>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" />
          </button>
        ))}
      </div>

      <p className="mt-8 text-center text-xs text-slate-400">
        You can change your role anytime in settings
      </p>
    </div>
  )
}
