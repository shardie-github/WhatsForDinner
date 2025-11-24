#!/bin/sh
# ============================================================================
# Supabase Migration Helper Script
# ============================================================================
# This script applies all pending Supabase migrations using the Supabase CLI.
# It's designed to be Termux-friendly (Android) and POSIX-compliant.
#
# Usage:
#   ./scripts/supa-migrate-all.sh
#
# Prerequisites:
#   1. Supabase CLI installed: npm install -g supabase
#   2. Authenticated: supabase login (run manually once)
#   3. Project ref set: SUPABASE_PROJECT_REF env var or update DEFAULT_PROJECT_REF below
# ============================================================================

set -e

# Colors for output ( ) {
  printf '\033[0;31m%s\033[0m\n' "$*"
}

# Default project ref (TODO: Update this with your project ref)
# Or set SUPABASE_PROJECT_REF environment variable
DEFAULT_PROJECT_REF="${SUPABASE_PROJECT_REF:-your-project-ref-here}"

# Get project ref from env or use default
PROJECT_REF="${SUPABASE_PROJECT_REF:-$DEFAULT_PROJECT_REF}"

# Check if project ref is set
if [ "$PROJECT_REF" = "your-project-ref-here" ]; then
  echo_error "ERROR: SUPABASE_PROJECT_REF not set"
  echo_error ""
  echo_error "Please either:"
  echo_error "  1. Set SUPABASE_PROJECT_REF environment variable:"
  echo_error "     export SUPABASE_PROJECT_REF=your-actual-project-ref"
  echo_error "  2. Or edit this script and update DEFAULT_PROJECT_REF"
  echo_error ""
  exit 1
fi

# Get script directory (works in sh/bash)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Change to repo root
cd "$REPO_ROOT"

echo_info "🚀 Supabase Migration Script"
echo_info "================================"
echo_info "Project Ref: $PROJECT_REF"
echo_info "Working Directory: $REPO_ROOT"
echo_info ""

# Check if supabase CLI is installed
if ! command -v supabase >/dev/null 2>&1; then
  echo_error "ERROR: Supabase CLI not found"
  echo_error ""
  echo_error "Install it with:"
  echo_error "  npm install -g supabase"
  echo_error ""
  exit 1
fi

echo_info "✅ Supabase CLI found"

# Check if we're linked to a project
echo_info "🔗 Checking project link..."
if ! supabase link --project-ref "$PROJECT_REF" 2>/dev/null; then
  echo_warn "⚠️  Project not linked. Attempting to link..."
  echo_info "   Note: You may need to run 'supabase login' first if not authenticated"
  
  if ! supabase link --project-ref "$PROJECT_REF"; then
    echo_error "ERROR: Failed to link project"
    echo_error ""
    echo_error "Make sure:"
    echo_error "  1. You're authenticated: supabase login"
    echo_error "  2. The project ref is correct: $PROJECT_REF"
    echo_error "  3. You have access to the project"
    echo_error ""
    exit 1
  fi
fi

echo_info "✅ Project linked"

# Apply migrations
echo_info ""
echo_info "📦 Applying migrations..."
echo_info ""

if supabase migration up; then
  echo_info ""
  echo_success "✅ Migrations applied successfully!"
  echo_info ""
  echo_info "Next steps:"
  echo_info "  - Verify your schema: supabase db diff"
  echo_info "  - Check RLS policies: supabase db inspect"
  echo_info ""
else
  echo_error ""
  echo_error "❌ Migration failed"
  echo_error ""
  echo_error "Troubleshooting:"
  echo_error "  1. Check the error message above"
  echo_error "  2. Verify your database connection"
  echo_error "  3. Check migration files for syntax errors"
  echo_error "  4. Ensure you have the necessary permissions"
  echo_error ""
  exit 1
fi
