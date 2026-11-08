import test from 'node:test';
import assert from 'node:assert/strict';
import {createStore} from '../server/store.mjs';
import {createApp} from '../server/auth.mjs';
import {createHash} from 'node:crypto';
import {profile} from './helpers.mjs';
const now=Date.parse('2026-11-07T18:00:00Z');
test('API risolve lo store remoto asincrono prima di serializzare profili e appuntamenti',async()=>{
 const raw=createStore(':memory:',()=>now);const u=raw.upsertIdentity('google','a','a@example.test','');raw.saveProfile(u.id,profile());
 const token='a'.repeat(43);raw.putSession(createHash('sha256').update(token).digest('base64url'),u.id);
 const store=new Proxy(raw,{get:(s,k)=>async(...args)=>s[k](...args)});
 const app=createApp({config:{origin:'https://example.test',enabled:false},store});
 try{
  const get=async p=>{const r=await app(new Request('https://example.test'+p,{headers:{authorization:'Bearer '+token}}));assert.equal(r.status,200);return r.json();};
  assert.equal((await get('/api/profile')).profile.description,profile().description);
  assert.deepEqual((await get('/api/appointments')).appointments,[]);
  const data=await get('/api/export');assert.equal(data.account.remaining,3);assert.deepEqual(data.reports,[]);
 }finally{raw.close();}
});
test('health restituisce 503 quando la verifica cloud fallisce',async()=>{
 const app=createApp({config:{origin:'https://example.test'},store:{health:async()=>{throw Error('offline');}}});
 const r=await app(new Request('https://example.test/api/health'));assert.equal(r.status,503);
});
