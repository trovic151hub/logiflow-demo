import { useEffect, useRef, useState } from 'react'

const API_KEY = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY

function loadGoogleMaps(key) {
  if (typeof window === 'undefined') return Promise.resolve()
  if (window.google?.maps) return Promise.resolve()
  return new Promise((resolve, reject) => {
    if (document.getElementById('gmaps-script')) {
      const iv = setInterval(() => {
        if (window.google?.maps) { clearInterval(iv); resolve() }
      }, 80)
      return
    }
    const s = document.createElement('script')
    s.id = 'gmaps-script'
    s.src = `https://maps.googleapis.com/maps/api/js?key=${key}`
    s.async = true
    s.defer = true
    s.onload = resolve
    s.onerror = () => reject(new Error('Google Maps failed to load'))
    document.head.appendChild(s)
  })
}

function jobPinSvg(color, label) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="40" viewBox="0 0 30 40">
    <path d="M15 0C6.7 0 0 6.7 0 15c0 9 15 25 15 25S30 24 30 15C30 6.7 23.3 0 15 0z" fill="${color}"/>
    <circle cx="15" cy="15" r="8" fill="white"/>
    <text x="15" y="19" text-anchor="middle" font-size="9" font-weight="800" fill="${color}">${label}</text>
  </svg>`
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg)
}

/**
 * RiderMap — shows an overview map for the rider with markers for all jobs.
 * Props:
 *   jobs: Array<{ id, pickup: { coords: { lat, lng }, address }, status }>
 */
export function RiderMap({ jobs = [] }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef([])
  const initializedRef = useRef(false)
  const [error, setError] = useState(null)

  const LAGOS = { lat: 6.5244, lng: 3.3792 }

  // Boot: create map once
  useEffect(() => {
    if (!API_KEY) { setError('no-key'); return }
    let cancelled = false

    loadGoogleMaps(API_KEY)
      .then(() => {
        if (cancelled || !containerRef.current || initializedRef.current) return
        const G = window.google.maps

        const map = new G.Map(containerRef.current, {
          center: LAGOS,
          zoom: 12,
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          styles: [
            { featureType: 'poi', stylers: [{ visibility: 'off' }] },
            { featureType: 'transit', stylers: [{ visibility: 'off' }] },
          ],
        })

        mapRef.current = map
        initializedRef.current = true
      })
      .catch((e) => setError(e.message))

    return () => { cancelled = true; mapRef.current = null; initializedRef.current = false }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Live: update job markers whenever jobs array changes
  useEffect(() => {
    if (!mapRef.current || !initializedRef.current) return
    const G = window.google.maps
    const map = mapRef.current

    // Clear existing markers
    markersRef.current.forEach((m) => m.setMap(null))
    markersRef.current = []

    if (jobs.length === 0) return

    const bounds = new G.LatLngBounds()

    jobs.forEach((job, i) => {
      const coords = job.pickup?.coords
      if (!coords) return

      const isPending = job.status === 'pending'
      const color = isPending ? '#2563EB' : '#10B981' // blue for new, green for active
      const label = isPending ? '!' : '▶'

      const marker = new G.Marker({
        map,
        position: { lat: coords.lat, lng: coords.lng },
        icon: {
          url: jobPinSvg(color, label),
          scaledSize: new G.Size(30, 40),
          anchor: new G.Point(15, 40),
        },
        title: `${job.id} — ${job.pickup.address}`,
        zIndex: isPending ? 10 : 5,
      })

      // Info window on click
      const infoWindow = new G.InfoWindow({
        content: `
          <div style="font-family: sans-serif; font-size: 12px; max-width: 180px; padding: 2px 0">
            <p style="font-weight: 800; margin: 0 0 2px">${job.id}</p>
            <p style="margin: 0; color: #64748b">${job.pickup.address}</p>
            <p style="margin: 4px 0 0; font-weight: 700; color: ${color}">${
              isPending ? '⏳ Awaiting acceptance' : '🚀 Active'
            }</p>
          </div>
        `,
      })

      marker.addListener('click', () => {
        infoWindow.open({ anchor: marker, map })
      })

      markersRef.current.push(marker)
      bounds.extend({ lat: coords.lat, lng: coords.lng })
    })

    if (jobs.length > 0) {
      map.fitBounds(bounds, { top: 40, right: 40, bottom: 40, left: 40 })
      // Don't zoom in too far if only one marker
      const listener = G.event.addListenerOnce(map, 'bounds_changed', () => {
        if (map.getZoom() > 14) map.setZoom(14)
      })
    }
  }, [jobs])

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="absolute inset-0" />
      {error === 'no-key' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-500 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
          <p className="text-sm font-semibold text-slate-600">Map not configured</p>
          <p className="text-xs text-slate-400 mt-1">Add <code>VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY</code> to .env</p>
        </div>
      )}
      {error && error !== 'no-key' && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
          <p className="text-sm text-slate-500">Map unavailable</p>
        </div>
      )}
    </div>
  )
}
