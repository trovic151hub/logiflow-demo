import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { DeliveryMap } from "@/components/delivery-map";
import { useRequireAuth } from "@/lib/use-require-auth";
import {
  useStore,
  updateDeliveryStatus,
  advanceCourier,
  STATUS_LABEL,
  type DeliveryStatus,
} from "@/lib/mock-store";

export const Route = createFileRoute("/rider/job/$id")({
  head: () => ({ meta: [{ title: "Active job — DashPoint" }] }),
  component: RiderJobPage,
});

const NEXT: Partial<Record<DeliveryStatus, { next: DeliveryStatus; label: string }>> = {
  accepted: { next: "picked_up", label: "Mark as picked up" },
  picked_up: { next: "in_transit", label: "Start trip" },
  in_transit: { next: "delivered", label: "Mark delivered" },
};

function RiderJobPage() {
  const user = useRequireAuth("rider");
  const navigate = useNavigate();
  const { id } = useParams({ from: "/rider/job/$id" });
  const delivery = useStore((s) => s.deliveries.find((d) => d.id === id));
  const [autoMove, setAutoMove] = useState(true);

  useEffect(() => {
    if (!delivery || delivery.status !== "in_transit" || !autoMove) return;
    let frac = 0;
    const iv = setInterval(() => {
      frac += 0.05;
      if (frac >= 1) {
        clearInterval(iv);
      } else {
        advanceCourier(id, frac);
      }
    }, 1500);
    return () => clearInterval(iv);
  }, [delivery?.status, id, autoMove]);

  if (!user) return null;
  if (!delivery)
    return (
      <AppShell>
        <main className="p-12 text-center text-slate-500">Job not found.</main>
      </AppShell>
    );

  const nextStep = NEXT[delivery.status];

  return (
    <AppShell>
      <main className="p-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-8 h-[70vh]">
          <DeliveryMap
            pickup={delivery.pickup.coords}
            dropoff={delivery.dropoff.coords}
            courier={delivery.courierPosition}
            className="h-full"
          />
        </section>

        <aside className="lg:col-span-4 space-y-6">
          <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Job</p>
            <h2 className="mt-1 font-display text-2xl font-bold">{delivery.id}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {delivery.packageType} · {delivery.distanceKm} km · ${delivery.price}
            </p>

            <div className="mt-6 space-y-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Pickup</p>
                <p className="text-sm font-medium">{delivery.pickup.address}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Dropoff</p>
                <p className="text-sm font-medium">{delivery.dropoff.address}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Customer</p>
                <p className="text-sm font-medium">{delivery.customerName}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-surface-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Current status</p>
              <span className="rounded-full bg-brand/10 px-3 py-1 text-[10px] font-bold uppercase text-brand">
                {STATUS_LABEL[delivery.status]}
              </span>
            </div>

            {nextStep ? (
              <button
                onClick={() => {
                  updateDeliveryStatus(id, nextStep.next);
                  if (nextStep.next === "in_transit") setAutoMove(true);
                }}
                className="w-full rounded-xl bg-brand py-3 font-bold text-white shadow-lg shadow-brand/20 hover:bg-brand-hover"
              >
                {nextStep.label}
              </button>
            ) : delivery.status === "delivered" ? (
              <div>
                <p className="text-sm text-success font-bold">✓ Delivered successfully</p>
                <button
                  onClick={() => navigate({ to: "/rider" })}
                  className="mt-4 w-full rounded-xl bg-navy py-3 font-bold text-white hover:bg-brand"
                >
                  Back to dashboard
                </button>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No action available.</p>
            )}
          </div>

          <Link to="/rider" className="block text-center text-sm font-bold text-brand hover:underline">
            ← All jobs
          </Link>
        </aside>
      </main>
    </AppShell>
  );
}