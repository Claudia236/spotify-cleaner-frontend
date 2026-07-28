# Spotify Playlist Cleaner — Frontend

Interfaccia React per collegare il tuo account Spotify, vedere i brani di una playlist skippati spesso o
non ascoltati da tempo, e spostarli in un'altra playlist con conferma manuale.

Richiede il [backend](../spotify-backend) in esecuzione, che si occupa dell'autenticazione OAuth e del
tracciamento degli ascolti.

## Setup

```bash
cp .env.example .env   # imposta VITE_API_URL se il backend non gira su http://127.0.0.1:8888
npm install
npm run dev
```

Apri `http://127.0.0.1:5173`, collega Spotify e seleziona una playlist da analizzare.

## Come funziona

1. **Login**: reindirizza al flusso OAuth del backend.
2. **Dashboard**: mostra da quanto tempo è attivo il tracciamento, permette di modificare le soglie
   (skip minimi, giorni senza ascolto) e di scegliere la playlist sorgente.
3. **Candidati**: elenco dei brani che superano una delle due soglie, con checkbox per selezionarli.
4. **Sposta selezionati**: chiama il backend per aggiungere i brani scelti alla playlist di destinazione
   (creata automaticamente al primo utilizzo) e rimuoverli dalla playlist sorgente.
