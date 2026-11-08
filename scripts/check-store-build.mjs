import {resolveApiConfig} from '../src/api-config.mjs';
import {checkStoreBuild} from '../src/store-build.mjs';
import {EAS_PROJECT_ID} from '../src/project.mjs';
const profile=process.env.EAS_BUILD_PROFILE;
if(profile&&!['demo','beta','production'].includes(profile))process.exit(0);
const missing=checkStoreBuild({...process.env,EAS_PROJECT_ID:process.env.EAS_PROJECT_ID||EAS_PROJECT_ID});
if(missing.length){console.error('Build store non avviabile. Configurare: '+missing.join(', '));process.exit(1);}
if(profile==='demo'&&process.env.EXPO_PUBLIC_DEMO_ONLY==='true'){console.log('Build demo esplicita: soli dati fittizi, nessun accesso reale o backend.');process.exit(0);}
try{
 const base=resolveApiConfig(process.env.EXPO_PUBLIC_API_URL,'ios').base;
 const [health,config]=await Promise.all(['/api/health','/api/config'].map(path=>fetch(base+path,{signal:AbortSignal.timeout(10000)})));
 if(!health.ok||(await health.json()).status!=='ok'||!config.ok)throw Error('Backend HTTPS non operativo.');
 const providers=(await config.json()).providers||{};
 if(!(providers.google||providers.facebook||providers.apple))throw Error('Nessun accesso reale attivo.');
 if((process.env.EAS_BUILD_PLATFORM==='ios'||process.argv[2]==='ios')&&!providers.apple)throw Error('Accesso Apple non ancora attivo per iOS.');
 console.log('Configurazione build e disponibilità API verificate. Accessi Expo, firma e requisiti store vanno verificati separatamente.');
}catch(error){console.error(error instanceof Error?error.message:'Controllo backend non riuscito.');process.exit(1);}
