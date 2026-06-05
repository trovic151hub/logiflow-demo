import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { signUp, type Role } from "@/lib/mock-store";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create account — DashPoint" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const [role, setRole] = useState<Role>("customer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    signUp(name.trim(), email.trim(), role);
    navigate({ to: role === "rider" ? "/rider" : "/customer" });
  }

  return (
    <AppShell>
      <main className="px-6 py-16 max-w-md mx-auto">
        <h1 className="font-display text-3xl font-bold text-navy">Create your account</h1>
        <p className="mt-2 text-sm text-slate-500">Join DashPoint in seconds.</p>

        <div className="mt-8 grid grid-cols-2 rounded-xl bg-surface-200 p-1">
          {(["customer", "rider"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`py-2 text-xs font-bold uppercase tracking-wider rounded-lg ${
                role === r ? "bg-white text-navy shadow" : "text-slate-500"
              }`}
            >
              {r === "customer" ? "Customer" : "Rider"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Full name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-surface-200 bg-white px-4 py-3 text-sm outline-none focus:border-brand"
            />
          </div>
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
            Create {role} account
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-500 text-center">
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-brand hover:underline">
            Sign in
          </Link>
        </p>
      </main>
    </AppShell>
  );
}