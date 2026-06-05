## DashPoint — Last-Mile Delivery Demo

A frontend-only demo with the "High-velocity utility" direction: indigo brand (#4F46E5), Space Grotesk display + Inter body, white cards on a soft surface, and a split map/details layout. Two role flows — Customer and Rider — share a common shell. Live tracking uses the Lovable Google Maps connector.

### Tech & data
- TanStack Start (file-based routes), Tailwind v4, shadcn/ui.
- **Mock data layer**: in-memory store in `src/lib/mock-store.ts` with seeded deliveries, riders, and a fake auth (localStorage-backed session — no real backend).
- Simulated realtime: a `setInterval` advances a rider marker along the route polyline and bumps status (pending → accepted → picked up → in transit → delivered).
- Google Maps via the Lovable connector (`VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY`) loaded async with `loading=async&callback=initMap`. `google.maps.Marker` only (no `mapId`).

### Routes
```text
/                         Landing — hero, "I need a delivery" vs "I'm a rider" CTAs
/login                    Shared login (role toggle: Customer / Rider)
/register                 Shared register (role toggle)

/customer                 Customer dashboard — recent deliveries + "Book new" panel
/customer/book            Create delivery request (pickup, dropoff, package size, ETA quote)
/customer/track/$id       Split-screen live tracking — map left, status + courier card right
/customer/history         Full delivery history table

/rider                    Rider dashboard — earnings strip + incoming requests feed
/rider/job/$id            Active job — map + status update buttons (Pick up / In transit / Delivered)
/rider/earnings           Earnings + completed deliveries breakdown
```

A pathless `_app` route guard checks the mock session and redirects to `/login`; role mismatch routes redirect to the correct dashboard.

### Components
- `AppShell` — sticky nav (logo, role-aware links, online indicator, avatar)
- `DeliveryMap` — wraps Google Maps; props: pickup, dropoff, courierPosition; auto-fits bounds and draws a polyline route
- `BookDeliveryForm`, `DeliveryStatusTimeline`, `RiderJobCard`, `EarningsStatCard`, `IncomingRequestsList`

### Mock store shape
```text
Delivery { id, customerId, riderId?, pickup, dropoff, packageType, price, status, createdAt, eta }
Rider    { id, name, rating, trips, online }
Session  { userId, role: "customer" | "rider" }
```
A small `useDeliveries()` hook exposes the store as React state with a tick-based subscription so status changes propagate live.

### Step plan
1. Connect Google Maps via `standard_connectors--connect` so the browser key is available.
2. Add design tokens (indigo brand, surface scale) to `src/styles.css`; install `@fontsource/space-grotesk` and `@fontsource/inter`.
3. Build mock store, session helpers, and `_app` auth guard.
4. Landing, login, register pages.
5. Customer flow: dashboard → book → track (with live map + simulated rider movement) → history.
6. Rider flow: dashboard with incoming jobs → accept/reject → active job with status updates → earnings.
7. Seed demo data and a "Reset demo" button in the footer.

### Out of scope
- Admin panel, real auth, real payments, real-time backend, push notifications.
