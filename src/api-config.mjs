export function resolveApiConfig(value,platform,{demoOnly=false}={}){
 if(demoOnly)return {configured:false,base:''};
 const raw=(value||'').trim();
 if(!raw)return {configured:false,base:''};
 if(raw==='/'&&platform==='web')return {configured:true,base:''};
 let url;try{url=new URL(raw);}catch{throw Error('Configura un’origine API HTTPS assoluta per l’app nativa.');}
 const local=['localhost','127.0.0.1','[::1]'].includes(url.hostname);
 if(url.username||url.password||!(url.pathname==='/'||/^\/functions\/v1\/[a-z][a-z0-9-]*\/?$/.test(url.pathname))||url.search||url.hash||(url.protocol!=='https:'&&!(local&&url.protocol==='http:')))throw Error('L’origine API deve usare HTTPS, senza credenziali e con un percorso supportato.');
 return {configured:true,base:url.origin+url.pathname.replace(/\/$/,'')};
}
