#!/bin/bash

# Supabase Migration Management Script
# Handles creation, validation, and application of database migrations

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
SUPABASE_DIR="$PROJECT_ROOT/supabase"
MIGRATIONS_DIR="$SUPABASE_DIR/migrations"

# Function to print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}[$(date +'%Y-%m-%d %H:%M:%S')] ${message}${NC}"
}

# Function to create a new migration
create_migration() {
    local name=$1
    local description=$2
    
    if [ -z "$name" ]; then
        print_status $RED "Migration name is required."
        exit 1
    fi
    
    # Generate timestamp
    local timestamp=$(date +%Y%m%d%H%M%S)
    local migration_file="${timestamp}_${name}.sql"
    local migration_path="$MIGRATIONS_DIR/$migration_file"
    
    print_status $BLUE "Creating migration: $migration_file"
    
    # Create migration file with template
    cat > "$migration_path" << EOF
-- Migration: $name
-- Description: $description
-- Created: $(date -u +%Y-%m-%dT%H:%M:%SZ)
-- Author: $(git config user.name)

-- Add your migration SQL here
-- Example:
-- CREATE TABLE IF NOT EXISTS example_table (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
--     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
-- );

-- Add indexes if needed
-- CREATE INDEX IF NOT EXISTS idx_example_table_created_at ON example_table(created_at);

-- Add RLS policies if needed
-- ALTER TABLE example_table ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "example_policy" ON example_table FOR ALL USING (true);
EOF
    
    print_status $GREEN "Migration created: $migration_path"
    print_status $YELLOW "Please edit the migration file and add your SQL statements."
}

