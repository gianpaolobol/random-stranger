/** @param {string} url @param {RequestInit & {fetchImpl?: typeof fetch, timeoutMs?: number}} options */
export async function requestJson(url,{fetchImpl=fetch,timeoutMs=15000,...options}={}){
 const controller=new AbortController();
 const timer=setTimeout(()=>controller.abort(),timeoutMs);
 try{
  const response=await fetchImpl(url,{...options,signal:controller.signal});
  let data;try{data=await response.json();}catch{if(controller.signal.aborted)throw controller.signal.reason;throw Error('Il servizio non è disponibile. Riprova più tardi.');}
  if(!response.ok)throw Object.assign(new Error(typeof data?.error==='string'?data.error:'Il servizio non è disponibile. Riprova più tardi.'),{status:response.status});
  return data;
 }catch(error){
  if(controller.signal.aborted)throw Error('Connessione interrotta. Prova ad aggiornare lo stato prima di ripetere l’operazione.');
  if(error instanceof TypeError)throw Error('Controlla la connessione e riprova. Le modifiche in corso restano disponibili.');
  throw error;
 }finally{clearTimeout(timer);}
}
