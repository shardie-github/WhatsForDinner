#!/bin/bash
# Quick development helper script
# Usage: ./scripts/dev.sh [web|mobile|all]

set -e

case "${1:-all}" in
  web)
    echo "🚀 Starting web app..."
    pnpm dev:web
    ;;
  mobile)
    echo "🚀 Starting mobile app..."
    pnpm dev:mobile
    ;;
  all)
    echo "🚀 Starting all apps..."
    pnpm dev
    ;;
  *)
    echo "Usage: ./scripts/dev.sh [web|mobile|all]"
    exit 1
    ;;
esac
