export type ViewId = 'home' | 'notes' | 'tasks' | 'travel' | 'profile'

export type Priority = 'low' | 'medium' | 'high'

export interface Note {
  id: string
  title: string
  body: string
  category: string
  color: 'sand' | 'mint' | 'lilac' | 'sky'
  pinned: boolean
  updatedAt: string
}

export interface Task {
  id: string
  title: string
  dueDate: string | null
  priority: Priority
  completed: boolean
  area: string
}

export interface TripDay {
  id: string
  time: string
  title: string
  detail: string
}

export interface Trip {
  id: string
  destination: string
  country: string
  startDate: string
  endDate: string
  status: 'idea' | 'planning' | 'booked'
  accent: string
  itinerary: TripDay[]
  packing: Array<{ id: string; label: string; packed: boolean }>
}

export interface Profile {
  name: string
  city: string
  bio: string
  email: string
  emergencyContact: string
  dietaryNotes: string
  travelStyle: string
}

export interface AuraData {
  version: 1
  profile: Profile
  notes: Note[]
  tasks: Task[]
  trips: Trip[]
}

export interface SearchResult {
  id: string
  view: ViewId
  eyebrow: string
  title: string
  detail: string
}
