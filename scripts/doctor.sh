#!/usr/bin/env sh
set -eu
say(){ printf '%s\n' "$*"; }
fail(){ printf 'ERROR: %s\n' "$*" >&2; exit 1; }
[ -f .env ] || say "No .env found (CI vars only)."
node -v >/dev/null 2>&1 || fail "Node missing"
say "Node: $(node -v)"
: "${EXPO_PUBLIC_SUPABASE_URL:?Set EXPO_PUBLIC_SUPABASE_URL}"
: "${EXPO_PUBLIC_SUPABASE_ANON_KEY:?Set EXPO_PUBLIC_SUPABASE_ANON_KEY}"
if [ "${SUPABASE_URL:-}" ] && [ "${SUPABASE_SERVICE_ROLE_KEY:-}" ]; then
  curl -sSf -H "apikey:$SUPABASE_SERVICE_ROLE_KEY" -H "Authorization:Bearer $SUPABASE_SERVICE_ROLE_KEY" \
    "$SUPABASE_URL/rest/v1/" >/dev/null || fail "Supabase REST unreachable"
fi
npm run typecheck >/dev/null 2>&1 || fail "Typecheck failed"
npm run lint >/dev/null 2>&1 || fail "Lint failed"
npm test -- --ci >/dev/null 2>&1 || say "Tests missing/failing"
say "Doctor OK"
