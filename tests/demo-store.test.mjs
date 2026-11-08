import test from 'node:test';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';
import {checkStoreBuild} from '../src/store-build.mjs';import {resolveApiConfig} from '../src/api-config.mjs';
const project='92c31a12-b721-4386-8bf8-7e623b43eb53';
test('profilo demo può essere distribuito senza backend solo con flag esplicito e progetto reale',()=>{
 assert.deepEqual(checkStoreBuild({EAS_PROJECT_ID:project,EAS_BUILD_PROFILE:'demo',EXPO_PUBLIC_DEMO_ONLY:'true'}),[]);
 assert.ok(checkStoreBuild({EAS_PROJECT_ID:project,EAS_BUILD_PROFILE:'demo'}).length);
});
test('modalità dimostrativa non può essere utilizzata accidentalmente in produzione',()=>{
 assert.ok(checkStoreBuild({EAS_PROJECT_ID:project,EAS_BUILD_PROFILE:'production',EXPO_PUBLIC_DEMO_ONLY:'true'}).includes('EXPO_PUBLIC_DEMO_ONLY'));
});
test('client demo ignora anche un endpoint reale impostato nell’ambiente',()=>{
 assert.deepEqual(resolveApiConfig('https://api.example.test','ios',{demoOnly:true}),{configured:false,base:''});
});
test('config nativa demo non richiede Apple Sign In o permessi rubrica e posizione',()=>{
 const cfg=JSON.parse(execFileSync(process.execPath,['--input-type=module','-e',"import c from './app.config.ts';console.log(JSON.stringify(c.expo))"],{env:{...process.env,EXPO_PUBLIC_DEMO_ONLY:'true'},encoding:'utf8'}));
 assert.equal(cfg.ios.usesAppleSignIn,false);assert.equal(cfg.ios.infoPlist.NSLocationWhenInUseUsageDescription,undefined);
 for(const p of ['READ_CONTACTS','ACCESS_FINE_LOCATION','ACCESS_COARSE_LOCATION'])assert.ok(cfg.android.blockedPermissions.includes('android.permission.'+p));
});
