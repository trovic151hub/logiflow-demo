import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useRequireAuth } from "@/lib/use-require-auth";
import { useStore } from "@/lib/mock-store";

export const Route = createFileRoute("/rider/earnings")({
  head: () => ({ meta: [{ title: "Earnings — DashPoint" }] }),
  component: EarningsPage,
});

function EarningsPage() {
  const user = useRequireAuth("rider");
  const completed = useStore((s) =>
    user ? s.deliveries.filter((d) => d.riderId === user.id && d.status === "delivered") : [],
  );
  if (!user) return null;

  const total = completed.reduce((a, d) => a + d.price, 0);
  const avg = completed.length ? Math.round((total / completed.length) * 100) / 100 : 0;

  return (
    <AppShell>
      <main className="p-6 max-w-6xl mx-auto">
        <h1 className="font-display text-3xl font-bold">Earnings</h1>
        <p className="mt-2 text-sm text-slate-500">Your completed deliveries and payouts.</p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard label="Total earned" value={`$${total.toFixed(2)}`} sub="all time" highlight />
          <StatCard label="Deliveries" value={`${completed.length}`} sub="completed" />
          <StatCard label="Avg per trip" value={`$${avg}`} sub="payout" />
        </div>

        <div className="mt-8 rounded-2xl border border-surface-200 bg-white shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-100 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="text-left px-6 py-3 font-bold">Order</th>
                <th className="text-left px-6 py-3 font-bold">Route</th>
                <th className="text-left px-6 py-3 font-bold">Distance</th>
                <th className="text-right px-6 py-3 font-bold">Payout</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200">
              {completed.map((d) => (
                <tr key={d.id}>
                  <td className="px-6 py-4 font-bold">{d.id}</td>
                  <td className="px-6 py-4 text-slate-600">{d.pickup.address} → {d.dropoff.address}</td>
                  <td className="px-6 py-4 text-slate-600">{d.distanceKm} km</td>
                  <td className="px-6 py-4 text-right font-bold text-success">+${d.price}</td>
                </tr>
              ))}
              {completed.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-slate-500">
                    No completed deliveries yet. Accept a job to start earning.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </AppShell>
  );
}

function StatCard({ label, value, sub, highlight }: { label: string; value: string; sub: string; highlight?: boolean }) {
  return (
    <div
      className={`rounded-2xl p-6 shadow-sm border ${
        highlight ? "bg-navy text-white border-navy" : "bg-white border-surface-200"
      }`}
    >
      <p className={`text-xs font-bold uppercase tracking-wider ${highlight ? "text-white/60" : "text-slate-400"}`}>{label}</p>
      <p className="mt-1 font-display text-2xl font-bold">{value}</p>
      <p className={`mt-2 text-xs ${highlight ? "text-white/60" : "text-slate-400"}`}>{sub}</p>
    </div>
  );
}