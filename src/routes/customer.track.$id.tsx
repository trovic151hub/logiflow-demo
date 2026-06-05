import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { DeliveryMap } from "@/components/delivery-map";
import { useRequireAuth } from "@/lib/use-require-auth";
import { useStore, advanceCourier, updateDeliveryStatus, STATUS_LABEL } from "@/lib/mock-store";

export const Route = createFileRoute("/customer/track/$id")({
  head: () => ({ meta: [{ title: "Live tracking — DashPoint" }] }),
  component: TrackPage,
});

function TrackPage() {
  const user = useRequireAuth("customer");
  const { id } = useParams({ from: "/customer/track/$id" });
  const delivery = useStore((s) => s.deliveries.find((d) => d.id === id));

  // Simulated rider movement when in transit
  useEffect(() => {
    if (!delivery) return;
    if (delivery.status === "pending") {
      const t = setTimeout(() => updateDeliveryStatus(id, "accepted", "u-rider-1", "Marcus Chen"), 2500);
      return () => clearTimeout(t);
    }
    if (delivery.status === "accepted") {
      const t = setTimeout(() => updateDeliveryStatus(id, "picked_up"), 3000);
      return () => clearTimeout(t);
    }
    if (delivery.status === "picked_up") {
      const t = setTimeout(() => updateDeliveryStatus(id, "in_transit"), 2000);
      return () => clearTimeout(t);
    }
    if (delivery.status === "in_transit") {
      let frac = 0;
      const iv = setInterval(() => {
        frac += 0.05;
        if (frac >= 1) {
          clearInterval(iv);
          updateDeliveryStatus(id, "delivered");
        } else {
          advanceCourier(id, frac);
        }
      }, 1500);
      return () => clearInterval(iv);
    }
  }, [delivery?.status, id]);

  if (!user) return null;
  if (!delivery)
    return (
      <AppShell>
        <main className="p-12 text-center text-slate-500">Delivery not found.</main>
      </AppShell>
    );

  const steps: Array<{ key: typeof delivery.status; label: string }> = [
    { key: "pending", label: "Order placed" },
    { key: "accepted", label: "Rider accepted" },
    { key: "picked_up", label: "Picked up" },
    { key: "in_transit", label: "In transit" },
    { key: "delivered", label: "Delivered" },
  ];
  const currentIdx = steps.findIndex((s) => s.key === delivery.status);

  return (
    <AppShell>
      <main className="p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-8 relative h-[70vh]">
          <DeliveryMap
            pickup={delivery.pickup.coords}
            dropoff={delivery.dropoff.coords}
            courier={delivery.courierPosition}
            className="h-full"
          />
          <div className="absolute top-6 left-6 flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-xl ring-1 ring-black/5">
            <div className="size-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs font-bold">Live · {delivery.id}</span>
          </div>
        </section>

        <aside className="lg:col-span-4 space-y-6">
          <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Status</p>
            <p className="mt-1 font-display text-2xl font-bold text-brand">{STATUS_LABEL[delivery.status]}</p>
            <p className="mt-1 text-sm text-slate-500">ETA · {delivery.etaMinutes} min</p>

            <ol className="mt-6 space-y-3">
              {steps.map((s, i) => {
                const done = i <= currentIdx;
                return (
                  <li key={s.key} className="flex items-center gap-3">
                    <span
                      className={`size-3 rounded-full ${done ? "bg-brand" : "bg-surface-200"} ${
                        i === currentIdx ? "ring-4 ring-brand/20" : ""
                      }`}
                    />
                    <span className={`text-sm ${done ? "font-bold text-navy" : "text-slate-400"}`}>{s.label}</span>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Your courier</p>
            <div className="mt-3 flex items-center gap-4">
              <div className="size-12 rounded-xl bg-brand/10 flex items-center justify-center font-bold text-brand">
                {(delivery.riderName ?? "—").split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold">{delivery.riderName ?? "Awaiting rider…"}</p>
                <p className="text-xs text-amber-500">★ 4.9 <span className="text-slate-400">(1,240 trips)</span></p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm space-y-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">From</p>
              <p className="text-sm font-medium">{delivery.pickup.address}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">To</p>
              <p className="text-sm font-medium">{delivery.dropoff.address}</p>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-surface-200">
              <span className="text-xs text-slate-500">{delivery.packageType} · {delivery.distanceKm} km</span>
              <span className="font-display font-bold">${delivery.price}</span>
            </div>
          </div>

          <Link to="/customer" className="block text-center text-sm font-bold text-brand hover:underline">
            ← Back to dashboard
          </Link>
        </aside>
      </main>
    </AppShell>
  );
}