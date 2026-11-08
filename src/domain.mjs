export const GENDERS=['donna','uomo','non binario'];
export const BODIES=['snella','atletica','media','morbida','robusta'];
export const HOUR=3600000, DURATION=1800000, GRACE=600000;
export const VENUES=[{id:'bologna-maggiore',name:'Piazza Maggiore',detail:'Davanti alla facciata di Palazzo d’Accursio · spazio pubblico',city:'Bologna',lat:44.4938,lon:11.3430},{id:'bologna-san-francesco',name:'Piazza San Francesco',detail:'Lato portico di via del Pratello · spazio pubblico',city:'Bologna',lat:44.4942,lon:11.3347}];
const fail=m=>{throw Object.assign(new Error(m),{status:400});};
export function validateProfile(p,now=Date.now()){
 if(!p||p.adult!==true||p.consent!==true||!Number.isInteger(p.age)||p.age<18||p.age>100)fail('Conferma maggiore età e trattamento delle preferenze.');
 if(typeof p.description!=='string'||p.description.trim().length<20||p.description.length>1500)fail('Inserisci una descrizione di 20–1500 caratteri.');
 if(!GENDERS.includes(p.gender)||!BODIES.includes(p.body)||typeof p.trans!=='boolean')fail('Controlla genere e corporatura.');
 if(!Array.isArray(p.wantedGenders)||!p.wantedGenders.length||p.wantedGenders.some(g=>!GENDERS.includes(g))||!Array.isArray(p.wantedBodies)||p.wantedBodies.some(b=>!BODIES.includes(b))||!['qualsiasi','trans','cis'].includes(p.transPreference))fail('Controlla le preferenze.');
 if(!Number.isInteger(p.minAge)||!Number.isInteger(p.maxAge)||p.minAge<18||p.maxAge>100||p.minAge>p.maxAge||!Number.isFinite(p.radiusKm)||p.radiusKm<1||p.radiusKm>100)fail('Controlla età e raggio (1–100 km).');
 if(!Number.isFinite(p.lat)||Math.abs(p.lat)>90||!Number.isFinite(p.lon)||Math.abs(p.lon)>180)fail('Scegli una zona valida o autorizza la posizione.');
 if(!Array.isArray(p.availability)||p.availability.length>12||p.availability.some(s=>!Number.isSafeInteger(s.start)||!Number.isSafeInteger(s.end)||s.start<=now||s.end-s.start<DURATION||s.end-s.start>86400000))fail('Inserisci disponibilità future di almeno 30 minuti e massimo 24 ore.');
 for(const field of ['orientation','interests'])if(typeof p[field]!=='string'||p[field].length>500)fail('Preferenze troppo lunghe.');
 return {adult:true,consent:true,age:p.age,description:p.description.trim(),gender:p.gender,trans:p.trans,body:p.body,orientation:p.orientation.trim(),interests:p.interests.trim(),wantedGenders:[...new Set(p.wantedGenders)],wantedBodies:[...new Set(p.wantedBodies)],transPreference:p.transPreference,minAge:p.minAge,maxAge:p.maxAge,radiusKm:p.radiusKm,lat:p.lat,lon:p.lon,availability:p.availability.map(s=>({start:s.start,end:s.end}))};
}
export function distanceKm(a,b,c,d){const rad=x=>x*Math.PI/180;const h=Math.sin(rad(c-a)/2)**2+Math.cos(rad(a))*Math.cos(rad(c))*Math.sin(rad(d-b)/2)**2;return 6371*2*Math.asin(Math.sqrt(Math.min(1,h)));}
function accepts(a,b){return a.wantedGenders.includes(b.gender)&&(!a.wantedBodies.length||a.wantedBodies.includes(b.body))&&b.age>=a.minAge&&b.age<=a.maxAge&&(a.transPreference==='qualsiasi'||(a.transPreference==='trans')===b.trans);}
export function compatible(a,b){return accepts(a,b)&&accepts(b,a)&&distanceKm(a.lat,a.lon,b.lat,b.lon)<=Math.min(a.radiusKm,b.radiusKm);}
export function commonSlot(a,b,now=Date.now()){for(const x of [...a.availability].sort((a,b)=>a.start-b.start))for(const y of b.availability){const start=Math.max(x.start,y.start,now+HOUR+60000),end=Math.min(x.end,y.end);if(end-start>=DURATION)return {start,end:start+DURATION};}return null;}
export const cancellationPenalty=(start,now=Date.now())=>start-now<HOUR;
export function publicProfile(p){return Object.fromEntries(['age','description','gender','trans','body','orientation','interests'].map(k=>[k,p[k]]));}
