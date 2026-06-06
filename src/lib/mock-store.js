import { useEffect, useState } from 'react'

const STORAGE_KEY = 'dashpoint-store-v1'

const SEED_USERS = [
  { id: 'u-cust-1', name: 'Ada Lovelace', email: 'ada@demo.io', role: 'customer' },
  { id: 'u-rider-1', name: 'Marcus Chen', email: 'marcus@demo.io', role: 'rider', rating: 4.9, trips: 1240 },
]

const LAGOS = { lat: 6.5244, lng: 3.3792 }
const offset = (base, dLat, dLng) => ({ lat: base.lat + dLat, lng: base.lng + dLng })

function distance(a, b) {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}

function seedDeliveries() {
  const base = LAGOS
  const make = (
    id,
    status,
    pickupAddr,
    dropAddr,
    p,
    d,
    pkg,
    customerName = 'Ada Lovelace',
    customerId = 'u-cust-1',
    riderId,
    riderName,
  ) => {
    const km = distance(p, d)
    return {
      id,
      customerId,
      customerName,
      riderId,
      riderName,
      pickup: { address: pickupAddr, coords: p },
      dropoff: { address: dropAddr, coords: d },
      packageType: pkg,
      price: Math.round(km * 3 + (pkg === 'Cargo' ? 8 : pkg === 'Express' ? 4 : 2)),
      distanceKm: Math.round(km * 10) / 10,
      status,
      createdAt: Date.now() - Math.random() * 86400000,
      etaMinutes: Math.max(5, Math.round(km * 4)),
      courierPosition: status === 'in_transit' || status === 'picked_up' ? p : undefined,
    }
  }
  return [
    make('DP-9021', 'in_transit', 'Lekki Phase 1', 'Victoria Island', offset(base, 0.02, 0.04), offset(base, -0.01, 0.01), 'Express', 'Ada Lovelace', 'u-cust-1', 'u-rider-1', 'Marcus Chen'),
    make('DP-8829', 'delivered', 'Ikeja City Mall', 'Yaba Tech', offset(base, 0.08, -0.05), offset(base, 0.04, -0.02), 'Cargo', 'Ada Lovelace', 'u-cust-1', 'u-rider-1', 'Marcus Chen'),
    make('DP-7710', 'pending', 'Surulere', 'Ikoyi', offset(base, 0.03, -0.04), offset(base, -0.005, 0.02), 'Express'),
    make('DP-7702', 'pending', 'Pharmacy Plus, Maryland', 'Magodo Estate', offset(base, 0.06, 0.01), offset(base, 0.08, 0.04), 'Express'),
    make('DP-7698', 'pending', 'Computer Village', 'Lekki Phase 2', offset(base, 0.075, -0.045), offset(base, 0.015, 0.06), 'Cargo'),
  ]
}

function defaultStore() {
  return { users: SEED_USERS, deliveries: seedDeliveries(), session: null }
}

let store = defaultStore()
let hydrated = false
const listeners = new Set()

function persist() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch {}
}

function hydrate() {
  if (hydrated || typeof window === 'undefined') return
  hydrated = true
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) store = JSON.parse(raw)
  } catch {}
}

function emit() {
  persist()
  listeners.forEach((l) => l())
}

export function subscribe(fn) {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

export function getStore() {
  hydrate()
  return store
}

export function useStore(selector) {
  hydrate()
  const [value, setValue] = useState(() => selector(store))
  useEffect(() => {
    const update = () => setValue(selector(store))
    update()
    return subscribe(update)
  }, [selector])
  return value
}

export function signIn(email) {
  hydrate()
  const user = store.users.find((u) => u.email.toLowerCase() === email.toLowerCase())
  if (!user) return null
  store.session = { userId: user.id, role: user.role }
  emit()
  return user
}

export function signUp(name, email, role) {
  hydrate()
  const user = {
    id: `u-${Math.random().toString(36).slice(2, 8)}`,
    name,
    email,
    role,
    ...(role === 'rider' ? { rating: 5, trips: 0 } : {}),
  }
  store.users = [...store.users, user]
  store.session = { userId: user.id, role }
  emit()
  return user
}

export function signOut() {
  store.session = null
  emit()
}

export function getCurrentUser() {
  hydrate()
  if (!store.session) return null
  return store.users.find((u) => u.id === store.session.userId) ?? null
}

export function createDelivery(input) {
  const km = distance(input.pickup.coords, input.dropoff.coords)
  const d = {
    id: `DP-${Math.floor(1000 + Math.random() * 9000)}`,
    customerId: input.customerId,
    customerName: input.customerName,
    pickup: input.pickup,
    dropoff: input.dropoff,
    packageType: input.packageType,
    price: Math.round(km * 3 + (input.packageType === 'Cargo' ? 8 : input.packageType === 'Express' ? 4 : 2)),
    distanceKm: Math.round(km * 10) / 10,
    status: 'pending',
    createdAt: Date.now(),
    etaMinutes: Math.max(5, Math.round(km * 4)),
  }
  store.deliveries = [d, ...store.deliveries]
  emit()
  return d
}

export function updateDeliveryStatus(id, status, riderId, riderName) {
  store.deliveries = store.deliveries.map((d) => {
    if (d.id !== id) return d
    const next = { ...d, status }
    if (riderId) {
      next.riderId = riderId
      next.riderName = riderName
    }
    if (status === 'picked_up' || status === 'in_transit') {
      next.courierPosition = next.courierPosition ?? d.pickup.coords
    }
    if (status === 'delivered') {
      next.courierPosition = d.dropoff.coords
    }
    return next
  })
  emit()
}

export function advanceCourier(id, fraction) {
  store.deliveries = store.deliveries.map((d) => {
    if (d.id !== id) return d
    const p = d.pickup.coords
    const q = d.dropoff.coords
    return {
      ...d,
      courierPosition: {
        lat: p.lat + (q.lat - p.lat) * fraction,
        lng: p.lng + (q.lng - p.lng) * fraction,
      },
    }
  })
  emit()
}

export function resetDemo() {
  store = defaultStore()
  if (typeof window !== 'undefined') window.localStorage.removeItem(STORAGE_KEY)
  emit()
}

export const STATUS_LABEL = {
  pending: 'Pending',
  accepted: 'Accepted',
  picked_up: 'Picked up',
  in_transit: 'In transit',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}
