import { describe, expect, it } from 'vitest'
import { createDefaultData, createValenciaTrip } from './data'
import { isAuraData, migrateData } from './storage'

describe('isAuraData', () => {
  it('accepts the current data schema', () => {
    expect(isAuraData(createDefaultData())).toBe(true)
  })

  it('rejects incomplete or future schemas', () => {
    expect(isAuraData({ version: 3, notes: [], tasks: [], trips: [] })).toBe(false)
    expect(isAuraData({ version: 2, notes: 'invalid' })).toBe(false)
  })

  it('migrates the original Lisbon demo without touching personal content', () => {
    const current = createDefaultData()
    const legacy = {
      ...current,
      version: 1,
      notes: [{ ...current.notes[0], title: 'La mia nota' }],
      trips: [{
        ...current.trips[0],
        destination: 'Lisbona',
        country: 'Portogallo',
        accommodation: undefined,
        dailyRoutine: undefined,
        itinerary: [{ id: 'legacy-step', time: '10:30', title: 'Arrivo e check-in', detail: 'Demo originale.' }],
      }],
    }

    const migrated = migrateData(legacy)

    expect(migrated?.version).toBe(2)
    expect(migrated?.notes[0]?.title).toBe('La mia nota')
    expect(migrated?.trips[0]?.destination).toBe('Valencia')
    expect(migrated?.trips[0]?.itinerary).toHaveLength(26)
  })
})

describe('Valencia program', () => {
  it('contains all eight days and the documented travel details', () => {
    const trip = createValenciaTrip()
    const dates = new Set(trip.itinerary.map((step) => step.date))

    expect(dates.size).toBe(8)
    expect(trip.startDate).toBe('2026-06-28')
    expect(trip.endDate).toBe('2026-07-05')
    expect(trip.accommodation).toBe('Residenza Amro Palleter')
    expect(trip.itinerary.some((step) => step.title.includes('Oceanogràfic'))).toBe(true)
    expect(trip.itinerary.some((step) => step.detail.includes('AZ2058'))).toBe(true)
  })
})
