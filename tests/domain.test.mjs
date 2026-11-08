import test from 'node:test';import assert from 'node:assert/strict';
import * as d from '../src/domain.mjs';
const now=Date.parse('2026-11-07T18:00:00Z');
import {profile} from './helpers.mjs';

test('60 minuti inclusi non consumano possibilità',()=>{assert.equal(d.cancellationPenalty(now+3600000,now),false);assert.equal(d.cancellationPenalty(now+3599999,now),true);});
test('profilo obbliga maggiore età, coordinate valide e intervalli futuri',()=>{assert.equal(d.validateProfile(profile(),now).age,30);assert.equal(d.validateProfile({...profile(),nickname:'legacy'},now).nickname,undefined);for(const x of [{age:17},{adult:false},{lat:91},{lon:Infinity},{availability:[{start:now-1,end:now+1}]},{wantedGenders:[]},{description:'x'},{minAge:17},{radiusKm:0}])assert.throws(()=>d.validateProfile(profile(x),now));});
test('match richiede preferenze reciproche e raggio di entrambi',()=>{const a=profile(),b=profile({gender:'uomo',wantedGenders:['donna']});assert.ok(d.compatible(a,b));assert.equal(d.compatible(a,{...b,wantedGenders:['uomo']}),false);assert.equal(d.compatible(a,{...b,lat:45}),false);assert.equal(d.compatible(a,{...b,body:'robusta',wantedBodies:[]}) ,true);assert.equal(d.compatible({...a,wantedBodies:['snella']},b),false);});
test('identità trans trattata separatamente e preferenze rispettate',()=>{const a=profile({transPreference:'trans'}),b=profile({gender:'uomo',wantedGenders:['donna']});assert.equal(d.compatible(a,b),false);assert.ok(d.compatible(a,{...b,trans:true}));});
test('sovrapposizione minima 30 min e preavviso >60 min',()=>{const a=profile(),b=profile({availability:[{start:now+7500000,end:now+9500000}]});assert.deepEqual(d.commonSlot(a,b,now),{start:now+7500000,end:now+9300000});assert.equal(d.commonSlot(a,{...b,availability:[{start:now+7500000,end:now+8000000}]},now),null);});
test('distanza in km e posizione precisa escluse dalle schede pubbliche',()=>{assert.ok(d.distanceKm(44.49,11.34,44.50,11.34)<1.2);const p=d.publicProfile(profile());assert.equal(p.lat,undefined);assert.equal(p.lon,undefined);assert.equal(p.availability,undefined);assert.equal(p.consent,undefined);});
