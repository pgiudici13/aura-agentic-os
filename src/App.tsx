import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react'
import { Icon, type IconName } from './components/Icon'
import { createDefaultData } from './lib/data'
import { downloadBackup, loadData, parseBackup, saveData } from './lib/storage'
import type { AuraData, Note, Priority, SearchResult, Task, Trip, ViewId } from './types'

const NAV_ITEMS: Array<{ id: ViewId; label: string; icon: IconName }> = [
  { id: 'home', label: 'Oggi', icon: 'home' },
  { id: 'notes', label: 'Note', icon: 'note' },
  { id: 'tasks', label: 'Attività', icon: 'check' },
  { id: 'travel', label: 'Viaggi', icon: 'plane' },
  { id: 'profile', label: 'Il mio spazio', icon: 'user' },
]

const dateFormatter = new Intl.DateTimeFormat('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })
const shortDateFormatter = new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'short' })
const itineraryDateFormatter = new Intl.DateTimeFormat('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })

const formatDate = (date: string) => shortDateFormatter.format(new Date(`${date}T12:00:00`))

const daysUntil = (date: string) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(`${date}T00:00:00`)
  return Math.ceil((target.getTime() - today.getTime()) / 86_400_000)
}

const dayWord = (days: number) => days === 1 ? 'giorno' : 'giorni'
const tripStatusLabel = (status: Trip['status']) => status === 'booked' ? 'Prenotato' : status === 'planning' ? 'In pianificazione' : 'Un’idea'

const greeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Buongiorno'
  if (hour < 18) return 'Buon pomeriggio'
  return 'Buonasera'
}

