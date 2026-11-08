import {mkdtemp,readFile,writeFile,mkdir,readdir,copyFile,lstat,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve,dirname,relative} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
export async function packageServer({root,output}){
 let target;try{target=JSON.parse(await readFile(join(root,'dist-server/runtime-target.json'),'utf8'));}catch{}
 if(target?.apiMode!=='same-origin')throw Error('Esegui prima npm run export:server per produrre la build same-origin.');
 const stage=await mkdtemp(join(tmpdir(),'random-stranger-release-'));
 const files={};
 async function copy(from,to){
  const stat=await lstat(from);
  if(stat.isSymbolicLink())throw Error('Collegamento simbolico non consentito nel pacchetto runtime.');
  if(stat.isDirectory()){for(const name of await readdir(from)){if(name.startsWith('.')||/\.sqlite(?:-|$)/.test(name))throw Error('File privato nel pacchetto runtime.');await copy(join(from,name),join(to,name));}return;}
  if(!stat.isFile())throw Error('File runtime non valido.');
  await mkdir(dirname(to),{recursive:true});await copyFile(from,to);
  files[relative(stage,to)]=createHash('sha256').update(await readFile(to)).digest('hex');
 }
 try{
  for(const name of ['api.mjs','apple.mjs','auth.mjs','config.mjs','http.mjs','index.mjs','moderate.mjs','static.mjs','store.mjs'])await copy(join(root,'server',name),join(stage,'server',name));
  for(const name of ['domain.mjs','aliases.mjs'])await copy(join(root,'src',name),join(stage,'src',name));
  await copy(join(root,'dist-server'),join(stage,'dist'));
  await writeFile(join(stage,'package.json'),JSON.stringify({name:'random-stranger-runtime',private:true,type:'module',engines:{node:'>=24.3.0'},scripts:{start:'node server/index.mjs'}},null,2)+'\n');
  await writeFile(join(stage,'runtime.env.example'),`NODE_ENV=production
PUBLIC_ORIGIN=https://random-stranger.example.invalid
WEB_ORIGIN=https://random-stranger.example.invalid
DATABASE_PATH=/var/lib/random-stranger/app.sqlite
HOST=127.0.0.1
PORT=8787
OAUTH_ENABLED=false
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
FACEBOOK_API_VERSION=
APPLE_CLIENT_ID=
APPLE_TEAM_ID=
APPLE_KEY_ID=
APPLE_PRIVATE_KEY=
RESTRICTED_BETA=true
BETA_ALLOWED_EMAILS=
`);
  await writeFile(join(stage,'README.md'),`# Random Stranger — runtime beta

Richiede Node >=24.3 e tar per l’estrazione. Non occorre installare dipendenze npm.
Questa build web usa le API sulla stessa origine; la demo Sites rimane separata.

1. Estrai in una directory dedicata leggibile solo dall’utente di servizio.
2. Copia runtime.env.example in un file esterno alla directory dist, ad esempio /etc/random-stranger/runtime.env, con permessi 600.
3. Mantieni NODE_ENV=production. Imposta PUBLIC_ORIGIN e WEB_ORIGIN allo stesso dominio HTTPS reale.
4. Crea il volume persistente DATABASE_PATH e la directory che lo contiene, scrivibili dall’utente di servizio. Non collocare mai database, backup o configurazione dentro dist. Conserva il volume negli aggiornamenti.
5. Configura il reverse proxy HTTPS verso HOST e PORT. Usa HOST=0.0.0.0 solo se richiesto da un container o dalla rete privata dell’host; non esporre HTTP senza il proxy TLS.
6. Avvia con node --env-file=/etc/random-stranger/runtime.env server/index.mjs sotto un supervisore di processo. npm start è disponibile quando le stesse variabili sono già impostate dall’host.
7. GET /api/health deve restituire 200 e {"status":"ok"}. GET /api/config mostra solo i provider attivi; senza OAuth configurato nessun accesso reale è abilitato.

## Accessi e beta
Configura applicazioni OAuth dedicate, senza riusare segreti di altre app. Callback: PUBLIC_ORIGIN/auth/google/callback e PUBLIC_ORIGIN/auth/facebook/callback. Compila gli ID e segreti del provider scelto; Facebook richiede anche la versione API abilitata. Imposta BETA_ALLOWED_EMAILS ai soli tester autorizzati e poi OAUTH_ENABLED=true. Il server respinge configurazioni parziali. Nessun segreto deve essere aggiunto al pacchetto o a dist.
Per build native separate, EXPO_PUBLIC_API_URL deve essere l’origine HTTPS assoluta; questa build web non costituisce un APK o IPA.

## Verifica dei profili
Il runtime richiede approvazione dei testi prima di nuovi abbinamenti. Elenca la coda con node --env-file=/etc/random-stranger/runtime.env server/moderate.mjs profiles, poi usa approve-profile USER HASH o reject-profile USER HASH leggendo la revisione corrente. Le modifiche ai testi richiedono nuova verifica; modifiche private a orari/preferenze non la richiedono. Elenca segnalazioni con content e gestiscile con remove-content ID o dismiss-content ID; non generano penalità di presenza. Organizza un presidio umano prima di aprire agli utenti.

## Gestione
Controlla le segnalazioni con node --env-file=/etc/random-stranger/runtime.env server/moderate.mjs list; usa uphold ID o dismiss ID soltanto dopo verifica. La CLI di moderazione non è esposta via HTTP.
SIGTERM/SIGINT chiudono server e database. Per backup coerenti ferma il processo, copia il volume SQLite e riavvia; verifica periodicamente il ripristino. Distribuisci nuove versioni del codice conservando database e configurazione esterni. release-manifest.json contiene gli hash SHA-256 dei file runtime e della build.

Nessun invio di inviti reale, verifica documentale dell’età o distribuzione store è attivato da questo archivio. Esegui il collaudo OAuth, GPS e dispositivi prima di aprire la beta.
`);
  await writeFile(join(stage,'release-manifest.json'),JSON.stringify({format:1,apiMode:'same-origin',files},null,2)+'\n');
  await mkdir(dirname(resolve(output)),{recursive:true});
  execFileSync('tar',['-czf',resolve(output),'-C',stage,'.']);
  return {output:resolve(output),files:Object.keys(files).length};
 }finally{await rm(stage,{recursive:true,force:true});}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const root=fileURLToPath(new URL('../',import.meta.url));
 console.log(JSON.stringify(await packageServer({root,output:process.argv[2]||join(root,'release/random-stranger-server.tar.gz')})));
}
