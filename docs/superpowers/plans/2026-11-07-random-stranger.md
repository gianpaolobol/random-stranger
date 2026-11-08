# Random Stranger Implementation Plan
> Implementazione diretta autorizzata dall’utente; task indipendenti verificati prima di salvare.
**Goal:** app iOS/Android/web con abbinamenti reciproci e appuntamenti senza foto.
**Architecture:** Expo condiviso, dominio puro, API HTTP con sessioni e SQLite transazionale. Demo locale esplicita e distinta dagli account reali.
**Tech Stack:** Expo 58, React Native 0.88, TypeScript, Node 24 SQLite.
**Spec:** docs/superpowers/specs/2026-11-07-random-stranger-design.md
## Global Constraints
- 60 minuti inclusi per cancellazione gratuita; tre violazioni per esclusione.
- No immagini profilo. Coordinate ed email non esposte ai candidati.
- OAuth Google/Facebook solo quando configurato realmente; niente accessi simulati spacciati per veri.
## Review Focus
- Limite esatto 60 min e fusi orari: test dominio con timestamp UTC.
- Cancellazioni duplicate: vincolo eventi univoci e transazioni.
- Appuntamenti sovrapposti: controllo dentro transazione SQL.
- Accesso a appuntamenti altrui: autorizzazione partecipanti nel backend.
- Mancato consenso e posizione negata: nessuna penalità per rifiuto; assenze contestabili.
### Task 1: Dominio e persistenza
Files: src/domain.mjs, server/store.mjs, tests/domain.test.mjs, tests/store.test.mjs.
Interfaces: validateProfile(input), compatible(a,b), cancellationPenalty(start,now); createStore(path) con profili, match, conferme, cancellazione, checkin, segnalazioni e contestazioni.
- [x] Scrivere e verificare test RED su 60 minuti, reciprocità, coordinate e terza violazione.
- [x] Implementare dominio e store transazionale; suite GREEN.
### Task 2: Autenticazione e API
Files: server/auth.mjs, server/api.mjs, server/index.mjs, src/auth.ts, tests/api.test.mjs.
Interfaces: createApp({store,config,providerFetch}) => (Request)=>Promise<Response>.
- [x] Test RED sessioni, proprietà record, CSRF, OAuth non configurato e scambio PKCE.
- [x] Adattare accessi Balotta senza immagini e integrare rotte reali. Suite GREEN.
### Task 3: App condivisa e brand
Files: App.tsx, src/ui.tsx, src/demo.ts, app.config.ts, eas.json, assets/brand-approved.png.
- [x] Onboarding, disponibilità, proposte, appuntamenti, preferenze, profilo, regole e gestione account.
- [x] Demo con dati fittizi espliciti; conferma/rifiuto/checkin/cancellazione e impostazioni funzionanti.
- [x] Typecheck ed export di tutte le piattaforme.
### Task 4: Verifica e consegna
- [x] Suite completa, controllo UI desktop/mobile e revisione finale.
- [x] Aggiornare CONTINUITA con verifiche e dipendenze reali mancanti.
- [x] Salvare sorgenti su remoto e pubblicare anteprima privata senza dichiarare distribuzione store.
