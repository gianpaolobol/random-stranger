# Alias per incontro — 7 novembre 2026
Richiesta approvata: nessun nome utente permanente. Nome di fantasia nuovo per ogni incontro, scelto da repertori gotici/medievali/futuristici/alieni in base al profilo. Font approvato: Random Stranger Fluid v3.

## Implementazione
`src/aliases.mjs` contiene 36 nomi per ciascuno dei repertori uomo, donna e neutro, oltre a 32 nomi di casata immaginari: 1.152 combinazioni per repertorio prima dell’eventuale suffisso di esaurimento. Repertori con alcuni nomi condivisi: non sono etichette identificative. Il repertorio neutro serve persone trans e non binarie, senza diciture o marcatori visibili nell’alias.
Il server usa una sorgente casuale crittografica. I due alias sono assegnati nella transazione di creazione dell’appuntamento, distinti tra i partecipanti, e salvati in alias_a/alias_b. Nessun riuso per la stessa persona rispetto agli incontri precedenti; dopo esaurimento delle combinazioni si usa un suffisso mai usato.
Nello stesso appuntamento gli alias restano stabili tra conferme, refresh, riavvii e cambi di descrizione/genere. In un nuovo appuntamento cambiano per entrambi. Il client riceve myAlias e partner.alias, senza ID account della controparte o nickname. Il blocco avviene tramite ID dell’appuntamento e autorizzazione lato server.
I profili non richiedono né salvano nickname; migrazione additiva dei database preesistenti, eliminazione dei nickname dai JSON e assegnazione di alias anche allo storico. L’ID interno dell’account rimane necessario per accesso, moderazione e blocchi: l’alias non promette anonimato assoluto, e una descrizione può rendere riconoscibile una persona.

## Rubrica e inviti
La richiesta di inviti obbligatori automatici a tutta la rubrica non è implementata. Nessun permesso contatti aggiunto, nessun caricamento di rubriche e nessun invio a persone reali. Alternativa proposta all’utente: inviti facoltativi a destinatari selezionati, con conferma dell’invio, senza garanzia di anonimato assoluto. Nessuna scelta su questa alternativa è stata ancora ricevuta; non è stata presentata come decisione dell’utente.

## Verifiche
40 test applicativi passati, inclusi ripetizione alias, reciprocità, persistenza, migrazione e risposte HTTP senza identificativi della controparte; TypeScript e export web/iOS/Android completati. Revisione indipendente senza rilievi Critical/Important. Backend reale e login OAuth ancora da collegare come da CONTINUITA.
