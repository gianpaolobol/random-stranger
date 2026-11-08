# Firma e compilazione — checkpoint 8 novembre 2026

- Repository gianpaolobol/random-stranger verificato pubblico tramite GitHub get_repo.
- Certificato Apple distribuzione e profilo Random Stranger recuperati dal servizio credenziali Expo esistente; nessuna nuova compilazione Expo avviata.
- Validazione locale: P12 e chiave privata leggibili con password; certificato valido; profilo App Store senza dispositivi, team BX9MDXAHKG, application identifier BX9MDXAHKG.it.randomstranger.app, scadenza 9 ottobre 2027. Chiave ASC Q867WLD8JD precedentemente autorizzata: formato privato valido.
- Nessuna credenziale inserita nel repository o nei log. GitHub Actions Secrets rimangono non configurati.
- Revisione automatica ha respinto il trasferimento del certificato privato a GitHub Actions Secrets, richiedendo consenso esplicito ai dati e alla destinazione. Necessario consenso per P12/password, profilo provisioning e chiave privata ASC nei soli Secrets di gianpaolobol/random-stranger.
- Revisione automatica ha nuovamente respinto la singola dichiarazione Google Play, nonostante la conferma dell'utente. Non effettuare tentativi tramite canali alternativi per aggirare il blocco. Modulo Google pronto, entrambe le dichiarazioni ancora non selezionate.
- ENABLE_NATIVE_CI non attivata; nessuna nuova build GitHub avviata finché firma non configurata. App Store Connect mostra ancora No Builds; consegna EAS precedente attestata ma disponibilità ai tester non attestata.

## Prossimo passo
Configurare i sei Secrets iOS in GitHub con conferma esplicita del trasferimento delle credenziali. Attivare ENABLE_NATIVE_CI e avviare workflow_dispatch platform=ios, upload_testflight=true. Verificare log, IPA firmato, upload e comparsa effettiva in TestFlight. Android: AAB esistente pronto, app Play da creare dopo completamento diretto delle dichiarazioni bloccate.
