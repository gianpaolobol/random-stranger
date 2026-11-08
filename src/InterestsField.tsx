import React from 'react';
import {View} from 'react-native';
import {BrandText as Text,Chips,Field,s} from './ui';
import {INTERESTS,parseInterests} from './interests.mjs';

export function InterestsField({value,onChange,onToggle}:{value:string;onChange:(value:string)=>void;onToggle:(interest:string)=>void}){
 const selected:string[]=parseInterests(value);
 const options:string[]=[...INTERESTS.map((v:string)=>selected.find(x=>x.toLocaleLowerCase('it')===v.toLocaleLowerCase('it'))||v),...selected.filter(x=>!INTERESTS.some((v:string)=>x.toLocaleLowerCase('it')===v.toLocaleLowerCase('it')))];
 return <View style={{gap:12}}>
  <Text style={s.label}>Interessi e desideri (facoltativi)</Text>
  <Text style={s.body}>Puoi selezionare più interessi. Tocca di nuovo una scelta per rimuoverla.</Text>
  <Chips options={options} selected={selected} onToggle={onToggle} onChange={()=>{}}/>
  <Text style={s.body}>{selected.length} interessi selezionati</Text>
  <Field label="Personalizza i tuoi interessi" value={value} onChange={onChange} multiline placeholder="Aggiungi anche interessi personali, separati da virgole"/>
 </View>;
}
