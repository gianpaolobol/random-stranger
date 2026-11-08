import {mkdtemp,cp,symlink,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';import {join} from 'node:path';import {fileURLToPath} from 'node:url';import {spawnSync} from 'node:child_process';
const root=fileURLToPath(new URL('../',import.meta.url));
const demoOnly=process.env.EXPO_PUBLIC_DEMO_ONLY==='true';
const temp=await mkdtemp(join(tmpdir(),'stranger-native-'));
try{
 for(const name of ['App.tsx','app.config.ts','package.json','package-lock.json','tsconfig.json','index.ts','src','assets','plugins'])await cp(join(root,name),join(temp,name),{recursive:true});
 await symlink(join(root,'node_modules'),join(temp,'node_modules'),'dir');
 const result=spawnSync(process.execPath,[join(root,'node_modules/expo/bin/cli'),'prebuild',temp,'--no-install','--platform','all','--template',join(root,'node_modules/expo/template.tgz'),'--skip-dependency-update','react,react-native'],{cwd:root,env:{...process.env,CI:'1',EXPO_OFFLINE:'1',EAS_BUILD_PROFILE:'beta'},encoding:'utf8'});
 if(result.status!==0)throw Error(result.stdout+'\n'+result.stderr);
 const manifest=await readFile(join(temp,'android/app/src/main/AndroidManifest.xml'),'utf8');
 for(const name of ['READ_EXTERNAL_STORAGE','WRITE_EXTERNAL_STORAGE','WRITE_CONTACTS','ACCESS_BACKGROUND_LOCATION','SYSTEM_ALERT_WINDOW',...(demoOnly?['READ_CONTACTS','ACCESS_FINE_LOCATION','ACCESS_COARSE_LOCATION']:[])]){
  const tags=manifest.match(/<uses-permission\b[^>]*>/g)||[];
  if(tags.some(tag=>tag.includes('android.permission.'+name+'"')&&!tag.includes('tools:node="remove"')))throw Error('Permesso Android non previsto: '+name);
 }
 if(!demoOnly&&!manifest.includes('android.permission.READ_CONTACTS'))throw Error('Lettura contatti Android non configurata.');
 const entitlements=await readFile(join(temp,'ios/RandomStranger/RandomStranger.entitlements'),'utf8');
 if(demoOnly?entitlements.includes('com.apple.developer.applesignin'):!entitlements.includes('com.apple.developer.applesignin'))throw Error('Entitlement Apple mancante.');
 const plist=await readFile(join(temp,'ios/RandomStranger/Info.plist'),'utf8');
 for(const name of ['NSLocationAlwaysAndWhenInUseUsageDescription','NSLocationAlwaysUsageDescription','NSMotionUsageDescription','NSFaceIDUsageDescription'])if(plist.includes('<key>'+name+'</key>'))throw Error('Uso iOS non previsto: '+name);
 for(const key of ['NSContactsUsageDescription','NSLocationWhenInUseUsageDescription'])if(!new RegExp('<key>'+key+'</key>\\s*<string>[^<]+</string>').test(plist))throw Error('Purpose string iOS mancante: '+key);
 const report={mode:demoOnly?'demo':'real',checkedAt:new Date().toISOString(),androidPrebuild:'passed',iosPrebuild:'passed',appleEntitlement:demoOnly?'not-requested':'present',unneededPermissions:'removed',purposeStrings:'contacts-and-location-present-for-linked-SDKs',contactAccess:demoOnly?'not-requested':'read-only,on-demand,names-only',nativeCompilation:'not-run',signedBinaries:false,deviceTests:'not-run',notes:['expo-system-ui non installato: la palette dell’app è applicata direttamente dai componenti.']};
 await writeFile(join(root,demoOnly?'docs/NATIVE_DEMO_VERIFICATION.json':'docs/NATIVE_VERIFICATION.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify(report));
}finally{await rm(temp,{recursive:true,force:true});}
