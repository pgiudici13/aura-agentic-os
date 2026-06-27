import { describe, expect, it } from 'vitest'
import { createDefaultData } from './data'
import { isAuraData } from './storage'

describe('isAuraData', () => {
  it('accepts the current data schema', () => {
    expect(isAuraData(createDefaultData())).toBe(true)
  })

  it('rejects incomplete or future schemas', () => {
    expect(isAuraData({ version: 2, notes: [], tasks: [], trips: [] })).toBe(false)
    expect(isAuraData({ version: 1, notes: 'invalid' })).toBe(false)
  })
})
