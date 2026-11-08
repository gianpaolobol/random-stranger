import test from 'node:test';import assert from 'node:assert/strict';import {resolveApiConfig} from '../src/api-config.mjs';
test('base API conserva il percorso del backend Supabase',()=>{
 assert.equal(resolveApiConfig('https://example.supabase.co/functions/v1/random-stranger','ios').base,'https://example.supabase.co/functions/v1/random-stranger');
});
