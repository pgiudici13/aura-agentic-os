import type { AuraData, Trip, TripDay } from '../types'

const futureDate = (days: number) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

export const createDefaultData = (): AuraData => ({
  version: 2,
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
  trips: [createValenciaTrip()],
})

const tripStep = (date: string, time: string, title: string, detail: string): TripDay => ({
  id: crypto.randomUUID(),
  date,
  time,
  title,
  detail,
})

export const createValenciaTrip = (): Trip => ({
  id: crypto.randomUUID(),
  destination: 'Valencia',
  country: 'Spagna',
  startDate: '2026-06-28',
  endDate: '2026-07-05',
  status: 'booked',
  accent: '#e8753f',
  accommodation: 'Residenza Amro Palleter',
  dailyRoutine: [
    { id: crypto.randomUUID(), time: '08:00', title: 'Colazione' },
    { id: crypto.randomUUID(), time: '10:00–13:00', title: 'Attività culturale' },
    { id: crypto.randomUUID(), time: '13:00–14:30', title: 'Pranzo' },
    { id: crypto.randomUUID(), time: '14:30–17:30', title: 'Corso di spagnolo' },
    { id: crypto.randomUUID(), time: '17:30–19:00', title: 'Attività libere insieme' },
    { id: crypto.randomUUID(), time: '20:00–21:00', title: 'Cena' },
    { id: crypto.randomUUID(), time: '21:30–23:00', title: 'Tempo libero insieme' },
    { id: crypto.randomUUID(), time: '23:30', title: 'Termine giornata' },
  ],
  itinerary: [
    tripStep('2026-06-28', '11:30', 'Partenza da Milano Linate', 'Volo AZ2045 in partenza dall’aeroporto di Linate.'),
    tripStep('2026-06-28', '16:34', 'Arrivo a Valencia', 'Atterraggio con il volo AZ0094 e accoglienza dedicata in aeroporto.'),
    tripStep('2026-06-28', 'A seguire', 'Trasferimento in residenza', 'Autobus privato fino alla Residenza Amro Palleter e sistemazione.'),
    tripStep('2026-06-28', 'Sera', 'Cena di benvenuto', 'Prima serata insieme per iniziare il viaggio studio.'),

    tripStep('2026-06-29', '10:00–13:00', 'Quiz tour nel centro storico', 'Tour interattivo tra le vie del centro, con salita alla Torre del Miguelete e vista panoramica sulla città.'),
    tripStep('2026-06-29', '14:20', 'Incontro a scuola', 'Distribuzione nelle classi e preparazione alla prima lezione.'),
    tripStep('2026-06-29', '14:30–17:20', 'Prima lezione di spagnolo', 'Inizio del corso di lingua spagnola.'),

    tripStep('2026-06-30', '10:00–11:30', 'Visita alla Lonja de la Seda', 'Visita al gioiello gotico di Valencia dichiarato Patrimonio dell’Umanità UNESCO.'),
    tripStep('2026-06-30', 'Pranzo', 'Pranzo al sacco o in residenza', 'Pausa pranzo prima delle lezioni pomeridiane.'),
    tripStep('2026-06-30', '14:30–17:20', 'Lezioni di spagnolo', 'Corso di lingua con pausa di 30 minuti.'),

    tripStep('2026-07-01', '10:00–13:00', 'Città delle Arti e Museo Fallero', 'Passeggiata tra le architetture di Calatrava e visita al museo dedicato alle Fallas.'),
    tripStep('2026-07-01', '14:30–17:20', 'Lezioni di spagnolo', 'Corso di lingua con pausa di 30 minuti.'),

    tripStep('2026-07-02', '10:00–12:00', 'Rally fotografico nel Barrio del Carmen', 'Caccia allo scatto perfetto a squadre nel cuore storico di Valencia.'),
    tripStep('2026-07-02', 'Pranzo', 'Pranzo al sacco o in residenza', 'Pausa pranzo prima delle lezioni.'),
    tripStep('2026-07-02', 'Pomeriggio', 'Lezioni di spagnolo', 'Proseguimento del corso di lingua.'),

    tripStep('2026-07-03', '10:00–12:30', 'Gymkana: caccia al tesoro', 'Prove, indovinelli e sfide a squadre per scoprire Valencia.'),
    tripStep('2026-07-03', 'Pranzo', 'Pranzo al sacco o in residenza', 'Pausa pranzo prima delle lezioni.'),
    tripStep('2026-07-03', '14:30–17:20', 'Lezioni di spagnolo', 'Consueto appuntamento pomeridiano con il corso di lingua.'),

    tripStep('2026-07-04', '10:00–17:00', 'Hemisfèric e Oceanogràfic', 'Giornata alla Città delle Arti e delle Scienze, tra planetario, cinema IMAX e il più grande acquario d’Europa.'),
    tripStep('2026-07-04', 'Pranzo', 'Pranzo al sacco', 'Pranzo durante la giornata alla Città delle Arti e delle Scienze.'),
    tripStep('2026-07-04', 'Sera', 'Cena di gruppo', 'Cena tutti insieme per l’ultima serata a Valencia.'),

    tripStep('2026-07-05', '08:00', 'Ultima colazione insieme', 'Colazione in residenza e preparazione alla partenza.'),
    tripStep('2026-07-05', 'Mattina', 'Preparazione e bagagli', 'Pranzo al sacco e raccolta dei bagagli.'),
    tripStep('2026-07-05', '14:25', 'Trasferimento in aeroporto', 'Incontro alla Residenza Amro Palleter e partenza per l’aeroporto.'),
    tripStep('2026-07-05', '17:25', 'Volo da Valencia', 'Partenza con il volo AZ0095.'),
    tripStep('2026-07-05', '22:10', 'Arrivo a Milano Linate', 'Arrivo a Linate con il volo AZ2058.'),
  ],
  packing: [
    { id: crypto.randomUUID(), label: 'Carta d’identità o passaporto', packed: false },
    { id: crypto.randomUUID(), label: 'Tessera sanitaria', packed: false },
    { id: crypto.randomUUID(), label: 'Quaderno per il corso di spagnolo', packed: false },
    { id: crypto.randomUUID(), label: 'Caricabatterie', packed: false },
    { id: crypto.randomUUID(), label: 'Scarpe comode', packed: false },
    { id: crypto.randomUUID(), label: 'Crema solare', packed: false },
  ],
})
