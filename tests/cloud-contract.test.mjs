// Generated behavioral contract; original cases: tests/store.test.mjs.
import {PGlite} from '@electric-sql/pglite';import {readFile} from 'node:fs/promises';import {after} from 'node:test';import {createCloudStore} from '../server/cloud-store.mjs';
const db=new PGlite();await db.exec('CREATE ROLE anon;CREATE ROLE authenticated;');await db.exec(await readFile(new URL('../supabase/schema.sql',import.meta.url),'utf8'));after(()=>db.close());
async function createTestStore(clock){await db.exec('TRUNCATE random_stranger.users,random_stranger.exclusions,random_stranger.attempts CASCADE');const adapt=tx=>({query:async(q,p=[])=>(await tx.query(q,p)).rows});return createCloudStore({...adapt(db),transaction:f=>db.transaction(tx=>f(adapt(tx))),close:()=>{}},clock,{reviewRequired:false});}
import test from 'node:test';
import assert from 'node:assert/strict';
import { profile } from './helpers.mjs';
const now = Date.parse('2026-11-07T18:00:00Z');
async function setup() {
  const s = await createTestStore(() => now);
  const a = await s.upsertIdentity('google', 'a', 'a@example.test', 'A'),
    b = await s.upsertIdentity('google', 'b', 'b@example.test', 'B');
  await s.saveProfile(a.id, profile());
  await s.saveProfile(b.id, profile({
    gender: 'uomo',
    wantedGenders: ['donna']
  }));
  return {
    s,
    a,
    b
  };
}
test('proposta automatica contiene solo profilo pubblico e luogo pubblico', async () => {
  const {
    s,
    a
  } = await setup();
  const x = await s.findMatch(a.id);
  assert.ok(x.id);
  assert.equal(x.status, 'proposed');
  assert.equal(x.partner.lat, undefined);
  assert.equal(x.partner.email, undefined);
  assert.equal(x.venue.name.length > 0, true);
  assert.equal((await s.listAppointments(a.id)).length, 1);
  await s.close();
});
test('entrambe le conferme necessarie; rifiuto non consuma possibilità', async () => {
  const {
    s,
    a,
    b
  } = await setup();
  const x = await s.findMatch(a.id);
  assert.equal((await s.confirm(a.id, x.id)).status, 'proposed');
  assert.equal((await s.confirm(b.id, x.id)).status, 'confirmed');
  assert.equal((await s.cancel(b.id, x.id, now + 3600000)).status, 'cancelled');
  const next = await s.findMatch(a.id);
  assert.equal((await s.decline(b.id, next.id)).status, 'cancelled');
  assert.equal((await s.account(b.id)).strikes, 0);
  await s.close();
});
test('accesso appuntamenti altrui negato', async () => {
  const {
    s,
    a
  } = await setup();
  const x = await s.findMatch(a.id);
  const c = await s.upsertIdentity('facebook', 'c', 'c@example.test', 'C');
  await assert.rejects(async () => await s.getAppointment(c.id, x.id), /autorizzato/);
  await s.close();
});
test('cancellazioni ripetute sono idempotenti; terza violazione esclude e rimuove profilo', async () => {
  const {
    s,
    a,
    b
  } = await setup();
  for (let i = 0; i < 3; i++) {
    const x = await s.findMatch(a.id);
    await s.confirm(a.id, x.id);
    await s.confirm(b.id, x.id);
    await s.cancel(a.id, x.id, now + 7200000 - 3599999);
    await s.cancel(a.id, x.id, now + 7200000 - 3599999);
    assert.equal((await s.account(a.id)).strikes, i + 1);
  }
  assert.equal((await s.account(a.id)).status, 'excluded');
  assert.equal(await s.getProfile(a.id), null);
  await assert.rejects(async () => await s.findMatch(a.id));
  await s.close();
});
test('cancellazione esattamente 60 min prima gratuita', async () => {
  const {
    s,
    a,
    b
  } = await setup();
  const x = await s.findMatch(a.id);
  await s.confirm(a.id, x.id);
  await s.confirm(b.id, x.id);
  await s.cancel(a.id, x.id, now + 3600000);
  assert.equal((await s.account(a.id)).strikes, 0);
  await s.close();
});
test('blocchi escludono abbinamenti in entrambi i versi', async () => {
  const {
    s,
    a,
    b
  } = await setup();
  await s.block(a.id, b.id);
  assert.equal(await s.findMatch(a.id), null);
  assert.equal(await s.findMatch(b.id), null);
  await s.close();
});
test('checkin fuori tempo o lontano negato, rifiuto di proseguire senza penalità', async () => {
  const {
    s,
    a,
    b
  } = await setup();
  const x = await s.findMatch(a.id);
  await s.confirm(a.id, x.id);
  await s.confirm(b.id, x.id);
  await assert.rejects(async () => await s.checkin(a.id, x.id, {
    lat: x.venue.lat,
    lon: x.venue.lon,
    accuracy: 10
  }, now));
  await assert.rejects(async () => await s.checkin(a.id, x.id, {
    lat: 0,
    lon: 0,
    accuracy: 10
  }, x.start));
  assert.ok(await s.checkin(a.id, x.id, {
    lat: x.venue.lat,
    lon: x.venue.lon,
    accuracy: 10
  }, x.start));
  await s.decision(a.id, x.id, false);
  assert.equal((await s.account(a.id)).strikes, 0);
  await s.close();
});
test('sola segnalazione non infligge penalità e non permette duplicazioni', async () => {
  const {
    s,
    a,
    b
  } = await setup();
  const x = await s.findMatch(a.id);
  await s.confirm(a.id, x.id);
  await s.confirm(b.id, x.id);
  await s.checkin(a.id, x.id, {
    lat: x.venue.lat,
    lon: x.venue.lon,
    accuracy: 10
  }, x.start);
  await assert.rejects(async () => await s.reportAbsence(a.id, x.id, 'Assente', x.start));
  await s.reportAbsence(a.id, x.id, 'Assente', x.end + 600001);
  await s.reportAbsence(a.id, x.id, 'Assente', x.end + 600001);
  assert.equal((await s.account(b.id)).strikes, 0);
  assert.equal((await s.reports(b.id)).length, 1);
  await s.appeal(b.id, x.id, 'GPS non disponibile');
  assert.equal((await s.reports(b.id))[0].appeal, 'GPS non disponibile');
  await s.close();
});
test('condivisione precisa solo con doppio consenso e revoca immediata', async () => {
  const {
    s,
    a,
    b
  } = await setup();
  const x = await s.findMatch(a.id);
  await s.confirm(a.id, x.id);
  await s.confirm(b.id, x.id);
  const pos = {
    lat: x.venue.lat,
    lon: x.venue.lon,
    accuracy: 10
  };
  await s.checkin(a.id, x.id, pos, x.start);
  await s.checkin(b.id, x.id, pos, x.start);
  await s.sharePosition(a.id, x.id, pos, x.start);
  assert.equal(await s.partnerPosition(b.id, x.id, x.start), null);
  await s.sharePosition(b.id, x.id, pos, x.start);
  assert.equal((await s.partnerPosition(a.id, x.id, x.start)).lat, pos.lat);
  await s.revokePosition(b.id, x.id);
  assert.equal(await s.partnerPosition(a.id, x.id, x.start), null);
  await s.close();
});
test('posizione condivisa scade dopo 15 min senza conservazione permanente', async () => {
  const {
    s,
    a,
    b
  } = await setup();
  const x = await s.findMatch(a.id);
  await s.confirm(a.id, x.id);
  await s.confirm(b.id, x.id);
  const pos = {
    lat: x.venue.lat,
    lon: x.venue.lon,
    accuracy: 10
  };
  for (const u of [a, b]) {
    await s.checkin(u.id, x.id, pos, x.start);
    await s.sharePosition(u.id, x.id, pos, x.start);
  }
  assert.equal(await s.partnerPosition(a.id, x.id, x.start + 900001), null);
  await s.close();
});
test('assenza accertata dopo contestazione conta una sola volta', async () => {
  const {
    s,
    a,
    b
  } = await setup();
  const x = await s.findMatch(a.id);
  await s.confirm(a.id, x.id);
  await s.confirm(b.id, x.id);
  await s.checkin(a.id, x.id, {
    lat: x.venue.lat,
    lon: x.venue.lon,
    accuracy: 10
  }, x.start);
  await s.reportAbsence(a.id, x.id, 'Assente', x.end + 600001);
  const reports = await s.pendingReports();
  await s.resolveAbsence(reports[0].id, true);
  assert.equal((await s.account(b.id)).strikes, 1);
  await assert.rejects(async () => await s.resolveAbsence(reports[0].id, true));
  assert.equal((await s.account(b.id)).strikes, 1);
  await s.close();
});
test('contestazione accolta rimuove penalità ed eventuale esclusione', async () => {
  const {
    s,
    a,
    b
  } = await setup();
  let last;
  for (let i = 0; i < 3; i++) {
    last = await s.findMatch(a.id);
    await s.confirm(a.id, last.id);
    await s.confirm(b.id, last.id);
    await s.cancel(a.id, last.id, now + 3600001);
  }
  assert.equal((await s.account(a.id)).status, 'excluded');
  await s.appeal(a.id, last.id, 'Emergenza documentata');
  const r = (await s.pendingReports())[0];
  await s.resolveAbsence(r.id, false);
  assert.equal((await s.account(a.id)).strikes, 2);
  assert.equal((await s.account(a.id)).status, 'active');
  assert.equal((await s.upsertIdentity('google', 'a', 'a@example.test', 'A')).status, 'active');
  await s.close();
});
test('assistenza generica non può generare penalità assenza', async () => {
  const {
    s,
    a
  } = await setup();
  const x = await s.findMatch(a.id);
  await s.appeal(a.id, x.id, 'GPS non disponibile');
  const r = (await s.pendingReports())[0];
  await assert.rejects(async () => await s.resolveAbsence(r.id, true), /assistenza/);
  assert.equal((await s.account(a.id)).strikes, 0);
  await s.close();
});
test('eliminazione controparte non cancella penalità indipendenti', async () => {
  const {
    s,
    a,
    b
  } = await setup();
  const x = await s.findMatch(a.id);
  await s.confirm(a.id, x.id);
  await s.confirm(b.id, x.id);
  await s.cancel(a.id, x.id, now + 3600001);
  assert.equal((await s.account(a.id)).strikes, 1);
  await s.deleteAccount(b.id);
  assert.equal((await s.account(a.id)).strikes, 1);
  assert.equal((await s.listAppointments(a.id)).length, 1);
  await s.close();
});
test('aggiornamento profilo con finestre scadute le elimina e mantiene nuove finestre', async () => {
  const {
    s,
    a
  } = await setup();
  const p = profile({
    availability: [{
      start: now - 7200000,
      end: now - 3600000
    }, {
      start: now + 7200000,
      end: now + 14400000
    }]
  });
  const saved = await s.saveProfile(a.id, p);
  assert.equal(saved.availability.length, 1);
  assert.equal(saved.availability[0].start, now + 7200000);
  await s.close();
});
test('eliminazione account annulla appuntamento della controparte senza penalità', async () => {
  const {
    s,
    a,
    b
  } = await setup();
  const x = await s.findMatch(a.id);
  await s.confirm(a.id, x.id);
  await s.confirm(b.id, x.id);
  await s.deleteAccount(b.id);
  assert.equal((await s.getAppointment(a.id, x.id)).status, 'cancelled');
  assert.equal((await s.account(a.id)).strikes, 0);
  await s.close();
});
test('profilo non richiede nome e scarta eventuali nickname legacy', async () => {
  const {
    s,
    a
  } = await setup();
  const p = {
    ...profile(),
    nickname: 'Nome permanente'
  };
  delete p.nickname;
  const saved = await s.saveProfile(a.id, p);
  assert.equal(saved.nickname, undefined);
  assert.equal((await s.getProfile(a.id)).nickname, undefined);
  await s.close();
});
test('alias reciproci sono stabili nel singolo incontro e diversi nel successivo', async () => {
  const {
    s,
    a,
    b
  } = await setup();
  const first = await s.findMatch(a.id),
    peer = await s.getAppointment(b.id, first.id);
  assert.ok(first.myAlias);
  assert.ok(first.partner.alias);
  assert.notEqual(first.myAlias, first.partner.alias);
  assert.equal(first.myAlias, peer.partner.alias);
  assert.equal(first.partner.alias, peer.myAlias);
  assert.equal(first.partner.id, undefined);
  assert.equal(first.partner.nickname, undefined);
  await s.saveProfile(a.id, profile({
    gender: 'uomo',
    wantedGenders: ['uomo'],
    trans: true
  }));
  assert.equal((await s.getAppointment(a.id, first.id)).myAlias, first.myAlias);
  await s.decline(a.id, first.id);
  await s.saveProfile(a.id, profile());
  const next = await s.findMatch(a.id);
  assert.notEqual(next.myAlias, first.myAlias);
  assert.notEqual(next.partner.alias, first.partner.alias);
  await s.close();
});
test('blocco usa incontro autorizzato senza pubblicare ID stabili della controparte', async () => {
  const {
    s,
    a,
    b
  } = await setup();
  const x = await s.findMatch(a.id);
  await s.blockAppointment(a.id, x.id);
  assert.equal(await s.findMatch(a.id), null);
  assert.equal(await s.findMatch(b.id), null);
  await assert.rejects(async () => await s.blockAppointment('intruso', x.id), /autorizzato/);
  await s.close();
});
