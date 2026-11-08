export function checkStoreBuild(env){
 const issues=[];let url;
 const demo=env.EAS_BUILD_PROFILE==='demo'&&env.EXPO_PUBLIC_DEMO_ONLY==='true';
 if((env.EAS_BUILD_PROFILE==='demo')!==(env.EXPO_PUBLIC_DEMO_ONLY==='true'))issues.push('EXPO_PUBLIC_DEMO_ONLY');
 try{url=new URL(env.EXPO_PUBLIC_API_URL);}catch{}
 if(!demo&&(!url||url.protocol!=='https:'||url.username||url.password||!(url.pathname==='/'||/^\/functions\/v1\/[a-z][a-z0-9-]*\/?$/.test(url.pathname))||url.search||url.hash||['localhost','127.0.0.1'].includes(url.hostname)||url.hostname.endsWith('.invalid')))issues.push('EXPO_PUBLIC_API_URL');
 if(!/^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(env.EAS_PROJECT_ID||''))issues.push('EAS_PROJECT_ID');
 return issues;
}
