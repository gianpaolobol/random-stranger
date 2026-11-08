// Explicit synthetic cloud test. Tokens stay in process memory; output contains only hashes.
import {randomUUID,randomBytes,createHash} from 'node:crypto';
import {createInterface} from 'node:readline/promises';
import assert from 'node:assert/strict';
import {publicProfile} from '../src/domain.mjs';
const base=process.argv[2];if(!base?.startsWith('https://'))throw Error('HTTPS test endpoint required');
const rl=createInterface({input:process.stdin,output:process.stdout});
const people=[0,1].map(()=>({id:randomUUID(),token:randomBytes(32).toString('base64url')}));
const quote=x=>"'"+String(x).replaceAll("'","''")+"'";
const ids=people.map(p=>quote(p.id)).join(',');
const cleanup=`DELETE FROM random_stranger.appointments WHERE a IN (${ids}) OR b IN (${ids}); DELETE FROM random_stranger.users WHERE id IN (${ids});`;
const seed=people.map(p=>`INSERT INTO random_stranger.users(id,provider,subject,email,name) VALUES(${quote(p.id)},'synthetic-test',${quote(p.id)},'',''); INSERT INTO random_stranger.sessions(hash,user_id,expires) VALUES(${quote(createHash('sha256').update(p.token).digest('base64url'))},${quote(p.id)},${Date.now()+600000});`).join('\n');
console.log(JSON.stringify({phase:'seed',sql:seed,cleanup}));
const wait=()=>rl.question('Ready for database action (enter to continue): ');
async function call(i,path,method='GET',body){const response=await fetch(base+path,{method,headers:{authorization:'Bearer '+people[i].token,'content-type':'application/json'},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(15000)});const value=await response.json();assert.equal(response.status,200,JSON.stringify(value));return value;}
try{
 await wait();const now=Date.now();const reviews=[];
 for(let i=0;i<2;i++){
  const profile={adult:true,age:30,description:'Profilo sintetico di collaudo, da eliminare.',gender:i?'uomo':'donna',trans:false,body:'atletica',orientation:'',interests:'Natura',wantedGenders:[i?'donna':'uomo'],wantedBodies:[],transPreference:'qualsiasi',minAge:18,maxAge:70,radiusKm:10,lat:44.4949,lon:11.3426,availability:[{start:now+10800000,end:now+18000000}],consent:true};
  const saved=await call(i,'/api/profile','PUT',profile);assert.equal(saved.moderation,'pending');assert.equal(saved.appointment,null);
  const approved=JSON.stringify(publicProfile(saved.profile));reviews.push(`UPDATE random_stranger.profile_reviews SET status='approved',content_hash=${quote(createHash('sha256').update(approved).digest('hex'))},approved_data=${quote(approved)} WHERE user_id=${quote(people[i].id)};`);
 }
 assert.equal((await call(0,'/api/match','POST',{})).appointment,null);
 console.log(JSON.stringify({phase:'approve',sql:reviews.join('\n')}));await wait();
 const x=(await call(0,'/api/match','POST',{})).appointment;assert.ok(x.id);assert.equal(x.partner.id,undefined);
 const again=(await call(1,'/api/match','POST',{})).appointment;assert.equal(again.id,x.id);assert.equal(again.myAlias,x.partner.alias);
 await call(0,`/api/appointments/${x.id}/confirm`,'POST',{});assert.equal((await call(1,`/api/appointments/${x.id}/confirm`,'POST',{})).appointment.status,'confirmed');
 console.log(JSON.stringify({phase:'encounter-window',sql:`UPDATE random_stranger.appointments SET start=${Date.now()-60000},"end"=${Date.now()+1740000} WHERE id=${quote(x.id)};`}));await wait();
 const path=`/api/appointments/${x.id}/location`,pos={lat:x.venue.lat,lon:x.venue.lon,accuracy:10};
 await call(0,path,'PUT',pos);assert.equal((await call(0,path)).position,null);
 await call(1,path,'PUT',pos);assert.equal((await call(0,path)).position.lat,pos.lat);assert.equal((await call(1,path)).position.lon,pos.lon);
 await call(1,path,'DELETE');assert.equal((await call(0,path)).position,null);
 const unauth=await fetch(base+'/api/profile');assert.equal(unauth.status,401);
 console.log(JSON.stringify({phase:'passed',checks:['pending moderation blocks matching','reciprocal aliases','mutual confirmation','authenticated two-client coordinate snapshot','mutual opt-in','revocation','unauthenticated denied'],cleanup}));
}finally{rl.close();}