function App() {
  const [data, setData] = useState<AuraData>(loadData)
  const [view, setView] = useState<ViewId>('home')
  const [searchOpen, setSearchOpen] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => saveData(data), [data])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen(true)
      }
      if (event.key === 'Escape') setSearchOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(''), 2600)
    return () => window.clearTimeout(timer)
  }, [toast])

  const updateData = (updater: (current: AuraData) => AuraData, message?: string) => {
    setData(updater)
    if (message) setToast(message)
  }

  const goTo = (nextView: ViewId) => {
    setView(nextView)
    setSearchOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Navigazione principale">
        <button className="brand" onClick={() => goTo('home')} aria-label="Vai alla dashboard">
          <span className="brand-mark">A</span>
          <span className="brand-copy"><strong>AURA</strong><small>Personal OS</small></span>
        </button>

        <nav className="side-nav">
          <p className="nav-label">Il tuo spazio</p>
          {NAV_ITEMS.map((item) => (
            <button key={item.id} className={`nav-item ${view === item.id ? 'active' : ''}`} onClick={() => goTo(item.id)}>
              <Icon name={item.icon} />
              <span>{item.label}</span>
              {item.id === 'tasks' && data.tasks.filter((task) => !task.completed).length > 0 && (
                <span className="nav-count">{data.tasks.filter((task) => !task.completed).length}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="privacy-card">
          <span className="privacy-icon"><Icon name="lock" /></span>
          <div><strong>Solo su questo dispositivo</strong><p>I tuoi dati non lasciano mai il browser.</p></div>
        </div>

        <div className="sidebar-user">
          <span className="avatar">{data.profile.name.slice(0, 1).toUpperCase() || 'P'}</span>
          <div><strong>{data.profile.name || 'Il mio profilo'}</strong><small>Spazio privato</small></div>
          <button className="icon-button" onClick={() => goTo('profile')} aria-label="Apri impostazioni"><Icon name="settings" /></button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="mobile-brand"><span className="brand-mark">A</span><strong>AURA</strong></div>
          <button className="search-trigger" onClick={() => setSearchOpen(true)}>
            <Icon name="search" /><span>Cerca in AURA...</span><kbd>⌘ K</kbd>
          </button>
          <div className="topbar-status"><span className="status-dot" />Salvataggio locale attivo</div>
        </header>

        <div className="view-container">
          {view === 'home' && <Dashboard data={data} updateData={updateData} goTo={goTo} />}
          {view === 'notes' && <NotesView data={data} updateData={updateData} />}
          {view === 'tasks' && <TasksView data={data} updateData={updateData} />}
          {view === 'travel' && <TravelView data={data} updateData={updateData} />}
          {view === 'profile' && <ProfileView data={data} updateData={updateData} />}
        </div>
      </main>

      <nav className="mobile-nav" aria-label="Navigazione mobile">
        {NAV_ITEMS.map((item) => (
          <button key={item.id} className={view === item.id ? 'active' : ''} onClick={() => goTo(item.id)}>
            <Icon name={item.icon} /><span>{item.label === 'Il mio spazio' ? 'Io' : item.label}</span>
          </button>
        ))}
      </nav>

      {searchOpen && <SearchPalette data={data} onClose={() => setSearchOpen(false)} goTo={goTo} />}
      {toast && <div className="toast" role="status"><Icon name="check" />{toast}</div>}
    </div>
  )
}

interface ViewProps {
  data: AuraData
  updateData: (updater: (current: AuraData) => AuraData, message?: string) => void
}

function Dashboard({ data, updateData, goTo }: ViewProps & { goTo: (view: ViewId) => void }) {
  const [capture, setCapture] = useState('')
  const openTasks = data.tasks.filter((task) => !task.completed)
  const upcomingTrip = [...data.trips]
    .filter((trip) => daysUntil(trip.startDate) >= 0)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))[0]
  const highPriority = openTasks.filter((task) => task.priority === 'high')
  const nextTask = highPriority[0] ?? openTasks[0]

  const handleCapture = (event: FormEvent) => {
    event.preventDefault()
    const value = capture.trim()
    if (!value) return
    const taskPrefix = /^(task|todo|attività)\s*:\s*/i
    if (taskPrefix.test(value)) {
      const newTask: Task = { id: crypto.randomUUID(), title: value.replace(taskPrefix, ''), dueDate: null, priority: 'medium', completed: false, area: 'Inbox' }
      updateData((current) => ({ ...current, tasks: [newTask, ...current.tasks] }), 'Attività aggiunta')
    } else {
      const cleanValue = value.replace(/^(nota|note)\s*:\s*/i, '')
      const newNote: Note = { id: crypto.randomUUID(), title: cleanValue.slice(0, 56), body: cleanValue, category: 'Inbox', color: 'sand', pinned: false, updatedAt: new Date().toISOString() }
      updateData((current) => ({ ...current, notes: [newNote, ...current.notes] }), 'Nota salvata')
    }
    setCapture('')
  }

  const toggleTask = (id: string) => {
    updateData((current) => ({ ...current, tasks: current.tasks.map((task) => task.id === id ? { ...task, completed: !task.completed } : task) }), 'Attività aggiornata')
  }

  return (
    <div className="dashboard">
      <section className="welcome-row">
        <div>
          <p className="eyebrow">{dateFormatter.format(new Date())}</p>
          <h1>{greeting()}, {data.profile.name || 'Pietro'}.</h1>
          <p className="subtitle">Ecco cosa merita la tua attenzione oggi.</p>
        </div>
        <div className="weather-pill"><Icon name="sun" /><span><strong>Il tuo ritmo</strong><small>Giornata da costruire</small></span></div>
      </section>

      <section className="hero-grid">
        <article className="focus-card">
          <div className="focus-top"><span className="section-kicker"><Icon name="sparkle" /> Focus del giorno</span><span className="soft-badge">Suggerito da AURA</span></div>
          <div className="focus-content">
            <p className="focus-number">01</p>
            <div>
              <h2>{nextTask?.title ?? 'Hai spazio per una nuova priorità'}</h2>
              <p>{nextTask ? `Area ${nextTask.area} · ${nextTask.dueDate ? `entro ${formatDate(nextTask.dueDate)}` : 'senza scadenza'}` : 'Aggiungi un’attività e AURA la porterà qui.'}</p>
            </div>
          </div>
          <div className="focus-actions">
            {nextTask ? <button className="primary-button light" onClick={() => toggleTask(nextTask.id)}><Icon name="check" /> Segna completata</button> : <button className="primary-button light" onClick={() => goTo('tasks')}><Icon name="plus" /> Nuova attività</button>}
            <button className="text-button light-text" onClick={() => goTo('tasks')}>Vedi tutte <Icon name="arrow" /></button>
          </div>
          <div className="orb orb-one" /><div className="orb orb-two" />
        </article>

        <article className="agent-card">
          <div className="agent-heading"><span className="agent-mark"><Icon name="sparkle" /></span><div><p className="section-kicker">Brief di AURA</p><h3>La tua giornata, sintetizzata</h3></div></div>
          <div className="agent-message">
            <p>{openTasks.length === 0
              ? 'Tutto libero. È un buon momento per pianificare qualcosa che conta.'
              : `Hai ${openTasks.length} ${openTasks.length === 1 ? 'attività aperta' : 'attività aperte'}${highPriority.length ? `, di cui ${highPriority.length} ad alta priorità` : ''}. Procedi una cosa alla volta.`}</p>
            {upcomingTrip && <p>Il viaggio a <strong>{upcomingTrip.destination}</strong> è tra {daysUntil(upcomingTrip.startDate)} {dayWord(daysUntil(upcomingTrip.startDate))}. La checklist è al {Math.round((upcomingTrip.packing.filter((item) => item.packed).length / Math.max(upcomingTrip.packing.length, 1)) * 100)}%.</p>}
          </div>
          <button className="agent-link" onClick={() => goTo(upcomingTrip ? 'travel' : 'tasks')}>Apri il prossimo passo <Icon name="chevron" /></button>
        </article>
      </section>

      <form className="quick-capture" onSubmit={handleCapture}>
        <span className="capture-icon"><Icon name="plus" /></span>
        <label htmlFor="quick-capture" className="sr-only">Cattura una nota o attività</label>
        <input id="quick-capture" value={capture} onChange={(event) => setCapture(event.target.value)} placeholder="Cattura al volo… prova “task: prenota il treno”" />
        <button type="submit" disabled={!capture.trim()}>Salva <Icon name="arrow" /></button>
      </form>

      <section className="metric-grid" aria-label="Riepilogo">
        <button className="metric-card" onClick={() => goTo('tasks')}>
          <span className="metric-icon green"><Icon name="check" /></span><div><strong>{openTasks.length}</strong><p>attività aperte</p></div><Icon name="chevron" className="metric-arrow" />
        </button>
        <button className="metric-card" onClick={() => goTo('notes')}>
          <span className="metric-icon peach"><Icon name="note" /></span><div><strong>{data.notes.length}</strong><p>note nel tuo spazio</p></div><Icon name="chevron" className="metric-arrow" />
        </button>
        <button className="metric-card" onClick={() => goTo('travel')}>
          <span className="metric-icon blue"><Icon name="plane" /></span><div><strong>{upcomingTrip ? daysUntil(upcomingTrip.startDate) : '—'}</strong><p>{upcomingTrip ? `${dayWord(daysUntil(upcomingTrip.startDate))} a ${upcomingTrip.destination}` : 'nessun viaggio'}</p></div><Icon name="chevron" className="metric-arrow" />
        </button>
      </section>

      <section className="content-grid">
        <div className="panel">
          <div className="panel-header"><div><p className="section-kicker">In movimento</p><h2>Prossime attività</h2></div><button className="text-button" onClick={() => goTo('tasks')}>Tutte <Icon name="arrow" /></button></div>
          <div className="task-preview-list">
            {openTasks.slice(0, 4).map((task) => <TaskRow key={task.id} task={task} onToggle={() => toggleTask(task.id)} />)}
            {openTasks.length === 0 && <EmptyState icon="check" title="Tutto completato" text="Hai liberato la lista. Ottimo momento per scegliere il prossimo passo." />}
          </div>
        </div>

        <div className="panel trip-preview">
          <div className="panel-header"><div><p className="section-kicker">Prossima partenza</p><h2>{upcomingTrip?.destination ?? 'Dove andiamo?'}</h2></div><button className="icon-button bordered" onClick={() => goTo('travel')} aria-label="Apri viaggi"><Icon name="arrow" /></button></div>
          {upcomingTrip ? <>
            <div className="trip-visual" style={{ '--trip-accent': upcomingTrip.accent } as CSSProperties}>
              <div className="sun-disc"/><div className="horizon horizon-one"/><div className="horizon horizon-two"/><span>{upcomingTrip.country}</span>
            </div>
            <div className="trip-meta"><span><Icon name="calendar" />{formatDate(upcomingTrip.startDate)} — {formatDate(upcomingTrip.endDate)}</span><span className="soft-badge">{tripStatusLabel(upcomingTrip.status)}</span></div>
          </> : <EmptyState icon="plane" title="Nessuna partenza" text="Crea un viaggio per organizzare itinerario e valigia." />}
        </div>
      </section>
    </div>
  )
}

function NotesView({ data, updateData }: ViewProps) {
  const [composerOpen, setComposerOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [draft, setDraft] = useState({ title: '', body: '', category: 'Personale', color: 'sand' as Note['color'] })
  const filteredNotes = data.notes.filter((note) => `${note.title} ${note.body} ${note.category}`.toLowerCase().includes(query.toLowerCase()))

  const addNote = (event: FormEvent) => {
    event.preventDefault()
    if (!draft.title.trim()) return
    const note: Note = { id: crypto.randomUUID(), ...draft, title: draft.title.trim(), body: draft.body.trim(), pinned: false, updatedAt: new Date().toISOString() }
    updateData((current) => ({ ...current, notes: [note, ...current.notes] }), 'Nota creata')
    setDraft({ title: '', body: '', category: 'Personale', color: 'sand' })
    setComposerOpen(false)
  }

  const togglePin = (id: string) => updateData((current) => ({ ...current, notes: current.notes.map((note) => note.id === id ? { ...note, pinned: !note.pinned } : note) }), 'Nota aggiornata')
  const removeNote = (id: string) => updateData((current) => ({ ...current, notes: current.notes.filter((note) => note.id !== id) }), 'Nota eliminata')

  return <div className="page-view">
    <PageHeader eyebrow="La tua memoria esterna" title="Note" description="Pensieri, idee e informazioni che vuoi ritrovare." action={<button className="primary-button" onClick={() => setComposerOpen(!composerOpen)}><Icon name={composerOpen ? 'close' : 'plus'} />{composerOpen ? 'Chiudi' : 'Nuova nota'}</button>} />
    {composerOpen && <form className="composer-card" onSubmit={addNote}>
      <div className="form-grid"><label>Titolo<input autoFocus value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="Di cosa vuoi ricordarti?" /></label><label>Categoria<input value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })} /></label></div>
      <label>Contenuto<textarea rows={5} value={draft.body} onChange={(event) => setDraft({ ...draft, body: event.target.value })} placeholder="Scrivi liberamente…" /></label>
      <div className="composer-footer"><div className="color-picker" aria-label="Colore nota">{(['sand', 'mint', 'lilac', 'sky'] as Note['color'][]).map((color) => <button type="button" key={color} className={`color-dot ${color} ${draft.color === color ? 'selected' : ''}`} onClick={() => setDraft({ ...draft, color })} aria-label={`Colore ${color}`} />)}</div><button className="primary-button" type="submit" disabled={!draft.title.trim()}>Salva nota</button></div>
    </form>}
    <div className="toolbar"><div className="inline-search"><Icon name="search" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cerca nelle note" aria-label="Cerca nelle note" /></div><span>{filteredNotes.length} {filteredNotes.length === 1 ? 'nota' : 'note'}</span></div>
    <div className="notes-grid">
      {[...filteredNotes].sort((a, b) => Number(b.pinned) - Number(a.pinned)).map((note) => <article className={`note-card note-${note.color}`} key={note.id}>
        <div className="note-top"><span className="note-category">{note.category}</span><div className="card-actions"><button className={note.pinned ? 'active' : ''} onClick={() => togglePin(note.id)} aria-label={note.pinned ? 'Rimuovi dai preferiti' : 'Fissa nota'}><Icon name="pin" /></button><button onClick={() => removeNote(note.id)} aria-label="Elimina nota"><Icon name="trash" /></button></div></div>
        <h2>{note.title}</h2><p>{note.body}</p><footer><span>{note.pinned ? 'Fissata' : 'Aggiornata'} · {formatDate(note.updatedAt.slice(0, 10))}</span><Icon name="arrow" /></footer>
      </article>)}
      {filteredNotes.length === 0 && <div className="empty-span"><EmptyState icon="note" title="Nessuna nota trovata" text="Prova una ricerca diversa o crea una nuova nota." /></div>}
    </div>
  </div>
}

