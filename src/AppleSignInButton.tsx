import React,{useEffect,useState} from 'react';
import {View} from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
export function AppleSignInButton({disabled,onPress}:{disabled:boolean;onPress:()=>void}){
 const [available,setAvailable]=useState(false);
 useEffect(()=>{AppleAuthentication.isAvailableAsync().then(setAvailable).catch(()=>{});},[]);
 if(!available)return null;
 return <View pointerEvents={disabled?'none':'auto'} style={{opacity:disabled?.4:1}}>
  <AppleAuthentication.AppleAuthenticationButton buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE} buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE} cornerRadius={12} style={{height:48,width:'100%'}} onPress={()=>{if(!disabled)onPress();}}/>
 </View>;
}
