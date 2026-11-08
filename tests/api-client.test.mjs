import test from 'node:test';import assert from 'node:assert/strict';
import {requestJson} from '../src/api-client.mjs';
test('richiesta JSON conserva cookie, metodo e corpo senza ripetere mutazioni',async()=>{
 let calls=0;
 const result=await requestJson('/api/profile',{method:'PUT',body:'{}',credentials:'include',fetchImpl:async(url,options)=>{calls++;assert.equal(url,'/api/profile');assert.equal(options.method,'PUT');assert.equal(options.credentials,'include');assert.equal(options.body,'{}');return Response.json({ok:true});}});
 assert.deepEqual(result,{ok:true});assert.equal(calls,1);
});
test('timeout libera la richiesta e non ripete il salvataggio',async()=>{
 let calls=0;await assert.rejects(requestJson('/api/profile',{method:'PUT',timeoutMs:10,fetchImpl:(_url,{signal})=>{calls++;return new Promise((resolve,reject)=>signal.addEventListener('abort',()=>reject(signal.reason)));}}),/aggiornare lo stato/);assert.equal(calls,1);
});
test('un’operazione con timeout esteso riceve la risposta finale senza ripetizioni',async()=>{
 let calls=0;const result=await requestJson('/api/account',{method:'DELETE',timeoutMs:100,fetchImpl:async()=>{calls++;await new Promise(resolve=>setTimeout(resolve,25));return Response.json({ok:true});}});
 assert.deepEqual(result,{ok:true});assert.equal(calls,1);
});
test('errore di rete, sessione scaduta e risposta non JSON sono comprensibili',async()=>{
 await assert.rejects(requestJson('/api/account',{fetchImpl:async()=>{throw new TypeError('Failed to fetch');}}),/connessione/i);
 await assert.rejects(requestJson('/api/account',{fetchImpl:async()=>Response.json({error:'Accedi per continuare.'},{status:401})}),error=>error.status===401&&/Accedi/.test(error.message));
 await assert.rejects(requestJson('/api/account',{fetchImpl:async()=>new Response('<html>proxy</html>',{status:502})}),/non è disponibile/);
});
