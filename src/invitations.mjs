export const INVITATION_HEADLINE='Invita i tuoi contatti per far crescere la nostra comunità: più persone, più possibilità di match.';
const PRIVACY_COPY='L’invito non mostra la tua identità o il tuo profilo agli invitati.';
export const invitationDelivery=Object.freeze({channel:'platform',enabled:false,verifiedSender:false});
// Disposable demo names. Native contact names stay on the phone; delivery is disabled.
export const DEMO_CONTACTS=Object.freeze([
 {id:'demo-1',label:'Giulia Rossi'},
 {id:'demo-2',label:'Luca Bianchi'},
 {id:'demo-3',label:'Andrea Moretti'}
]);
export function toggleRecipient(selected,id){return selected.includes(id)?selected.filter(x=>x!==id):[...selected,id];}
export function invitationPrivacyCopy(policy={}){return policy.demoPreview===true||(policy.channel==='platform'&&policy.enabled===true&&policy.verifiedSender===true)?PRIVACY_COPY:null;}
export function buildInvitationPreview(contacts,selectedIds){
 const ids=[...new Set(selectedIds)];if(!ids.length)throw Error('Scegli almeno un destinatario per vedere l’anteprima. Puoi sempre continuare senza invitare.');
 const recipients=ids.map(id=>{const c=contacts.find(x=>x.id===id);if(!c)throw Error('Il destinatario selezionato non è disponibile.');return {id:c.id,label:c.label};});
 const url='https://random-stranger.gianpaolo-franceschi.chatgpt.site';
 return {recipients,url,subject:'Scopri Random Stranger',body:'Scopri Random Stranger: una comunità di incontri tra adulti, senza foto, con descrizioni e preferenze reciproche.\n\n'+url};
}
