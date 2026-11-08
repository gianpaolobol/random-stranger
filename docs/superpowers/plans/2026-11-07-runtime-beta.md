# Runtime beta — piano di implementazione

Obiettivo: rendere distribuibile su un host Node 24 l’app web con le API e SQLite persistente, mantenendo la demo Sites privata.
Specifica: 2026-11-07-random-stranger-design.md. Esecuzione diretta autorizzata dall’utente, senza attivare servizi o account inesistenti.

## Task 1: collegamento e avvio del servizio
- [x] Test RED per base API web sulla stessa origine, base HTTPS nativa, configurazione server e health check.
- [x] src/api-config.mjs: resolveApiConfig(value,platform) distingue demo, same-origin web e API assoluta; integrare src/auth.ts senza modificare la demo senza configurazione.
- [x] server/config.mjs: readServerConfig(env) valida origine, porta, bind, database persistente e provider; nessun segreto nei messaggi.
- [x] server/index.mjs: bind configurabile, health check /api/health, chiusura ordinata.
- [x] scripts/package-server.mjs: archivio con soli file runtime espliciti, dist, manifest e istruzioni; nessun database, segreto o sorgente non necessario.
- [x] Verificare vere richieste HTTP su processo avviato, chiusura e archivio runtime, suite completa, TypeScript, export tre piattaforme e revisione indipendente.
- [x] Salvare sorgenti sul remoto e aggiornare l’anteprima privata. Pubblicazione backend esterna e build firmate restano dipendenti da accessi reali.

## Casi da verificare
Variabile API assente mantiene demo; slash web usa cookie sulla stessa origine; URL nativo relativo respinto; origine di produzione non HTTPS respinta; SQLite in memoria respinto in produzione; porta/bind letti; endpoint health non espone segreti; pacchetto non contiene file personali.
