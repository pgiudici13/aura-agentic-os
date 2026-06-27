import type { AuraData } from '../types'
import { createDefaultData } from './data'

export const STORAGE_KEY = 'aura-os:data:v1'

export const isAuraData = (value: unknown): value is AuraData => {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<AuraData>
  return (
    candidate.version === 1 &&
    !!candidate.profile &&
    Array.isArray(candidate.notes) &&
    Array.isArray(candidate.tasks) &&
    Array.isArray(candidate.trips)
  )
}

export const loadData = (): AuraData => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) return createDefaultData()
    const parsed: unknown = JSON.parse(stored)
    return isAuraData(parsed) ? parsed : createDefaultData()
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
  if (!isAuraData(parsed)) throw new Error('Il file non è un backup AURA valido.')
  return parsed
}
