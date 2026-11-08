// Fantasy names, grouped for matching preferences, never account identifiers.
export const NAME_BANK=Object.freeze({
 uomo:Object.freeze(['Alaric','Aldric','Vaelor','Cael','Darian','Theron','Eryx','Kael','Odran','Maelor','Aurel','Corvin','Veylan','Eldric','Arctur','Lucan','Valen','Severin','Azrael','Orien','Draeven','Faelan','Riven','Torian','Zarek','Ulric','Soren','Nerian','Aster','Vesper','Noctis','Solan','Zephyr','Evran','Iskander','Kaeron']),
 donna:Object.freeze(['Isolde','Aelora','Lyra','Morrigan','Elowen','Selene','Vaelith','Aurelia','Nerissa','Seraphine','Elysia','Thalia','Nyra','Veyra','Caelia','Althea','Luneth','Orlena','Ilyra','Sylva','Azura','Valeria','Astra','Eirene','Zorya','Maelis','Rhaena','Elenya','Aster','Vesper','Noctis','Solan','Zephyr','Nimue','Ysola','Aeryn']),
 neutro:Object.freeze(['Aster','Vesper','Noctis','Solan','Zephyr','Nyx','Eon','Aether','Vey','Nox','Lumen','Caelis','Astryn','Oris','Vhael','Eiren','Velis','Sael','Thalen','Neris','Syl','Ael','Zyren','Rhael','Oryn','Elion','Mael','Kaeris','Aer','Novis','Syris','Aeryn','Lior','Seren','Teryn','Vaeris'])
});
export const HOUSE_NAMES=Object.freeze(['Nox','Astralis','Lunaris','Veyr','Caelum','Solaryn','Eclipsis','Nebulis','Aethra','Vesperis','Orialis','Nyther','Valdyr','Umbriel','Asterion','Sylvar','Elyth','Zerion','Noctara','Velorum','Arcanis','Therys','Lunovar','Cyrion','Eldara','Vexalis','Nerath','Solvyr','Oberis','Yllion','Caelith','Voryn']);
const CATALOG=Object.fromEntries(Object.entries(NAME_BANK).map(([key,names])=>[key,names.flatMap(n=>HOUSE_NAMES.map(h=>`${n} ${h}`))]));
export function generateEncounterAlias(profile,used=[],pick=n=>Math.floor(Math.random()*n)){
 const key=profile?.trans||profile?.gender==='non binario'?'neutro':profile?.gender==='donna'?'donna':profile?.gender==='uomo'?'uomo':'neutro';
 const excluded=new Set(used),available=CATALOG[key].filter(n=>!excluded.has(n));
 const choose=arr=>arr[((pick(arr.length)%arr.length)+arr.length)%arr.length];
 if(available.length)return choose(available);
 const base=choose(CATALOG[key]);let suffix=2;while(excluded.has(`${base} ${suffix}`))suffix++;
 return `${base} ${suffix}`;
}
