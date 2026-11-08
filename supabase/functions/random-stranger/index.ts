import postgres from 'npm:postgres@3.4.7';
import {createCloudStore} from '../../../server/cloud-store.mjs';
import {createApp} from '../../../server/auth.mjs';

// Database credentials are supplied by Supabase at runtime, never by the client.
const sql=postgres(Deno.env.get('SUPABASE_DB_URL')!,{
 prepare:false,max:1,idle_timeout:20,connect_timeout:10,
 connection:{application_name:'random-stranger-beta',statement_timeout:10000},
 types:{bigint:{to:20,from:[20],serialize:String,parse:Number}},
});
const adapt=(client:any)=>({query:(text:string,args:unknown[]=[])=>client.unsafe(text,args)});
const store=createCloudStore({...adapt(sql),transaction:(f:any)=>sql.begin(tx=>f(adapt(tx))),close:()=>sql.end()});
const projectUrl=Deno.env.get('SUPABASE_URL')!;
const origin=new URL(projectUrl).origin;
const base=origin+'/functions/v1/random-stranger';
const get=(name:string)=>Deno.env.get(name);
const config={origin,webOrigin:origin,oauthBase:base,
 enabled:get('OAUTH_ENABLED')==='true',restrictedBeta:true,
 allowedEmails:(get('BETA_ALLOWED_EMAILS')||'').split(',').map(v=>v.trim().toLowerCase()).filter(Boolean),
 googleId:get('GOOGLE_CLIENT_ID'),googleSecret:get('GOOGLE_CLIENT_SECRET'),
 facebookId:get('FACEBOOK_APP_ID'),facebookSecret:get('FACEBOOK_APP_SECRET'),facebookVersion:get('FACEBOOK_API_VERSION'),
 appleId:get('APPLE_CLIENT_ID'),appleTeamId:get('APPLE_TEAM_ID'),appleKeyId:get('APPLE_KEY_ID'),applePrivateKey:get('APPLE_PRIVATE_KEY'),
};
// Custom OAuth/session authentication lives in createApp. No Supabase user JWT is used.
const app=createApp({config,store});
Deno.serve(async(request:Request)=>{
 const url=new URL(request.url);
 const prefix='/random-stranger';
 // The edge gateway strips /functions/v1 before forwarding to the function.
 if(url.pathname.startsWith('/functions/v1/random-stranger/'))url.pathname=url.pathname.slice('/functions/v1/random-stranger'.length);
 else if(url.pathname.startsWith(prefix+'/'))url.pathname=url.pathname.slice(prefix.length);
 else return new Response('Non trovato',{status:404});
 return app(new Request(url,request));
});
