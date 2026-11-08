import {generateEncounterAlias} from './aliases.mjs';
import type {Profile,Appointment} from './types';
export const emptyProfile=():Profile=>({age:25,adult:false,consent:false,description:'',gender:'donna',trans:false,body:'media',orientation:'',interests:'',wantedGenders:['uomo'],wantedBodies:[],transPreference:'qualsiasi',minAge:18,maxAge:60,radiusKm:10,lat:44.4949,lon:11.3426,availability:[]});
export const demoProfile=():Profile=>({...emptyProfile(),age:29,adult:true,consent:true,description:'Mi piacciono le conversazioni sincere, le passeggiate senza meta e le persone che sanno sorprendere. Corporatura atletica, capelli scuri e un sorriso facile. Cerco un incontro leggero, rispettoso e senza aspettative.',body:'atletica',interests:'Cinema indipendente · musica dal vivo · passeggiate',availability:[{start:Date.now()+7200000,end:Date.now()+14400000}]});
export function demoAppointment(p:Profile,history:Appointment[]=[]):Appointment{
 const myAlias=generateEncounterAlias(p,history.map(x=>x.myAlias));
 const target={gender:p.wantedGenders[0]||'uomo',trans:p.transPreference==='trans'};
 const alias=generateEncounterAlias(target,[...history.map(x=>x.partner.alias),myAlias]);
 return {id:'demo-'+Date.now()+'-'+Math.random().toString(36).slice(2,9),myAlias,start:p.availability[0]?.start||Date.now()+7200000,end:(p.availability[0]?.start||Date.now()+7200000)+1800000,status:'proposed',venue:{name:'Piazza Maggiore',detail:'Davanti a Palazzo d’Accursio · Bologna',lat:44.4938,lon:11.343},partner:{alias,age:32,gender:target.gender,body:p.wantedBodies[0]||'atletica',description:'Sono una persona curiosa, dalla corporatura atletica. Capelli castani corti, occhiali tondi e una giacca blu. Mi piace conoscere qualcuno dal vivo, con calma e senza pressioni.',interests:'Musica · architettura · viaggi'},confirmed:false,partnerConfirmed:true,checkedIn:false,partnerCheckedIn:false,decision:null,partnerDecision:null};
}
