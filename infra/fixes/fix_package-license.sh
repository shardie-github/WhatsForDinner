#!/usr/bin/env bash
# Fix: Add license to package.json
set -euo pipefail
if [ -f "package.json" ]; then
  node -e "
    const fs = require('fs');
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    if (!pkg.license) {
      pkg.license = 'UNLICENSED';
      fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
      console.log('Added license field to package.json');
    } else {
      console.log('License already specified:', pkg.license);
    }
  "
  echo "✅ package.json license check complete"
else
  echo "⚠️  package.json not found"
  exit 1
fi
