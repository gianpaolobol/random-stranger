import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtemp,rm,writeFile,mkdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {resolveApiConfig} from '../src/api-config.mjs';
import {readServerConfig} from '../server/config.mjs';
import {createApp} from '../server/auth.mjs';
import {createStore} from '../server/store.mjs';

test('base API distingue demo, stessa origine web e server nativo HTTPS',()=>{
 assert.deepEqual(resolveApiConfig(undefined,'web'),{configured:false,base:''});
 assert.deepEqual(resolveApiConfig('/','web'),{configured:true,base:''});
 assert.deepEqual(resolveApiConfig('https://beta.example.invalid/','ios'),{configured:true,base:'https://beta.example.invalid'});
 for(const url of ['/','https://user:secret@example.invalid','https://example.invalid/path','http://example.invalid'])assert.throws(()=>resolveApiConfig(url,'android'));
});
test('configurazione produzione esige HTTPS, volume persistente e provider completi',()=>{
 const env={NODE_ENV:'production',PUBLIC_ORIGIN:'https://beta.example.invalid',DATABASE_PATH:'/data/app.sqlite',HOST:'0.0.0.0',PORT:'8787'};
 const config=readServerConfig(env);
 assert.equal(config.host,'0.0.0.0');assert.equal(config.databasePath,'/data/app.sqlite');assert.equal(config.port,8787);
 assert.equal(config.auth.enabled,false);
 for(const extra of [{PUBLIC_ORIGIN:'http://localhost:8787'},{DATABASE_PATH:':memory:'},{DATABASE_PATH:'./app.sqlite'},{PORT:'NaN'},{PORT:'65536'},{WEB_ORIGIN:'https://other.invalid'},{OAUTH_ENABLED:'true'},{OAUTH_ENABLED:'true',GOOGLE_CLIENT_ID:'id',GOOGLE_CLIENT_SECRET:'secret',BETA_ALLOWED_EMAILS:''}])assert.throws(()=>readServerConfig({...env,...extra}));
 const configured=readServerConfig({...env,OAUTH_ENABLED:'true',GOOGLE_CLIENT_ID:'id',GOOGLE_CLIENT_SECRET:'secret',BETA_ALLOWED_EMAILS:' tester@example.invalid '});
 assert.equal(configured.auth.enabled,true);assert.deepEqual(configured.auth.allowedEmails,['tester@example.invalid']);
 assert.equal(readServerConfig({...env,OAUTH_ENABLED:'true',GOOGLE_CLIENT_ID:'id',GOOGLE_CLIENT_SECRET:'secret',BETA_ALLOWED_EMAILS:'tester@example.invalid',APPLE_CLIENT_ID:'',APPLE_TEAM_ID:'',APPLE_KEY_ID:'',APPLE_PRIVATE_KEY:''}).auth.enabled,true);
});
test('health controlla SQLite senza sessione e senza esporre configurazione',async()=>{
 const store=createStore(':memory:');
 const app=createApp({store,config:{origin:'http://localhost:8787'}});
 const healthy=await app(new Request('http://localhost:8787/api/health'));
 assert.equal(healthy.status,200);assert.deepEqual(await healthy.json(),{status:'ok'});
 store.close();
 assert.equal((await app(new Request('http://localhost:8787/api/health'))).status,503);
});
test('processo reale serve API e web sulla stessa porta e termina ordinatamente',async()=>{
 const dir=await mkdtemp(join(tmpdir(),'stranger-runtime-'));
 const web=join(dir,'web');await mkdir(web);await writeFile(join(web,'index.html'),'<html>Random Stranger test</html>');
 const child=spawn(process.execPath,['server/index.mjs'],{env:{...process.env,NODE_ENV:'test',PUBLIC_ORIGIN:'http://localhost:8787',WEB_ORIGIN:'http://localhost:8787',DATABASE_PATH:join(dir,'app.sqlite'),STATIC_DIRECTORY:web,HOST:'127.0.0.1',PORT:'0',OAUTH_ENABLED:'false'},stdio:['ignore','pipe','pipe']});
 let output='';child.stderr.resume();
 const exited=new Promise(resolve=>child.once('exit',(code,signal)=>resolve({code,signal})));
 try{
  const port=await new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>reject(Error('Server non avviato')),10000);
   child.stdout.on('data',chunk=>{output+=chunk;const match=output.match(/127\.0\.0\.1:(\d+)/);if(match){clearTimeout(timer);resolve(Number(match[1]));}});
   child.once('exit',()=>{clearTimeout(timer);reject(Error('Server terminato prima dell’avvio'));});
  });
  const origin='http://127.0.0.1:'+port;
  assert.equal((await fetch(origin+'/api/health')).status,200);
  assert.equal((await fetch(origin+'/api/session')).status,401);
  const page=await fetch(origin+'/');assert.equal(page.status,200);assert.equal(await page.text(),'<html>Random Stranger test</html>');
  assert.equal((await fetch(origin+'/server/auth.mjs')).status,404);
  child.kill('SIGTERM');
  assert.deepEqual(await exited,{code:0,signal:null});
 }finally{if(child.exitCode===null)child.kill('SIGTERM');await exited;await rm(dir,{recursive:true,force:true});}
});
