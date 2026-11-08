import {withStaticFiles} from './static.mjs';
import {createNodeServer} from './http.mjs';
import {createStore} from './store.mjs';import {createApp} from './auth.mjs';
import {readServerConfig} from './config.mjs';
const config=readServerConfig();
const store=createStore(config.databasePath,undefined,{reviewRequired:true});
const app=createApp({store,config:config.auth});
store.prune();const cleanup=setInterval(()=>store.prune(),60000);cleanup.unref();
const server=createNodeServer(withStaticFiles(app,config.staticDirectory));
server.listen(config.port,config.host,()=>console.log(`Random Stranger API avviata su ${config.host}:${server.address().port}.`));
let stopping=false;
function shutdown(){if(stopping)return;stopping=true;clearInterval(cleanup);server.close(()=>{store.close();process.exit(0);});setTimeout(()=>process.exit(1),10000).unref();}
process.on('SIGTERM',shutdown);process.on('SIGINT',shutdown);
