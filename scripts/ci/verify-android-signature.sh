#!/usr/bin/env bash
set -euo pipefail
AAB=android/app/build/outputs/bundle/release/app-release.aab
jarsigner -verify "$AAB"
# Compare the signed bundle's public certificate to the configured upload key.
keytool -exportcert -keystore "$ANDROID_KEYSTORE_PATH" -alias "$ANDROID_KEY_ALIAS" -storepass:env ANDROID_KEYSTORE_PASSWORD -file "$RUNNER_TEMP/rs-expected.der"
keytool -printcert -jarfile "$AAB" -rfc > "$RUNNER_TEMP/rs-signer.pem"
openssl x509 -in "$RUNNER_TEMP/rs-signer.pem" -outform DER -out "$RUNNER_TEMP/rs-actual.der"
cmp "$RUNNER_TEMP/rs-expected.der" "$RUNNER_TEMP/rs-actual.der"
