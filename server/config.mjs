import {isAbsolute} from 'node:path';
import {fileURLToPath} from 'node:url';
export function readServerConfig(env=process.env){
 const production=env.NODE_ENV==='production';
 const raw=env.PUBLIC_ORIGIN||'http://localhost:8787';
 let url;try{url=new URL(raw);}catch{throw Error('PUBLIC_ORIGIN non valido.');}
 if(url.username||url.password||url.pathname!=='/'||url.search||url.hash||!['http:','https:'].includes(url.protocol))throw Error('PUBLIC_ORIGIN deve contenere solo l’origine.');
 const enabled=env.OAUTH_ENABLED==='true';
 if((production||enabled)&&url.protocol!=='https:')throw Error('Produzione e OAuth richiedono PUBLIC_ORIGIN HTTPS.');
 const origin=url.origin;
 if(env.WEB_ORIGIN&&env.WEB_ORIGIN.replace(/\/$/,'')!==origin)throw Error('WEB_ORIGIN deve coincidere con PUBLIC_ORIGIN.');
 const port=Number(env.PORT??8787);
 if(!Number.isInteger(port)||port<(production?1:0)||port>65535)throw Error('PORT non valida.');
 const databasePath=env.DATABASE_PATH||'./random-stranger.sqlite';
 if(production&&(!isAbsolute(databasePath)||databasePath===':memory:'))throw Error('DATABASE_PATH richiede un percorso assoluto su volume persistente.');
 const allowedEmails=(env.BETA_ALLOWED_EMAILS||'').split(',').map(v=>v.trim().toLowerCase()).filter(Boolean);
 const restrictedBeta=env.RESTRICTED_BETA!=='false';
 const googleId=env.GOOGLE_CLIENT_ID,googleSecret=env.GOOGLE_CLIENT_SECRET;
 const facebookId=env.FACEBOOK_APP_ID,facebookSecret=env.FACEBOOK_APP_SECRET,facebookVersion=env.FACEBOOK_API_VERSION;
 const appleId=env.APPLE_CLIENT_ID,appleTeamId=env.APPLE_TEAM_ID,appleKeyId=env.APPLE_KEY_ID,applePrivateKey=env.APPLE_PRIVATE_KEY;
 if(enabled){
  if((googleId&&!googleSecret)||(!googleId&&googleSecret))throw Error('Configurazione Google incompleta.');
  if((facebookId||facebookSecret||facebookVersion)&&!(facebookId&&facebookSecret&&/^v\d+\.\d+$/.test(facebookVersion||'')))throw Error('Configurazione Facebook incompleta.');
  if((appleId||appleTeamId||appleKeyId||applePrivateKey)&&!(appleId&&appleTeamId&&appleKeyId&&applePrivateKey))throw Error('Configurazione Apple incompleta.');
  if(!(googleId&&googleSecret)&&!(facebookId&&facebookSecret&&facebookVersion)&&!(appleId&&appleTeamId&&appleKeyId&&applePrivateKey))throw Error('Configura almeno un provider OAuth.');
  if(restrictedBeta&&!allowedEmails.length)throw Error('Configura BETA_ALLOWED_EMAILS per la beta riservata.');
 }
 return {host:env.HOST||'127.0.0.1',port,databasePath,staticDirectory:env.STATIC_DIRECTORY||fileURLToPath(new URL('../dist',import.meta.url)),auth:{origin,webOrigin:origin,enabled,googleId,googleSecret,facebookId,facebookSecret,facebookVersion,appleId,appleTeamId,appleKeyId,applePrivateKey,restrictedBeta,allowedEmails}};
}
