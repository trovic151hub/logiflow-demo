import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { getCurrentUser, signOut, useStore, resetDemo } from "@/lib/mock-store";

type NavLink = { to: string; label: string };

const CUSTOMER_LINKS: NavLink[] = [
  { to: "/customer", label: "Dashboard" },
  { to: "/customer/book", label: "Book" },
  { to: "/customer/history", label: "History" },
];
const RIDER_LINKS: NavLink[] = [
  { to: "/rider", label: "Dashboard" },
  { to: "/rider/earnings", label: "Earnings" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const session = useStore((s) => s.session);
  const [mounted, setMounted] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => setMounted(true), []);

  const user = mounted ? getCurrentUser() : null;
  const links = session?.role === "rider" ? RIDER_LINKS : CUSTOMER_LINKS;

  return (
    <div className="min-h-screen bg-surface-100 text-navy">
      <nav className="sticky top-0 z-50 flex items-center justify-between border-b border-surface-200 bg-white px-6 py-4">
        <div className="flex items-center gap-8">
          <Link to="/" className="font-display text-2xl font-bold tracking-tight text-brand">
            DASHPOINT
          </Link>
          {session && (
            <div className="hidden gap-6 md:flex">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className={`text-sm font-medium ${
                    pathname === l.to ? "text-navy" : "text-slate-500 hover:text-navy"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          {mounted && session && (
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                {session.role === "rider" ? "Rider Online" : "Customer"}
              </span>
            </div>
          )}
          {mounted && user ? (
            <>
              <div className="hidden sm:block text-right">
                <p className="text-xs text-slate-400">Signed in as</p>
                <p className="text-sm font-bold">{user.name}</p>
              </div>
              <button
                onClick={() => {
                  signOut();
                  navigate({ to: "/login" });
                }}
                className="rounded-lg border border-surface-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-surface-100"
              >
                Sign out
              </button>
            </>
          ) : mounted ? (
            <Link
              to="/login"
              className="rounded-lg bg-brand px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-brand-hover"
            >
              Sign in
            </Link>
          ) : null}
        </div>
      </nav>
      {children}
      <footer className="border-t border-surface-200 bg-white px-6 py-4 text-xs text-slate-400 flex items-center justify-between">
        <span>DashPoint demo · frontend-only mock data</span>
        <button
          onClick={() => {
            resetDemo();
            navigate({ to: "/" });
          }}
          className="text-slate-500 hover:text-brand font-semibold"
        >
          Reset demo
        </button>
      </footer>
    </div>
  );
}