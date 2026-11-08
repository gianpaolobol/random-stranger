import test from 'node:test';import assert from 'node:assert/strict';
import {generateKeyPairSync,sign} from 'node:crypto';
import {verifyAppleToken} from '../server/apple.mjs';
const {privateKey,publicKey}=generateKeyPairSync('rsa',{modulusLength:2048});
const jwk={...publicKey.export({format:'jwk'}),kid:'test',alg:'RS256',use:'sig'};
const claims={iss:'https://appleid.apple.com',aud:'it.randomstranger.app',sub:'apple-user',nonce:'nonce',iat:1000,exp:2000,email:'relay@privaterelay.appleid.com',email_verified:'true'};
function token(changes={},key=privateKey){const data=[{alg:'RS256',kid:'test'}, {...claims,...changes}].map(x=>Buffer.from(JSON.stringify(x)).toString('base64url')).join('.');return data+'.'+sign('RSA-SHA256',Buffer.from(data),key).toString('base64url');}
const verify=(value,extra={})=>verifyAppleToken(value,{audience:claims.aud,nonce:claims.nonce,now:1500,fetchKeys:async()=>({keys:[jwk]}),...extra});
test('Apple verifica firma e mantiene email relay privata',async()=>{const result=await verify(token());assert.equal(result.sub,'apple-user');assert.equal(result.email,claims.email);});
test('Apple rifiuta issuer audience nonce scadenza e firma errati',async()=>{
 for(const change of [{iss:'https://evil.invalid'},{aud:'another-app'},{nonce:'other'},{exp:1499},{iat:1600},{email_verified:false},{sub:''}])await assert.rejects(verify(token(change)));
 const wrong=generateKeyPairSync('rsa',{modulusLength:2048});await assert.rejects(verify(token({},wrong.privateKey)));
 await assert.rejects(verify('not-a-jwt'));
});
