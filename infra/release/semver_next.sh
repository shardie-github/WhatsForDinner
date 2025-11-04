#!/usr/bin/env bash
set -euo pipefail

# Compute next semver tag
LAST="$(git describe --tags --abbrev=0 2>/dev/null || echo 'v0.0.0')"
base="${LAST#v}"
IFS='.' read -r MA MI PA <<<"$base"

# Default to patch if not specified
TYPE="${1:-patch}"

case "$TYPE" in
  major)
    MA=$((MA+1))
    MI=0
    PA=0
    ;;
  minor)
    MI=$((MI+1))
    PA=0
    ;;
  patch|*)
    PA=$((PA+1))
    ;;
esac

echo "v${MA}.${MI}.${PA}"
