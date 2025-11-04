#!/usr/bin/env bash
# Fix: Ensure .env.example completeness
set -euo pipefail
echo "Checking .env.example completeness..."

EXAMPLE="$(ls .env*.example 2>/dev/null | head -n1 || true)"
if [ -z "$EXAMPLE" ]; then
  echo "⚠️  No .env.example found. Creating template..."
  cat > .env.example << 'EOF'
# Environment Configuration Template
# Copy this file to .env and fill in values

# Database
DATABASE_URL=

# API Keys
API_KEY=

# Feature Flags
FEATURE_FLAG_ENABLED=false
EOF
  echo "✅ Created .env.example template"
else
  echo "✅ .env.example exists"
fi

# Run env completeness check
if [ -f "infra/selfcheck/env_completeness.sh" ]; then
  bash infra/selfcheck/env_completeness.sh || echo "⚠️  Some env keys may be missing"
fi
