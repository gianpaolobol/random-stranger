import {EXPO_OWNER,EAS_PROJECT_ID} from './src/project.mjs';
import {nativeBuildVersion} from './src/ci-build.mjs';
const nativeVersion=nativeBuildVersion(process.env);
const demoOnly=process.env.EXPO_PUBLIC_DEMO_ONLY==='true';
export default {expo:{
 name:'Random Stranger',slug:'random-stranger',scheme:'randomstranger',version:'0.1.0',
 icon:'./assets/app-icon.png',orientation:'portrait',userInterfaceStyle:'dark',owner:EXPO_OWNER,
 extra:{eas:{projectId:process.env.EAS_PROJECT_ID||EAS_PROJECT_ID}},
 ios:{...(nativeVersion.iosBuildNumber?{buildNumber:nativeVersion.iosBuildNumber}:{}),appleTeamId:'BX9MDXAHKG',supportsTablet:true,usesAppleSignIn:!demoOnly,bundleIdentifier:'it.randomstranger.app',
  infoPlist:{ITSAppUsesNonExemptEncryption:false,...(demoOnly?{}:{NSLocationWhenInUseUsageDescription:'La posizione serve per trovare incontri nella tua zona e confermare la presenza. Viene richiesta solo quando scegli di usarla.'})}},
 android:{...(nativeVersion.androidVersionCode?{versionCode:nativeVersion.androidVersionCode}:{}),package:'it.randomstranger.app',allowBackup:false,
  blockedPermissions:[
   ...(demoOnly?['android.permission.READ_CONTACTS','android.permission.ACCESS_FINE_LOCATION','android.permission.ACCESS_COARSE_LOCATION']:[]),
   'android.permission.READ_EXTERNAL_STORAGE','android.permission.WRITE_EXTERNAL_STORAGE','android.permission.WRITE_CONTACTS','android.permission.ACCESS_BACKGROUND_LOCATION',
   ...(process.env.EAS_BUILD_PROFILE==='development'?[]:['android.permission.SYSTEM_ALERT_WINDOW'])
  ],permissions:demoOnly?[]:['ACCESS_COARSE_LOCATION','ACCESS_FINE_LOCATION']},
 web:{bundler:'metro',favicon:'./assets/app-icon.png',name:'Random Stranger',description:'Incontri senza foto. Una descrizione, un momento, una possibilità.'},
 plugins:[
  ['./plugins/withMinimalPermissions.cjs',{demoOnly}],
  ['expo-secure-store',{faceIDPermission:false}],
  'expo-apple-authentication',
  ['expo-contacts',{contactsPermission:'La rubrica serve per scegliere i nomi delle persone da invitare. I contatti restano sul telefono.'}],
  ['expo-location',{locationAlwaysAndWhenInUsePermission:false,locationAlwaysPermission:false,motionUsagePermission:false,locationWhenInUsePermission:'Usa la posizione per abbinamenti vicini e check-in volontario.'}]
 ]
}};
