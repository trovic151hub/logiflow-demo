import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User,
  CreditCard,
  LogOut,
  ArrowLeft,
  ChevronRight,
  Pencil,
  Save,
  Car,
  Palette,
  Hash,
  IdCard,
  Fingerprint,
  Landmark,
  AlertCircle,
} from 'lucide-react'
import { AppShell } from '@/components/app-shell'
import { useRequireAuth } from '@/lib/use-require-auth'
import { signOut, updateCurrentUser, useStore, VEHICLE_TYPES } from '@/lib/mock-store'

const SECTIONS = [
  { id: 'profile', label: 'Profile', description: 'Name, email, and phone', Icon: User },
  { id: 'payment', label: 'Payment & verification', description: 'Vehicle, license, and bank details', Icon: CreditCard },
]

function isPaymentIncomplete(user) {
  return !user.vehicleType || !user.plateNumber || !user.licenseNumber || !user.nin || !user.bankName || !user.accountNumber
}

export default function RiderAccount() {
  const user = useRequireAuth('rider')
  const navigate = useNavigate()
  const liveUser = useStore((s) => (s.session ? s.users.find((item) => item.id === s.session.userId) : null))
  const accountUser = liveUser ?? user
  const [activeSection, setActiveSection] = useState(null)

  if (!accountUser) return null

  const handleLogout = () => {
    signOut()
    navigate('/auth')
  }

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1)
    } else {
      navigate('/rider')
    }
  }

  const activeTitle = SECTIONS.find((section) => section.id === activeSection)?.label ?? 'Account'
  const paymentIncomplete = isPaymentIncomplete(accountUser)

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
            <p className="mt-2 text-sm text-slate-500">Profile and payment & verification details.</p>
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
              {SECTIONS.map(({ id, label, description, Icon }) => (
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
                    <span className="flex items-center gap-2 text-sm font-bold">
                      {label}
                      {id === 'payment' && paymentIncomplete && (
                        <span className="inline-flex h-2 w-2 rounded-full bg-red-400" />
                      )}
                    </span>
                    <span className="block truncate text-xs text-slate-500">{description}</span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                </button>
              ))}
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

            {activeSection === 'profile' && <ProfilePanel user={accountUser} />}
            {activeSection === 'payment' && <PaymentPanel user={accountUser} />}
          </section>
        )}
      </main>
    </AppShell>
  )
}

function ProfilePanel({ user }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [phone, setPhone] = useState(user.phone ?? '')
  const [notice, setNotice] = useState('')

  function saveProfile() {
    updateCurrentUser({
      name: name.trim() || user.name,
      email: email.trim() || user.email,
      phone: phone.trim(),
    })
    setEditing(false)
    setNotice('Profile updated.')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-blue-50 p-5">
        <div>
          <p className="text-sm font-bold text-[#102A6B]">Profile information</p>
          <p className="mt-1 text-sm text-slate-500">Edit your account name, email, and phone number.</p>
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
          <EditableField label="Phone" type="tel" value={phone} onChange={setPhone} placeholder="+234 91 234 6789" />
          <InfoItem label="Account type" value="Rider" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <InfoItem label="Full name" value={user.name} />
          <InfoItem label="Email" value={user.email} />
          <InfoItem label="Phone" value={user.phone || 'Not set'} />
          <InfoItem label="Account type" value="Rider" />
        </div>
      )}
    </div>
  )
}

function PaymentPanel({ user }) {
  const [editing, setEditing] = useState(false)
  const [vehicleType, setVehicleType] = useState(user.vehicleType ?? '')
  const [vehicleColor, setVehicleColor] = useState(user.vehicleColor ?? '')
  const [plateNumber, setPlateNumber] = useState(user.plateNumber ?? '')
  const [licenseNumber, setLicenseNumber] = useState(user.licenseNumber ?? '')
  const [nin, setNin] = useState(user.nin ?? '')
  const [bankName, setBankName] = useState(user.bankName ?? '')
  const [accountNumber, setAccountNumber] = useState(user.accountNumber ?? '')
  const [notice, setNotice] = useState('')

  const incomplete = isPaymentIncomplete(user)

  function savePayment() {
    updateCurrentUser({
      vehicleType,
      vehicleColor: vehicleColor.trim(),
      plateNumber: plateNumber.trim(),
      licenseNumber: licenseNumber.trim(),
      nin: nin.trim(),
      bankName: bankName.trim(),
      accountNumber: accountNumber.trim(),
    })
    setEditing(false)
    setNotice('Payment & verification details updated.')
  }

  return (
    <div className="space-y-6">
      {incomplete && !editing && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <p>Your payment & verification details are incomplete. Add them so you can start receiving job payouts.</p>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-blue-50 p-5">
        <div>
          <p className="text-sm font-bold text-[#102A6B]">Payment & verification</p>
          <p className="mt-1 text-sm text-slate-500">Your vehicle, license, and bank details.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (editing) {
              savePayment()
            } else {
              setEditing(true)
              setNotice('')
            }
          }}
          className="inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-hover"
        >
          {editing ? <Save className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
          {editing ? 'Save changes' : 'Edit details'}
        </button>
      </div>

      {notice && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</div>}

      {editing ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block rounded-xl bg-slate-50 px-4 py-3">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
              <Car className="h-3.5 w-3.5" /> Vehicle type
            </span>
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-[#102A6B] outline-none transition focus:border-brand"
            >
              <option value="" disabled>
                Select vehicle type
              </option>
              {VEHICLE_TYPES.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <EditableField label="Vehicle color" value={vehicleColor} onChange={setVehicleColor} placeholder="e.g. Black" Icon={Palette} />
          <EditableField label="Plate number" value={plateNumber} onChange={setPlateNumber} placeholder="e.g. LND-234-KJ" Icon={Hash} />
          <EditableField label="Driver's license number" value={licenseNumber} onChange={setLicenseNumber} Icon={IdCard} />
          <EditableField label="NIN (National ID Number)" value={nin} onChange={setNin} placeholder="11-digit NIN" Icon={Fingerprint} />
          <EditableField label="Bank name" value={bankName} onChange={setBankName} placeholder="e.g. GTBank" Icon={Landmark} />
          <EditableField label="Bank account number" value={accountNumber} onChange={setAccountNumber} placeholder="10-digit account number" Icon={CreditCard} />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <InfoItem label="Vehicle type" value={user.vehicleType || 'Not set'} />
          <InfoItem label="Vehicle color" value={user.vehicleColor || 'Not set'} />
          <InfoItem label="Plate number" value={user.plateNumber || 'Not set'} />
          <InfoItem label="Driver's license number" value={user.licenseNumber || 'Not set'} />
          <InfoItem label="NIN" value={user.nin || 'Not set'} />
          <InfoItem label="Bank name" value={user.bankName || 'Not set'} />
          <InfoItem label="Bank account number" value={user.accountNumber || 'Not set'} />
        </div>
      )}
    </div>
  )
}

function EditableField({ label, value, onChange, type = 'text', placeholder, Icon }) {
  return (
    <label className="block rounded-xl bg-slate-50 px-4 py-3">
      <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
        {Icon && <Icon className="h-3.5 w-3.5" />} {label}
      </span>
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
