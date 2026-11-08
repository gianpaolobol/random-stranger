# Random Stranger — caricamento store

## Verificato il 7 novembre 2026
Nome: Random Stranger. Bundle ID / package Android: it.randomstranger.app. Icona: simbolo alato senza scritta; interfaccia con sola scritta approvata. Client Expo SDK 58, React Native previsto dall’SDK locale. Accessi Google/Facebook e accesso Apple nativo implementati; nessuna credenziale di produzione configurata.

Il controllo `npm run verify:native` genera i progetti iOS e Android in una directory temporanea: verifica entitlement Apple e rimozione dei permessi non utilizzati. Non compila né firma. Risultati in NATIVE_VERIFICATION.json.

## Stato del caricamento — aggiornamento 8 novembre 2026
Android: AAB demo 0.1.0 (versionCode 2) compilato con successo da EAS, build e6460bbc-5d97-4d39-9dc3-3974e4f7681e; sorgente 35a0001c49b89b81b9e60d3d09ba7c7e183b7f7c. Keystore dedicato custodito su Expo. Archivio ZIP verificato senza errori; non eseguita una verifica crittografica indipendente con jarsigner. File conservato con ID libfile_47eaa911d6e88191ab04b1294abd8099. Non ancora caricato su Google Play.
Google Play: modulo Crea app predisposto (Random Stranger, it.randomstranger.app, italiano, app gratuita). Nome pacchetto disponibile. Dichiarazioni norme/esportazione ancora non accettate: occorre conferma specifica del proprietario prima di creare il record.
iOS: App ID it.randomstranger.app creato nel team BX9MDXAHKG; record App Store Connect 6832108281, SKU random-stranger-demo. Chiave App Store Connect Q867WLD8JD (fungoitalia) associata su EAS con autorizzazione esplicita dell’utente; autenticazione API riuscita. Profilo di firma 8S8B8ASVQ2 assegnato correttamente. Build iOS c56c1865-e480-47df-b87b-153f3d5fa239 avviata: 0.1.0 (3), commit 83449b490091f06905d5ca0b43c9c19c5f17503a, ultimo stato verificato IN_PROGRESS. Nessun IPA o build TestFlight ancora attestato.
La demo non usa accessi social, dati reali, rubrica o posizione. Backend Free separato già operativo come infrastruttura, provider OAuth ancora disabilitati. La distribuzione dimostrativa non certifica il funzionamento con utenti reali.

## Accessi e compilazione
1. Account Expo collegato: gianpaolobol, ruolo Release Manager sul solo account personale. Progetto @gianpaolobol/random-stranger, UUID 92c31a12-b721-4386-8bf8-7e623b43eb53, verificato da CLI e persistito in src/project.mjs. Non ricrearlo; EAS_PROJECT_ID resta un override facoltativo. Non usare l’ID del sito come ID EAS.
2. Attivare backend HTTPS con SQLite persistente e OAuth dedicati; per Apple usare APPLE_CLIENT_ID=it.randomstranger.app con team ID, key ID e chiave privata esclusivamente sul server. Il client non riceve queste chiavi. Con email relay Apple nella beta, autorizzare esplicitamente quell’indirizzo.
3. Configurare EXPO_PUBLIC_API_URL all’origine HTTPS del backend per le build native. `npm run check:store -- ios` verifica formato e disponibilità API e richiede Apple attivo; il controllo non certifica requisiti legali o approvazione.
4. Configurare firma Android e profilo Apple con gli account del proprietario. Usare `eas build --platform android --profile beta` e `eas build --platform ios --profile beta`. Il pre-install hook respinge build store senza endpoint operativo e UUID EAS.
5. Dopo prove su dispositivi, usare `eas submit --platform android --profile beta` e `eas submit --platform ios --profile beta` con credenziali autorizzate. Il profilo Android punta al testing interno in stato bozza. L’upload iOS va in App Store Connect e TestFlight, non equivale alla pubblicazione App Store.