function TasksView({ data, updateData }: ViewProps) {
  const [filter, setFilter] = useState<'open' | 'all' | 'done'>('open')
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [area, setArea] = useState('Personale')
  const shown = data.tasks.filter((task) => filter === 'all' || (filter === 'done' ? task.completed : !task.completed))

  const addTask = (event: FormEvent) => {
    event.preventDefault()
    if (!title.trim()) return
    const task: Task = { id: crypto.randomUUID(), title: title.trim(), dueDate: dueDate || null, priority, completed: false, area: area.trim() || 'Personale' }
    updateData((current) => ({ ...current, tasks: [task, ...current.tasks] }), 'Attività aggiunta')
    setTitle(''); setDueDate(''); setPriority('medium')
  }
  const toggle = (id: string) => updateData((current) => ({ ...current, tasks: current.tasks.map((task) => task.id === id ? { ...task, completed: !task.completed } : task) }), 'Attività aggiornata')
  const remove = (id: string) => updateData((current) => ({ ...current, tasks: current.tasks.filter((task) => task.id !== id) }), 'Attività eliminata')

  return <div className="page-view">
    <PageHeader eyebrow="Fai spazio alle cose importanti" title="Attività" description="Una lista chiara, senza rumore e ordinata per priorità." />
    <form className="task-composer" onSubmit={addTask}>
      <div className="task-main-input"><span><Icon name="plus" /></span><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Aggiungi una nuova attività…" aria-label="Titolo attività" /></div>
      <input type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} aria-label="Scadenza" />
      <select value={priority} onChange={(event) => setPriority(event.target.value as Priority)} aria-label="Priorità"><option value="low">Bassa</option><option value="medium">Media</option><option value="high">Alta</option></select>
      <input className="area-input" value={area} onChange={(event) => setArea(event.target.value)} aria-label="Area" />
      <button className="primary-button" type="submit" disabled={!title.trim()}>Aggiungi</button>
    </form>
    <div className="filter-tabs">{(['open', 'all', 'done'] as const).map((item) => <button key={item} className={filter === item ? 'active' : ''} onClick={() => setFilter(item)}>{item === 'open' ? 'Da fare' : item === 'all' ? 'Tutte' : 'Completate'}<span>{item === 'open' ? data.tasks.filter((task) => !task.completed).length : item === 'done' ? data.tasks.filter((task) => task.completed).length : data.tasks.length}</span></button>)}</div>
    <div className="tasks-panel">
      {shown.map((task) => <div className={`full-task-row ${task.completed ? 'completed' : ''}`} key={task.id}>
        <button className="task-check" onClick={() => toggle(task.id)} aria-label={task.completed ? 'Riapri attività' : 'Completa attività'}>{task.completed && <Icon name="check" />}</button>
        <div className="task-copy"><strong>{task.title}</strong><span><span className={`priority-dot ${task.priority}`} />{task.area}{task.dueDate && <> · {formatDate(task.dueDate)}</>}</span></div>
        <span className={`priority-badge ${task.priority}`}>{task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Bassa'}</span>
        <button className="icon-button danger" onClick={() => remove(task.id)} aria-label="Elimina attività"><Icon name="trash" /></button>
      </div>)}
      {shown.length === 0 && <EmptyState icon="check" title={filter === 'done' ? 'Nessuna attività completata' : 'Lista libera'} text="Le nuove attività compariranno qui." />}
    </div>
  </div>
}

