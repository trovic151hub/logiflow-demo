import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
  User,
  LogOut,
  Settings,
  Shield,
  Mail,
  ArrowLeft,
  BarChart3,
  Bell,
  Check,
  X,
  ChevronRight,
  LifeBuoy,
  History,
  PhoneCall,
  Package,
  Clock,
  Pencil,
  Save,
} from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { useRequireAuth } from '@/lib/use-require-auth'
import { signOut, updateCurrentUser, useStore, STATUS_LABEL } from '@/lib/mock-store'

const SECTIONS = [
  { id: 'profile', label: 'Profile', description: 'Personal details and activity', Icon: User },
  { id: 'settings', label: 'Settings', description: 'Security and notification preferences', Icon: Settings },
  { id: 'help', label: 'Help', description: 'Support and contact options', Icon: LifeBuoy },
  { id: 'history', label: 'History', description: 'Recent shipments and records', Icon: History },
]

export default function Account() {
  const user = useRequireAuth()
  const navigate = useNavigate()
  const liveUser = useStore((s) => (s.session ? s.users.find((item) => item.id === s.session.userId) : null))
  const accountUser = liveUser ?? user
  const [activeSection, setActiveSection] = useState(null)
  const [activeModal, setActiveModal] = useState(null)
  const [email, setEmail] = useState(accountUser?.email ?? '')
  const [password, setPassword] = useState('')
  const [preferences, setPreferences] = useState({ email: true, sms: true, marketing: false })
  const [savedNotice, setSavedNotice] = useState('')
  const deliveries = useStore((s) => (accountUser ? s.deliveries.filter((d) => d.customerId === accountUser.id) : []))

  if (!accountUser) return null

  const totalOrders = deliveries.length
  const deliveredOrders = deliveries.filter((d) => d.status === 'delivered').length
  const activeOrders = deliveries.filter((d) => d.status !== 'delivered' && d.status !== 'cancelled').length
  const totalSpent = deliveries
    .filter((d) => d.status !== 'cancelled')
    .reduce((sum, delivery) => sum + (Number(delivery.price) || 0), 0)
  const recentDeliveries = [...deliveries].sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0)).slice(0, 4)

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
  }

  const activeTitle = SECTIONS.find((section) => section.id === activeSection)?.label ?? 'Account'

  return (
    <AppShell>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Go back"
          className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        {!activeSection && (
          <div className="mb-6">
            <h1 className="font-display text-3xl font-bold tracking-tight text-[#102A6B]">Account</h1>
            <p className="mt-2 text-sm text-slate-500">Profile, settings, help, and shipment history.</p>
          </div>
        )}

        {!activeSection ? (
          <section className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-sm font-bold text-white">
                  {accountUser.name.split(' ').map((name) => name[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-[#102A6B]">{accountUser.name}</p>
                  <p className="truncate text-xs text-slate-500">{accountUser.email}</p>
                </div>
              </div>
            </div>

            <nav className="p-2">
              {SECTIONS.map(({ id, label, description, Icon }) => {
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveSection(id)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-slate-700 transition hover:bg-blue-50 hover:text-brand"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-bold">{label}</span>
                      <span className="block truncate text-xs text-slate-500">{description}</span>
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                  </button>
                )
              })}
            </nav>
          </section>
        ) : (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveSection(null)}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50"
                  aria-label="Back to account sections"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">Account section</p>
                  <h2 className="mt-1 font-display text-xl font-bold text-[#102A6B]">{activeTitle}</h2>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100"
              >
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>

            {activeSection === 'profile' && (
              <ProfilePanel
                user={accountUser}
                totalOrders={totalOrders}
                deliveredOrders={deliveredOrders}
                activeOrders={activeOrders}
                totalSpent={totalSpent}
              />
            )}

            {activeSection === 'settings' && (
              <SettingsPanel
                preferences={preferences}
                setPreferences={setPreferences}
                savedNotice={savedNotice}
                savePreferences={savePreferences}
                openModal={openModal}
              />
            )}

            {activeSection === 'help' && <HelpPanel />}

            {activeSection === 'history' && <HistoryPanel deliveries={recentDeliveries} />}
          </section>
        )}
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

function ProfilePanel({ user, totalOrders, deliveredOrders, activeOrders, totalSpent }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [newPassword, setNewPassword] = useState('')
  const [notice, setNotice] = useState('')

  function saveProfile() {
    updateCurrentUser({ name: name.trim() || user.name, email: email.trim() || user.email })
    setNewPassword('')
    setEditing(false)
    setNotice(newPassword ? 'Profile updated. Password captured for this demo.' : 'Profile updated.')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-blue-50 p-5">
        <div>
          <p className="text-sm font-bold text-[#102A6B]">Profile information</p>
          <p className="mt-1 text-sm text-slate-500">Edit your account name, email, and password directly here.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (editing) {
              saveProfile()
            } else {
              setEditing(true)
              setNotice('')
            }
          }}
          className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-hover"
        >
          {editing ? <Save className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
          {editing ? 'Save changes' : 'Edit profile'}
        </button>
      </div>

      {notice && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</div>}

      {editing ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <EditableField label="Full name" value={name} onChange={setName} />
          <EditableField label="Email" type="email" value={email} onChange={setEmail} />
          <EditableField label="New password" type="password" value={newPassword} onChange={setNewPassword} placeholder="Enter new password" />
          <InfoItem label="Account type" value="Customer" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <InfoItem label="Full name" value={user.name} />
          <InfoItem label="Email" value={user.email} />
          {user.phone && <InfoItem label="Phone" value={user.phone} />}
          <InfoItem label="Account type" value="Customer" />
        </div>
      )}

      <div className="border-t border-slate-100 pt-6">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-700">
          <BarChart3 className="h-4 w-4 text-brand" /> Activity
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Total orders" value={totalOrders} />
          <StatCard label="Delivered" value={deliveredOrders} tone="text-emerald-600" />
          <StatCard label="Active" value={activeOrders} tone="text-orange-500" />
          <StatCard label="Total spent" value={`NGN ${totalSpent.toLocaleString()}`} />
        </div>
      </div>
    </div>
  )
}

function SettingsPanel({ preferences, setPreferences, savedNotice, savePreferences, openModal }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <ActionButton icon={Shield} title="Change Password" text="Update security" onClick={() => openModal('password')} />
        <ActionButton icon={Mail} title="Update Email" text="Change email address" onClick={() => openModal('email')} />
        <ActionButton icon={Bell} title="Notifications" text="Manage alerts" onClick={() => openModal('notifications')} />
      </div>

      {savedNotice && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{savedNotice}</div>}

      <div className="space-y-3">
        <PreferenceRow title="Email notifications" text="Get updates about your orders" checked={preferences.email} onChange={() => setPreferences((prev) => ({ ...prev, email: !prev.email }))} />
        <PreferenceRow title="SMS notifications" text="Receive text messages for deliveries" checked={preferences.sms} onChange={() => setPreferences((prev) => ({ ...prev, sms: !prev.sms }))} />
        <PreferenceRow title="Marketing emails" text="Receive special offers and promotions" checked={preferences.marketing} onChange={() => setPreferences((prev) => ({ ...prev, marketing: !prev.marketing }))} />
      </div>

      <button onClick={savePreferences} className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-hover">
        <Check className="h-4 w-4" /> Confirm preferences
      </button>
    </div>
  )
}

