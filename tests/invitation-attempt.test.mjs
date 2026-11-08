import test from 'node:test';import assert from 'node:assert/strict';
import {selectAllRecipients,createInvitationSender} from '../src/invitation-attempt.mjs';
const contacts=[{id:'a',label:'Anna'},{id:'b',label:'Luca'},{id:'c',label:'Giulia'}];
test('seleziona tutti deduplica e invia esclusivamente i singoli rimasti selezionati',async()=>{
 assert.deepEqual(selectAllRecipients([...contacts,contacts[0]]),['a','b','c']);
 const calls=[];const sender=createInvitationSender({deliver:async({recipient})=>{calls.push(recipient.id);return {confirmed:true};}});
 const result=await sender.send(contacts.filter(c=>c.id!=='b'));
 assert.deepEqual(calls,['a','c']);assert.equal(result.completed,2);
});
test('doppio tocco condivide la stessa operazione e non ripete gli inviti completati',async()=>{
 let release,calls=0;const sender=createInvitationSender({deliver:async()=>{calls++;await new Promise(resolve=>{release=()=>resolve({confirmed:true});});return {confirmed:true};}});
 const first=sender.send([contacts[0]]),second=sender.send([contacts[0]]);
 assert.equal(first,second);await new Promise(resolve=>setImmediate(resolve));release();await first;
 assert.equal(calls,1);const again=await sender.send([contacts[0]]);assert.equal(again.alreadyCompleted,1);assert.equal(calls,1);
});
test('dopo errore certo riprova solo il destinatario fallito, con la stessa chiave',async()=>{
 const calls=[],keys=[];let fails=true;
 const sender=createInvitationSender({deliver:async({recipient,idempotencyKey})=>{calls.push(recipient.id);if(recipient.id==='b'){keys.push(idempotencyKey);if(fails){fails=false;throw Object.assign(Error('Rifiutato prima dell’invio'),{deliveryState:'not_sent'});}}return {confirmed:true};}});
 assert.equal((await sender.send(contacts.slice(0,2))).failed,1);
 const retried=await sender.send(contacts.slice(0,2));assert.equal(retried.alreadyCompleted,1);assert.equal(retried.completed,1);
 assert.deepEqual(calls,['a','b','b']);assert.equal(keys[0],keys[1]);
});
test('esito incerto non viene ritentato senza idempotenza del servizio',async()=>{
 let calls=0;const sender=createInvitationSender({deliver:async()=>{calls++;throw Error('Timeout dopo possibile consegna');}});
 assert.equal((await sender.send([contacts[0]])).uncertain,1);
 assert.equal((await sender.send([contacts[0]])).uncertain,1);assert.equal(calls,1);
});
test('durante un invio non si può sostituire la selezione con altri destinatari',async()=>{
 let release;const sender=createInvitationSender({deliver:()=>new Promise(resolve=>{release=()=>resolve({confirmed:true});})});
 const first=sender.send([contacts[0]]);await new Promise(resolve=>setImmediate(resolve));
 await assert.rejects(sender.send([contacts[1]]),/in corso/);release();await first;
});
test('retry con servizio idempotente riusa la chiave anche dopo una consegna senza risposta',async()=>{
 const delivered=new Set();let physical=0,first=true;
 const sender=createInvitationSender({supportsIdempotency:true,deliver:async({idempotencyKey})=>{
  if(!delivered.has(idempotencyKey)){physical++;delivered.add(idempotencyKey);}
  if(first){first=false;throw Error('Risposta persa dopo la consegna');}
  return {confirmed:true};
 }});
 assert.equal((await sender.send([contacts[0]])).uncertain,1);
 assert.equal((await sender.send([contacts[0]])).completed,1);assert.equal(physical,1);
});
test('apertura di un compositore senza ricevuta non equivale a consegna confermata',async()=>{
 let calls=0;const sender=createInvitationSender({deliver:async()=>{calls++;return {action:'sharedAction'};}});
 assert.equal((await sender.send([contacts[0]])).uncertain,1);
 await sender.send([contacts[0]]);assert.equal(calls,1);
});