function TravelView({ data, updateData }: ViewProps) {
  const [selectedId, setSelectedId] = useState(data.trips[0]?.id ?? '')
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState({ destination: '', country: '', startDate: '', endDate: '' })
  const trip = data.trips.find((item) => item.id === selectedId) ?? data.trips[0]
  const itineraryGroups = useMemo(() => {
    if (!trip) return []
    const groups = new Map<string, typeof trip.itinerary>()
    trip.itinerary.forEach((step) => groups.set(step.date, [...(groups.get(step.date) ?? []), step]))
    return Array.from(groups, ([date, steps], index) => ({ date, steps, dayNumber: index + 1 }))
  }, [trip])

  const addTrip = (event: FormEvent) => {
    event.preventDefault()
    if (!draft.destination || !draft.startDate || !draft.endDate) return
    const newTrip: Trip = { id: crypto.randomUUID(), ...draft, status: 'planning', accent: '#4d7d72', accommodation: '', dailyRoutine: [], itinerary: [], packing: [] }
    updateData((current) => ({ ...current, trips: [newTrip, ...current.trips] }), 'Viaggio creato')
    setSelectedId(newTrip.id); setDraft({ destination: '', country: '', startDate: '', endDate: '' }); setAdding(false)
  }
  const togglePacked = (id: string) => {
    if (!trip) return
    updateData((current) => ({ ...current, trips: current.trips.map((item) => item.id === trip.id ? { ...item, packing: item.packing.map((pack) => pack.id === id ? { ...pack, packed: !pack.packed } : pack) } : item) }), 'Valigia aggiornata')
  }
  const addPacking = () => {
    if (!trip) return
    const label = window.prompt('Cosa vuoi aggiungere alla valigia?')?.trim()
    if (!label) return
    updateData((current) => ({ ...current, trips: current.trips.map((item) => item.id === trip.id ? { ...item, packing: [...item.packing, { id: crypto.randomUUID(), label, packed: false }] } : item) }), 'Elemento aggiunto')
  }

  return <div className="page-view">
    <PageHeader eyebrow="Dall’idea alla partenza" title="Viaggi" description="Itinerari, date e valigia: tutto insieme, anche offline." action={<button className="primary-button" onClick={() => setAdding(!adding)}><Icon name={adding ? 'close' : 'plus'} />{adding ? 'Chiudi' : 'Nuovo viaggio'}</button>} />
    {adding && <form className="composer-card compact" onSubmit={addTrip}><div className="form-grid four"><label>Destinazione<input autoFocus value={draft.destination} onChange={(event) => setDraft({ ...draft, destination: event.target.value })} /></label><label>Paese<input value={draft.country} onChange={(event) => setDraft({ ...draft, country: event.target.value })} /></label><label>Partenza<input type="date" value={draft.startDate} onChange={(event) => setDraft({ ...draft, startDate: event.target.value })} /></label><label>Ritorno<input type="date" min={draft.startDate} value={draft.endDate} onChange={(event) => setDraft({ ...draft, endDate: event.target.value })} /></label></div><div className="composer-footer"><span /><button className="primary-button" disabled={!draft.destination || !draft.startDate || !draft.endDate}>Crea viaggio</button></div></form>}
    <div className="trip-selector">{data.trips.map((item) => <button key={item.id} onClick={() => setSelectedId(item.id)} className={trip?.id === item.id ? 'active' : ''}><span className="trip-color" style={{ background: item.accent }} /><span><strong>{item.destination}</strong><small>{formatDate(item.startDate)} — {formatDate(item.endDate)}</small></span></button>)}</div>
    {trip ? <div className="travel-layout">
      <section className="travel-hero" style={{ '--trip-accent': trip.accent } as CSSProperties}>
        <div><span className="soft-badge light-badge">{tripStatusLabel(trip.status)}</span><h2>{trip.destination}</h2><p>{trip.country}</p><div className="travel-dates"><span><Icon name="calendar" />{formatDate(trip.startDate)} — {formatDate(trip.endDate)}</span><span><Icon name="clock" />{Math.max(daysUntil(trip.startDate), 0)} {dayWord(Math.max(daysUntil(trip.startDate), 0))} alla partenza</span></div></div>
        <div className="travel-art"><div className="travel-sun"/><div className="travel-hill a"/><div className="travel-hill b"/></div>
      </section>
      {trip.accommodation && <div className="stay-strip"><span><Icon name="briefcase" /></span><div><small>Dove soggiorni</small><strong>{trip.accommodation}</strong></div><em>Base del viaggio</em></div>}
      <section className="panel itinerary-panel"><div className="panel-header"><div><p className="section-kicker">Programma completo</p><h2>Giorno per giorno</h2></div><span>{itineraryGroups.length} giorni · {trip.itinerary.length} tappe</span></div><div className="timeline">{itineraryGroups.map((group) => <section className="timeline-day" key={group.date}><header className="timeline-day-header"><span>Giorno {group.dayNumber}</span><strong>{itineraryDateFormatter.format(new Date(`${group.date}T12:00:00`))}</strong></header>{group.steps.map((step) => <div className="timeline-item" key={step.id}><time>{step.time}</time><span className="timeline-dot"/><div><strong>{step.title}</strong><p>{step.detail}</p></div></div>)}</section>)}{trip.itinerary.length === 0 && <EmptyState icon="map" title="Itinerario vuoto" text="Le tappe del viaggio compariranno qui." />}</div></section>
      {trip.dailyRoutine.length > 0 && <section className="panel routine-panel"><div className="panel-header"><div><p className="section-kicker">Organizzazione</p><h2>Giornata tipo</h2></div><span>Orari indicativi</span></div><div className="routine-list">{trip.dailyRoutine.map((item) => <div key={item.id}><time>{item.time}</time><span>{item.title}</span></div>)}</div></section>}
      <section className="panel packing-panel"><div className="panel-header"><div><p className="section-kicker">Checklist</p><h2>Valigia</h2></div><button className="icon-button bordered" onClick={addPacking} aria-label="Aggiungi elemento"><Icon name="plus" /></button></div><div className="packing-progress"><span style={{ width: `${Math.round((trip.packing.filter((item) => item.packed).length / Math.max(trip.packing.length, 1)) * 100)}%` }} /></div><div className="packing-list">{trip.packing.map((item) => <label key={item.id}><input type="checkbox" checked={item.packed} onChange={() => togglePacked(item.id)} /><span>{item.label}</span></label>)}</div></section>
    </div> : <div className="large-empty"><EmptyState icon="plane" title="Il prossimo viaggio inizia qui" text="Aggiungi una destinazione e costruisci il tuo piano." /></div>}
  </div>
}

