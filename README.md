# AURA — Personal Agentic OS

AURA è un sistema operativo personale accessibile dal web, installabile e utilizzabile anche offline. Riunisce dashboard giornaliera, note, attività, viaggi e profilo in un’interfaccia unica.

## Privacy e persistenza

- I dati vengono salvati automaticamente nel `localStorage` del browser.
- Nessun dato personale viene inviato a server o salvato nella repository.
- I dati sono specifici del browser e del dispositivo in uso.
- La sezione **Il mio spazio** permette di esportare e importare backup JSON.

> La repository pubblica contiene soltanto il codice dell’applicazione. Non inserire dati personali direttamente nei file sorgente.

## Sviluppo locale

```bash
npm install
npm run dev
```

Verifiche:

```bash
npm run lint
npm test
npm run build
```

## Deployment

Il workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) esegue test, build e deployment automatico su GitHub Pages a ogni push su `main`.

## Stack

- React
- TypeScript strict
- Vite
- CSS responsive senza librerie UI
- Service Worker per la modalità offline
- Vitest
