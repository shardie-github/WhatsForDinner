#!/usr/bin/env bash
set -euo pipefail

# Generate CHANGELOG.md from git log
LAST_TAG="$(git describe --tags --abbrev=0 2>/dev/null || echo '')"

if [ -z "$LAST_TAG" ]; then
  echo "# Changelog" > CHANGELOG.md
  echo "" >> CHANGELOG.md
  echo "All notable changes to this project will be documented in this file." >> CHANGELOG.md
  echo "" >> CHANGELOG.md
  echo "## [Unreleased]" >> CHANGELOG.md
  echo "" >> CHANGELOG.md
  git log --pretty=format:'* %s (%h)' --max-count=50 >> CHANGELOG.md
else
  echo "# Changelog" > CHANGELOG.md
  echo "" >> CHANGELOG.md
  echo "All notable changes to this project will be documented in this file." >> CHANGELOG.md
  echo "" >> CHANGELOG.md
  echo "## [Unreleased]" >> CHANGELOG.md
  echo "" >> CHANGELOG.md
  git log "$LAST_TAG"..HEAD --pretty=format:'* %s (%h)' >> CHANGELOG.md
  echo "" >> CHANGELOG.md
  echo "## [$LAST_TAG]" >> CHANGELOG.md
  echo "" >> CHANGELOG.md
  git log "$LAST_TAG" --pretty=format:'* %s (%h)' --max-count=20 >> CHANGELOG.md
fi

# Copy to RELEASE_NOTES.md
cp CHANGELOG.md RELEASE_NOTES.md
