# Random Stranger — distribuzione demo, 8 novembre 2026

## Android
App Play creata: 4973696627498088796, pacchetto it.randomstranger.app. AAB 0.1.0 (2) caricato, elaborato e release 1 pubblicata nel canale interno 4701512455309823023. Console: Disponibile per i tester interni. Il canale indica Non attivo perché l'elenco tester non è ancora configurato; nessun destinatario aggiunto automaticamente. Non è una pubblicazione pubblica in produzione.

## iOS diretto GitHub
Run https://github.com/gianpaolobol/random-stranger/actions/runs/42431167633 — SUCCESS. Commit sorgenti aa708f051776b45e46f099be2bb5fbfcdcabd547. Checks e iOS verdi; Android saltato intenzionalmente (AAB già distribuito).
Versione 0.1.0, build 10001; bundle it.randomstranger.app verificati nell'Info.plist dell'IPA scaricato. Firma e profilo App Store validati; archivio Xcode e export IPA riusciti. Apple altool: UPLOAD SUCCEEDED with no errors, 2026-11-08T00:54:17Z (01:54:17 Europe/Rome).
Artefatto GitHub 13597439199, scade 11 novembre. Copia IPA conservata: https://chatgpt.com/library?file_id=libfile_556fae940f248191ba7fd09af1248417&account_id=personal
SHA-256 IPA: d4c40e02b9427fbd911ca5c35278e5480f2e293f32897798301143384eeeb003.
App Store Connect 6832108281 mostra ancora No Builds all'ultima lettura; non attestare disponibilità TestFlight ai tester finché Apple non mostra l'elaborazione completata. Nessun invito inviato e nessun gruppo creato.

## Firma e ripresa
Sei Secrets iOS configurati su GitHub; ENABLE_NATIVE_CI=true. Credenziali solo in Secrets, nessun valore in Git o log. File temporaneo di trasferimento rimosso. Workflow manuale platform=ios, upload_testflight=true.
I quattro Secrets Android non sono stati configurati in questa sessione: per future compilazioni Android su GitHub devono essere recuperati dal keystore dedicato già esistente, senza cambiarne la chiave di upload.
Entrambe le versioni distribuite sono DEMO con dati fittizi, senza GPS, login social o inviti reali. Le verifiche della pipeline non sostituiscono un collaudo fisico su telefoni.


## Replacement build12001 — startup regression
- Source15cf2dbfced20f20468f1a7d40bdda25380aea1a; signed GitHub run42438255269 SUCCESS.
- IPA verified:it.randomstranger.app,0.1.0,12001; SHA256d36d8a57b827e26a3a955e604a5f1910cefe3648df2df78c315aec2fdda39704.
- Apple authenticated Build Uploads:0.1.0(12001),Processing,Apple delivery UUID0b92a48f-5aea-441b-bfc9-a366cfcfb541. This proves received upload; it is not yet proof of a selectable TestFlight build or installability.
- Simulator Release startup regression passed on identical source:run42436848726. Screenshot:docs/screenshots/ios-startup-pass-20261108.jpg. Device retest pending.
