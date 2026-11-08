# Backend beta senza nuovi abbonamenti

Vincolo confermato dall’utente: Expo per app/build, nessun piano Railway; servizi esterni soltanto gratuiti. Organizzazione Supabase personale scelta esplicitamente; piano Free verificato, preventivo progetto 0/mese. Progetto mkvpndnrwjofmfgamxbk, eu-central-1. Nessuna migrazione di dati utente: il progetto è nuovo e vuoto.

Scelta del costruttore: database e funzioni server Supabase Free per non introdurre consumi di Expo Hosting a pagamento. Conservare il runtime Node/SQLite locale e la demo privata. Migrare la logica già collaudata a uno store asincrono, con transazioni Postgres e lock per evitare incontri duplicati. Schema dedicato non esposto dalla Data API, RLS e revoca anon/authenticated. Nessuna chiave segreta nei client.

Sequenza: test API asincrone; adapter Postgres e schema privato; verifiche reali SQL e suite; endpoint cloud autenticato; configurazione OAuth solo con credenziali dedicate reali. Nessun utente demo o metodo di accesso finto esposto nel backend. Posizione reale fra telefoni non dichiarata operativa prima del collaudo. Live tracking resta un passaggio separato dallo snapshot già presente; limiti Free e quote da rispettare.

Blocchi di uscita: credenziali OAuth Apple/Google/Facebook non ancora configurate; account store e firma separati. Non collegare la demo privata a un backend pubblico che potrebbe cambiare il suo pubblico.
