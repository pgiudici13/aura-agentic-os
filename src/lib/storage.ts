import type { AuraData, Note, Profile, Task, Trip, TripDay, TripRoutine } from '../types'
import { createDefaultData, createValenciaTrip } from './data'

// Keep the key stable so schema migrations can preserve existing browser data.
export const STORAGE_KEY = 'aura-os:data:v1'

type StoredTripDay = Omit<TripDay, 'date'> & { date?: string }
type StoredTrip = Omit<Trip, 'accommodation' | 'dailyRoutine' | 'itinerary'> & {
  accommodation?: string
  dailyRoutine?: TripRoutine[]
  itinerary: StoredTripDay[]
}
type StoredAuraData = Omit<AuraData, 'version' | 'trips'> & {
  version: 1 | 2
  trips: StoredTrip[]
}

const isRecord = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object'
const isString = (value: unknown): value is string => typeof value === 'string'

const isProfile = (value: unknown): value is Profile => isRecord(value) &&
  ['name', 'city', 'bio', 'email', 'emergencyContact', 'dietaryNotes', 'travelStyle'].every((key) => isString(value[key]))

const isNote = (value: unknown): value is Note => isRecord(value) &&
  ['id', 'title', 'body', 'category', 'color', 'updatedAt'].every((key) => isString(value[key])) &&
  typeof value.pinned === 'boolean'

const isTask = (value: unknown): value is Task => isRecord(value) &&
  ['id', 'title', 'priority', 'area'].every((key) => isString(value[key])) &&
  (value.dueDate === null || isString(value.dueDate)) && typeof value.completed === 'boolean'

const isTripDay = (value: unknown): value is StoredTripDay => isRecord(value) &&
  ['id', 'time', 'title', 'detail'].every((key) => isString(value[key])) &&
  (value.date === undefined || isString(value.date))

const isTripRoutine = (value: unknown): value is TripRoutine => isRecord(value) &&
  ['id', 'time', 'title'].every((key) => isString(value[key]))

const isStoredTrip = (value: unknown): value is StoredTrip => isRecord(value) &&
  ['id', 'destination', 'country', 'startDate', 'endDate', 'status', 'accent'].every((key) => isString(value[key])) &&
  (value.accommodation === undefined || isString(value.accommodation)) &&
  (value.dailyRoutine === undefined || (Array.isArray(value.dailyRoutine) && value.dailyRoutine.every(isTripRoutine))) &&
  Array.isArray(value.itinerary) && value.itinerary.every(isTripDay) &&
  Array.isArray(value.packing) && value.packing.every((item) => isRecord(item) && isString(item.id) && isString(item.label) && typeof item.packed === 'boolean')

const isStoredAuraData = (value: unknown): value is StoredAuraData => {
  if (!isRecord(value) || (value.version !== 1 && value.version !== 2)) return false
  return isProfile(value.profile) &&
    Array.isArray(value.notes) && value.notes.every(isNote) &&
    Array.isArray(value.tasks) && value.tasks.every(isTask) &&
    Array.isArray(value.trips) && value.trips.every(isStoredTrip)
}

export const isAuraData = (value: unknown): value is AuraData => {
  if (!isStoredAuraData(value) || value.version !== 2) return false
  return value.trips.every((trip) =>
    isString(trip.accommodation) &&
    Array.isArray(trip.dailyRoutine) &&
    trip.itinerary.every((step) => isString(step.date)),
  )
}

export const migrateData = (value: unknown): AuraData | null => {
  if (!isStoredAuraData(value)) return null

  return {
    ...value,
    version: 2,
    trips: value.trips.map((trip) => {
      const isOriginalDemo = trip.destination === 'Lisbona' &&
        trip.country === 'Portogallo' &&
        trip.itinerary.some((step) => step.title === 'Arrivo e check-in')

      if (isOriginalDemo) return createValenciaTrip()

      return {
        ...trip,
        accommodation: trip.accommodation ?? '',
        dailyRoutine: trip.dailyRoutine ?? [],
        itinerary: trip.itinerary.map((step) => ({ ...step, date: step.date ?? trip.startDate })),
      }
    }),
  }
}

export const loadData = (): AuraData => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) return createDefaultData()
    const parsed: unknown = JSON.parse(stored)
    return migrateData(parsed) ?? createDefaultData()
  } catch {
    return createDefaultData()
  }
}

export const saveData = (data: AuraData) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export const downloadBackup = (data: AuraData) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `aura-backup-${new Date().toISOString().slice(0, 10)}.json`
  anchor.click()
  URL.revokeObjectURL(url)
}

export const parseBackup = async (file: File): Promise<AuraData> => {
  const parsed: unknown = JSON.parse(await file.text())
  const migrated = migrateData(parsed)
  if (!migrated) throw new Error('Il file non è un backup AURA valido.')
  return migrated
}
