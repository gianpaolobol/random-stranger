// Run the existing store behavior contract against actual Postgres (PGlite).
import {readFile,writeFile} from 'node:fs/promises';import {parse} from '@babel/parser';import traverseModule from '@babel/traverse';import generateModule from '@babel/generator';import * as t from '@babel/types';
const traverse=traverseModule.default||traverseModule,generate=generateModule.default||generateModule;
const ast=parse(await readFile(new URL('../tests/store.test.mjs',import.meta.url),'utf8'),{sourceType:'module'});
ast.program.body=ast.program.body.filter(n=>!(t.isImportDeclaration(n)&&n.source.value.includes('server/store'))&&!(t.isExpressionStatement(n)&&t.isCallExpression(n.expression)&&n.expression.arguments[0]?.value?.startsWith('database precedenti')));
traverse(ast,{CallExpression:{exit(p){
 const c=p.node.callee;const store=t.isMemberExpression(c)&&t.isIdentifier(c.object,{name:'s'});const helper=t.isIdentifier(c)&&['setup','createStore'].includes(c.name);const throws=t.isMemberExpression(c)&&t.isIdentifier(c.object,{name:'assert'})&&t.isIdentifier(c.property,{name:'throws'});
 if(throws)c.property.name='rejects';if(t.isIdentifier(c,{name:'createStore'})){c.name='createTestStore';p.node.arguments.shift();}
 if(!(store||helper||throws)||p.parentPath.isAwaitExpression())return;p.replaceWith(t.awaitExpression(p.node));const f=p.getFunctionParent();if(f)f.node.async=true;p.skip();
 }}});
const header=`// Generated behavioral contract; original cases: tests/store.test.mjs.\nimport {PGlite} from '@electric-sql/pglite';import {readFile} from 'node:fs/promises';import {after} from 'node:test';import {createCloudStore} from '../server/cloud-store.mjs';
const db=new PGlite();await db.exec('CREATE ROLE anon;CREATE ROLE authenticated;');await db.exec(await readFile(new URL('../supabase/schema.sql',import.meta.url),'utf8'));after(()=>db.close());
async function createTestStore(clock){await db.exec('TRUNCATE random_stranger.users,random_stranger.exclusions,random_stranger.attempts CASCADE');const adapt=tx=>({query:async(q,p=[])=>(await tx.query(q,p)).rows});return createCloudStore({...adapt(db),transaction:f=>db.transaction(tx=>f(adapt(tx))),close:()=>{}},clock,{reviewRequired:false});}\n`;
await writeFile(new URL('../tests/cloud-contract.test.mjs',import.meta.url),header+generate(ast).code+'\n');
