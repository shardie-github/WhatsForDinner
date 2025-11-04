#!/bin/bash
# Guardrails Validator - Validates architectural invariants
# Runs all guardrails defined in guardrails.yaml

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GUARDRAILS_FILE="${SCRIPT_DIR}/guardrails.yaml"
FAILED_GUARDRAILS=()
PASSED_GUARDRAILS=()
SKIPPED_GUARDRAILS=()
TOTAL_CHECKS=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Parse guardrails.yaml and extract expressions
# This is a simplified parser - in production, use yq or a proper YAML parser
parse_guardrails() {
    local in_guardrails=false
    local current_name=""
    local current_expression=""
    local current_severity=""
    local current_description=""
    local current_status=""
    
    while IFS= read -r line; do
        # Detect guardrails section
        if [[ "$line" =~ ^guardrails: ]]; then
            in_guardrails=true
            continue
        fi
        
        # Detect end of guardrails section
        if [[ "$line" =~ ^[a-z] && "$line" != "  - name:" && "$line" != "  - description:" ]]; then
            if [[ "$line" =~ ^metadata: ]]; then
                break
            fi
        fi
        
        if [ "$in_guardrails" = true ]; then
            # Extract guardrail name
            if [[ "$line" =~ ^[[:space:]]*-[[:space:]]name:[[:space:]]*(.+) ]]; then
                if [ -n "$current_name" ]; then
                    # Process previous guardrail
                if [ -n "$current_expression" ]; then
                    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
                    validate_guardrail "$current_name" "$current_expression" "$current_severity" "$current_description" "$current_status"
                fi
                fi
                current_name="${BASH_REMATCH[1]}"
                current_expression=""
                current_severity=""
                current_description=""
            fi
            
            # Extract expression
            if [[ "$line" =~ ^[[:space:]]*expression:[[:space:]]*[\"']?(.+)[\"']?$ ]]; then
                current_expression="${BASH_REMATCH[1]}"
            fi
            
            # Extract severity
            if [[ "$line" =~ ^[[:space:]]*severity:[[:space:]]*(.+) ]]; then
                current_severity="${BASH_REMATCH[1]}"
            fi
            
            # Extract description
            if [[ "$line" =~ ^[[:space:]]*description:[[:space:]]*[\"']?(.+)[\"']?$ ]]; then
                current_description="${BASH_REMATCH[1]}"
            fi
            
            # Extract status
            if [[ "$line" =~ ^[[:space:]]*status:[[:space:]]*[\"']?(.+)[\"']?$ ]]; then
                current_status="${BASH_REMATCH[1]}"
            fi
        fi
    done < "$GUARDRAILS_FILE"
    
    # Process last guardrail
    if [ -n "$current_name" ] && [ -n "$current_expression" ]; then
        TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
        validate_guardrail "$current_name" "$current_expression" "$current_severity" "$current_description" "$current_status"
    fi
}

validate_guardrail() {
    local name="$1"
    local expression="$2"
    local severity="$3"
    local description="$4"
    local status="$5"  # optional status field
    
    log_info "Checking: $name"
    
    # Skip if status is "planned" (not yet implemented)
    if [ "$status" = "planned" ]; then
        log_info "  ⏭️  SKIPPED (PLANNED): $description"
        SKIPPED_GUARDRAILS+=("$name")
        return 0
    fi
    
    # Skip if status is "implemented" (already done, just verify)
    if [ "$status" = "implemented" ]; then
        log_info "  ✓ VERIFYING (IMPLEMENTED): $description"
    fi
    
    # Change to workspace root
    cd "${SCRIPT_DIR}/../.." || exit 1
    
    # Execute the expression (safely)
    if eval "$expression" > /dev/null 2>&1; then
        PASSED_GUARDRAILS+=("$name")
        log_info "  ✓ PASSED: $description"
    else
        # If status is "implemented" but fails, that's a problem
        if [ "$status" = "implemented" ]; then
            FAILED_GUARDRAILS+=("$name|$severity|$description|IMPLEMENTED_BUT_FAILING")
            log_error "  ✗ FAILED (IMPLEMENTED BUT FAILING): $description"
        else
            FAILED_GUARDRAILS+=("$name|$severity|$description")
            if [ "$severity" = "critical" ]; then
                log_error "  ✗ FAILED (CRITICAL): $description"
            elif [ "$severity" = "high" ]; then
                log_error "  ✗ FAILED (HIGH): $description"
            else
                log_warn "  ✗ FAILED (MEDIUM): $description"
            fi
        fi
    fi
}

# Main execution
main() {
    log_info "Starting guardrails validation..."
    log_info "Reading guardrails from: $GUARDRAILS_FILE"
    
    if [ ! -f "$GUARDRAILS_FILE" ]; then
        log_error "Guardrails file not found: $GUARDRAILS_FILE"
        exit 1
    fi
    
    parse_guardrails
    
    # Summary
    echo ""
    log_info "=== Validation Summary ==="
    log_info "Total checks: $TOTAL_CHECKS"
    log_info "Passed: ${#PASSED_GUARDRAILS[@]}"
    log_info "Skipped (planned): ${#SKIPPED_GUARDRAILS[@]}"
    log_info "Failed: ${#FAILED_GUARDRAILS[@]}"
    
    if [ ${#FAILED_GUARDRAILS[@]} -gt 0 ]; then
        echo ""
        log_error "=== Failed Guardrails ==="
        for failed in "${FAILED_GUARDRAILS[@]}"; do
            IFS='|' read -r name severity description <<< "$failed"
            log_error "- [$severity] $name: $description"
        done
        echo ""
        
        # Check for critical failures
        critical_failures=0
        for failed in "${FAILED_GUARDRAILS[@]}"; do
            if [[ "$failed" =~ \|critical\| ]]; then
                critical_failures=$((critical_failures + 1))
            fi
        done
        
        if [ $critical_failures -gt 0 ]; then
            log_error "CRITICAL: $critical_failures critical guardrails failed!"
            exit 1
        fi
        
        # Exit with error if any high/critical failures
        exit 1
    fi
    
    log_info "All guardrails passed! ✓"
    exit 0
}

main "$@"
