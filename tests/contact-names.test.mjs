import test from 'node:test';import assert from 'node:assert/strict';
import {contactNames} from '../src/contact-names.mjs';
import {buildInvitationPreview} from '../src/invitations.mjs';
test('elenco contatti conserva solo ID locale e nome, mai telefoni o email',()=>{
 const contacts=contactNames([{id:'b',fullName:'  Luca Bianchi ',phones:[{number:'+390000'}],emails:[{address:'private@example.invalid'}]},{id:'a',fullName:'Anna Rossi'}]);
 assert.deepEqual(contacts,[{id:'a',label:'Anna Rossi'},{id:'b',label:'Luca Bianchi'}]);
 const preview=buildInvitationPreview([{...contacts[0],email:'private@example.invalid',phone:'+390000'}],['a']);
 assert.equal(JSON.stringify(preview).includes('private@example.invalid'),false);assert.equal(JSON.stringify(preview).includes('+390000'),false);
});
test('nomi uguali restano contatti distinti e mancanza nome non espone altri dati',()=>{
 const contacts=contactNames([{id:'a',fullName:'Andrea'},{id:'b',fullName:'Andrea'},{id:'c',fullName:null,email:'private@example.invalid'}]);
 assert.equal(contacts.length,3);assert.equal(contacts.find(c=>c.id==='c').label,'Contatto senza nome');
});
