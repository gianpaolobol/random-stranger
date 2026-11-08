import {Platform} from 'react-native';
import {Contact,ContactField,requestPermissionsAsync} from 'expo-contacts';
import {contactNames} from './contact-names.mjs';
export type ContactName={id:string;label:string};
export async function loadContactNames():Promise<ContactName[]>{
 if(Platform.OS==='web')throw new Error('La rubrica del telefono è disponibile nell’app per iOS e Android.');
 const permission=await requestPermissionsAsync();
 if(!permission.granted&&permission.accessPrivileges!=='limited')throw new Error('Rubrica non autorizzata. Puoi continuare senza invitare.');
 const names=await Contact.getAllDetails([ContactField.FULL_NAME] as const);
 return contactNames(names);
}
