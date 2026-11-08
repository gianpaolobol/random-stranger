import test from 'node:test';import assert from 'node:assert/strict';
import {mkdtemp,mkdir,writeFile,rm,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';import {join} from 'node:path';import {execFileSync} from 'node:child_process';
import {packageServer} from '../scripts/package-server.mjs';
test('pacchetto runtime contiene web e server senza segreti, database o dipendenze di sviluppo',async()=>{
 const root=await mkdtemp(join(tmpdir(),'stranger-package-'));
 try{
  for(const dir of ['server','src','dist-server'])await mkdir(join(root,dir));
  await writeFile(join(root,'dist-server/index.html'),'<html>Random Stranger</html>');
  await writeFile(join(root,'dist-server/runtime-target.json'),JSON.stringify({apiMode:'same-origin'}));
  await writeFile(join(root,'.env'),'SECRET=not-for-release');await writeFile(join(root,'private.sqlite'),'private');
  for(const name of ['api.mjs','apple.mjs','auth.mjs','config.mjs','http.mjs','index.mjs','moderate.mjs','static.mjs','store.mjs'])await writeFile(join(root,'server',name),'export {};');
  for(const name of ['domain.mjs','aliases.mjs'])await writeFile(join(root,'src',name),'export {};');
  const output=join(root,'release.tar.gz');
  await packageServer({root,output});
  const files=execFileSync('tar',['-tzf',output],{encoding:'utf8'});
  assert.match(files,/server\/index.mjs/);assert.match(files,/dist\/index.html/);
  assert.doesNotMatch(files,/(?:^|\/)\.env(?:\n|$)|sqlite|node_modules|App.tsx/);
  const target=join(root,'unpacked');await mkdir(target);execFileSync('tar',['-xzf',output,'-C',target]);
  const pkg=JSON.parse(await readFile(join(target,'package.json'),'utf8'));
  assert.equal(pkg.scripts.start,'node server/index.mjs');assert.equal(pkg.dependencies,undefined);
  const instructions=await readFile(join(target,'README.md'),'utf8');assert.match(instructions,/NODE_ENV=production/);assert.match(instructions,/DATABASE_PATH/);assert.match(instructions,/moderate.mjs/);
  const example=await readFile(join(target,'runtime.env.example'),'utf8');assert.match(example,/OAUTH_ENABLED=false/);assert.match(example,/HOST=127.0.0.1/);
  const manifest=JSON.parse(await readFile(join(target,'release-manifest.json'),'utf8'));
  assert.equal(manifest.files['dist/index.html'].length,64);
  await rm(join(root,'dist-server/runtime-target.json'));
  await assert.rejects(packageServer({root,output}),/same-origin/);
 }finally{await rm(root,{recursive:true,force:true});}
});
