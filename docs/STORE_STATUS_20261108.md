# Stato store — 8 novembre 2026

## Verifiche della sessione
- GitHub: workflow presenti, ultime esecuzioni skipped. Quota account Free vista in Billing > Actions: compute $28.48 used / $12 included; storage 0.5 GB / 0.5 GB; reset indicato in 23 giorni. Nessuna spesa aggiuntiva autorizzata.
- Repository privato random-stranger: pagina Actions secrets vuota (nessun repository secret né environment secret). Nessun nuovo build native GitHub avviato.
- Invio iOS già avviato cbce21da-a861-4235-aec0-36322cc9cd89: Expo mostra Succeeded, versione 0.1.0 (3), commit 83449b4. Log: tre chunk caricati, upload completato, elaborazione Apple non attesa. Build upload ID c3d56837-ae02-4e31-be2e-d13f02f2f425.
- App Store Connect app 6832108281: mostra ancora No Builds, anche aprendo il dettaglio indicato nei log. Non dichiarare build disponibile ai tester. Ricerca email Apple dedicata a Random Stranger dopo 7 novembre senza risultati.
- Google Play: app Random Stranger ancora da creare. Modulo predisposto con it.randomstranger.app (disponibilità verificata), italiano, App, Senza costi; protezione automatica conservata. Due dichiarazioni non accettate: conformità alle Norme del programma sviluppatori e leggi USA esportazione. Necessaria conferma specifica prima dell'accettazione e creazione.
- AAB esistente v0.1.0 code 2 salvato: libfile_47eaa911d6e88191ab04b1294abd8099, /workspace/scratch/random-stranger-demo-android-vc2.aab. Non ancora caricato in Play.

## Passi rimanenti
1. Ottenere conferma specifica per le due dichiarazioni Google e creazione app gratuita per test interno, quindi caricare AAB esistente.
2. Per nuove build direttamente GitHub: rendere disponibile capacità di calcolo senza spese non autorizzate, configurare in modo sicuro firma Android/iOS e chiave ASC; non rendere pubblico il repository senza scelta esplicita.
3. Verificare la comparsa della build Apple e lo stato effettivo prima di dichiarare TestFlight operativo.
