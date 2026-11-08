import {appendFile,access} from 'node:fs/promises';
for(const name of ['ANDROID_KEYSTORE_PATH','ANDROID_KEYSTORE_PASSWORD','ANDROID_KEY_ALIAS','ANDROID_KEY_PASSWORD'])if(!process.env[name])throw Error(`Missing signing secret: ${name}`);
await access(process.env.ANDROID_KEYSTORE_PATH);
await appendFile('android/app/build.gradle', `
// Dedicated CI release signing. Never fall back to the generated debug key.
android {
 signingConfigs {
  ciRelease {
   storeFile file(System.getenv('ANDROID_KEYSTORE_PATH'))
   storePassword System.getenv('ANDROID_KEYSTORE_PASSWORD')
   keyAlias System.getenv('ANDROID_KEY_ALIAS')
   keyPassword System.getenv('ANDROID_KEY_PASSWORD')
  }
 }
 buildTypes { release { signingConfig signingConfigs.ciRelease } }
}
`);
