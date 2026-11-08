import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
import {profile} from './helpers.mjs';
const now=Date.parse('2026-11-07T18:00:00Z');
test('Postgres preserva matching, alias, doppia conferma e annullamento a 60 minuti',async()=>{
 const module=await import('../server/cloud-store.mjs').catch(()=>null);assert.equal(typeof module?.createCloudStore,'function','store Postgres mancante');
 const {PGlite}=await import('@electric-sql/pglite');const db=new PGlite();
 await db.exec('CREATE ROLE anon; CREATE ROLE authenticated;');
 await db.exec(await readFile(new URL('../supabase/schema.sql',import.meta.url),'utf8'));
 const adapter={query:async(q,p=[])=>(await db.query(q,p)).rows,transaction:f=>db.transaction(tx=>f({query:async(q,p=[])=>(await tx.query(q,p)).rows})),close:()=>db.close()};
 const s=module.createCloudStore(adapter,()=>now,{reviewRequired:true});
 try{
  const a=await s.upsertIdentity('google','a','a@example.test',''),b=await s.upsertIdentity('google','b','b@example.test','');
  await s.saveProfile(a.id,profile());await s.saveProfile(b.id,profile({gender:'uomo',wantedGenders:['donna']}));
  assert.equal(await s.findMatch(a.id),null);for(const p of await s.pendingProfiles())await s.reviewProfile(p.userId,true,p.contentHash);
  const x=await s.findMatch(a.id);assert.ok(x.id);assert.equal(x.partner.id,undefined);assert.ok(x.partner.alias);
  assert.equal((await s.getAppointment(b.id,x.id)).myAlias,x.partner.alias);
  assert.equal((await s.confirm(a.id,x.id)).status,'proposed');assert.equal((await s.confirm(b.id,x.id)).status,'confirmed');
  await assert.rejects(s.getAppointment('outsider',x.id),/autorizzato/);
  await s.cancel(a.id,x.id,x.start-3600000);assert.equal((await s.account(a.id)).strikes,0);
  assert.equal((await s.listAppointments(a.id))[0].status,'cancelled');
  await s.putSession('hash',a.id);assert.equal((await s.getSession('hash')).id,a.id);await s.dropSession('hash');assert.equal(await s.getSession('hash'),null);
 }finally{await s.close();}
});
