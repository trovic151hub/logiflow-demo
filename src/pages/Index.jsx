import { Link } from 'react-router-dom'

export default function Index() {
  function getStartedPath() {
    return localStorage.getItem('swiftship_onboarding_seen') ? '/auth' : '/onboarding'
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
      <div className="mb-4 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          Live in your city
        </span>
      </div>

      <h1 className="font-display max-w-xl text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight text-navy">
        Last-mile delivery,{' '}
        <span className="text-brand">on demand.</span>
      </h1>

      <p className="mt-5 max-w-md text-base text-slate-500">
        Book a courier in seconds. Real-time tracking, instant notifications, and reliable
        delivery — all in one place.
      </p>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link
          to={getStartedPath()}
          className="rounded-full bg-brand px-8 py-4 text-sm font-semibold text-white hover:bg-brand-hover transition-colors"
        >
          I need a delivery
        </Link>
        <Link
          to={getStartedPath()}
          className="rounded-full border border-surface-200 bg-white px-8 py-4 text-sm font-semibold text-slate-700 hover:bg-surface-100 transition-colors"
        >
          I&apos;m a rider
        </Link>
      </div>

      <p className="mt-8 text-xs text-slate-400">
        New here?{' '}
        <Link to="/onboarding" className="text-brand hover:underline">
          See how it works
        </Link>
      </p>
    </main>
  )
}
