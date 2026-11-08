# Random Stranger
App Expo per iOS, Android e web: profili solo testuali senza nickname permanente, alias nuovi per ogni incontro, disponibilità, preferenze reciproche e incontri in luoghi pubblici. Identità visiva approvata: azzurro/fucsia su blu notte, stella nella o e simbolo alato.

## Stato reale
- Client condiviso sviluppato; anteprima privata pubblicata in modalità demo con dati fittizi.
- API Node/SQLite sviluppata e verificata localmente; non è collegata al servizio pubblico.
- OAuth Google/Facebook implementato con stato monouso, cookie HttpOnly, PKCE Google e handoff nativo PKCE. Nessuna credenziale reale viene inclusa.
- Gli export JavaScript/Hermes per web, iOS e Android NON sono APK/IPA firmati o prove su dispositivi.
- Il primo catalogo di luoghi è limitato al centro di Bologna; estendere `VENUES` con luoghi pubblici verificati per altri territori.
- Font approvato Random Stranger Fluid v3: 320 caratteri, TTF installabile e WOFF2, sorgenti degli outline inclusi; stessa famiglia per titoli e testi. Il marchio raster approvato è conservato.

## Sviluppo
Richiede Node >=24.3 e npm.

```sh
npm ci
npm test
npm run typecheck
npm run export:all
npm run start
```

## API locale
```sh
cp .env.example .env
node --env-file=.env server/index.mjs
```
Il server ascolta 127.0.0.1:8787; serve API e `dist/` dalla medesima origine. Per produzione serve un host Node con volume SQLite persistente e reverse proxy HTTPS. Il frontend web e le API devono avere la **stessa origine**: non collegare una pagina Sites a un’API su un altro dominio con cookie di terze parti. Per il nativo impostare `EXPO_PUBLIC_API_URL` all’origine HTTPS dell’API prima di generare la build.

Configurare client OAuth dedicati a Random Stranger, non riutilizzare segreti di altre app. URI callback: `PUBLIC_ORIGIN/auth/google/callback` e `PUBLIC_ORIGIN/auth/facebook/callback`; deep link nativo `randomstranger://auth`. Per avviare login reali: HTTPS, ID/segreti dei provider, versione Graph esplicita, `OAUTH_ENABLED=true`, email consentite per la beta. Nessuna richiesta di chiavi in chiaro nella chat.

La demo ospitata resta separata dagli account reali, non effettua richieste OAuth configurate e non invia posizioni reali quando si simula la presenza.

Le modifiche non salvate al profilo vengono conservate nella sessione quando si cambia pagina o arrivano aggiornamenti automatici; aggiornare la disponibilità non le cancella. Non persistono dopo chiusura o ricaricamento dell’app. Le richieste hanno un limite di 15 secondi e non ripetono automaticamente salvataggi o conferme; eventuali problemi di sincronizzazione possono essere ritentati dal relativo avviso.

## Regole
- Match solo con preferenze reciproche, distanza accettata da entrambi e finestra comune di almeno 30 minuti.
- Il salvataggio di un profilo disponibile cerca automaticamente un abbinamento.
- Conferma di entrambi almeno un’ora prima; nessun appuntamento unilaterale.
- Cancellazione con anticipo >=60 minuti: zero penalità. Cancellazione più tardiva di incontro confermato: una penalità idempotente.
- Tre penalità: rimozione profilo e esclusione automatica. I metadati minimi delle contestazioni restano accessibili; l’identificativo di esclusione impedisce il ripristino con lo stesso provider dopo cancellazione.
- Check-in volontario da 10 minuti prima a 10 minuti dopo la fine, entro 150m, precisione <=100m. Il GPS del dispositivo non è una prova incontrovertibile: una sola segnalazione non infligge penalità.
- Assenze contestabili: richiedono valutazione di moderazione. Un ricorso accolto rimuove la penalità e l’eventuale esclusione; il profilo già rimosso va ricreato.
- Proseguire o fermarsi non infligge penalità. La scelta è revocabile.
- Posizione precisa solo durante l’incontro e solo con opt-in reciproco; scade in massimo 15 minuti. Rifiuto o revoca interrompono l’accesso. Pulizia SQLite ogni minuto nel processo server.
- Aggiornamento stato partner ogni 20 secondi e al ritorno in primo piano.

