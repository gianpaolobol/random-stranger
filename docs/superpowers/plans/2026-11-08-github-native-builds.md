# GitHub Native Builds Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. L’utente ha già richiesto esecuzione autonoma.

**Goal:** Compilare demo AAB/IPA direttamente su GitHub senza EAS.
**Architecture:** Expo prebuild genera progetti effimeri, Gradle/Xcode compilano e firmano con Secrets privati. TestFlight usa altool diretto, Google Play resta caricamento iniziale esplicito.
**Tech Stack:** Node24, GitHub Actions, Gradle, Xcode, Ruby xcodeproj.
**Spec:** docs/superpowers/specs/2026-11-08-github-native-builds-design.md

## Global Constraints
- Repo privato dedicato; nessuna modifica a Fungo Italia/Balotta.
- Niente chiamate EAS o segreti nel codice/log. Demo esplicita senza dati reali.
- Quote e credenziali da verificare prima di ENABLE_NATIVE_CI=true.

## Review Focus
- Nessuna firma debug scambiata per release; mancanza credenziali ferma il job.
- Versioni intere, monotone ai retry e superiori a 3.
- Nessun caricamento pubblico o tester aggiunto automaticamente.
- Cleanup chiavi anche in caso di errore.
- Nessuna compilazione macOS prima della verifica quote.

### Task 1: Configurazione locale e workflow
- [ ] Test RED numeri build validi/invalidi.
- [ ] Integrare numeri build in app.config.ts senza cambiare default locali.
- [ ] Aggiungere workflow gated con firma nativa e script dedicati.
- [ ] Eseguire suite, TypeScript, prebuild demo e controlli sintassi.
- [ ] Revisione indipendente della sola pipeline, poi correzioni necessarie.

### Task 2: Repository e attivazione
- [ ] Salvare sorgente corrente e workflow nel repository privato.
- [ ] Verificare stato remoto, quote e disponibilità Secrets.
- [ ] Attivare ed eseguire solo dopo quote e credenziali disponibili/autorizzate; altrimenti registrare esattamente il blocco.
