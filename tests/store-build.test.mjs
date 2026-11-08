import test from 'node:test';import assert from 'node:assert/strict';
import {checkStoreBuild} from '../src/store-build.mjs';
test('build store respinge assenza di API HTTPS e progetto EAS',()=>{
 const issues=checkStoreBuild({});assert.ok(issues.includes('EXPO_PUBLIC_API_URL'));assert.ok(issues.includes('EAS_PROJECT_ID'));
 for(const url of ['/','http://localhost:8787','https://api.example.invalid'])assert.ok(checkStoreBuild({EXPO_PUBLIC_API_URL:url,EAS_PROJECT_ID:'00000000-0000-4000-8000-000000000001'}).includes('EXPO_PUBLIC_API_URL'));
});
test('build store accetta solo identificatori veri e origine assoluta senza percorso',()=>{
 assert.deepEqual(checkStoreBuild({EXPO_PUBLIC_API_URL:'https://api.randomstranger.it',EAS_PROJECT_ID:'12345678-1234-4123-8123-123456789abc'}),[]);
 assert.ok(checkStoreBuild({EXPO_PUBLIC_API_URL:'https://host.it/private',EAS_PROJECT_ID:'appgprj-not-an-eas-id'}).length===2);
});
