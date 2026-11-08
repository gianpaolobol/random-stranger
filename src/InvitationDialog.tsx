import React,{useEffect,useState,useRef,useMemo} from 'react';
import {Modal,View,ScrollView,StyleSheet,Platform} from 'react-native';
import {BrandText as Text,C,s,Label,Title,Button,Check,Card,Field} from './ui';
import {loadContactNames,ContactName} from './contacts';
import {selectAllRecipients,createInvitationSender} from './invitation-attempt.mjs';
import {INVITATION_HEADLINE,DEMO_CONTACTS,buildInvitationPreview,toggleRecipient,invitationPrivacyCopy,invitationDelivery} from './invitations.mjs';
export function InvitationDialog({visible,demo,onClose,scopeKey}:{visible:boolean;demo:boolean;onClose:()=>void;scopeKey:string}){
 const [selected,setSelected]=useState<string[]>([]),[step,setStep]=useState<'select'|'preview'|'done'>('select');
 const [contacts,setContacts]=useState<ContactName[]>([]),[loading,setLoading]=useState(false),[contactError,setContactError]=useState(''),[query,setQuery]=useState('');
 const generation=useRef(0);
 const [sending,setSending]=useState(false),[sendIssue,setSendIssue]=useState(''),[retryBlocked,setRetryBlocked]=useState(false);
 const sender=useMemo(()=>createInvitationSender({deliver:async()=>({simulated:true})}),[scopeKey]);
 useEffect(()=>{generation.current++;setSelected([]);setStep('select');setContacts(visible&&demo?[...DEMO_CONTACTS]:[]);setLoading(false);setContactError('');setQuery('');setSendIssue('');setRetryBlocked(false);return()=>{generation.current++;};},[visible,demo]);
 async function importNames(){const ticket=generation.current;setLoading(true);setContactError('');try{const names=await loadContactNames();if(ticket===generation.current){setContacts(names);setSelected([]);}}catch(error){if(ticket===generation.current)setContactError(error instanceof Error?error.message:'Rubrica non disponibile.');}finally{if(ticket===generation.current)setLoading(false);}}
 const draft=selected.length?buildInvitationPreview(contacts,selected):null;
 const filtered=contacts.filter(c=>c.label.toLocaleLowerCase('it').includes(query.trim().toLocaleLowerCase('it')));
 const privacy=invitationPrivacyCopy({demoPreview:demo&&step==='preview'});
 const allSelected=contacts.length>0&&contacts.every(c=>selected.includes(c.id));
 async function simulate(){if(!draft)return;setSending(true);setSendIssue('');try{const result=await sender.send(draft.recipients);setRetryBlocked(result.uncertain>0&&!result.failed);if(result.failed||result.uncertain)setSendIssue(result.uncertain?'Esito non confermato: gli inviti incerti non vengono ripetuti automaticamente.':'Alcuni inviti non sono partiti. Puoi riprovare solo quelli non completati.');else setStep('done');}catch(error){setSendIssue(error instanceof Error?error.message:'Operazione non disponibile.');}finally{setSending(false);}}
 return <Modal visible={visible} transparent animationType="fade" onRequestClose={()=>{if(!sending)onClose();}}><View style={styles.overlay}><View style={styles.dialog}>
 <ScrollView contentContainerStyle={{gap:20,paddingBottom:6}}>
 <Label>{step==='preview'?'Anteprima dell’invito':step==='done'?'Prova completata':'Una comunità che cresce'}</Label>
 <Title>{step==='done'?'Grazie per la prova.':'Più persone, più possibilità.'}</Title>
 {step!=='done'&&<Text style={[s.body,{color:C.text}]}>{INVITATION_HEADLINE}</Text>}
 {demo?<View style={styles.demo}><Text style={{color:C.blue,fontSize:12,lineHeight:19}}>Demo: contatti fittizi. Nessun invito viene inviato.</Text></View>:<Text style={s.body}>L’invio dalla piattaforma non è ancora disponibile. Puoi continuare a usare l’app senza invitare nessuno.</Text>}
 {step==='select'&&<><Text style={s.label}>{demo?'Scegli i destinatari della prova':'Scegli chi invitare'}</Text>{!demo&&Platform.OS!=='web'&&<Button secondary disabled={loading} onPress={importNames}>{loading?'Caricamento nomi…':contacts.length?'Aggiorna nomi dalla rubrica':'Scegli dalla rubrica'}</Button>}{!demo&&Platform.OS==='web'&&<Text style={s.body}>Apri l’app sul telefono per scegliere i contatti dalla rubrica.</Text>}{!!contactError&&<Text style={{color:C.pink}}>{contactError}</Text>}{contacts.length>0&&<Field label="Cerca un nome" value={query} onChange={setQuery} placeholder="Nome del contatto"/>}{contacts.length>0&&<><Button secondary small onPress={()=>setSelected(allSelected?[]:selectAllRecipients(contacts))}>{allSelected?'Deseleziona tutti':'Seleziona tutti'}</Button>{!!query.trim()&&<Text style={s.body}>La selezione di tutti comprende anche i nomi fuori dalla ricerca.</Text>}</>}{filtered.slice(0,100).map(c=><View key={c.id} style={styles.contact}><Check checked={selected.includes(c.id)} onChange={()=>setSelected(list=>toggleRecipient(list,c.id))}>{c.label}</Check></View>)}{filtered.length>100&&<Text style={s.body}>Cerca un nome per restringere l’elenco.</Text>}<Text style={s.body}>{selected.length} destinatari selezionati</Text><Button disabled={!selected.length} onPress={()=>setStep('preview')}>Anteprima invito</Button></>}
 {step==='preview'&&draft&&<><Text style={s.label}>Destinatari: {draft.recipients.length}</Text>{draft.recipients.map(c=><Text key={c.id} style={s.body}>{c.label}</Text>)}<Card style={{backgroundColor:C.bg,padding:18}}><Text style={{color:C.text,fontSize:19}}>{draft.subject}</Text><Text style={[s.body,{color:C.text}]}>{draft.body}</Text></Card>{privacy&&<Text style={{fontSize:12,lineHeight:19,color:C.muted}}>{privacy}</Text>}{!!sendIssue&&<Text style={{color:C.pink,fontSize:13,lineHeight:20}}>{sendIssue}</Text>}{demo&&<Button disabled={sending||retryBlocked} onPress={simulate}>{sending?'Simulazione in corso…':sendIssue?'Riprova inviti non partiti':'Simula invito'}</Button>}<Button secondary disabled={sending} onPress={()=>{setSendIssue('');setRetryBlocked(false);setStep('select');}}>Modifica destinatari</Button></>}
 {demo&&step==='done'&&<Text style={[s.body,{color:C.text}]}>La simulazione con {selected.length} destinatari fittizi è terminata. Nessun messaggio è stato inviato.</Text>}
 {!demo&&!invitationDelivery.enabled&&<Button disabled onPress={()=>{}}>Invio non ancora disponibile</Button>}
 </ScrollView>
 <Button secondary disabled={sending} onPress={onClose}>{step==='done'?'Continua nell’app':'Continua senza invitare'}</Button>
 </View></View></Modal>;
}
const styles=StyleSheet.create({overlay:{flex:1,backgroundColor:'#000b',alignItems:'center',justifyContent:'center',padding:20},dialog:{width:'100%',maxWidth:560,maxHeight:'92%',backgroundColor:C.panel,borderColor:C.line,borderWidth:1,borderRadius:24,padding:24,gap:18},demo:{borderRadius:10,backgroundColor:'#102337',padding:12},contact:{borderBottomWidth:1,borderColor:C.line,paddingBottom:12,gap:2}});
