#!/usr/bin/env bash
set -euo pipefail
: "${ASC_KEY_P8_BASE64:?Missing ASC API key}" "${ASC_KEY_ID:?Missing key ID}" "${ASC_ISSUER_ID:?Missing issuer}"
mkdir -p "$HOME/private_keys"
chmod 700 "$HOME/private_keys"
python3 - <<'PY'
import base64,os,pathlib
p=pathlib.Path.home()/'private_keys'/('AuthKey_'+os.environ['ASC_KEY_ID']+'.p8')
p.write_bytes(base64.b64decode(os.environ['ASC_KEY_P8_BASE64'],validate=True));p.chmod(0o600)
PY
shopt -s nullglob
IPAS=(build/ios/export/*.ipa)
[[ "${#IPAS[@]}" == 1 ]] || { echo 'Expected exactly one IPA'; exit 1; }
xcrun altool --upload-app --type ios --file "${IPAS[0]}" --apiKey "$ASC_KEY_ID" --apiIssuer "$ASC_ISSUER_ID"
