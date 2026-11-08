export const INTERESTS=['Cinema','Musica','Viaggi','Arte','Sport','Natura','Lettura','Tecnologia','Cucina','Passeggiate'];
export function parseInterests(value){
 const seen=new Set();
 return value.split(/[·,;\n]/).map(v=>v.trim()).filter(v=>{
  const key=v.toLocaleLowerCase('it');
  if(!key||seen.has(key))return false;
  seen.add(key);return true;
 });
}
export function toggleInterest(value,interest){
 const selected=parseInterests(value),key=interest.toLocaleLowerCase('it');
 return (selected.some(v=>v.toLocaleLowerCase('it')===key)
  ?selected.filter(v=>v.toLocaleLowerCase('it')!==key):[...selected,interest]).join(' · ');
}
