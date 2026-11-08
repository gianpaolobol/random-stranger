# Demo su TestFlight e Google Play interno

Richiesta utente: completare le demo installabili; Facebook sospeso, OAuth e consenso Apple non conclusi. Scelta del costruttore comunicata: build dimostrativa separata, esplicita e con dati fittizi; non aggirare i controlli della versione reale.

Profilo EAS demo, distribuzione store, AAB Android e IPA iOS. Flag EXPO_PUBLIC_DEMO_ONLY=true: il client disabilita qualsiasi endpoint reale, non mostra pulsanti social non operativi, non richiede contatti o GPS né entitlement Apple Login. Demo locale in memoria; tutte le simulazioni restano etichettate. Nessun cambiamento di finalità o funzionalità nascoste per la revisione.

Verificare test configurazione, TypeScript, suite completa, prebuild nativi, export e comportamento browser della variante demo. Conservare profili beta/production con controllo backend e OAuth. Crediti Expo verificati nell’account Starter: 3/45 USD già consumati, medium Android1 e iOS2 secondo pagina billing del 7 novembre; usare medium, senza upgrade. Fermarsi se vengono richiesti costi aggiuntivi.

Poi salvare codice e avviare build EAS. Firma Android dedicata al package it.randomstranger.app. Firma iOS/App ID e record App Store Connect sul team del proprietario; nessuna chiave in Git. Caricamento Android iniziale tramite Play Console se API non consente il primo upload. Nessuna pubblicazione production: solo test interno Play e TestFlight. Non dichiarare APK/IPA né caricamenti senza output verificato. Eventuali conferme browser richieste soltanto al passaggio concreto.

Requisiti esterni: app identifiers, firma, accessi console, eventuali accordi e metadati privacy/tester. I test automatici e il prebuild non sostituiscono collaudo su telefono, firma o revisione store.
