export const selectAllRecipients=contacts=>[...new Set(contacts.map(c=>c.id))];
let sequence=0;
export function createInvitationSender({deliver,makeKey=()=>globalThis.crypto?.randomUUID?.()||`invite-${Date.now()}-${++sequence}-${Math.random().toString(36).slice(2)}`,supportsIdempotency=false}){
 const journal=new Map();let active=null,activeSignature='';
 return {send(recipients){
  const unique=[...new Map(recipients.map(c=>[c.id,Object.freeze({id:c.id,label:c.label})])).values()];
  if(!unique.length)return Promise.reject(Error('Scegli almeno un destinatario.'));
  const signature=unique.map(c=>c.id).sort().join('\u0000');
  if(active)return signature===activeSignature?active:Promise.reject(Error('Un invito è già in corso. Attendi prima di cambiare destinatari.'));
  activeSignature=signature;
  active=Promise.resolve().then(async()=>{
   const result={completed:0,alreadyCompleted:0,failed:0,uncertain:0};
   for(const recipient of unique){
    let item=journal.get(recipient.id);
    if(item?.state==='completed'){result.alreadyCompleted++;continue;}
    if(item?.state==='uncertain'&&!supportsIdempotency){result.uncertain++;continue;}
    if(!item){item={key:makeKey(),state:'pending'};journal.set(recipient.id,item);}
    try{const receipt=await deliver({recipient,idempotencyKey:item.key});if(receipt?.confirmed!==true&&receipt?.simulated!==true)throw Error('Consegna non confermata.');item.state='completed';result.completed++;}
    catch(error){item.state=error?.deliveryState==='not_sent'?'failed':'uncertain';result[item.state]++;}
   }
   return result;
  }).finally(()=>{active=null;activeSignature='';});
  return active;
 }};
}
