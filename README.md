# Spotify Cleaner — Frontend

Interfaccia React per collegare il tuo account Spotify, vedere i brani di una playlist che ascolti a lungo
e spesso (e copiarli nella tua playlist preferiti), o che skippi spesso (e spostarli in una playlist di
revisione), con conferma manuale.

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
   (ascolti prolungati minimi e skip minimi) e di scegliere la playlist sorgente.
3. **Candidati**: due elenchi separati, brani ascoltati a lungo almeno N volte e brani skippati almeno
   M volte, ciascuno con checkbox per selezionarli.
4. **Copia selezionati nei preferiti**: chiama il backend per aggiungere i brani scelti alla playlist
   preferiti (creata automaticamente al primo utilizzo), lasciandoli anche nella playlist sorgente.
5. **Sposta selezionati in revisione**: chiama il backend per aggiungere i brani scelti alla playlist di
   revisione skip (creata automaticamente al primo utilizzo) e rimuoverli dalla playlist sorgente.