function ProfileView({ data, updateData }: ViewProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [importError, setImportError] = useState('')
  const updateProfile = (field: keyof AuraData['profile'], value: string) => updateData((current) => ({ ...current, profile: { ...current.profile, [field]: value } }))
  const importFile = async (file: File | undefined) => {
    if (!file) return
    try {
      const imported = await parseBackup(file)
      updateData(() => imported, 'Backup ripristinato')
      setImportError('')
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Impossibile leggere il backup.')
    }
  }
  const reset = () => {
    if (!window.confirm('Vuoi cancellare i dati locali e ripristinare AURA? Questa azione non può essere annullata.')) return
    updateData(() => createDefaultData(), 'AURA ripristinata')
  }

  return <div className="page-view">
    <PageHeader eyebrow="La tua base personale" title="Il mio spazio" description="Informazioni utili per personalizzare AURA e prepararti meglio." />
    <div className="profile-layout">
      <section className="profile-card"><div className="profile-identity"><span className="profile-avatar">{data.profile.name.slice(0, 1).toUpperCase() || 'P'}</span><div><h2>{data.profile.name || 'Il tuo nome'}</h2><p>{data.profile.city || 'La tua città'}</p></div></div><p>{data.profile.bio || 'Aggiungi una breve descrizione.'}</p><div className="profile-safe"><Icon name="lock" /><span><strong>Profilo locale</strong><small>Visibile solo in questo browser</small></span></div></section>
      <section className="settings-section"><div className="settings-heading"><span className="settings-icon"><Icon name="user" /></span><div><h2>Informazioni personali</h2><p>Usate solo per rendere AURA più utile.</p></div></div><div className="form-grid"><label>Nome<input value={data.profile.name} onChange={(event) => updateProfile('name', event.target.value)} /></label><label>Città / Paese<input value={data.profile.city} onChange={(event) => updateProfile('city', event.target.value)} /></label><label className="full">Presentazione<textarea rows={3} value={data.profile.bio} onChange={(event) => updateProfile('bio', event.target.value)} /></label><label>Email<input type="email" value={data.profile.email} onChange={(event) => updateProfile('email', event.target.value)} placeholder="Facoltativa" /></label><label>Contatto di emergenza<input value={data.profile.emergencyContact} onChange={(event) => updateProfile('emergencyContact', event.target.value)} placeholder="Nome e numero" /></label></div></section>
      <section className="settings-section"><div className="settings-heading"><span className="settings-icon orange"><Icon name="briefcase" /></span><div><h2>Preferenze di viaggio</h2><p>Informazioni che vuoi avere a portata di mano.</p></div></div><div className="form-grid"><label>Stile di viaggio<input value={data.profile.travelStyle} onChange={(event) => updateProfile('travelStyle', event.target.value)} /></label><label>Note alimentari<input value={data.profile.dietaryNotes} onChange={(event) => updateProfile('dietaryNotes', event.target.value)} placeholder="Allergie o preferenze" /></label></div></section>
      <section className="settings-section data-section"><div className="settings-heading"><span className="settings-icon blue"><Icon name="lock" /></span><div><h2>Dati e privacy</h2><p>AURA salva automaticamente in localStorage. Il repository non contiene i tuoi dati.</p></div></div><div className="data-actions"><button className="secondary-button" onClick={() => downloadBackup(data)}><Icon name="download" /><span><strong>Esporta backup</strong><small>Scarica un file JSON</small></span></button><button className="secondary-button" onClick={() => inputRef.current?.click()}><Icon name="upload" /><span><strong>Importa backup</strong><small>Ripristina da un file</small></span></button><input ref={inputRef} className="sr-only" type="file" accept="application/json" onChange={(event) => void importFile(event.target.files?.[0])} /></div>{importError && <p className="error-message">{importError}</p>}<div className="danger-zone"><div><strong>Ripristina lo spazio</strong><p>Cancella i dati locali e ricrea il contenuto iniziale.</p></div><button className="danger-button" onClick={reset}>Ripristina</button></div></section>
    </div>
  </div>
}