## Moderazione locale
```sh
node --env-file=.env server/moderate.mjs list
node --env-file=.env server/moderate.mjs uphold ID
node --env-file=.env server/moderate.mjs dismiss ID
```
`uphold` conferma un’assenza verificata o mantiene la penalità contestata; `dismiss` archivia l’accusa o annulla la penalità contestata. Una richiesta generica di assistenza non può creare penalità. Questi comandi non sono esposti via HTTP.

## Prima di una beta reale
Occorre ancora collegare hosting API e credenziali OAuth, associare il progetto agli account di build iOS/Android, produrre APK/IPA firmati e provare su telefoni. Verificare presenza/GPS, deep link e revoche reali; verificare requisiti di distribuzione e testi privacy con i dati/fornitori effettivi. L’età è attualmente auto-dichiarata: non esiste verifica documentale. Nessun invito o messaggio è stato inviato a persone reali.

## Pacchetto per hosting Node
`npm run export:server` genera in `dist-server/` la web app con API sulla stessa origine (`EXPO_PUBLIC_API_URL=/`). `npm run package:server` produce `release/random-stranger-server.tar.gz`: server Node senza dipendenze npm a runtime, build web, manifest SHA-256, README e configurazione di esempio. Include solo file runtime espliciti: nessun database o segreto. La demo `dist/` resta separata; per aggiornarla usare `npm run export:all` senza variabile API.

Estrarre su un host Node >=24.3, configurare reverse proxy HTTPS, volume SQLite persistente fuori dalla directory web e file di ambiente esterno a `dist`. Usare `NODE_ENV=production`, `PUBLIC_ORIGIN` e `WEB_ORIGIN` identici, `DATABASE_PATH` assoluto, `HOST` e `PORT` secondo la rete dell’host. Avvio: `node --env-file=/percorso/runtime.env server/index.mjs`. Non servono `npm install` nel pacchetto o accessi reali per avviare il servizio con OAuth disattivato. `/api/health` verifica SQLite e restituisce 200 oppure 503 senza esporre configurazione.

Prima di abilitare OAuth, configurare un provider completo e le email ammesse alla beta. Impostazioni incomplete, origine non HTTPS in produzione e database non persistente vengono respinti all’avvio. Il pacchetto è stato estratto e avviato localmente verificando HTTP e arresto ordinato; non equivale a un backend pubblico già ospitato. Per il client nativo serve `EXPO_PUBLIC_API_URL` con l’origine HTTPS assoluta, non `/`.

Riferimenti implementativi: [Expo Location](https://docs.expo.dev/versions/v58.0.0/sdk/location/), [Expo AuthSession](https://docs.expo.dev/versions/latest/sdk/auth-session/), [Piazza Maggiore](https://www.bolognawelcome.com/it/luoghi/piazze-vie-monumenti/piazza-maggiore).

## Alias degli incontri
Nessun nome utente scelto dall’utente. Alias di fantasia assegnati automaticamente a ciascun partecipante per ogni appuntamento, diversi dall’incontro precedente e stabili nello stesso incontro. Nessun ID account della controparte nelle risposte pubbliche. Vedi docs/ENCOUNTER_ALIASES.md. Non sono richiesti permessi contatti e non vengono inviati inviti obbligatori.

## Inviti facoltativi
Schermata con testo approvato, selezione dei soli destinatari dimostrativi e conferma simulata. Sempre possibile continuare senza inviti. Nessun contatto reale acquisito e nessun messaggio inviato; il servizio di invio dalla piattaforma resta da collegare. Dettagli in docs/OPTIONAL_INVITATIONS.md.

### Backend cloud gratuito (7 novembre 2026)
Database e API Supabase Free configurati nel progetto mkvpndnrwjofmfgamxbk (Francoforte), senza Railway o nuovi consumi Expo Hosting. Vedi supabase/README.md. App/build restano Expo; la demo privata resta fittizia. Accessi OAuth da configurare prima di collegare la build nativa al cloud. Test cloud con sessioni sintetiche e snapshot coordinate riusciti; nessun collaudo GPS reale o build store ancora eseguito.
