#!/bin/bash
# Quick test helper script
# Usage: ./scripts/test.sh [watch|coverage|ci]

set -e

case "${1:-}" in
  watch)
    echo "🧪 Running tests in watch mode..."
    pnpm test:watch
    ;;
  coverage)
    echo "🧪 Running tests with coverage..."
    pnpm test:coverage
    ;;
  ci)
    echo "🧪 Running CI tests..."
    pnpm test:ci
    ;;
  *)
    echo "🧪 Running all tests..."
    pnpm test
    ;;
esac
