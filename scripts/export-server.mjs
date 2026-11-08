import {spawnSync} from 'node:child_process';
import {writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const result=spawnSync(process.execPath,['node_modules/expo/bin/cli','export','--platform','web','--output-dir','dist-server'],{cwd:root,env:{...process.env,EXPO_PUBLIC_API_URL:'/'},stdio:'inherit'});
if(result.status!==0)process.exit(result.status||1);
await writeFile(new URL('../dist-server/runtime-target.json',import.meta.url),JSON.stringify({apiMode:'same-origin'})+'\n');
