# Random Stranger — backend beta Free

Progetto `mkvpndnrwjofmfgamxbk`, organizzazione personale, regione eu-central-1. Piano Free e costo di creazione 0/mese verificati il 7 novembre 2026. Non aggiungere piani Pro, branch, compute aggiuntivo o componenti a pagamento. Le quote Free possono limitare o sospendere il servizio; assenza di SLA e pausa per inattività accettate per la beta.

App e build restano su Expo. Database e API usano Supabase Free; non si attiva Expo Hosting a consumo. Conservata la demo privata senza dati reali. Nessuna credenziale OAuth attualmente configurata: accessi reali disabilitati.

Schema `random_stranger`, escluso dalla Data API; nessun accesso anon/authenticated alle tabelle, RLS attiva. Solo il backend con sessioni proprie accede al DB. Il client non riceve credenziali database o chiavi segrete. La revisione profili è obbligatoria. Nessun endpoint pubblico di moderazione.

Lo store Postgres viene generato dalla logica SQLite con `node scripts/build-cloud-store.mjs`. SQL del sorgente tradotto con parametri bind; transazioni e lock consultivo di progetto preservano atomicità/concorrenza. Il lock globale privilegia correttezza nella piccola beta; non è una soluzione di alta capacità. Contratto di comportamento su Postgres/PGlite: `node scripts/build-cloud-tests.mjs`, `npm test`.

Endpoint previsto: `https://mkvpndnrwjofmfgamxbk.supabase.co/functions/v1/random-stranger`. Configurarlo in EXPO_PUBLIC_API_URL soltanto dopo configurazione e collaudo degli accessi. I callback OAuth devono usare il percorso `/functions/v1/random-stranger/auth/PROVIDER/callback`. Secrets solo nella dashboard Supabase; OAUTH_ENABLED e BETA_ALLOWED_EMAILS restringono la beta. L’accesso Apple necessita delle credenziali dedicate complete, come il runtime locale.

La posizione implementata rimane uno snapshot volontario a scadenza; il monitoraggio continuo fra due telefoni resta da implementare e collaudare, quindi non è annunciato come operativo. Inviti reali ancora disabilitati. Nessun caricamento store o build firmata prodotto da questo backend.

Verifiche cloud del 7 novembre: health=ok, accesso senza sessione=401; collaudo scripts/smoke-cloud.mjs con due sessioni sintetiche e coordinate simulate riuscito (matching, moderazione, conferme, doppio opt-in e revoca). Tutte le fixture rimosse e conteggi finali utenti/appuntamenti/coordinate zero. Cleanup SQL pianificato nel database ogni minuto, prima esecuzione succeeded. L’API filtra le coordinate scadute subito; la pulizia fisica avviene al successivo ciclo disponibile, senza garanzia temporale durante sospensioni del piano Free.

Advisor: soltanto informazioni su RLS senza policy (deny-all voluto per schema server) e indici non ancora utilizzati (progetto nuovo). [RLS senza policy](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy), [indici inutilizzati](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index).
