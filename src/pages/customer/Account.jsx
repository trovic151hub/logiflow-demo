import { useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { User, LogOut, Settings, Shield, MapPin, Phone, Mail, Calendar, ArrowLeft, BarChart3, Bell, Check, X } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { useRequireAuth } from '@/lib/use-require-auth'
import { signOut, useStore } from '@/lib/mock-store'

export default function Account() {
  const user = useRequireAuth()
  const navigate = useNavigate()
  const [activeModal, setActiveModal] = useState(null)
  const [email, setEmail] = useState(user?.email ?? '')
  const [password, setPassword] = useState('')
  const [preferences, setPreferences] = useState({ email: true, sms: true, marketing: false })
  const [savedNotice, setSavedNotice] = useState('')
  const deliveries = useStore((s) => (user ? s.deliveries.filter((d) => d.customerId === user.id) : []))

  const preferencesRef = useMemo(() => ({ current: null }), [])

  if (!user) return null

  const totalOrders = deliveries.length
  const deliveredOrders = deliveries.filter((d) => d.status === 'delivered').length
  const activeOrders = deliveries.filter((d) => d.status !== 'delivered' && d.status !== 'cancelled').length
  const totalSpent = deliveries
    .filter((d) => d.status !== 'cancelled')
    .reduce((sum, delivery) => sum + (Number(delivery.price) || 0), 0)

  const handleLogout = () => {
    signOut()
    navigate('/auth')
  }

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1)
    } else {
      navigate('/customer')
    }
  }

  const openModal = (type) => {
    setActiveModal(type)
    setSavedNotice('')
  }

  const closeModal = () => {
    setActiveModal(null)
    setSavedNotice('')
  }

  const savePreferences = () => {
    setSavedNotice('Preferences updated successfully.')
    document.getElementById('preferences')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <AppShell>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Back button */}
        <button
          type="button"
          onClick={handleBack}
          aria-label="Go back"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        {/* Header */}
        <div>
          <h1 className="font-display text-center text-3xl font-bold">Account Settings</h1>
          <p className="mt-2 text-sm text-center text-slate-500">
            Manage your profile and account preferences
          </p>
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile card */}
          <div className="lg:col-span-2 rounded-2xl border border-surface-200 bg-white p-6 shadow-sm space-y-6">
            <div>
              <h2 className="font-display text-lg font-bold flex items-center gap-2">
                <User className="h-5 w-5 text-brand" /> Profile Information
              </h2>
              <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Your account details</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Full Name</label>
                <div className="mt-2 rounded-lg bg-surface-100 px-4 py-3">
                  <p className="font-medium text-navy">{user.name}</p>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email</label>
                <div className="mt-2 rounded-lg bg-surface-100 px-4 py-3">
                  <p className="font-medium text-navy break-all">{user.email}</p>
                </div>
              </div>
              {user.phone && (
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Phone</label>
                  <div className="mt-2 rounded-lg bg-surface-100 px-4 py-3">
                    <p className="font-medium text-navy">{user.phone}</p>
                  </div>
                </div>
              )}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Account Type</label>
                <div className="mt-2 rounded-lg bg-surface-100 px-4 py-3">
                  <span className="inline-flex items-center gap-2 rounded-full bg-brand/10 px-3 py-1 text-xs font-bold text-brand uppercase">
                    <User className="h-3 w-3" /> Customer
                  </span>
                </div>
              </div>
            </div>

            {/* Account stats */}
            <div className="border-t border-surface-200 pt-6 space-y-4">
              <h3 className="font-bold text-slate-700 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-slate-400" /> Your Activity
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-surface-100 p-4 text-center">
                  <p className="text-2xl font-display font-bold text-brand">{totalOrders}</p>
                  <p className="text-xs text-slate-500 mt-1">Total Orders</p>
                </div>
                <div className="rounded-lg bg-surface-100 p-4 text-center">
                  <p className="text-2xl font-display font-bold text-success">{deliveredOrders}</p>
                  <p className="text-xs text-slate-500 mt-1">Delivered</p>
                </div>
                <div className="rounded-lg bg-surface-100 p-4 text-center">
                  <p className="text-2xl font-display font-bold text-orange-500">{activeOrders}</p>
                  <p className="text-xs text-slate-500 mt-1">Active</p>
                </div>
                <div className="rounded-lg bg-surface-100 p-4 text-center">
                  <p className="text-2xl font-display font-bold text-slate-900">NGN {totalSpent.toLocaleString()}</p>
                  <p className="text-xs text-slate-500 mt-1">Total Spent</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick actions sidebar */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-700">Quick Actions</h3>
              
              <button onClick={() => openModal('password')} className="w-full flex items-center gap-3 rounded-lg border border-surface-200 px-4 py-3 hover:bg-surface-100 transition-colors text-left">
                <Shield className="h-5 w-5 text-slate-400" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-700">Change Password</p>
                  <p className="text-xs text-slate-500">Update your security</p>
                </div>
              </button>

              <button onClick={() => openModal('email')} className="w-full flex items-center gap-3 rounded-lg border border-surface-200 px-4 py-3 hover:bg-surface-100 transition-colors text-left">
                <Mail className="h-5 w-5 text-slate-400" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-700">Update Email</p>
                  <p className="text-xs text-slate-500">Change your email address</p>
                </div>
              </button>

              <button onClick={() => openModal('notifications')} className="w-full flex items-center gap-3 rounded-lg border border-surface-200 px-4 py-3 hover:bg-surface-100 transition-colors text-left">
                <Bell className="h-5 w-5 text-slate-400" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-700">Notifications</p>
                  <p className="text-xs text-slate-500">Manage preferences</p>
                </div>
              </button>

              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 hover:bg-red-100 transition-colors text-left"
              >
                <LogOut className="h-5 w-5 text-red-500" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-red-600">Sign Out</p>
                  <p className="text-xs text-red-500">Logout from your account</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Preferences section */}
        <div id="preferences" className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm space-y-6">
          <div>
            <h2 className="font-display text-lg font-bold flex items-center gap-2">
              <Settings className="h-5 w-5 text-brand" /> Preferences
            </h2>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Customize your experience</p>
          </div>

          {savedNotice && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{savedNotice}</div>}

          <div className="space-y-4">
            <label className="flex items-center gap-3 rounded-lg border border-surface-200 p-4 hover:bg-surface-100 cursor-pointer">
              <input type="checkbox" checked={preferences.email} onChange={() => setPreferences((prev) => ({ ...prev, email: !prev.email }))} className="h-4 w-4 rounded text-brand" />
              <div>
                <p className="text-sm font-semibold text-slate-700">Email notifications</p>
                <p className="text-xs text-slate-500">Get updates about your orders</p>
              </div>
            </label>

            <label className="flex items-center gap-3 rounded-lg border border-surface-200 p-4 hover:bg-surface-100 cursor-pointer">
              <input type="checkbox" checked={preferences.sms} onChange={() => setPreferences((prev) => ({ ...prev, sms: !prev.sms }))} className="h-4 w-4 rounded text-brand" />
              <div>
                <p className="text-sm font-semibold text-slate-700">SMS notifications</p>
                <p className="text-xs text-slate-500">Receive text messages for deliveries</p>
              </div>
            </label>

            <label className="flex items-center gap-3 rounded-lg border border-surface-200 p-4 hover:bg-surface-100 cursor-pointer">
              <input type="checkbox" checked={preferences.marketing} onChange={() => setPreferences((prev) => ({ ...prev, marketing: !prev.marketing }))} className="h-4 w-4 rounded text-brand" />
              <div>
                <p className="text-sm font-semibold text-slate-700">Marketing emails</p>
                <p className="text-xs text-slate-500">Receive special offers and promotions</p>
              </div>
            </label>
          </div>

       <div className='w-full flex items-center justify-center'>
           <button onClick={savePreferences} className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-hover">
            <Check className="h-4 w-4" /> Confirm preferences
          </button>
       </div>
        </div>
      </main>

      {activeModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/50 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{activeModal === 'password' ? 'Change password' : activeModal === 'email' ? 'Update email' : 'Notification preferences'}</p>
                <p className="mt-1 text-sm text-slate-500">{activeModal === 'password' ? 'Set a new password for your account.' : activeModal === 'email' ? 'Use a new email address for updates.' : 'Choose how you want alerts delivered.'}</p>
              </div>
              <button onClick={closeModal} className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                <X className="h-4 w-4" />
              </button>
            </div>

            {activeModal === 'password' ? (
              <div className="space-y-4">
                <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter new password" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand" />
                <button onClick={closeModal} className="w-full rounded-full bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-hover">Save password</button>
              </div>
            ) : activeModal === 'email' ? (
              <div className="space-y-4">
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Enter new email" className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-brand" />
                <button onClick={closeModal} className="w-full rounded-full bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-hover">Save email</button>
              </div>
            ) : (
              <div className="space-y-4">
                <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
                  <input type="checkbox" checked={preferences.email} onChange={() => setPreferences((prev) => ({ ...prev, email: !prev.email }))} className="h-4 w-4 rounded text-brand" />
                  <span className="text-sm text-slate-700">Email pushes</span>
                </label>
                <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
                  <input type="checkbox" checked={preferences.sms} onChange={() => setPreferences((prev) => ({ ...prev, sms: !prev.sms }))} className="h-4 w-4 rounded text-brand" />
                  <span className="text-sm text-slate-700">SMS updates</span>
                </label>
                <button onClick={closeModal} className="w-full rounded-full bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-hover">Confirm</button>
              </div>
            )}
          </div>
        </div>
      )}
    </AppShell>
  )
}
