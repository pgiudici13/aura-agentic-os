import type { AuraData } from '../types'

const futureDate = (days: number) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

export const createDefaultData = (): AuraData => ({
  version: 1,
  profile: {
    name: 'Pietro',
    city: 'Italia',
    bio: 'Creo, imparo e tengo le cose importanti in un solo posto.',
    email: '',
    emergencyContact: '',
    dietaryNotes: '',
    travelStyle: 'Città, buon cibo e itinerari flessibili',
  },
  notes: [
    {
      id: crypto.randomUUID(),
      title: 'Benvenuto in AURA',
      body: 'Questo spazio è solo tuo. Appunti, attività e viaggi vengono salvati automaticamente su questo dispositivo.',
      category: 'Inizia qui',
      color: 'mint',
      pinned: true,
      updatedAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      title: 'Idee da esplorare',
      body: 'Un posto libero per progetti, link, libri e cose che non vuoi dimenticare.',
      category: 'Idee',
      color: 'lilac',
      pinned: false,
      updatedAt: new Date().toISOString(),
    },
  ],
  tasks: [
    {
      id: crypto.randomUUID(),
      title: 'Personalizzare il profilo AURA',
      dueDate: futureDate(1),
      priority: 'medium',
      completed: false,
      area: 'Personale',
    },
    {
      id: crypto.randomUUID(),
      title: 'Creare il primo backup dei dati',
      dueDate: futureDate(7),
      priority: 'low',
      completed: false,
      area: 'AURA',
    },
  ],
  trips: [
    {
      id: crypto.randomUUID(),
      destination: 'Lisbona',
      country: 'Portogallo',
      startDate: futureDate(42),
      endDate: futureDate(47),
      status: 'planning',
      accent: '#d96f4b',
      itinerary: [
        { id: crypto.randomUUID(), time: '10:30', title: 'Arrivo e check-in', detail: 'Lasciare i bagagli e fare una passeggiata in zona.' },
        { id: crypto.randomUUID(), time: '18:00', title: 'Miradouro al tramonto', detail: 'Scegliere il punto panoramico in base al quartiere.' },
      ],
      packing: [
        { id: crypto.randomUUID(), label: 'Documenti', packed: false },
        { id: crypto.randomUUID(), label: 'Caricabatterie', packed: false },
        { id: crypto.randomUUID(), label: 'Scarpe comode', packed: false },
      ],
    },
  ],
})
