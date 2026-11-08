import {createPublicKey,verify,sign} from 'node:crypto';
const invalid=()=>{throw Object.assign(new Error('Accesso Apple non valido. Riprova.'),{status:400});};
let cachedKeys=null,keysUntil=0;
async function fetchAppleKeys(){
 if(cachedKeys&&Date.now()<keysUntil)return cachedKeys;
 const response=await fetch('https://appleid.apple.com/auth/keys',{signal:AbortSignal.timeout(10000)});
 if(!response.ok)throw Error('Servizio Apple non disponibile.');
 const keys=await response.json();cachedKeys=keys;keysUntil=Date.now()+300000;return keys;
}
export async function verifyAppleToken(value,{audience,nonce,now=Math.floor(Date.now()/1000),fetchKeys=fetchAppleKeys}){
 if(typeof value!=='string'||value.length>12000||!nonce)invalid();
 let header,claims,parts;
 try{parts=value.split('.');if(parts.length!==3)invalid();header=JSON.parse(Buffer.from(parts[0],'base64url'));claims=JSON.parse(Buffer.from(parts[1],'base64url'));}catch{invalid();}
 if(header.alg!=='RS256'||typeof header.kid!=='string')invalid();
 const keys=await fetchKeys(),jwk=keys.keys?.find(k=>k.kid===header.kid&&k.kty==='RSA'&&(!k.alg||k.alg==='RS256'));
 if(!jwk||!verify('RSA-SHA256',Buffer.from(parts[0]+'.'+parts[1]),createPublicKey({key:jwk,format:'jwk'}),Buffer.from(parts[2],'base64url')))invalid();
 if(claims.iss!=='https://appleid.apple.com'||claims.aud!==audience||claims.nonce!==nonce||typeof claims.sub!=='string'||!claims.sub||claims.sub.length>255||!Number.isFinite(claims.exp)||claims.exp<=now||!Number.isFinite(claims.iat)||claims.iat>now+60)invalid();
 if(claims.email&&(!(claims.email_verified===true||claims.email_verified==='true')||typeof claims.email!=='string'))invalid();
 return claims;
}
export function appleReady(config){return Boolean(config.enabled&&config.appleId&&config.appleTeamId&&config.appleKeyId&&config.applePrivateKey);}
function clientSecret(config){
 const now=Math.floor(Date.now()/1000),encode=v=>Buffer.from(JSON.stringify(v)).toString('base64url');
 const data=encode({alg:'ES256',kid:config.appleKeyId})+'.'+encode({iss:config.appleTeamId,iat:now,exp:now+300,aud:'https://appleid.apple.com',sub:config.appleId});
 return data+'.'+sign('sha256',Buffer.from(data),{key:config.applePrivateKey.replace(/\\n/g,'\n'),dsaEncoding:'ieee-p1363'}).toString('base64url');
}
export async function revokeAppleCode({config,code,subject,nonce,providerFetch=fetch,fetchKeys}){
 if(typeof code!=='string'||!code||code.length>4096)invalid();
 const secret=clientSecret(config);
 const response=await providerFetch('https://appleid.apple.com/auth/token',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:config.appleId,client_secret:secret,code,grant_type:'authorization_code'}),signal:AbortSignal.timeout(10000)});
 if(!response.ok)throw Error('Impossibile verificare la revoca Apple. Riprova.');
 const tokens=await response.json();
 const claims=await verifyAppleToken(tokens.id_token,{audience:config.appleId,nonce,fetchKeys});
 if(claims.sub!==subject)invalid();
 const token=tokens.refresh_token||tokens.access_token;
 if(typeof token!=='string'||!token)invalid();
 const revoked=await providerFetch('https://appleid.apple.com/auth/revoke',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:config.appleId,client_secret:secret,token,token_type_hint:tokens.refresh_token?'refresh_token':'access_token'}),signal:AbortSignal.timeout(10000)});
 if(!revoked.ok)throw Error('Revoca Apple non completata. Riprova.');
}
