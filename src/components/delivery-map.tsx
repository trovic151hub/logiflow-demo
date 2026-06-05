import { useEffect, useRef, useState } from "react";
import type { LatLng } from "@/lib/mock-store";

declare global {
  interface Window {
    google?: any;
    initDashpointMap?: () => void;
    __dashpointMapReady?: boolean;
    __dashpointMapQueue?: Array<() => void>;
  }
}

const BROWSER_KEY = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY as string | undefined;
const TRACKING_ID = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID as string | undefined;

function loadMaps(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.__dashpointMapReady) return Promise.resolve();
  return new Promise((resolve) => {
    window.__dashpointMapQueue = window.__dashpointMapQueue ?? [];
    window.__dashpointMapQueue.push(resolve);
    if (document.getElementById("dashpoint-gmaps")) return;
    window.initDashpointMap = () => {
      window.__dashpointMapReady = true;
      window.__dashpointMapQueue?.forEach((fn) => fn());
      window.__dashpointMapQueue = [];
    };
    const s = document.createElement("script");
    s.id = "dashpoint-gmaps";
    s.async = true;
    const params = new URLSearchParams({
      key: BROWSER_KEY ?? "",
      loading: "async",
      callback: "initDashpointMap",
    });
    if (TRACKING_ID) params.set("channel", TRACKING_ID);
    s.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    document.head.appendChild(s);
  });
}

export type DeliveryMapProps = {
  pickup?: LatLng;
  dropoff?: LatLng;
  courier?: LatLng;
  className?: string;
};

export function DeliveryMap({ pickup, dropoff, courier, className }: DeliveryMapProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const lineRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!BROWSER_KEY) {
      setError("Google Maps key missing.");
      return;
    }
    let cancelled = false;
    loadMaps()
      .then(() => {
        if (cancelled || !ref.current || !window.google?.maps) return;
        mapRef.current = new window.google.maps.Map(ref.current, {
          center: pickup ?? { lat: 6.5244, lng: 3.3792 },
          zoom: 13,
          disableDefaultUI: true,
          zoomControl: true,
          styles: [
            { featureType: "poi", stylers: [{ visibility: "off" }] },
            { featureType: "transit", stylers: [{ visibility: "off" }] },
          ],
        });
        setReady(true);
      })
      .catch((e) => setError(String(e)));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ready || !mapRef.current || !window.google?.maps) return;
    const g = window.google.maps;
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    lineRef.current?.setMap(null);
    lineRef.current = null;

    const bounds = new g.LatLngBounds();
    if (pickup) {
      const m = new g.Marker({
        position: pickup,
        map: mapRef.current,
        label: { text: "A", color: "#fff", fontWeight: "700" },
      });
      markersRef.current.push(m);
      bounds.extend(pickup);
    }
    if (dropoff) {
      const m = new g.Marker({
        position: dropoff,
        map: mapRef.current,
        label: { text: "B", color: "#fff", fontWeight: "700" },
      });
      markersRef.current.push(m);
      bounds.extend(dropoff);
    }
    if (pickup && dropoff) {
      lineRef.current = new g.Polyline({
        path: [pickup, dropoff],
        geodesic: true,
        strokeColor: "#4F46E5",
        strokeOpacity: 0.9,
        strokeWeight: 4,
        map: mapRef.current,
      });
    }
    if (courier) {
      const m = new g.Marker({
        position: courier,
        map: mapRef.current,
        icon: {
          path: g.SymbolPath.CIRCLE,
          scale: 9,
          fillColor: "#10B981",
          fillOpacity: 1,
          strokeColor: "#fff",
          strokeWeight: 3,
        },
      });
      markersRef.current.push(m);
      bounds.extend(courier);
    }
    if (!bounds.isEmpty()) mapRef.current.fitBounds(bounds, 80);
  }, [ready, pickup, dropoff, courier]);

  return (
    <div className={className} style={{ position: "relative", minHeight: 320 }}>
      <div ref={ref} className="absolute inset-0 rounded-2xl overflow-hidden bg-surface-200" />
      {error && (
        <div className="absolute inset-0 grid place-items-center text-sm text-slate-500 bg-surface-200 rounded-2xl">
          {error}
        </div>
      )}
    </div>
  );
}