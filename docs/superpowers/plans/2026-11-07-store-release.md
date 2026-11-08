# Preparazione caricamento Google Play e TestFlight

Esecuzione diretta autorizzata dall’utente. Si preservano brand e comportamento approvati; nessun caricamento dichiarato senza ricevuta dello store.

- [x] Accesso Apple nativo: nonce monouso del server, verifica JWT RS256 con chiavi Apple, issuer/audience/scadenza/nonce, sessione dedicata. Cancellazione account con nuova autorizzazione Apple e revoca token, senza archiviare token Apple.
- [x] Configurazione build: identificatori stabili, icona, entitlement Apple, profili EAS, controllo credenziali/endpoint prima di avviare build store. Nessun ID progetto inventato.
- [x] Verifica prebuild nativa isolata Android/iOS, TypeScript, suite completa ed export; nessun export spacciato per APK/IPA.
- [x] Registro store con requisiti ufficiali, rischi di ammissibilità effettivi, dati mancanti per privacy/sicurezza e account. Non inventare email di assistenza, URL legali o dichiarazioni di conformità.
- [ ] Salvare sorgenti e pacchetto aggiornato. Il caricamento effettivo richiede accesso Expo/EAS, Apple Developer/App Store Connect, Play Console e backend HTTPS operativo.

Riferimenti: developer.apple.com/app-store/review/guidelines/ (1.1.4, 1.2, 2.2, 4.8); support.google.com/googleplay/android-developer/answer/9878810 e /14747720; docs.expo.dev/deploy/submit-to-app-stores/.

Moderazione prepubblicazione e segnalazioni contenuto implementate dopo conferma utente della finalità incontri tra adulti; presidio e contatti pubblici da configurare.
