#!/bin/bash
# Quick code quality check script
# Usage: ./scripts/check.sh [all|lint|type|format]

set -e

case "${1:-all}" in
  lint)
    echo "🔍 Running linter..."
    pnpm lint
    ;;
  type)
    echo "🔍 Running type check..."
    pnpm type-check
    ;;
  format)
    echo "🔍 Checking code formatting..."
    pnpm format:check
    ;;
  all)
    echo "🔍 Running all checks..."
    echo "→ Linting..."
    pnpm lint || echo "⚠️  Linting issues found"
    echo "→ Type checking..."
    pnpm type-check || echo "⚠️  Type errors found"
    echo "→ Formatting..."
    pnpm format:check || echo "⚠️  Formatting issues found"
    echo "✅ Checks complete!"
    ;;
  *)
    echo "Usage: ./scripts/check.sh [all|lint|type|format]"
    exit 1
    ;;
esac
