#!/bin/bash

# Supabase Deployment Script with Branch-Aware Logic
# This script handles deployment of Supabase functions and migrations based on the current branch

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
FUNCTIONS_DIR="$SUPABASE_DIR/functions"

# Environment variables
BRANCH_NAME=${GITHUB_REF_NAME:-$(git branch --show-current)}
ENVIRONMENT=${ENVIRONMENT:-development}
DRY_RUN=${DRY_RUN:-false}
VERBOSE=${VERBOSE:-false}

# Function to print colored output
print_status() {
    local color=$1
    local message=$2
    echo -e "${color}[$(date +'%Y-%m-%d %H:%M:%S')] ${message}${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to validate environment
validate_environment() {
    print_status $BLUE "Validating environment..."
    
    # Check if Supabase CLI is installed
    if ! command_exists supabase; then
        print_status $RED "Supabase CLI is not installed. Please install it first."
        exit 1
    fi
    
    # Check if we're in a Supabase project
    if [ ! -f "$SUPABASE_DIR/config.toml" ]; then
        print_status $RED "Not in a Supabase project directory. Please run this from the project root."
        exit 1
    fi
    
    # Check for required environment variables
    if [ -z "$SUPABASE_PROJECT_REF" ] && [ "$ENVIRONMENT" != "development" ]; then
        print_status $RED "SUPABASE_PROJECT_REF environment variable is required for non-development deployments."
        exit 1
    fi
    
    print_status $GREEN "Environment validation passed."
}

# Function to determine deployment strategy based on branch
get_deployment_strategy() {
    case "$BRANCH_NAME" in
        "main"|"master")
            echo "production"
            ;;
        "develop"|"staging")
            echo "staging"
            ;;
        "feature/"*|"bugfix/"*|"hotfix/"*)
            echo "preview"
            ;;
        *)
            echo "development"
            ;;
    esac
}

# Function to get Supabase project reference
get_project_ref() {
    local strategy=$1
    
    case "$strategy" in
        "production")
            echo "$SUPABASE_PROJECT_REF_PROD"
            ;;
        "staging")
            echo "$SUPABASE_PROJECT_REF_STAGING"
            ;;
        "preview")
            echo "$SUPABASE_PROJECT_REF_PREVIEW"
            ;;
        *)
            echo "local"
            ;;
    esac
}

# Function to deploy database migrations
deploy_migrations() {
    local strategy=$1
    local project_ref=$2
    
    print_status $BLUE "Deploying database migrations..."
    
    if [ "$strategy" = "development" ] || [ "$project_ref" = "local" ]; then
        print_status $YELLOW "Running local migrations..."
        supabase db reset --local
    else
        print_status $YELLOW "Deploying migrations to $strategy environment..."
        
        if [ "$DRY_RUN" = "true" ]; then
            print_status $YELLOW "DRY RUN: Would deploy migrations to $project_ref"
            return 0
        fi
        
        # Generate migration diff
        supabase db diff --schema public > /tmp/migration_diff.sql
        
        if [ -s /tmp/migration_diff.sql ]; then
            print_status $YELLOW "Migration changes detected:"
            cat /tmp/migration_diff.sql
            
            # Apply migrations
            supabase db push --project-ref "$project_ref"
            print_status $GREEN "Migrations deployed successfully."
        else
            print_status $GREEN "No migration changes detected."
        fi
    fi
}

# Function to deploy Edge Functions
deploy_functions() {
    local strategy=$1
    local project_ref=$2
    
    print_status $BLUE "Deploying Edge Functions..."
    
    if [ "$strategy" = "development" ] || [ "$project_ref" = "local" ]; then
        print_status $YELLOW "Skipping function deployment for local development."
        return 0
    fi
    
    # Deploy all functions
    local functions=("api" "generate-meal" "job-processor")
    
    for func in "${functions[@]}"; do
        if [ -d "$FUNCTIONS_DIR/$func" ]; then
            print_status $YELLOW "Deploying function: $func"
            
            if [ "$DRY_RUN" = "true" ]; then
                print_status $YELLOW "DRY RUN: Would deploy $func to $project_ref"
            else
                supabase functions deploy "$func" --project-ref "$project_ref"
                print_status $GREEN "Function $func deployed successfully."
            fi
        else
            print_status $YELLOW "Function $func not found, skipping."
        fi
    done
}