function HelpPanel() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-slate-50 p-5">
        <p className="text-sm font-bold text-slate-900">Need support?</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">Get help with delivery tracking, account issues, bookings, or payment questions.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link to="/customer/help" className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-hover">
            <LifeBuoy className="h-4 w-4" /> Open help center
          </Link>
          <a href="tel:08106146952" className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
            <PhoneCall className="h-4 w-4" /> Call support
          </a>
        </div>
      </div>
    </div>
  )
}

function HistoryPanel({ deliveries }) {
  return (
    <div className="space-y-4">
      {deliveries.length === 0 ? (
        <div className="rounded-2xl bg-slate-50 p-8 text-center text-sm text-slate-500">No shipment history yet.</div>
      ) : (
        <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200">
          {deliveries.map((delivery) => (
            <Link key={delivery.id} to={`/customer/track/${delivery.id}`} className="flex items-center gap-3 px-4 py-4 transition hover:bg-slate-50">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-brand">
                <Package className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-slate-900">{delivery.id}</span>
                <span className="block truncate text-xs text-slate-500">{delivery.pickup?.address} to {delivery.dropoff?.address}</span>
              </span>
              <span className="hidden items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase text-slate-500 sm:inline-flex">
                <Clock className="h-3 w-3" /> {STATUS_LABEL[delivery.status]}
              </span>
              <ChevronRight className="h-4 w-4 text-slate-300" />
            </Link>
          ))}
        </div>
      )}

      <Link to="/customer/history" className="inline-flex items-center gap-2 rounded-full bg-[#102A6B] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0B1F52]">
        View full history <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  )
}

function EditableField({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <label className="block rounded-xl bg-slate-50 px-4 py-3">
      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-[#102A6B] outline-none transition focus:border-brand"
      />
    </label>
  )
}

function InfoItem({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-slate-900">{value}</p>
    </div>
  )
}

function StatCard({ label, value, tone = 'text-brand' }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4 text-center">
      <p className={`font-display text-2xl font-bold ${tone}`}>{value}</p>
      <p className="mt-1 text-xs text-slate-500">{label}</p>
    </div>
  )
}

function ActionButton({ icon: Icon, title, text, onClick }) {
  return (
    <button onClick={onClick} className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-left transition hover:bg-slate-50">
      <Icon className="h-5 w-5 text-slate-400" />
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-slate-700">{title}</span>
        <span className="block truncate text-xs text-slate-500">{text}</span>
      </span>
    </button>
  )
}

function PreferenceRow({ title, text, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:bg-slate-50">
      <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 rounded text-brand" />
      <span>
        <span className="block text-sm font-semibold text-slate-700">{title}</span>
        <span className="block text-xs text-slate-500">{text}</span>
      </span>
    </label>
  )
}
