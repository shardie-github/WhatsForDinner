#!/bin/bash
# Mobile App Setup Script
# Run this after building the web app to initialize Capacitor platforms

set -e

echo "?? Setting up mobile apps..."

cd "$(dirname "$0")/../apps/web"

# Check if web app is built
if [ ! -d "dist" ]; then
  echo "?? Building web app first..."
  pnpm build
fi

echo "?? Initializing Capacitor platforms..."

# Add iOS platform (macOS only)
if [[ "$OSTYPE" == "darwin"* ]]; then
  echo "?? Adding iOS platform..."
  npx cap add ios || echo "??  iOS platform already exists"
else
  echo "??  Skipping iOS (macOS required)"
fi

# Add Android platform
echo "?? Adding Android platform..."
npx cap add android || echo "??  Android platform already exists"

# Sync web assets
echo "?? Syncing web assets to native platforms..."
npx cap sync

# Generate icons (if Capacitor Assets CLI is available)
if command -v npx &> /dev/null; then
  echo "?? Generating app icons..."
  npx @capacitor/assets generate \
    --iconPath ../../ops/branding/appicon.svg \
    --splashPath ../../ops/branding/appicon.svg \
    --iosProject ios/App || echo "??  Icon generation skipped (run manually)"
fi

echo ""
echo "? Mobile setup complete!"
echo ""
echo "Next steps:"
echo "  1. Configure native projects:"
if [[ "$OSTYPE" == "darwin"* ]]; then
  echo "     npx cap open ios"
fi
echo "     npx cap open android"
echo ""
echo "  2. Set up signing certificates"
echo "  3. Configure push notifications"
echo "  4. Test on devices"
echo ""
echo "See ops/release/INITIALIZATION_GUIDE.md for details"
