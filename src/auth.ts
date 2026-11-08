import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import * as AuthSession from 'expo-auth-session';
import * as AppleAuthentication from 'expo-apple-authentication';
import {resolveApiConfig} from './api-config.mjs';
import {requestJson} from './api-client.mjs';

WebBrowser.maybeCompleteAuthSession();
export const demoOnly=process.env.EXPO_PUBLIC_DEMO_ONLY==='true';
const apiConfig=resolveApiConfig(process.env.EXPO_PUBLIC_API_URL,Platform.OS,{demoOnly});
const API=apiConfig.base;
const TOKEN_KEY='stranger.session';
export type Provider='google'|'facebook'|'apple';
export type User={id:string;name:string;email:string;provider?:Provider};

export const backendConfigured=apiConfig.configured;
export async function api(path:string,method='GET',body?:unknown,timeoutMs?:number) {
 if(!backendConfigured) throw new Error('Gli accessi reali non sono ancora collegati. Puoi esplorare la demo con dati fittizi.');
 const token=Platform.OS==='web'?null:await SecureStore.getItemAsync(TOKEN_KEY);
 return requestJson(API+path,{method,credentials:'include',...(timeoutMs?{timeoutMs}:{}),headers:{...(body?{'content-type':'application/json'}:{}),...(token?{authorization:'Bearer '+token}:{})},...(body?{body:JSON.stringify(body)}:{})});
}
export async function getProviders():Promise<Record<Provider,boolean>> {
 if(!backendConfigured) return {google:false,facebook:false,apple:false};
 try {return (await api('/api/config')).providers;} catch {return {google:false,facebook:false,apple:false};}
}
export async function getSession():Promise<User|null> {
 if(!backendConfigured) return null;try{return (await api('/api/session')).user;}catch{return null;}
}
export async function signIn(provider:Provider) {
 const providers=await getProviders();
 if(!providers[provider]) throw new Error('Accesso '+(provider==='google'?'Google':provider==='apple'?'Apple':'Facebook')+' in preparazione. Per ora puoi esplorare la demo con dati fittizi.');
 if(provider==='apple'){
  const credentials=await appleCredentials();
  const data=await api('/auth/apple/native','POST',credentials);await SecureStore.setItemAsync(TOKEN_KEY,data.token);return;
 }
 if(Platform.OS==='web') {window.location.assign(API+'/auth/'+provider+'/start');return;}
 const redirectUri=AuthSession.makeRedirectUri({scheme:'randomstranger',path:'auth'});
 const verifier=Array.from(await Crypto.getRandomBytesAsync(48),b=>b.toString(16).padStart(2,'0')).join('');
 const digest=await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256,verifier,{encoding:Crypto.CryptoEncoding.BASE64});
 const challenge=digest.replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
 const result=await WebBrowser.openAuthSessionAsync(API+'/auth/'+provider+'/start?platform=native&challenge='+challenge,redirectUri);
 if(result.type!=='success') throw new Error('Accesso annullato. Puoi riprovare quando vuoi.');
 const url=new URL(result.url);
 if(url.protocol!=='randomstranger:'||url.hostname!=='auth') throw new Error('Risposta di accesso non valida.');
 const code=url.searchParams.get('code');if(!code) throw new Error('Nessun codice ricevuto.');
 const data=await api('/auth/native/exchange','POST',{code,verifier});await SecureStore.setItemAsync(TOKEN_KEY,data.token);
}
export async function signOut() {try{await api('/api/logout','POST');}finally{if(Platform.OS!=='web') await SecureStore.deleteItemAsync(TOKEN_KEY);}}
async function appleCredentials(){
 if(Platform.OS!=='ios'||!await AppleAuthentication.isAvailableAsync())throw new Error('Accesso Apple disponibile nell’app iOS.');
 const {nonce}=await api('/auth/apple/challenge','POST');
 try{
  const credential=await AppleAuthentication.signInAsync({nonce,requestedScopes:[AppleAuthentication.AppleAuthenticationScope.EMAIL]});
  if(!credential.identityToken)throw new Error('Nessun token Apple ricevuto.');
  return {nonce,identityToken:credential.identityToken,authorizationCode:credential.authorizationCode};
 }catch(error){if((error as {code?:string}).code==='ERR_REQUEST_CANCELED')throw new Error('Accesso Apple annullato.');throw error;}
}
export async function deleteAccount() {
 const session=await getSession();
 const credentials=session?.provider==='apple'?await appleCredentials():undefined;
 // Apple verification/exchange/revocation each have a server timeout of 10s.
 const result=await api('/api/account','DELETE',credentials,session?.provider==='apple'?45000:15000);
 if(Platform.OS!=='web')await SecureStore.deleteItemAsync(TOKEN_KEY);
 return result;
}