# Function to validate migrations
validate_migrations() {
    print_status $BLUE "Validating migrations..."
    
    # Check if migrations directory exists
    if [ ! -d "$MIGRATIONS_DIR" ]; then
        print_status $RED "Migrations directory not found: $MIGRATIONS_DIR"
        exit 1
    fi
    
    # Check for SQL syntax errors
    local errors=0
    for migration in "$MIGRATIONS_DIR"/*.sql; do
        if [ -f "$migration" ]; then
            print_status $YELLOW "Validating: $(basename "$migration")"
            
            # Basic SQL syntax check
            if ! psql --dry-run -f "$migration" >/dev/null 2>&1; then
                print_status $RED "Syntax error in: $(basename "$migration")"
                errors=$((errors + 1))
            fi
        fi
    done
    
    if [ $errors -eq 0 ]; then
        print_status $GREEN "All migrations validated successfully."
    else
        print_status $RED "Found $errors migration errors."
        exit 1
    fi
}

# Function to apply migrations
apply_migrations() {
    local environment=${1:-local}
    
    print_status $BLUE "Applying migrations to $environment environment..."
    
    case "$environment" in
        "local")
            print_status $YELLOW "Applying migrations to local database..."
            supabase db reset --local
            ;;
        "staging")
            print_status $YELLOW "Applying migrations to staging database..."
            supabase db push --project-ref "$SUPABASE_PROJECT_REF_STAGING"
            ;;
        "production")
            print_status $YELLOW "Applying migrations to production database..."
            supabase db push --project-ref "$SUPABASE_PROJECT_REF_PROD"
            ;;
        *)
            print_status $RED "Unknown environment: $environment"
            exit 1
            ;;
    esac
    
    print_status $GREEN "Migrations applied successfully."
}

# Function to rollback migrations
rollback_migrations() {
    local environment=${1:-local}
    local steps=${2:-1}
    
    print_status $BLUE "Rolling back $steps migration(s) from $environment environment..."
    
    case "$environment" in
        "local")
            print_status $YELLOW "Rolling back local database..."
            # For local, we'll reset to a clean state
            supabase db reset --local
            ;;
        "staging"|"production")
            print_status $RED "Rollback not supported for remote environments."
            print_status $YELLOW "Please create a new migration to fix issues."
            exit 1
            ;;
        *)
            print_status $RED "Unknown environment: $environment"
            exit 1
            ;;
    esac
    
    print_status $GREEN "Rollback completed."
}

# Function to generate migration diff
generate_diff() {
    local environment=${1:-local}
    
    print_status $BLUE "Generating migration diff for $environment environment..."
    
    local diff_file="migration_diff_$(date +%Y%m%d_%H%M%S).sql"
    
    case "$environment" in
        "local")
            supabase db diff --schema public > "$diff_file"
            ;;
        "staging")
            supabase db diff --schema public --project-ref "$SUPABASE_PROJECT_REF_STAGING" > "$diff_file"
            ;;
        "production")
            supabase db diff --schema public --project-ref "$SUPABASE_PROJECT_REF_PROD" > "$diff_file"
            ;;
        *)
            print_status $RED "Unknown environment: $environment"
            exit 1
            ;;
    esac
    
    print_status $GREEN "Migration diff generated: $diff_file"
    
    if [ -s "$diff_file" ]; then
        print_status $YELLOW "Changes detected:"
        cat "$diff_file"
    else
        print_status $GREEN "No changes detected."
    fi
}

# Function to list migrations
list_migrations() {
    print_status $BLUE "Listing migrations..."
    
    if [ ! -d "$MIGRATIONS_DIR" ]; then
        print_status $RED "Migrations directory not found: $MIGRATIONS_DIR"
        exit 1
    fi
    
    local count=0
    for migration in "$MIGRATIONS_DIR"/*.sql; do
        if [ -f "$migration" ]; then
            local filename=$(basename "$migration")
            local size=$(wc -l < "$migration")
            print_status $YELLOW "$filename ($size lines)"
            count=$((count + 1))
        fi
    done
    
    print_status $GREEN "Total migrations: $count"
}

# Function to check migration status
check_status() {
    local environment=${1:-local}
    
    print_status $BLUE "Checking migration status for $environment environment..."
    
    case "$environment" in
        "local")
            supabase db diff --schema public
            ;;
        "staging")
            supabase db diff --schema public --project-ref "$SUPABASE_PROJECT_REF_STAGING"
            ;;
        "production")
            supabase db diff --schema public --project-ref "$SUPABASE_PROJECT_REF_PROD"
            ;;
        *)
            print_status $RED "Unknown environment: $environment"
            exit 1
            ;;
    esac
}

# Function to backup database
backup_database() {
    local environment=${1:-local}
    local backup_file="backup_${environment}_$(date +%Y%m%d_%H%M%S).sql"
    
    print_status $BLUE "Creating database backup for $environment environment..."
    
    case "$environment" in
        "local")
            supabase db dump --local > "$backup_file"
            ;;
        "staging")
            supabase db dump --project-ref "$SUPABASE_PROJECT_REF_STAGING" > "$backup_file"
            ;;
        "production")
            supabase db dump --project-ref "$SUPABASE_PROJECT_REF_PROD" > "$backup_file"
            ;;
        *)
            print_status $RED "Unknown environment: $environment"
            exit 1
            ;;
    esac
    
    print_status $GREEN "Database backup created: $backup_file"
}

# Main function
main() {
    local command=$1
    shift
    
    case "$command" in
        "create")
            create_migration "$@"
            ;;
        "validate")
            validate_migrations
            ;;
        "apply")
            apply_migrations "$@"
            ;;
        "rollback")
            rollback_migrations "$@"
            ;;
        "diff")
            generate_diff "$@"
            ;;
        "list")
            list_migrations
            ;;
        "status")
            check_status "$@"
            ;;
        "backup")
            backup_database "$@"
            ;;
        "help"|"--help"|"-h")
            echo "Usage: $0 <command> [options]"
            echo ""
            echo "Commands:"
            echo "  create <name> [description]  Create a new migration"
            echo "  validate                     Validate all migrations"
            echo "  apply [environment]          Apply migrations to environment"
            echo "  rollback [environment] [steps] Rollback migrations"
            echo "  diff [environment]           Generate migration diff"
            echo "  list                         List all migrations"
            echo "  status [environment]         Check migration status"
            echo "  backup [environment]         Create database backup"
            echo ""
            echo "Environments: local (default), staging, production"
            exit 0
            ;;
        *)
            print_status $RED "Unknown command: $command"
            print_status $YELLOW "Use '$0 help' for usage information."
            exit 1
            ;;
    esac
}

# Run main function
main "$@"