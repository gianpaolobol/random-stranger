# Inviti facoltativi — schermata e anteprima

L’utente ha approvato il testo per una schermata di invito facoltativo e ha chiesto di procedere. Gli inviti non sono una condizione per installazione, registrazione o utilizzo dell’app.

Testo principale:
«Invita i tuoi contatti per far crescere la nostra comunità: più persone, più possibilità di match.»

Testo piccolo nell’anteprima dell’invio dalla piattaforma:
«L’invito non mostra la tua identità o il tuo profilo agli invitati.»

## Stato implementato
`src/InvitationDialog.tsx`: selezione esplicita di destinatari dimostrativi, anteprima, modifica selezione, simulazione e continuazione senza inviti. Nessun destinatario preselezionato. Il dialogo compare all’ingresso nella demo e dopo il primo salvataggio di un profilo reale; è riapribile da dashboard e profilo.
`src/invitations.mjs`: contenuto generico, senza nome/alias dell’utente, ID profilo o codici referral; il link è uguale per tutti. Il testo privacy compare nell’anteprima demo dichiarata, non viene attribuito alla condivisione tramite account personale dell’utente.

## Limiti reali
Nessun accesso alla rubrica, nessun caricamento di contatti reali e nessun invio. I destinatari demo sono esempi `example.invalid`. La conferma è «Simula invito» e il risultato dichiara che nessun messaggio è partito. In modalità reale il canale di invio è disabilitato e la continuazione resta disponibile.
Il servizio reale di invio dalla piattaforma non è configurato. Prima di abilitarlo servono un mittente della piattaforma verificato, un canale e destinatari autorizzati, il collegamento di produzione accessibile ai destinatari e una verifica che messaggio e metadati non mostrino l’identità dell’invitante. Nessuna promessa di anonimato assoluto. Nessun fallback automatico a SMS, WhatsApp o email personali.

## Verifiche
Cinque test nuovi su selezione, assenza di dati del profilo, deduplicazione, testo privacy e canale non configurato; 45 test applicativi in totale. TypeScript e export web/iOS/Android completati. Questi export non sono build native firmate.

Browser desktop: verificati salto facoltativo, riapertura, selezione, anteprima, conferma della simulazione e azzeramento della selezione alla riapertura. Prova visiva in screenshots/invitations.jpg.

## Revisione elenco nomi
Richiesta utente: mostrare solo i nomi, recuperati dalla rubrica del telefono; contemplare WhatsApp, SMS e email. Eliminati email/telefoni dall’elenco e dai dati dell’anteprima. Demo con nomi fittizi Giulia Rossi, Luca Bianchi e Andrea Moretti.
App nativa: pulsante Scegli dalla rubrica richiede il permesso di lettura soltanto su azione esplicita e recupera esclusivamente FULL_NAME e ID locale tramite expo-contacts. Ricerca per nome e selezione multipla, massimo 100 righe renderizzate alla volta; tutti i nomi autorizzati sono ricercabili. I dati restano in memoria locale e sono rimossi alla chiusura, senza caricamento su server. Scrittura rubrica disabilitata in Android; supporto accesso limitato iOS.
Il collegamento ai canali WhatsApp/SMS/email e l’invio reale NON sono ancora attivi. Questi canali, quando usano l’account personale dell’utente, possono mostrare il mittente: nessuna frase che li dichiari anonimi. La frase approvata sull’identità nascosta resta circoscritta alla simulazione del futuro invio dalla piattaforma. Anteprima privata attuale non è un link di installazione pubblico.
76 test passati e verifica prebuild per i permessi aggiornata. Importazione rubrica e consegna messaggi su telefoni reali non ancora collaudate; nessuna rubrica reale letta durante lo sviluppo.

## Selezione completa e protezione dei tentativi
Seleziona tutti comprende tutti i contatti autorizzati, anche oltre le prime 100 righe o fuori dal filtro di ricerca. Quando sono tutti selezionati diventa Deseleziona tutti; ogni nome può essere tolto singolarmente prima dell’anteprima. La lista definitiva contiene soltanto i selezionati, deduplicati per ID locale.
Il controller dei tentativi mantiene un blocco sincrono per i doppi tocchi e un registro in memoria separato per sessione/account. Un secondo tocco sulla stessa selezione condivide l’operazione in corso; un’altra selezione viene respinta mentre la prima è attiva. Le azioni di modifica/chiusura sono disabilitate durante la simulazione.
Ogni destinatario mantiene la stessa chiave di idempotenza nei retry; le conferme già ottenute vengono saltate. Un rifiuto certo prima dell’invio è ritentabile; un timeout o altro esito incerto non viene ritentato senza un servizio che garantisca idempotenza. Aprire un compositore non è una ricevuta di consegna. L’attuale adapter è soltanto una simulazione e non produce messaggi.
Limite esplicito: il registro vive nella sessione dell’app; la consegna reale richiederà un registro persistente sul backend e idempotenza del provider o riconciliazione dello stato. Nessuna garanzia di consegna o deduplicazione reale attraverso WhatsApp/SMS/email è dichiarata da questa demo. Sette test nuovi coprono selezione/esclusione, doppi tocchi, retry parziale, esito incerto, selezione concorrente, chiave stabile con provider idempotente e assenza ricevuta.
