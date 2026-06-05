import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DashPoint — Last-mile delivery, on demand" },
      { name: "description", content: "Book deliveries, track riders live, and earn as a courier. DashPoint is a high-velocity last-mile logistics platform." },
      { property: "og:title", content: "DashPoint — Last-mile delivery, on demand" },
      { property: "og:description", content: "Book, track, and deliver across the city in minutes." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <AppShell>
      <main className="px-6 py-16 lg:py-24 max-w-6xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
            Live in your city
          </span>
        </div>
        <h1 className="font-display text-5xl lg:text-7xl font-bold tracking-tight text-navy max-w-3xl">
          Last-mile delivery, <span className="text-brand">on demand.</span>
        </h1>
        <p className="mt-6 text-lg text-slate-500 max-w-xl">
          Book a courier, watch them on the map, and get your package across the city in minutes. Or join as a rider and start earning today.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 max-w-2xl">
          <Link
            to="/login"
            search={{ role: "customer" }}
            className="group rounded-2xl border border-surface-200 bg-white p-6 shadow-sm hover:border-brand transition-all"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">For customers</p>
            <h3 className="mt-2 font-display text-2xl font-bold text-navy">I need a delivery</h3>
            <p className="mt-2 text-sm text-slate-500">Book in seconds, track in real time.</p>
            <p className="mt-4 text-sm font-bold text-brand group-hover:underline">Get started →</p>
          </Link>
          <Link
            to="/login"
            search={{ role: "rider" }}
            className="group rounded-2xl border border-surface-200 bg-navy text-white p-6 shadow-lg hover:bg-brand transition-all"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-white/60">For couriers</p>
            <h3 className="mt-2 font-display text-2xl font-bold">I'm a rider</h3>
            <p className="mt-2 text-sm text-white/70">Accept jobs nearby and earn on every trip.</p>
            <p className="mt-4 text-sm font-bold text-success">Open rider hub →</p>
          </Link>
        </div>
      </main>
    </AppShell>
  );
}
