import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { signIn, type Role } from "@/lib/mock-store";

type Search = { role?: Role };

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    role: s.role === "rider" ? "rider" : s.role === "customer" ? "customer" : undefined,
  }),
  head: () => ({ meta: [{ title: "Sign in — DashPoint" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { role: initialRole } = Route.useSearch();
  const [role, setRole] = useState<Role>(initialRole ?? "customer");
  const [email, setEmail] = useState(initialRole === "rider" ? "marcus@demo.io" : "ada@demo.io");
  const navigate = useNavigate();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    signIn(email.trim(), role);
    navigate({ to: role === "rider" ? "/rider" : "/customer" });
  }

  return (
    <AppShell>
      <main className="px-6 py-16 max-w-md mx-auto">
        <h1 className="font-display text-3xl font-bold text-navy">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-500">Sign in to your DashPoint account.</p>

        <div className="mt-8 grid grid-cols-2 rounded-xl bg-surface-200 p-1">
          {(["customer", "rider"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${
                role === r ? "bg-white text-navy shadow" : "text-slate-500"
              }`}
            >
              {r === "customer" ? "Customer" : "Rider"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-surface-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Password</label>
            <input
              type="password"
              required
              defaultValue="demo"
              className="w-full rounded-xl border border-surface-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-brand py-3 font-bold text-white shadow-lg shadow-brand/20 hover:bg-brand-hover"
          >
            Sign in as {role}
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-500 text-center">
          New here?{" "}
          <Link to="/register" className="font-bold text-brand hover:underline">
            Create an account
          </Link>
        </p>
        <p className="mt-4 text-xs text-slate-400 text-center">
          Demo: any email works. Try <code>ada@demo.io</code> or <code>marcus@demo.io</code>.
        </p>
      </main>
    </AppShell>
  );
}