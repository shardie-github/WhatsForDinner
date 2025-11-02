#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# Generate Supabase TypeScript Types
# =============================================================================
# This script generates TypeScript types from the Supabase database schema
# =============================================================================

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUT_DIR="$ROOT/supabase/types"
OUTPUT_FILE="$OUTPUT_DIR/generated.ts"

mkdir -p "$OUTPUT_DIR"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Generating Supabase TypeScript types...${NC}"

# Load environment
if [ -f "$ROOT/.env" ]; then
  source "$ROOT/.env"
elif [ -f "$ROOT/.env.local" ]; then
  source "$ROOT/.env.local"
fi

: "${SUPABASE_DB_URL:=$DATABASE_URL}"

if [ -z "${SUPABASE_DB_URL:-}" ]; then
  echo -e "${RED}Error: SUPABASE_DB_URL or DATABASE_URL not set${NC}"
  echo "Set SUPABASE_DB_URL in .env or pass as environment variable"
  exit 1
fi

# Check if supabase CLI is available
if ! command -v supabase >/dev/null 2>&1; then
  echo -e "${YELLOW}Supabase CLI not found. Install: npm i -g supabase${NC}"
  exit 1
fi

# Check if project is linked
if [ -z "${SUPABASE_PROJECT_REF:-}" ]; then
  echo -e "${YELLOW}SUPABASE_PROJECT_REF not set. Attempting to generate types from DB URL...${NC}"
  
  # Generate types directly from database
  supabase gen types typescript --db-url "$SUPABASE_DB_URL" > "$OUTPUT_FILE" || {
    echo -e "${RED}Failed to generate types. Ensure SUPABASE_DB_URL is correct.${NC}"
    exit 1
  }
else
  # Use project reference
  supabase gen types typescript --project-id "$SUPABASE_PROJECT_REF" > "$OUTPUT_FILE" || {
    echo -e "${RED}Failed to generate types. Check SUPABASE_PROJECT_REF and authentication.${NC}"
    exit 1
  }
fi

echo -e "${GREEN}? TypeScript types generated: $OUTPUT_FILE${NC}"
echo ""
echo "Usage in TypeScript:"
echo "  import { Database } from '@/supabase/types/generated'"
echo "  const supabase = createClient<Database>(url, key)"
