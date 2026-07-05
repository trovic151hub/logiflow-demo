import { useNavigate } from 'react-router-dom'
import { User, LogOut, Settings, Shield, MapPin, Phone, Mail, Calendar, ArrowLeft, BarChart3, Bell } from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { useRequireAuth } from '@/lib/use-require-auth'
import { signOut } from '@/lib/mock-store'

export default function Account() {
  const user = useRequireAuth()
  const navigate = useNavigate()

  if (!user) return null

  const handleLogout = () => {
    signOut()
    navigate('/auth')
  }

  return (
    <AppShell>
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Back button */}
        <button
          onClick={() => navigate('/customer')}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-navy transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </button>

        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-bold">Account Settings</h1>
          <p className="mt-2 text-sm text-slate-500">
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
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg bg-surface-100 p-4 text-center">
                  <p className="text-2xl font-display font-bold text-brand">12</p>
                  <p className="text-xs text-slate-500 mt-1">Total Orders</p>
                </div>
                <div className="rounded-lg bg-surface-100 p-4 text-center">
                  <p className="text-2xl font-display font-bold text-success">8</p>
                  <p className="text-xs text-slate-500 mt-1">Delivered</p>
                </div>
                <div className="rounded-lg bg-surface-100 p-4 text-center">
                  <p className="text-2xl font-display font-bold text-orange-500">₦4,850</p>
                  <p className="text-xs text-slate-500 mt-1">Total Spent</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick actions sidebar */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-700">Quick Actions</h3>
              
              <button className="w-full flex items-center gap-3 rounded-lg border border-surface-200 px-4 py-3 hover:bg-surface-100 transition-colors text-left">
                <Shield className="h-5 w-5 text-slate-400" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-700">Change Password</p>
                  <p className="text-xs text-slate-500">Update your security</p>
                </div>
              </button>

              <button className="w-full flex items-center gap-3 rounded-lg border border-surface-200 px-4 py-3 hover:bg-surface-100 transition-colors text-left">
                <Mail className="h-5 w-5 text-slate-400" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-700">Update Email</p>
                  <p className="text-xs text-slate-500">Change your email address</p>
                </div>
              </button>

              <button className="w-full flex items-center gap-3 rounded-lg border border-surface-200 px-4 py-3 hover:bg-surface-100 transition-colors text-left">
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
        <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm space-y-6">
          <div>
            <h2 className="font-display text-lg font-bold flex items-center gap-2">
              <Settings className="h-5 w-5 text-brand" /> Preferences
            </h2>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Customize your experience</p>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-3 rounded-lg border border-surface-200 p-4 hover:bg-surface-100 cursor-pointer">
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded text-brand" />
              <div>
                <p className="text-sm font-semibold text-slate-700">Email notifications</p>
                <p className="text-xs text-slate-500">Get updates about your orders</p>
              </div>
            </label>

            <label className="flex items-center gap-3 rounded-lg border border-surface-200 p-4 hover:bg-surface-100 cursor-pointer">
              <input type="checkbox" defaultChecked className="h-4 w-4 rounded text-brand" />
              <div>
                <p className="text-sm font-semibold text-slate-700">SMS notifications</p>
                <p className="text-xs text-slate-500">Receive text messages for deliveries</p>
              </div>
            </label>

            <label className="flex items-center gap-3 rounded-lg border border-surface-200 p-4 hover:bg-surface-100 cursor-pointer">
              <input type="checkbox" className="h-4 w-4 rounded text-brand" />
              <div>
                <p className="text-sm font-semibold text-slate-700">Marketing emails</p>
                <p className="text-xs text-slate-500">Receive special offers and promotions</p>
              </div>
            </label>
          </div>
        </div>
      </main>
    </AppShell>
  )
}