# Function to run database tests
run_db_tests() {
    local strategy=$1
    local project_ref=$2
    
    print_status $BLUE "Running database tests..."
    
    if [ "$strategy" = "development" ] || [ "$project_ref" = "local" ]; then
        print_status $YELLOW "Running local database tests..."
        supabase test db --local
    else
        print_status $YELLOW "Running database tests against $strategy environment..."
        
        if [ "$DRY_RUN" = "true" ]; then
            print_status $YELLOW "DRY RUN: Would run database tests against $project_ref"
        else
            supabase test db --project-ref "$project_ref"
        fi
    fi
}

# Function to validate RLS policies
validate_rls() {
    print_status $BLUE "Validating Row Level Security policies..."
    
    # Run RLS validation tests
    if [ -f "$SUPABASE_DIR/test/01_rls_tests.sql" ]; then
        print_status $YELLOW "Running RLS validation tests..."
        
        if [ "$DRY_RUN" = "true" ]; then
            print_status $YELLOW "DRY RUN: Would validate RLS policies"
        else
            supabase test db --local --file "$SUPABASE_DIR/test/01_rls_tests.sql"
            print_status $GREEN "RLS validation completed."
        fi
    else
        print_status $YELLOW "No RLS tests found, skipping validation."
    fi
}

# Function to generate deployment report
generate_deployment_report() {
    local strategy=$1
    local project_ref=$2
    
    print_status $BLUE "Generating deployment report..."
    
    local report_file="deployment-report-$(date +%Y%m%d-%H%M%S).json"
    
    cat > "$report_file" << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "branch": "$BRANCH_NAME",
  "environment": "$strategy",
  "project_ref": "$project_ref",
  "deployment_status": "success",
  "migrations_applied": true,
  "functions_deployed": true,
  "tests_passed": true
}
EOF
    
    print_status $GREEN "Deployment report generated: $report_file"
}

# Function to rollback deployment
rollback_deployment() {
    local strategy=$1
    local project_ref=$2
    
    print_status $RED "Rolling back deployment..."
    
    if [ "$strategy" = "development" ] || [ "$project_ref" = "local" ]; then
        print_status $YELLOW "Resetting local database..."
        supabase db reset --local
    else
        print_status $YELLOW "Rolling back to previous migration..."
        # This would need to be implemented based on your rollback strategy
        print_status $RED "Rollback not implemented for remote environments."
    fi
}

# Main deployment function
main() {
    print_status $BLUE "Starting Supabase deployment process..."
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --dry-run)
                DRY_RUN=true
                shift
                ;;
            --verbose)
                VERBOSE=true
                shift
                ;;
            --environment)
                ENVIRONMENT="$2"
                shift 2
                ;;
            --help)
                echo "Usage: $0 [--dry-run] [--verbose] [--environment ENV]"
                echo "  --dry-run: Show what would be deployed without actually deploying"
                echo "  --verbose: Enable verbose output"
                echo "  --environment: Override environment (development, staging, production)"
                exit 0
                ;;
            *)
                print_status $RED "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    # Validate environment
    validate_environment
    
    # Determine deployment strategy
    local strategy=$(get_deployment_strategy)
    local project_ref=$(get_project_ref "$strategy")
    
    print_status $GREEN "Deployment strategy: $strategy"
    print_status $GREEN "Project reference: $project_ref"
    
    # Set trap for error handling
    trap 'rollback_deployment "$strategy" "$project_ref"' ERR
    
    # Deploy migrations
    deploy_migrations "$strategy" "$project_ref"
    
    # Deploy functions
    deploy_functions "$strategy" "$project_ref"
    
    # Run database tests
    run_db_tests "$strategy" "$project_ref"
    
    # Validate RLS policies
    validate_rls
    
    # Generate deployment report
    generate_deployment_report "$strategy" "$project_ref"
    
    print_status $GREEN "Deployment completed successfully!"
}

# Run main function
main "$@"