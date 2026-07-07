import { useEffect, useMemo, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MapPin, Zap, Package, Leaf, ArrowLeft, ArrowRight,
  CheckCircle2, ArrowLeftRight, Navigation, AlertTriangle,
  Maximize2, X, ChevronDown,
} from 'lucide-react'
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { AppShell } from '@/components/app-shell'
import { useRequireAuth } from '@/lib/use-require-auth'
import { createDelivery } from '@/lib/mock-store'

/* ─── Fix Leaflet icon paths broken by bundlers ──────────────────────── */
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})
// import { useState, useEffect } from 'react'
// import { AlertTriangle, CheckCircle2 } from 'lucide-react'

function WeightSlider({ weight, setWeight, wMeta, weightSurcharge }) {
  const pct = Math.round(((weight - 1) / 49) * 100)
  const thresholdPct = Math.round(((20 - 1) / 49) * 100)

  // Local buffer so the field can hold "" or a half-typed value while editing,
  // instead of being clamped (and visibly reset) on every keystroke. Commits
  // back to `weight` only on blur / Enter.
  const [inputValue, setInputValue] = useState(String(weight))
  useEffect(() => {
    setInputValue(String(weight))
  }, [weight])

  function commitInput(raw) {
    if (raw === '') {
      setInputValue(String(weight))
      return
    }

    const parsed = Number(raw)
    const clamped = Number.isFinite(parsed) ? Math.min(50, Math.max(1, Math.round(parsed))) : weight
    setWeight(clamped)
    setInputValue(String(clamped))
  }

  function handleInputChange(raw) {
    setInputValue(raw)

    if (raw === '') return

    const parsed = Number(raw)
    if (!Number.isFinite(parsed)) return

    const clamped = Math.min(50, Math.max(1, Math.round(parsed)))
    setWeight(clamped)
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-800">Package weight</p>
        <span
          className="rounded-full border px-2.5 py-0.5 text-[11px] font-semibold"
          style={{ background: wMeta.bg, borderColor: wMeta.border, color: wMeta.text }}
        >
          {wMeta.label}
        </span>
      </div>

      {/* taller hit area (h-8 vs h-5) makes dragging easier to grab, track stays visually h-2 */}
      <div className="relative mb-1 flex h-8 items-center">
        <div className="absolute inset-x-0 h-2 rounded-full bg-slate-200 overflow-hidden">
          <div
            className="h-full rounded-full transition-[width] duration-75"
            style={{ width: `${pct}%`, background: wMeta.color }}
          />
        </div>
        <div
          className="absolute top-0 bottom-0 flex items-center pointer-events-none"
          style={{ left: `${thresholdPct}%` }}
        >
          <div className="h-4 w-px bg-slate-400 opacity-60" />
        </div>
        {/* touchAction: 'none' stops touch-drag from being swallowed as a page scroll */}
        <input
          type="range"
          min={1}
          max={50}
          step={1}
          value={weight}
          onChange={(e) => setWeight(Number(e.target.value))}
          className="absolute inset-x-0 h-full w-full cursor-pointer opacity-0"
          style={{ zIndex: 2, touchAction: 'none' }}
        />
        <div
          className="pointer-events-none absolute top-1/2 -translate-y-1/2 h-5 w-5 rounded-full border-2 border-white shadow-md"
          style={{ left: `calc(${pct}% - 10px)`, background: wMeta.color, zIndex: 1 }}
        />
      </div>

      <div className="flex justify-between text-[10px] text-slate-400 mb-4">
        <span>1 kg</span>
        <span className="flex items-center gap-1">
          <span className="h-1.5 w-px bg-slate-400" />
          20 kg limit
        </span>
        <span>50 kg</span>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2">
          <input
            type="number"
            min={1}
            max={50}
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onBlur={(e) => commitInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
            className="w-14 bg-transparent text-sm font-bold text-slate-800 outline-none"
          />
          <span className="text-xs text-slate-400">kg</span>
        </div>
        <div
          className="flex flex-1 items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium"
          style={{ background: wMeta.bg, borderColor: wMeta.border, color: wMeta.text }}
        >
          {weight > 20 ? (
            <>
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              Extra charge: ₦{weightSurcharge}
            </>
          ) : (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              No surcharge
            </>
          )}
        </div>
      </div>
    </div>
  )
}
const makePin = (color) =>
  new L.DivIcon({
    html: `<div style="
      width:13px;height:13px;border-radius:50%;
      background:${color};border:2.5px solid #fff;
      box-shadow:0 1px 6px rgba(0,0,0,.3)
    "></div>`,
    className: '',
    iconAnchor: [6, 6],
  })

const PICKUP_PIN = makePin('#6366f1')
const DROPOFF_PIN = makePin('#16a34a')

/* ─── Static data ────────────────────────────────────────────────────── */
const ADDRESS_SUGGESTIONS = [
  { label: 'Lekki Phase 1',   coords: { lat: 6.4328, lng: 3.4382 } },
  { label: 'Victoria Island', coords: { lat: 6.4270, lng: 3.4300 } },
  { label: 'Ikeja City Mall', coords: { lat: 6.5964, lng: 3.3426 } },
  { label: 'Yaba Tech',       coords: { lat: 6.5058, lng: 3.3799 } },
  { label: 'Surulere',        coords: { lat: 6.4923, lng: 3.3652 } },
  { label: 'Magodo Estate',   coords: { lat: 6.6100, lng: 3.3420 } },
]

const PACKAGE_TYPES = [
  { id: 'Express',  label: 'Express',  desc: 'Fastest delivery',   Icon: Zap,     surcharge: 4, accent: '#eab308' },
  { id: 'Cargo',    label: 'Cargo',    desc: 'Heavy & bulky items', Icon: Package, surcharge: 8, accent: '#3b82f6' },
  { id: 'Electric', label: 'Electric', desc: 'Eco-friendly ride',   Icon: Leaf,    surcharge: 2, accent: '#16a34a' },
]

const STEPS = ['Route', 'Package', 'Review']

/* ─── Pure helpers ───────────────────────────────────────────────────── */
function filterSuggestions(query) {
  if (!query.trim()) return ADDRESS_SUGGESTIONS
  return ADDRESS_SUGGESTIONS.filter((s) =>
    s.label.toLowerCase().includes(query.toLowerCase())
  )
}

function resolveCoords(label, fallback) {
  const match = ADDRESS_SUGGESTIONS.find(
    (s) => s.label.toLowerCase() === label.toLowerCase()
  )
  return match ? match.coords : fallback
}

async function fetchLagosSuggestions(query, signal) {
  if (!query.trim() || query.trim().length < 2) {
    return ADDRESS_SUGGESTIONS
  }

  const viewbox = [2.60, 6.80, 4.00, 5.10].join(',')
  const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=8&countrycodes=ng&viewbox=${viewbox}&bounded=1&q=${encodeURIComponent(query)}`

  try {
    const response = await fetch(url, {
      headers: { 'Accept-Language': 'en' },
      signal,
    })
    if (!response.ok) throw new Error('Search failed')
    const items = await response.json()
    return items.map((item) => ({
      label: item.display_name,
      coords: { lat: Number(item.lat), lng: Number(item.lon) },
    }))
  } catch (error) {
    return ADDRESS_SUGGESTIONS
  }
}

function haversine(a, b) {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
    Math.cos((b.lat * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

function weightMeta(w) {
  if (w <= 10) return { label: 'Light',    color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d' }
  if (w <= 20) return { label: 'Standard', color: '#d97706', bg: '#fffbeb', border: '#fde68a', text: '#b45309' }
  return           { label: 'Heavy — surcharge applies', color: '#dc2626', bg: '#fef2f2', border: '#fecaca', text: '#b91c1c' }
}

/* ─── Map sub-components ─────────────────────────────────────────────── */
function BoundsFitter({ pickup, dropoff }) {
  const map = useMap()
  useEffect(() => {
    const bounds = L.latLngBounds(
      [pickup.lat, pickup.lng],
      [dropoff.lat, dropoff.lng]
    )
    map.fitBounds(bounds, { padding: [44, 44], maxZoom: 14 })
  }, [map, pickup.lat, pickup.lng, dropoff.lat, dropoff.lng])
  return null
}

function LiveMap({ pickup, dropoff, className, zoom = 12, zoomControl = true }) {
  const center = [
    (pickup.lat + dropoff.lat) / 2,
    (pickup.lng + dropoff.lng) / 2,
  ]
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className={className}
      style={{ width: '100%', height: '100%' }}
      zoomControl={zoomControl}
      scrollWheelZoom={false}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap"
      />
      <Marker position={[pickup.lat, pickup.lng]} icon={PICKUP_PIN} />
      <Marker position={[dropoff.lat, dropoff.lng]} icon={DROPOFF_PIN} />
      <Polyline
        positions={[[pickup.lat, pickup.lng], [dropoff.lat, dropoff.lng]]}
        color="#6366f1"
        weight={2.5}
        dashArray="7 5"
        opacity={0.8}
      />
      <BoundsFitter pickup={pickup} dropoff={dropoff} />
    </MapContainer>
  )
}
 

  /* ── Shared address suggestion dropdown ── */
  function SuggestionDropdown({
    type,
    items,
    show,
    query,
    onSelectAddress,
    onUseMyLocation,
    geoLabel,
    geoReady,
  }) {
    if (!show) return null

    const isPickup = type === 'pickup'

    return (
      <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-40 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <button
          type="button"
          onClick={() => onUseMyLocation(type)}
          disabled={!geoReady}
          className="flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left hover:bg-indigo-50 disabled:opacity-40"
        >
          <Navigation className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
          <span className="truncate text-sm font-medium text-indigo-600">{geoLabel}</span>
        </button>

        {items.length === 0 ? (
          <p className="px-4 py-3 text-sm text-slate-400">No results</p>
        ) : (
          items.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => onSelectAddress(type, item)}
              className={[
                'flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50',
                query === item.label ? 'bg-slate-50 font-semibold text-brand' : '',
              ].join(' ')}
            >
              <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-300" />
              {item.label}
            </button>
          ))
        )}
      </div>
    )
  }

  /* ── Address input field ── */
  function AddressField({
    type,
    query,
    setQuery,
    showDrop,
    setShowDrop,
    suggestions,
    geoLabel,
    geoReady,
    onUseMyLocation,
    onSelectAddress,
  }) {
    const inputRef = useRef(null)
    const [focused, setFocused] = useState(false)

    const isPickup = type === 'pickup'
    const label = isPickup ? 'Pickup' : 'Dropoff'
    const hint = isPickup ? 'Where should we collect the package?' : 'Where is it going?'
    const pinColor = isPickup ? 'text-indigo-500' : 'text-green-600'
    const dotColor = isPickup ? 'bg-indigo-100 ring-indigo-300' : 'bg-green-100 ring-green-300'
    const dotInner = isPickup ? 'bg-indigo-500' : 'bg-green-600'

    const handleFocus = () => {
      setFocused(true)
      setShowDrop(true)
    }

    const handleBlur = () => {
      setFocused(false)
      window.setTimeout(() => setShowDrop(false), 150)
    }

    return (
      <div className="relative">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-black-400">{label}</p>
              <p className="mt-0.5 text-xs text-slate-400">{hint}</p>
            </div>
            <span className={`flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-opacity-30 ${dotColor}`}>
              <span className={`h-2.5 w-2.5 rounded-full ${dotInner}`} />
            </span>
          </div>

          <div
            onMouseDown={() => {
              setFocused(true)
              setShowDrop(true)
              requestAnimationFrame(() => inputRef.current?.focus())
            }}
            onClick={() => {
              setFocused(true)
              setShowDrop(true)
              inputRef.current?.focus()
            }}
            className={[
              'flex min-w-0 cursor-text items-center gap-2 rounded-2xl border bg-slate-50 px-3 py-2 transition-all duration-150',
              focused ? 'border-indigo-400 shadow-[0_0_0_3px_rgba(99,102,241,0.10)]' : 'border-slate-200',
            ].join(' ')}
          >
            <MapPin className={`h-4 w-4 shrink-0 ${pinColor}`} />
            <input
              ref={inputRef}
              type="text"
              autoComplete="off"
              spellCheck={false}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setShowDrop(true)
              }}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder={`Enter ${label.toLowerCase()} address`}
              autoCapitalize="words"
              autoCorrect="off"
              className="min-w-0 w-full bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
            />
            {query ? (
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setQuery('')
                  setShowDrop(true)
                  inputRef.current?.focus()
                }}
                className="shrink-0 rounded-full p-0.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : (
              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-300" />
            )}
          </div>
        </div>

        <SuggestionDropdown
          type={type}
          items={suggestions}
          show={showDrop}
          query={query}
          onSelectAddress={onSelectAddress}
          onUseMyLocation={onUseMyLocation}
          geoLabel={geoLabel}
          geoReady={geoReady}
        />
      </div>
    )
  }
/* ─── Main page ──────────────────────────────────────────────────────── */
export default function Book() {
  const user = useRequireAuth('customer')
  const navigate = useNavigate()

  /* form state */
  const [step, setStep]               = useState(0)
  const [pickupQuery, setPickupQuery] = useState('')
  const [dropoffQuery, setDropoffQuery] = useState('')
  const [pickupCoords, setPickupCoords] = useState({ lat: 6.4328, lng: 3.4382 })
  const [dropoffCoords, setDropoffCoords] = useState({ lat: 6.4270, lng: 3.4300 })
  const [confirmedPickup, setConfirmedPickup]   = useState('Lekki Phase 1')
  const [confirmedDropoff, setConfirmedDropoff] = useState('Victoria Island')
  const [showPickupDrop, setShowPickupDrop]   = useState(false)
  const [showDropoffDrop, setShowDropoffDrop] = useState(false)
  const [pickupSuggestions, setPickupSuggestions] = useState(ADDRESS_SUGGESTIONS)
  const [dropoffSuggestions, setDropoffSuggestions] = useState(ADDRESS_SUGGESTIONS)
  const [pkg, setPkg]     = useState('Express')
  const [weight, setWeight] = useState(5)
  const [note, setNote]   = useState('')

  /* map UI state */
  const [mapExpanded, setMapExpanded]   = useState(false)
  const [mobileMapOpen, setMobileMapOpen] = useState(false)

  /* geolocation */
  const [geoCoords, setGeoCoords]   = useState(null)
  const [geoLabel, setGeoLabel]     = useState('Detecting location…')
  const [geoReady, setGeoReady]     = useState(false)

  /* ── Geolocation on mount ── */
  useEffect(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setGeoCoords(coords)
        setGeoLabel(`My location (${coords.lat.toFixed(3)}, ${coords.lng.toFixed(3)})`)
        setGeoReady(true)
      },
      () => setGeoLabel('Location unavailable')
    )
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const timer = setTimeout(() => {
      fetchLagosSuggestions(pickupQuery, controller.signal).then((items) => {
        if (!controller.signal.aborted) setPickupSuggestions(items)
      })
    }, 250)
    return () => {
      controller.abort()
      clearTimeout(timer)
    }
  }, [pickupQuery])

  useEffect(() => {
    const controller = new AbortController()
    const timer = setTimeout(() => {
      fetchLagosSuggestions(dropoffQuery, controller.signal).then((items) => {
        if (!controller.signal.aborted) setDropoffSuggestions(items)
      })
    }, 250)
    return () => {
      controller.abort()
      clearTimeout(timer)
    }
  }, [dropoffQuery])

  /* ── Scroll top on step change ── */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [step])

  /* ── Derived values ── */
  const km = useMemo(
    () => Math.round(haversine(pickupCoords, dropoffCoords) * 10) / 10,
    [pickupCoords, dropoffCoords]
  )
  const selectedPkg     = PACKAGE_TYPES.find((p) => p.id === pkg) || PACKAGE_TYPES[0]
  const weightSurcharge = weight > 20 ? Math.round((weight - 20) * 50) : 0
  const price           = Math.round(km * 3 + selectedPkg.surcharge + weightSurcharge)
  const eta             = Math.max(5, Math.round(km * 4))
  const wMeta           = weightMeta(weight)

  const routeValid   = pickupQuery.trim() && dropoffQuery.trim() &&
                       pickupQuery.trim().toLowerCase() !== dropoffQuery.trim().toLowerCase()
  const packageValid = weight >= 1 && weight <= 50
  const advanceBlocked = (step === 0 && !routeValid) || (step === 1 && !packageValid)

  if (!user) return null

  /* ── Address selection handlers ── */
  function selectAddress(type, item) {
    if (type === 'pickup') {
      setPickupQuery(item.label)
      setPickupCoords(item.coords)
      setConfirmedPickup(item.label)
      setShowPickupDrop(false)
    } else {
      setDropoffQuery(item.label)
      setDropoffCoords(item.coords)
      setConfirmedDropoff(item.label)
      setShowDropoffDrop(false)
    }
  }

  function useMyLocation(type) {
    if (!geoCoords) return
    if (type === 'pickup') {
      setPickupQuery(geoLabel)
      setPickupCoords(geoCoords)
      setConfirmedPickup(geoLabel)
      setShowPickupDrop(false)
    } else {
      setDropoffQuery(geoLabel)
      setDropoffCoords(geoCoords)
      setConfirmedDropoff(geoLabel)
      setShowDropoffDrop(false)
    }
  }

  function swapAddresses() {
    const pq = pickupQuery, dq = dropoffQuery
    const pc = pickupCoords, dc = dropoffCoords
    const cp = confirmedPickup, cd = confirmedDropoff
    setPickupQuery(dq);  setDropoffQuery(pq)
    setPickupCoords(dc); setDropoffCoords(pc)
    setConfirmedPickup(cd); setConfirmedDropoff(cp)
    setShowPickupDrop(false); setShowDropoffDrop(false)
  }

  function handleAdvance() {
    if (advanceBlocked) return
    if (step === 0) {
      setPickupCoords(resolveCoords(pickupQuery, pickupCoords))
      setDropoffCoords(resolveCoords(dropoffQuery, dropoffCoords))
      setConfirmedPickup(pickupQuery)
      setConfirmedDropoff(dropoffQuery)
    }
    setStep((s) => Math.min(s + 1, 2))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const delivery = createDelivery({
      customerId:   user.id,
      customerName: user.name,
      pickup:  { address: confirmedPickup,  coords: pickupCoords },
      dropoff: { address: confirmedDropoff, coords: dropoffCoords },
      packageType: pkg,
    })
    navigator.clipboard?.writeText(delivery.trackingId)
    navigate('/customer/track/' + delivery.id)
  }

  /* ════════════════════════════════════════════
     SUB-COMPONENTS (defined inside so they have
     access to state via closure — no prop drilling)
  ════════════════════════════════════════════ */

  /* ── Step progress bar ── */
  function StepBar() {
    return (
      <div className="mb-8 flex items-center">
        {STEPS.map((label, idx) => {
          const done   = step > idx
          const active = step === idx
          const canJump = idx < step
          return (
            <div key={label} className="flex flex-1 items-center last:flex-none">
              <button
                type="button"
                disabled={!canJump}
                onClick={() => canJump && setStep(idx)}
                className={[
                  'flex flex-col items-center gap-1.5',
                  canJump ? 'cursor-pointer' : 'cursor-default',
                ].join(' ')}
              >
                {/* circle */}
                <div
                  className={[
                    'flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-300',
                    done   ? 'border-brand bg-brand text-white'
                    : active ? 'border-brand bg-white text-brand shadow-[0_0_0_4px_rgba(99,102,241,0.12)]'
                    :          'border-slate-200 bg-white text-slate-400',
                  ].join(' ')}
                >
                  {done
                    ? <CheckCircle2 className="h-3.5 w-3.5" />
                    : <span>{idx + 1}</span>
                  }
                </div>
                {/* label */}
                <span
                  className={[
                    'hidden text-[10px] font-semibold uppercase tracking-widest transition-colors sm:block',
                    active ? 'text-brand'
                    : done  ? 'text-slate-500'
                    :         'text-slate-300',
                  ].join(' ')}
                >
                  {label}
                </span>
              </button>

              {/* connector line (not after last) */}
              {idx < STEPS.length - 1 && (
                <div className="relative mx-2 h-0.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-brand transition-all duration-500"
                    style={{ width: step > idx ? '100%' : '0%' }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }


  /* ── Weight slider with colour track ── */

  /* ── Desktop aside map panel ── */
  function DesktopMap() {
    return (
      <div className="sticky top-6 space-y-4">
        {/* map card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Live route
            </p>
            <button
              type="button"
              onClick={() => setMapExpanded(true)}
              className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-500 hover:bg-slate-100"
            >
              <Maximize2 className="h-3 w-3" />
              Expand
            </button>
          </div>
          <div className="h-72 overflow-hidden rounded-xl border border-slate-100">
            <LiveMap
              pickup={pickupCoords}
              dropoff={dropoffCoords}
              className="h-full w-full"
            />
          </div>
          {/* legend */}
          <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" /> Pickup
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-green-600" /> Dropoff
            </span>
          </div>
        </div>

        {/* stats */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'ETA',       val: `${eta} min` },
              { label: 'Distance',  val: `${km} km`   },
              { label: 'Est. cost', val: `₦${price}`, accent: true },
            ].map(({ label, val, accent }) => (
              <div key={label} className="rounded-xl bg-slate-50 p-3 text-center">
                <p className="text-[10px] uppercase tracking-widest text-slate-400">{label}</p>
                <p className={`mt-1 text-sm font-bold ${accent ? 'text-brand' : 'text-slate-800'}`}>
                  {val}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-xs text-slate-500">
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-500" />
            Tracking ID generated after booking confirmation.
          </div>
        </div>
      </div>
    )
  }

  /* ── Expanded fullscreen map overlay ── */
  function MapOverlay() {
    if (!mapExpanded) return null
    return (
      <div
        className="fixed inset-0 z-50 flex flex-col bg-black/50"
        onClick={() => setMapExpanded(false)}
      >
        <div
          className="relative m-4 flex flex-1 flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
            <div>
              <p className="text-sm font-semibold text-slate-800">Route preview</p>
              <p className="text-xs text-slate-400">{confirmedPickup} → {confirmedDropoff}</p>
            </div>
            <button
              onClick={() => setMapExpanded(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 hover:bg-slate-50"
            >
              <X className="h-4 w-4 text-slate-500" />
            </button>
          </div>
          <div className="flex-1">
            <LiveMap
              pickup={pickupCoords}
              dropoff={dropoffCoords}
              className="h-full w-full"
            />
          </div>
          <div className="grid grid-cols-3 gap-3 border-t border-slate-100 p-4">
            {[
              { label: 'ETA',      val: `${eta} min` },
              { label: 'Distance', val: `${km} km`   },
              { label: 'Price',    val: `₦${price}`, accent: true },
            ].map(({ label, val, accent }) => (
              <div key={label} className="rounded-xl bg-slate-50 p-3 text-center">
                <p className="text-[10px] uppercase tracking-widest text-slate-400">{label}</p>
                <p className={`mt-0.5 text-sm font-bold ${accent ? 'text-brand' : 'text-slate-800'}`}>
                  {val}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  /* ── Mobile floating map ── */
  function MobileFloatingMap() {
    const [previewZoom, setPreviewZoom] = useState(12)

    const zoomIn = (event) => {
      event.stopPropagation()
      setPreviewZoom((z) => Math.min(z + 1, 18))
    }

    const zoomOut = (event) => {
      event.stopPropagation()
      setPreviewZoom((z) => Math.max(z - 1, 2))
    }

    return (
      <>
        {/* circular thumbnail — fixed at bottom-right on mobile */}
        {!mobileMapOpen && (
          <div className="fixed bottom-24 right-4 z-40 flex flex-col items-center gap-2 lg:hidden">
            <button
              onClick={() => setMobileMapOpen(true)}
              className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-white shadow-xl ring-2 ring-indigo-300"
              aria-label="Show map"
            >
              {/* tiny live map in the thumb */}
              <div className="pointer-events-none h-full w-full">
                <LiveMap
                  pickup={pickupCoords}
                  dropoff={dropoffCoords}
                  zoom={previewZoom}
                  zoomControl={false}
                  className="h-full w-full"
                />
              </div>
              {/* "Map" label overlay */}
              <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/40 to-transparent pb-1.5 rounded-full">
                <span className="text-[8px] font-bold uppercase tracking-widest text-white">Map</span>
              </div>
            </button>
          </div>
        )}

        {/* bottom-sheet expansion */}
        {mobileMapOpen && (
          <div
            className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50 lg:hidden"
            onClick={() => setMobileMapOpen(false)}
          >
            <div
              className="flex flex-col rounded-t-3xl bg-white"
              onClick={(e) => e.stopPropagation()}
            >
              {/* drag handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="h-1 w-10 rounded-full bg-slate-300" />
              </div>
              {/* header */}
              <div className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Route preview</p>
                  <p className="truncate max-w-[220px] text-xs text-slate-400">
                    {confirmedPickup} → {confirmedDropoff}
                  </p>
                </div>
                <button
                  onClick={() => setMobileMapOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200"
                >
                  <X className="h-4 w-4 text-slate-500" />
                </button>
              </div>
              {/* map */}
              <div className="h-[340px] w-full">
                <LiveMap
                  pickup={pickupCoords}
                  dropoff={dropoffCoords}
                  className="h-full w-full"
                />
              </div>
              {/* stats bar */}
              <div className="grid grid-cols-3 gap-3 border-t border-slate-100 p-4">
                {[
                  { label: 'ETA',      val: `${eta} min` },
                  { label: 'Distance', val: `${km} km`   },
                  { label: 'Price',    val: `₦${price}`, accent: true },
                ].map(({ label, val, accent }) => (
                  <div key={label} className="rounded-xl bg-slate-50 p-3 text-center">
                    <p className="text-[10px] uppercase tracking-widest text-slate-400">{label}</p>
                    <p className={`mt-0.5 text-sm font-bold ${accent ? 'text-brand' : 'text-slate-800'}`}>
                      {val}
                    </p>
                  </div>
                ))}
              </div>
              {/* safe area spacer */}
              <div className="h-safe-area-bottom h-6" />
            </div>
          </div>
        )}
      </>
    )
  }

  /* ══════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════ */
   const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1)
    } else {
      navigate('/customer')
    }
  }
  return (
    <AppShell>
      {/* Fullscreen map overlay (desktop) */}
      <MapOverlay />

      <main className="min-h-screen px-4 pb-28 pt-5 sm:px-6 lg:px-8 lg:pb-8">
        <div className="mx-auto max-w-6xl">
          {/* Back button */}
          <button
            type="button"
            onClick={handleBack}
            aria-label="Go back"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          {/* Page grid */}
          <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
            {/* ── Left: form column ── */}
            <div className="min-w-0 space-y-4">
              {/* Header card */}
              <div className="rounded-2xl border mt-5 border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-7">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
                      New delivery
                    </p>
                    <h1 className="mt-1.5 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                      Book in 3 steps
                    </h1>
                    <p className="mt-1 text-sm text-slate-400">
                      Set your route, choose a package type, then confirm.
                    </p>
                  </div>
                  <div className="inline-flex shrink-0 items-center rounded-full bg-primary/8 px-3.5 py-1.5 text-xs font-bold text-primary">
                    Step {step + 1} / 3
                  </div>
                </div>
              </div>

              {/* Main form card */}
              <div className="rounded-2xl border border-slate-200 bg-white px-5 py-6 shadow-sm sm:px-7">
                <StepBar />

                <form onSubmit={handleSubmit}>
                  {/* ─── STEP 0: Route ─── */}
                  {step === 0 && (
                    <div className="space-y-3">
                      <AddressField
                        type="pickup"
                        query={pickupQuery}
                        setQuery={setPickupQuery}
                        showDrop={showPickupDrop}
                        setShowDrop={setShowPickupDrop}
                        suggestions={pickupSuggestions}
                        geoLabel={geoLabel}
                        geoReady={geoReady}
                        onUseMyLocation={useMyLocation}
                        onSelectAddress={selectAddress}
                      />

                      {/* swap */}
                      <div className="flex justify-center">
                        <button
                          type="button"
                          onClick={swapAddresses}
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm hover:bg-slate-50 active:scale-95 transition-transform"
                        >
                          <ArrowLeftRight className="h-3.5 w-3.5 text-slate-500" />
                        </button>
                      </div>

                      <AddressField
                        type="dropoff"
                        query={dropoffQuery}
                        setQuery={setDropoffQuery}
                        showDrop={showDropoffDrop}
                        setShowDrop={setShowDropoffDrop}
                        suggestions={dropoffSuggestions}
                        geoLabel={geoLabel}
                        geoReady={geoReady}
                        onUseMyLocation={useMyLocation}
                        onSelectAddress={selectAddress}
                      />

                      {/* Route summary mini-card */}
                      <div className="mt-2 grid grid-cols-2 gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                        {[
                          { label: "Distance", val: `${km} km` },
                          { label: "ETA", val: `${eta} min` },
                        ].map(({ label, val }) => (
                          <div key={label} className="rounded-xl bg-white px-4 py-3 shadow-sm">
                            <p className="text-[10px] uppercase tracking-widest text-slate-400">
                              {label}
                            </p>
                            <p className="mt-1 text-base font-bold text-slate-800">{val}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ─── STEP 1: Package ─── */}
                  {step === 1 && (
                    <div className="space-y-5">
                      {/* Package type picker */}
                      <div>
                        <p className="mb-3 text-sm font-semibold text-slate-700">
                          Choose a service
                        </p>
                        <div className="grid gap-3 sm:grid-cols-3">
                          {PACKAGE_TYPES.map(({ id, label, desc, Icon, surcharge, accent }) => {
                            const active = pkg === id;
                            return (
                              <button
                                key={id}
                                type="button"
                                onClick={() => setPkg(id)}
                                className={[
                                  "group relative rounded-2xl border p-4 text-left transition-all duration-200",
                                  active
                                    ? "border-brand bg-brand/5 shadow-md ring-2 ring-brand/10"
                                    : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white",
                                ].join(" ")}
                              >
                                {active && (
                                  <span className="absolute right-3 top-3 flex h-4 w-4 items-center justify-center rounded-full bg-brand">
                                    <CheckCircle2 className="h-3 w-3 text-white" />
                                  </span>
                                )}
                                <Icon
                                  className="mb-2.5 h-5 w-5 transition-colors"
                                  style={{ color: active ? accent : "#94a3b8" }}
                                />
                                <p
                                  className={`text-sm font-semibold ${active ? "text-slate-900" : "text-slate-600"}`}
                                >
                                  {label}
                                </p>
                                <p className="mt-0.5 text-xs text-slate-400">{desc}</p>
                                <p className="mt-3 text-xs font-bold text-slate-600">
                                  ≈ ₦{Math.round(km * 3 + surcharge)}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Weight */}
                      <WeightSlider
                        weight={weight}
                        setWeight={setWeight}
                        wMeta={wMeta}
                        weightSurcharge={weightSurcharge}
                      />

                      {/* Special instructions */}
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="mb-2 text-sm font-semibold text-slate-700">
                          Special instructions
                        </p>
                        <textarea
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          rows={3}
                          placeholder="e.g. Call on arrival, fragile contents, leave at gate…"
                          className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-300 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-50"
                        />
                      </div>
                    </div>
                  )}

                  {/* ─── STEP 2: Review ─── */}
                  {step === 2 && (
                    <div className="space-y-4">
                      {/* Route summary */}
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          Route
                        </p>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100">
                              <div className="h-2 w-2 rounded-full bg-indigo-500" />
                            </div>
                            <div>
                              <p className="text-[10px] uppercase tracking-widest text-slate-400">
                                Pickup
                              </p>
                              <p className="mt-0.5 text-sm font-semibold text-slate-800">
                                {confirmedPickup}
                              </p>
                            </div>
                          </div>
                          <div className="ml-3 h-5 w-px bg-slate-200" />
                          <div className="flex items-start gap-3">
                            <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100">
                              <div className="h-2 w-2 rounded-full bg-green-600" />
                            </div>
                            <div>
                              <p className="text-[10px] uppercase tracking-widest text-slate-400">
                                Dropoff
                              </p>
                              <p className="mt-0.5 text-sm font-semibold text-slate-800">
                                {confirmedDropoff}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-3">
                          {[
                            { label: "Distance", val: `${km} km` },
                            { label: "ETA", val: `${eta} min` },
                          ].map(({ label, val }) => (
                            <div key={label} className="rounded-xl bg-white px-4 py-3 shadow-sm">
                              <p className="text-[10px] uppercase tracking-widest text-slate-400">
                                {label}
                              </p>
                              <p className="mt-1 text-base font-bold text-slate-800">{val}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Package summary */}
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          Package
                        </p>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { label: "Type", val: pkg },
                            { label: "Weight", val: `${weight} kg` },
                            { label: "Notes", val: note || "None", small: true },
                          ].map(({ label, val, small }) => (
                            <div key={label} className="rounded-xl bg-white px-3 py-3 shadow-sm">
                              <p className="text-[10px] uppercase tracking-widest text-slate-400">
                                {label}
                              </p>
                              <p
                                className={`mt-1 font-semibold text-slate-800 leading-snug ${small ? "text-xs line-clamp-2" : "text-sm"}`}
                              >
                                {val}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Price */}
                      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                        <div>
                          <p className="text-[10px] uppercase tracking-widest text-slate-400">
                            Total estimate
                          </p>
                          <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                            ₦{price.toLocaleString()}
                          </p>
                        </div>
                        <div className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500">
                          Ready to confirm
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ─── Navigation buttons ─── */}
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    {step > 0 && (
                      <button
                        type="button"
                        onClick={() => setStep((s) => Math.max(s - 1, 0))}
                        className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 shadow-sm hover:bg-slate-50 active:scale-95 transition-all"
                      >
                        Back
                      </button>
                    )}

                    {step < 2 ? (
                      <button
                        type="button"
                        onClick={handleAdvance}
                        disabled={advanceBlocked}
                        className={[
                          "flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold shadow-sm transition-all active:scale-95",
                          advanceBlocked
                            ? "cursor-not-allowed bg-slate-100 text-slate-400 shadow-none"
                            : "bg-brand text-white hover:bg-brand-hover",
                        ].join(" ")}
                      >
                        Continue
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className="flex items-center gap-2 rounded-xl bg-brand px-7 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-brand-hover active:scale-95 transition-all"
                      >
                        Confirm booking
                        <CheckCircle2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Inline validation hints */}
                  {advanceBlocked && step === 0 && (
                    <p className="mt-3 flex items-center gap-1.5 text-sm text-rose-500">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      Enter different pickup and destination to continue.
                    </p>
                  )}
                  {advanceBlocked && step === 1 && (
                    <p className="mt-3 flex items-center gap-1.5 text-sm text-rose-500">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      Weight must be between 1 and 50 kg.
                    </p>
                  )}
                </form>
              </div>
            </div>

            {/* ── Right: desktop map aside ── */}
            <aside className="hidden lg:block">
              <DesktopMap />
            </aside>
          </div>
        </div>
      </main>

      {/* Mobile floating map (lg hidden handled inside component) */}
      <MobileFloatingMap />
    </AppShell>
  );
}