export const createProfileState=profile=>({profile,draft:profile});
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function rebase(draft,base,remote){
 return Object.fromEntries(Object.keys(remote).map(key=>[key,same(draft[key],base[key])?remote[key]:draft[key]]));
}
export function profileReducer(state,event){
 switch(event.type){
  case 'edit':return {...state,draft:{...state.draft,...(typeof event.patch==='function'?event.patch(state.draft):event.patch)}};
  case 'remote':return {profile:event.profile,draft:rebase(state.draft,state.profile,event.profile)};
  case 'saved':return {profile:event.profile,draft:rebase(state.draft,event.submitted,event.profile)};
  case 'reset':return createProfileState(event.profile);
  default:return state;
 }
}
export function createRefreshGate(){let version=0;return {begin:()=>++version,isCurrent:ticket=>ticket===version,invalidate:()=>{version++;}};}
export async function restoreSession({gate,getSession,onSession}){
 const ticket=gate.begin();const user=await getSession();
 if(user&&gate.isCurrent(ticket))await onSession(user);
}
export async function exitSession({clear,signOut}){clear();await signOut();}