## Accesso Apple e cancellazione
Nonce server monouso e token verificato per firma RSA, issuer, audience, scadenza e nonce. Email relay accettate e non pubblicate. La cancellazione richiede una nuova autorizzazione sullo stesso account Apple, scambia il codice e revoca il token senza conservarlo nel database. Se il servizio Apple non consente la revoca, la cancellazione locale viene comunque eseguita e l’app comunica il passaggio manuale residuo. Timeout client di cancellazione Apple 45s, superiore ai timeout dei passaggi server (10s ciascuno). Chiavi e account reali da collaudare su dispositivo.

## Requisiti ancora da completare prima di inviare in revisione
- Backend pubblico operativo; credenziali e firma reali; test su iPhone/iPad e Android, GPS/deep link/accessi/revoche.
- Identità del titolare, contatto assistenza e sicurezza minori, URL pubblici privacy, termini, standard contro abusi su minori e richiesta cancellazione web: da definire con il proprietario; nessuna email o dichiarazione pubblica inventata.
- Moderazione implementata: il runtime obbliga la revisione dei testi prima dei nuovi abbinamenti; le modifiche pubbliche richiedono nuova revisione. Segnalazione contenuti e blocco disponibili già sulle proposte. Restano da organizzare il presidio operativo e il contatto pubblico di assistenza/sicurezza.
- Dichiarazioni privacy Apple e Data safety Play coerenti con email, preferenze personali, zona, check-in temporaneo, SDK e infrastruttura effettivi. Completare questionari età e blocco minori Play; età oggi autodichiarata.
- Screenshot da build native vere, testi store e note per revisori fedeli alle funzioni effettive. Non utilizzare screenshot desktop come prove di un’app nativa collaudata.

## Ammissibilità del concept
Apple App Review 1.1.4 include il divieto delle app di hookup; 1.2 riguarda contenuti degli utenti, filtri, segnalazioni, blocchi e contatto; 2.2 applica le linee guida anche alle beta TestFlight; 4.8 richiede accesso equivalente a tutela della privacy con login social. Google Play vieta servizi/contenuti destinati alla gratificazione sessuale e richiede standard di sicurezza minori per social/dating, anche per app riservate ad adulti. Il concept originale centrato sull’offerta di sesso richiede una decisione sostanziale sul prodotto: non basta riscrivere il marketing. Il 7 novembre 2026 l’utente ha confermato esplicitamente la finalità “Incontri tra adulti”: primi incontri pubblici, senza promettere o organizzare rapporti sessuali. Il prodotto segue questa scelta, che non garantisce comunque l’ammissione. Nessuna funzionalità nascosta o descrizione ingannevole per la revisione.

Fonti ufficiali consultate:
- https://developer.apple.com/app-store/review/guidelines/
- https://developer.apple.com/testflight/
- https://docs.expo.dev/versions/latest/sdk/apple-authentication/
- https://docs.expo.dev/deploy/submit-to-app-stores/
- https://support.google.com/googleplay/android-developer/answer/9878810
- https://support.google.com/googleplay/android-developer/answer/14747720
- https://support.google.com/googleplay/android-developer/answer/16302250

## Demo separata per TestFlight / test interno Google Play
Usare `eas build --profile demo --platform android` e `--platform ios` per la demo fittizia senza utenti reali. Flag EXPO_PUBLIC_DEMO_ONLY=true in eas.json: tutte le API disattivate, nessun pulsante social, nessuna posizione o rubrica reale. Il controllo demo non sostituisce né disattiva i guard beta/production. I metadati ai revisori devono descrivere la versione dimostrativa senza incontri/messaggi reali.
110 test, TypeScript, export demo tre piattaforme e prebuild demo/reale passati il 7 novembre 2026. Keystore Android dedicato creato su Expo. Nessun caricamento attestato in questa sezione finché i successivi risultati non riportano ID build, stato FINISHED e stato store verificato. Profilo invio demo Android: internal, draft. Non pubblicare in production.

Invio iOS standard programmato su EAS: cbce21da-a861-4235-aec0-36322cc9cd89, collegato alla build c56c1865-e480-47df-b87b-153f3d5fa239. Nessun piano aggiuntivo. Non equivale ad app già disponibile su TestFlight; verificare il completamento build, submission e processing Apple. Gruppi automatici disabilitati.
