#!/usr/bin/env bash
set -euo pipefail
SIGN_DIR="$RUNNER_TEMP/rs-signing"
if [[ -f "$SIGN_DIR/profile-uuid" ]]; then
 RS_UUID="$(cat "$SIGN_DIR/profile-uuid")"
 rm -f "$HOME/Library/MobileDevice/Provisioning Profiles/$RS_UUID.mobileprovision"
fi
security delete-keychain "$SIGN_DIR/build.keychain-db" 2>/dev/null || true
rm -rf "$SIGN_DIR"
if [[ -n "${ASC_KEY_ID:-}" ]]; then rm -f "$HOME/private_keys/AuthKey_${ASC_KEY_ID}.p8"; fi
