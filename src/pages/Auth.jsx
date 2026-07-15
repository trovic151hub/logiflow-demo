import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  ChevronLeft,
  Car,
  Palette,
  Hash,
  IdCard,
  Fingerprint,
  Landmark,
  CreditCard,
} from 'lucide-react'
import { signIn, getCurrentUser, signUp, updateCurrentUser, VEHICLE_TYPES } from '@/lib/mock-store'

export default function Auth() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const role = state?.role === 'rider' ? 'rider' : 'customer'
  const [tab, setTab] = useState(state?.role ? 'signup' : 'login')
  const [signupStep, setSignupStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  const [name, setName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [signupPassword, setSignupPassword] = useState('')

  const [vehicleType, setVehicleType] = useState('')
  const [vehicleColor, setVehicleColor] = useState('')
  const [plateNumber, setPlateNumber] = useState('')
  const [licenseNumber, setLicenseNumber] = useState('')
  const [nin, setNin] = useState('')
  const [bankName, setBankName] = useState('')
  const [accountNumber, setAccountNumber] = useState('')

  useEffect(() => {
    if (state?.role) return // explicit CTA intent (e.g. "I'm a rider") wins over an existing session
    const user = getCurrentUser()
    if (user) {
      navigate(user.role === 'rider' ? '/rider' : '/customer', { replace: true })
    }
  }, [navigate, state])

  function switchTab(t) {
    setTab(t)
    setSignupStep(1)
    setError('')
    setShowPassword(false)
  }

  function handleLogin(e) {
    e.preventDefault()
    setError('')
    const user = signIn(loginEmail)
    if (!user) {
      setError('No account found with that email. Please sign up.')
      return
    }
    navigate(user.role === 'rider' ? '/rider' : '/customer')
  }

  function handleGeneralSubmit(e) {
    e.preventDefault()
    setError('')
    if (!name.trim() || !signupEmail.trim() || !signupPassword.trim() || (role === 'rider' && !phone.trim())) {
      setError('Please fill in all required fields.')
      return
    }

    const user = signUp(name.trim(), signupEmail.trim(), role, { phone: phone.trim() })
    if (user.role === 'rider') {
      setSignupStep(2)
      return
    }
    navigate('/customer', { replace: true })
  }

  function handlePaymentSubmit(e) {
    e.preventDefault()
    const details = {}
    if (vehicleType) details.vehicleType = vehicleType
    if (vehicleColor.trim()) details.vehicleColor = vehicleColor.trim()
    if (plateNumber.trim()) details.plateNumber = plateNumber.trim()
    if (licenseNumber.trim()) details.licenseNumber = licenseNumber.trim()
    if (nin.trim()) details.nin = nin.trim()
    if (bankName.trim()) details.bankName = bankName.trim()
    if (accountNumber.trim()) details.accountNumber = accountNumber.trim()
    if (Object.keys(details).length > 0) {
      updateCurrentUser(details)
    }
    navigate('/rider', { replace: true })
  }

  function handleSkipPayment() {
    navigate('/rider', { replace: true })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-12 w-full">
      <Link to="/" className="self-start mb-2 flex items-center gap-1 text-sm text-slate-400 hover:text-navy transition-colors">
        <ChevronLeft className="h-4 w-4" /> Back
      </Link>

      <div className="mb-5 flex items-center justify-center">
        <img
          src="/logo.png"
          alt="Workspace Logistics & Courier Logo"
          className="h-20 w-auto object-contain"
        />
      </div>
      <h1 className="font-display text-xl sm:text-2xl font-bold text-navy">Welcome to Workspace Logistics</h1>
      <p className="mt-1 text-sm text-slate-500">Sign in or create an account to continue</p>

      <div className="mt-8 w-full max-w-sm rounded-2xl border border-surface-200 bg-white p-6 shadow-md">
        {!(role === 'rider' && tab === 'signup' && signupStep === 2) && (
          <>
            <div className="flex rounded-full bg-surface-200 p-1">
              <button
                onClick={() => switchTab('login')}
                className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition-colors ${
                  tab === 'login' ? 'bg-brand text-white shadow-sm' : 'text-slate-600'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => switchTab('signup')}
                className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition-colors ${
                  tab === 'signup' ? 'bg-brand text-white shadow-sm' : 'text-slate-600'
                }`}
              >
                Sign Up
              </button>
            </div>

            {tab === 'signup' && (
              <p className="mt-3 text-center text-xs text-slate-400">
                Signing up as {role === 'rider' ? 'a rider' : 'a customer'}
                {role === 'rider' && ' · Step 1 of 2'}
              </p>
            )}
          </>
        )}

        {role === 'rider' && tab === 'signup' && signupStep === 2 && (
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-wider text-brand">Step 2 of 2</p>
            <h2 className="mt-1 text-sm font-bold text-navy">Payment & verification details</h2>
            <p className="mt-1 text-xs text-slate-500">
              Add these now, or skip and complete them later from your account settings.
            </p>
          </div>
        )}

        {error && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-center text-xs text-red-500">
            {error}
          </p>
        )}

        {tab === 'login' ? (
          <form onSubmit={handleLogin} className="mt-5 flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700">Email</label>
              <div className="flex items-center gap-3 rounded-full bg-surface-100 px-4 py-3">
                <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700">Password</label>
              <div className="flex items-center gap-3 rounded-full bg-surface-100 px-4 py-3">
                <Lock className="h-4 w-4 shrink-0 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="enter your password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="shrink-0"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-slate-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-slate-400" />
                  )}
                </button>
              </div>
            </div>

            <button type="button" className="text-right text-xs text-brand hover:underline">
              Forget password?
            </button>

            <button
              type="submit"
              className="mt-1 w-full rounded-full bg-brand py-3.5 text-sm font-semibold text-white hover:bg-brand-hover transition-colors"
            >
              Login
            </button>
          </form>
        ) : role === 'rider' && signupStep === 2 ? (
          <form onSubmit={handlePaymentSubmit} className="mt-5 flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700">Vehicle type</label>
              <div className="flex items-center gap-3 rounded-full bg-surface-100 px-4 py-3">
                <Car className="h-4 w-4 shrink-0 text-slate-400" />
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="flex-1 bg-transparent text-sm outline-none text-slate-700"
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
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700">Vehicle color</label>
              <div className="flex items-center gap-3 rounded-full bg-surface-100 px-4 py-3">
                <Palette className="h-4 w-4 shrink-0 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. Black"
                  value={vehicleColor}
                  onChange={(e) => setVehicleColor(e.target.value)}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700">Plate number</label>
              <div className="flex items-center gap-3 rounded-full bg-surface-100 px-4 py-3">
                <Hash className="h-4 w-4 shrink-0 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. LND-234-KJ"
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value)}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700">Driver&apos;s license number</label>
              <div className="flex items-center gap-3 rounded-full bg-surface-100 px-4 py-3">
                <IdCard className="h-4 w-4 shrink-0 text-slate-400" />
                <input
                  type="text"
                  placeholder="License number"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700">NIN (National ID Number)</label>
              <div className="flex items-center gap-3 rounded-full bg-surface-100 px-4 py-3">
                <Fingerprint className="h-4 w-4 shrink-0 text-slate-400" />
                <input
                  type="text"
                  placeholder="11-digit NIN"
                  value={nin}
                  onChange={(e) => setNin(e.target.value)}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700">Bank name</label>
              <div className="flex items-center gap-3 rounded-full bg-surface-100 px-4 py-3">
                <Landmark className="h-4 w-4 shrink-0 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. GTBank"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700">Bank account number</label>
              <div className="flex items-center gap-3 rounded-full bg-surface-100 px-4 py-3">
                <CreditCard className="h-4 w-4 shrink-0 text-slate-400" />
                <input
                  type="text"
                  placeholder="10-digit account number"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-1 w-full rounded-full bg-brand py-3.5 text-sm font-semibold text-white hover:bg-brand-hover transition-colors"
            >
              Save & finish
            </button>
            <button
              type="button"
              onClick={handleSkipPayment}
              className="w-full rounded-full py-3 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors"
            >
              Skip for now
            </button>
          </form>
        ) : (
          <form onSubmit={handleGeneralSubmit} className="mt-5 flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700">Full name</label>
              <div className="flex items-center gap-3 rounded-full bg-surface-100 px-4 py-3">
                <User className="h-4 w-4 shrink-0 text-slate-400" />
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700">Email</label>
              <div className="flex items-center gap-3 rounded-full bg-surface-100 px-4 py-3">
                <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700">Phone</label>
              <div className="flex items-center gap-3 rounded-full bg-surface-100 px-4 py-3">
                <Phone className="h-4 w-4 shrink-0 text-slate-400" />
                <input
                  type="tel"
                  placeholder="+234 91 234 6789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-slate-700">Password</label>
              <div className="flex items-center gap-3 rounded-full bg-surface-100 px-4 py-3">
                <Lock className="h-4 w-4 shrink-0 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create your password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="shrink-0"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-slate-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-slate-400" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="mt-1 w-full rounded-full bg-brand py-3.5 text-sm font-semibold text-white hover:bg-brand-hover transition-colors"
            >
              {role === 'rider' ? 'Continue' : 'Create Account'}
            </button>
          </form>
        )}
      </div>

      <p className="mt-6 text-center text-xs text-slate-400">
        By continuing, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  )
}
