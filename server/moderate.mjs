// Operazione di moderazione solo locale; mai esposta via HTTP.
import {createStore} from './store.mjs';
const s=createStore(process.env.DATABASE_PATH||'./random-stranger.sqlite',undefined,{reviewRequired:true});
try {
 const [action,id,revision]=process.argv.slice(2);
 if(action==='list')console.log(JSON.stringify(s.pendingReports(),null,2));
 else if(['uphold','dismiss'].includes(action)&&id)console.log(s.resolveAbsence(id,action==='uphold'));
 else if(action==='profiles')console.log(JSON.stringify(s.pendingProfiles(),null,2));
 else if(['approve-profile','reject-profile'].includes(action)&&id&&revision)console.log(s.reviewProfile(id,action==='approve-profile',revision));
 else if(action==='content')console.log(JSON.stringify(s.pendingContentReports(),null,2));
 else if(['remove-content','dismiss-content'].includes(action)&&id)console.log(s.resolveContentReport(id,action==='remove-content'));
 else throw Error('Uso: list | uphold ID | dismiss ID | profiles | approve-profile USER HASH | reject-profile USER HASH | content | remove-content ID | dismiss-content ID');
}finally{s.close();}
