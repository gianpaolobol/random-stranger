import test from 'node:test';import assert from 'node:assert/strict';
import {createProfileState,profileReducer,createRefreshGate,restoreSession,exitSession} from '../src/profile-sync.mjs';
import {profile} from './helpers.mjs';
test('aggiornamento remoto conserva modifiche parziali anche senza descrizione e fuori dal profilo',()=>{
 let state=createProfileState(profile({description:'',interests:''}));
 state=profileReducer(state,{type:'edit',patch:{age:41,wantedGenders:['donna','uomo'],interests:'Cinema · Musica'}});
 state=profileReducer(state,{type:'remote',profile:profile({description:'',interests:'',radiusKm:22})});
 assert.equal(state.draft.age,41);assert.equal(state.draft.interests,'Cinema · Musica');assert.deepEqual(state.draft.wantedGenders,['donna','uomo']);assert.equal(state.draft.radiusKm,22);
 assert.equal(state.profile.age,30);
});
test('salvataggio incorpora normalizzazione e conserva modifiche fatte durante la richiesta',()=>{
 let state=createProfileState(profile());
 state=profileReducer(state,{type:'edit',patch:{interests:'  Cinema  '}});
 const submitted=state.draft;
 state=profileReducer(state,{type:'edit',patch:{interests:'Cinema · Viaggi'}});
 state=profileReducer(state,{type:'saved',submitted,profile:{...submitted,interests:'Cinema'}});
 assert.equal(state.profile.interests,'Cinema');assert.equal(state.draft.interests,'Cinema · Viaggi');
 state=profileReducer(state,{type:'saved',submitted:state.draft,profile:{...state.draft,interests:'Cinema · Viaggi'}});
 state=profileReducer(state,{type:'remote',profile:{...state.profile,interests:'Musica'}});
 assert.equal(state.draft.interests,'Musica');
});
test('reset sessione elimina tutte le bozze precedenti',()=>{
 let state=createProfileState(profile());state=profileReducer(state,{type:'edit',patch:{interests:'Privato'}});
 state=profileReducer(state,{type:'reset',profile:profile({interests:''})});assert.equal(state.draft.interests,'');
});
test('risposta vecchia o di una sessione conclusa non può aggiornare la schermata',()=>{
 const gate=createRefreshGate();const first=gate.begin(),second=gate.begin();
 assert.equal(gate.isCurrent(first),false);assert.equal(gate.isCurrent(second),true);
 gate.invalidate();assert.equal(gate.isCurrent(second),false);
});
test('ricerca iniziale della sessione non scavalca una demo già aperta',async()=>{
 const gate=createRefreshGate();let complete,restored=false;
 const pending=restoreSession({gate,getSession:()=>new Promise(resolve=>{complete=resolve;}),onSession:()=>{restored=true;}});
 gate.invalidate();complete({id:'previous-account'});await pending;assert.equal(restored,false);
});
test('uscita rimuove subito dati locali anche quando il server non risponde',async()=>{
 let cleared=false,called=false;
 await assert.rejects(exitSession({clear:()=>{cleared=true;},signOut:async()=>{called=true;assert.equal(cleared,true);throw Error('offline');}}),/offline/);
 assert.equal(cleared,true);assert.equal(called,true);
});
