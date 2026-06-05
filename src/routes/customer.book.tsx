import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { useRequireAuth } from "@/lib/use-require-auth";
import { createDelivery, type LatLng } from "@/lib/mock-store";

export const Route = createFileRoute("/customer/book")({
  head: () => ({ meta: [{ title: "Book delivery — DashPoint" }] }),
  component: BookPage,
});

const LAGOS = { lat: 6.5244, lng: 3.3792 };
function randomNear(base: LatLng, spread = 0.08): LatLng {
  return { lat: base.lat + (Math.random() - 0.5) * spread, lng: base.lng + (Math.random() - 0.5) * spread };
}

function distance(a: LatLng, b: LatLng) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

const PRICING = { Express: 4, Cargo: 8, Electric: 2 } as const;

function BookPage() {
  const user = useRequireAuth("customer");
  const navigate = useNavigate();
  const [pickup, setPickup] = useState("Lekki Phase 1");
  const [dropoff, setDropoff] = useState("Victoria Island");
  const [pkg, setPkg] = useState<"Express" | "Cargo" | "Electric">("Express");

  const pickupCoords = useMemo(() => randomNear(LAGOS), []);
  const dropoffCoords = useMemo(() => randomNear(LAGOS), []);
  const km = useMemo(() => Math.round(distance(pickupCoords, dropoffCoords) * 10) / 10, [pickupCoords, dropoffCoords]);
  const price = Math.round(km * 3 + PRICING[pkg]);
  const eta = Math.max(5, Math.round(km * 4));

  if (!user) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const d = createDelivery({
      customerId: user!.id,
      customerName: user!.name,
      pickup: { address: pickup, coords: pickupCoords },
      dropoff: { address: dropoff, coords: dropoffCoords },
      packageType: pkg,
    });
    navigate({ to: "/customer/track/$id", params: { id: d.id } });
  }

  return (
    <AppShell>
      <main className="p-6 max-w-2xl mx-auto">
        <h1 className="font-display text-3xl font-bold">Book a delivery</h1>
        <p className="mt-2 text-sm text-slate-500">Fastest last-mile logistics across the city.</p>

        <form onSubmit={handleSubmit} className="mt-8 rounded-2xl border border-surface-200 bg-white p-6 shadow-sm space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Pickup location</label>
            <div className="flex items-center gap-3 rounded-xl border border-surface-200 bg-surface-100 px-4 py-3">
              <div className="h-2 w-2 rounded-full bg-brand" />
              <input
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                required
                className="w-full bg-transparent text-sm font-medium outline-none"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Dropoff point</label>
            <div className="flex items-center gap-3 rounded-xl border border-surface-200 bg-surface-100 px-4 py-3">
              <div className="h-2 w-2 rounded-full bg-success" />
              <input
                value={dropoff}
                onChange={(e) => setDropoff(e.target.value)}
                required
                placeholder="Where to?"
                className="w-full bg-transparent text-sm font-medium outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {(["Express", "Cargo", "Electric"] as const).map((opt) => {
              const selected = pkg === opt;
              const optPrice = Math.round(km * 3 + PRICING[opt]);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setPkg(opt)}
                  className={`flex flex-col items-center gap-2 rounded-xl p-3 transition-colors ${
                    selected ? "border-2 border-brand bg-brand/5" : "border border-surface-200 hover:border-brand/30"
                  }`}
                >
                  <span className={`text-[10px] font-bold uppercase ${selected ? "text-navy" : "text-slate-400"}`}>{opt}</span>
                  <span className="text-sm font-bold">${optPrice}</span>
                </button>
              );
            })}
          </div>

          <div className="rounded-xl bg-surface-100 p-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-slate-500">Distance</p>
              <p className="font-display font-bold">{km} km</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">ETA</p>
              <p className="font-display font-bold">{eta} min</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Total</p>
              <p className="font-display font-bold text-brand">${price}</p>
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-brand py-4 font-bold text-white shadow-lg shadow-brand/20 hover:bg-brand-hover active:scale-[0.98] transition-all"
          >
            Confirm order
          </button>
        </form>
      </main>
    </AppShell>
  );
}