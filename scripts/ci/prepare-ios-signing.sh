#!/usr/bin/env bash
set -euo pipefail
: "${APPLE_CERTIFICATE_P12_BASE64:?Missing certificate}" "${APPLE_CERTIFICATE_PASSWORD:?Missing certificate password}" "${APPLE_PROFILE_BASE64:?Missing profile}" "${APPLE_TEAM_ID:?Missing team}"
SIGN_DIR="$RUNNER_TEMP/rs-signing"
mkdir -p "$SIGN_DIR"
chmod 700 "$SIGN_DIR"
export SIGN_DIR
python3 - <<'PY'
import base64,os,pathlib
for env,name in [('APPLE_CERTIFICATE_P12_BASE64','certificate.p12'),('APPLE_PROFILE_BASE64','profile.mobileprovision')]:
 path=pathlib.Path(os.environ['SIGN_DIR'])/name
 path.write_bytes(base64.b64decode(os.environ[env],validate=True));path.chmod(0o600)
PY
KEYCHAIN_PASSWORD="$(openssl rand -hex 32)"
security create-keychain -p "$KEYCHAIN_PASSWORD" "$SIGN_DIR/build.keychain-db"
security set-keychain-settings -lut 21600 "$SIGN_DIR/build.keychain-db"
security unlock-keychain -p "$KEYCHAIN_PASSWORD" "$SIGN_DIR/build.keychain-db"
security import "$SIGN_DIR/certificate.p12" -P "$APPLE_CERTIFICATE_PASSWORD" -k "$SIGN_DIR/build.keychain-db" -T /usr/bin/codesign -T /usr/bin/security
security set-key-partition-list -S apple-tool:,apple:,codesign: -s -k "$KEYCHAIN_PASSWORD" "$SIGN_DIR/build.keychain-db" >/dev/null
security list-keychain -d user -s "$SIGN_DIR/build.keychain-db"
security cms -D -i "$SIGN_DIR/profile.mobileprovision" > "$SIGN_DIR/profile.plist"
python3 - <<'PY'
import datetime,os,pathlib,plistlib,shutil
root=pathlib.Path(os.environ['SIGN_DIR']); p=plistlib.loads((root/'profile.plist').read_bytes())
team=os.environ['APPLE_TEAM_ID']; bundle='it.randomstranger.app'
assert p['TeamIdentifier']==[team], 'Unexpected profile team'
assert p['Entitlements']['application-identifier']==team+'.'+bundle, 'Unexpected profile bundle'
assert p['ExpirationDate']>datetime.datetime.now(datetime.timezone.utc).replace(tzinfo=None), 'Expired provisioning profile'
assert not p.get('ProvisionedDevices') and not p.get('ProvisionsAllDevices'), 'App Store profile required'
uuid=p['UUID']
dest=pathlib.Path.home()/'Library/MobileDevice/Provisioning Profiles';dest.mkdir(parents=True,exist_ok=True)
shutil.copyfile(root/'profile.mobileprovision',dest/(uuid+'.mobileprovision'))
(root/'profile-uuid').write_text(uuid)
with open(os.environ['GITHUB_ENV'],'a') as f:f.write('RS_PROFILE_UUID='+uuid+'\n')
options={'method':'app-store-connect','teamID':team,'signingStyle':'manual','signingCertificate':'Apple Distribution','provisioningProfiles':{bundle:uuid},'manageAppVersionAndBuildNumber':False,'uploadSymbols':True}
(root/'ExportOptions.plist').write_bytes(plistlib.dumps(options))
PY