function SearchPalette({ data, onClose, goTo }: { data: AuraData; onClose: () => void; goTo: (view: ViewId) => void }) {
  const [query, setQuery] = useState('')
  const results = useMemo<SearchResult[]>(() => {
    const notes = data.notes.map((note) => ({ id: note.id, view: 'notes' as const, eyebrow: 'Nota', title: note.title, detail: note.body }))
    const tasks = data.tasks.map((task) => ({ id: task.id, view: 'tasks' as const, eyebrow: task.completed ? 'Completata' : 'Attività', title: task.title, detail: task.area }))
    const trips = data.trips.map((trip) => ({ id: trip.id, view: 'travel' as const, eyebrow: 'Viaggio', title: trip.destination, detail: `${trip.country} · ${formatDate(trip.startDate)}` }))
    const all = [...notes, ...tasks, ...trips]
    if (!query.trim()) return all.slice(0, 6)
    return all.filter((result) => `${result.title} ${result.detail} ${result.eyebrow}`.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
  }, [data, query])

  return <div className="palette-backdrop" onMouseDown={onClose} role="presentation"><div className="search-palette" role="dialog" aria-modal="true" aria-label="Cerca in AURA" onMouseDown={(event) => event.stopPropagation()}><div className="palette-input"><Icon name="search" /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cerca note, attività e viaggi…" /><button onClick={onClose} aria-label="Chiudi"><Icon name="close" /></button></div><div className="palette-results"><p>{query ? 'Risultati' : 'Accesso rapido'}</p>{results.map((result) => <button key={`${result.view}-${result.id}`} onClick={() => goTo(result.view)}><span className={`result-icon ${result.view}`}><Icon name={result.view === 'notes' ? 'note' : result.view === 'tasks' ? 'check' : 'plane'} /></span><span><small>{result.eyebrow}</small><strong>{result.title}</strong><em>{result.detail}</em></span><Icon name="arrow" /></button>)}{results.length === 0 && <EmptyState icon="search" title="Nessun risultato" text="Prova con parole diverse." />}</div><footer><span><kbd>↵</kbd> apri</span><span><kbd>esc</kbd> chiudi</span><strong><Icon name="lock" /> Ricerca locale</strong></footer></div></div>
}

function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <header className="page-header"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p></div>{action}</header>
}

function TaskRow({ task, onToggle }: { task: Task; onToggle: () => void }) {
  return <div className="preview-task"><button className="task-check" onClick={onToggle} aria-label={`Completa ${task.title}`} /> <div><strong>{task.title}</strong><span><span className={`priority-dot ${task.priority}`} />{task.area}{task.dueDate && <> · {formatDate(task.dueDate)}</>}</span></div><Icon name="chevron" /></div>
}

function EmptyState({ icon, title, text }: { icon: IconName; title: string; text: string }) {
  return <div className="empty-state"><span><Icon name={icon} /></span><strong>{title}</strong><p>{text}</p></div>
}

export default App
