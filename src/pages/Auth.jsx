import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, User, Phone, ChevronLeft } from 'lucide-react'
import { signIn, getCurrentUser } from '@/lib/mock-store'

export default function Auth() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('login')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  const [name, setName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [signupPassword, setSignupPassword] = useState('')

  useEffect(() => {
    const user = getCurrentUser()
    if (user) {
      navigate(user.role === 'rider' ? '/rider' : '/customer', { replace: true })
    }
  }, [navigate])

  function switchTab(t) {
    setTab(t)
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

  function handleSignUp(e) {
    e.preventDefault()
    setError('')
    if (!name.trim() || !signupEmail.trim()) {
      setError('Please enter your name and email.')
      return
    }
    navigate('/choose-role', { state: { name: name.trim(), email: signupEmail.trim(), phone } })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-12 w-full">
      <Link to="/" className="self-start mb-2 flex items-center gap-1 text-sm text-slate-400 hover:text-navy transition-colors">
        <ChevronLeft className="h-4 w-4" /> Home
      </Link>

      <div className="mb-5 h-20 w-20 rounded-2xl bg-surface-200" />
      <h1 className="font-display text-xl sm:text-2xl font-bold text-navy">Welcome to DASHPOINT</h1>
      <p className="mt-1 text-sm text-slate-500">Sign in or create an account to continue</p>

      <div className="mt-8 w-full max-w-sm rounded-2xl border border-surface-200 bg-white p-6 shadow-md">
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
        ) : (
          <form onSubmit={handleSignUp} className="mt-5 flex flex-col gap-3">
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
              Create Account
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
