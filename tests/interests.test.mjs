import test from 'node:test';
import assert from 'node:assert/strict';
import * as interests from '../src/interests.mjs';
import {validateProfile} from '../src/domain.mjs';
import {profile} from './helpers.mjs';

test('gli interessi possono essere aggiunti insieme e rimossi singolarmente',()=>{
 let value='';
 value=interests.toggleInterest(value,'Cinema');
 value=interests.toggleInterest(value,'Musica');
 value=interests.toggleInterest(value,'Viaggi');
 assert.deepEqual(interests.parseInterests(value),['Cinema','Musica','Viaggi']);
 value=interests.toggleInterest(value,'Musica');
 assert.deepEqual(interests.parseInterests(value),['Cinema','Viaggi']);
 const saved=validateProfile(profile({interests:value}),Date.parse('2026-11-07T18:00:00Z'));
 assert.deepEqual(interests.parseInterests(JSON.parse(JSON.stringify(saved)).interests),['Cinema','Viaggi']);
});
test('interessi personali e profili precedenti non vengono persi o duplicati',()=>{
 const value='Cinema indipendente · musica dal vivo · passeggiate';
 assert.deepEqual(interests.parseInterests(value),['Cinema indipendente','musica dal vivo','passeggiate']);
 assert.deepEqual(interests.parseInterests(' Cinema, cinema; Musica\nArchitettura '),['Cinema','Musica','Architettura']);
 assert.deepEqual(interests.parseInterests(interests.toggleInterest(value,'Viaggi')),['Cinema indipendente','musica dal vivo','passeggiate','Viaggi']);
 assert.deepEqual(interests.parseInterests(interests.toggleInterest('Cinema','cinema')),[]);
});
