export function contactNames(contacts){
 const seen=new Set();
 return contacts.filter(c=>typeof c.id==='string'&&!seen.has(c.id)&&seen.add(c.id)).map(c=>({id:c.id,label:typeof c.fullName==='string'&&c.fullName.trim()?c.fullName.trim():'Contatto senza nome'})).sort((a,b)=>a.label.localeCompare(b.label,'it'));
}
