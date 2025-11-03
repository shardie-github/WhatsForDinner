#!/bin/bash

# Production Setup Guide Script
# This script helps set up Nomad for production deployment

set -e

echo "?? Nomad Production Setup"
echo "========================="
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Step 1: Environment Variables
echo -e "${BLUE}Step 1: Environment Variables${NC}"
echo "Review and configure .env.local with production values"
echo "Key variables to set:"
echo "  - NEXT_PUBLIC_SUPABASE_URL"
echo "  - SUPABASE_SERVICE_ROLE_KEY"
echo "  - STRIPE_SECRET_KEY"
echo "  - OPENAI_API_KEY"
echo "  - SLACK_ALERT_WEBHOOK"
echo "  - PAGERDUTY_API_KEY"
echo "  - BACKUP_BUCKET_URL"
echo "  - BACKUP_ENCRYPTION_KEY"
echo ""
read -p "Press Enter when environment variables are configured..."

# Step 2: Observability Stack
echo ""
echo -e "${BLUE}Step 2: Observability Stack${NC}"
read -p "Start observability stack (Prometheus/Grafana)? (y/n): " START_OBS

if [ "$START_OBS" = "y" ]; then
    echo "Starting observability stack..."
    docker-compose -f docker-compose.observability.yml up -d
    echo -e "${GREEN}? Observability stack started${NC}"
    echo "  - Prometheus: http://localhost:9090"
    echo "  - Grafana: http://localhost:3001 (admin/admin)"
    echo "  - Loki: http://localhost:3100"
    echo "  - Tempo: http://localhost:3200"
else
    echo -e "${YELLOW}??  Skipped observability stack${NC}"
fi

# Step 3: Alerts Setup
echo ""
echo -e "${BLUE}Step 3: Alerting Configuration${NC}"
read -p "Configure Slack/PagerDuty alerts? (y/n): " SETUP_ALERTS

if [ "$SETUP_ALERTS" = "y" ]; then
    ./scripts/setup-alerts.sh
else
    echo -e "${YELLOW}??  Skipped alert configuration${NC}"
fi

# Step 4: Backup Configuration
echo ""
echo -e "${BLUE}Step 4: Backup Configuration${NC}"
echo "Configure backup storage:"
echo "1. Set BACKUP_BUCKET_URL (S3/GCS or local path)"
echo "2. Set BACKUP_ENCRYPTION_KEY (32+ characters)"
echo "3. Test backup: pnpm backup:run"
echo ""
read -p "Backup configured? (y/n): " BACKUP_CONFIG

if [ "$BACKUP_CONFIG" = "y" ]; then
    echo "Testing backup..."
    pnpm backup:run || echo -e "${RED}??  Backup test failed - review configuration${NC}"
else
    echo -e "${YELLOW}??  Backup configuration pending${NC}"
fi

# Step 5: Performance Baseline
echo ""
echo -e "${BLUE}Step 5: Performance Baseline${NC}"
read -p "Generate performance baseline? (y/n): " GEN_BASELINE

if [ "$GEN_BASELINE" = "y" ]; then
    echo "Generating performance baseline..."
    pnpm perf:baseline
    echo -e "${GREEN}? Baseline generated${NC}"
else
    echo -e "${YELLOW}??  Performance baseline skipped${NC}"
fi

# Step 6: Security Scans
echo ""
echo -e "${BLUE}Step 6: Security Validation${NC}"
read -p "Run security scans? (y/n): " RUN_SECURITY

if [ "$RUN_SECURITY" = "y" ]; then
    echo "Running security checks..."
    pnpm security:audit
    pnpm security:scan
    echo -e "${GREEN}? Security scans completed${NC}"
else
    echo -e "${YELLOW}??  Security scans skipped${NC}"
fi

# Step 7: Health Check
echo ""
echo -e "${BLUE}Step 7: Health Check${NC}"
read -p "Run health checks? (y/n): " RUN_HEALTH

if [ "$RUN_HEALTH" = "y" ]; then
    echo "Checking service health..."
    pnpm health:check || echo -e "${RED}??  Health check failed${NC}"
else
    echo -e "${YELLOW}??  Health check skipped${NC}"
fi

# Step 8: Evidence Bundle
echo ""
echo -e "${BLUE}Step 8: Audit Evidence Bundle${NC}"
read -p "Generate evidence bundle for audit? (y/n): " GEN_EVIDENCE

if [ "$GEN_EVIDENCE" = "y" ]; then
    echo "Generating evidence bundle..."
    pnpm evidence:bundle
    echo -e "${GREEN}? Evidence bundle generated${NC}"
else
    echo -e "${YELLOW}??  Evidence bundle skipped${NC}"
fi

# Summary
echo ""
echo -e "${GREEN}? Production Setup Summary${NC}"
echo "========================="
echo ""
echo "Completed:"
[ "$START_OBS" = "y" ] && echo "  ? Observability stack"
[ "$SETUP_ALERTS" = "y" ] && echo "  ? Alerting configured"
[ "$BACKUP_CONFIG" = "y" ] && echo "  ? Backup configured"
[ "$GEN_BASELINE" = "y" ] && echo "  ? Performance baseline"
[ "$RUN_SECURITY" = "y" ] && echo "  ? Security scans"
[ "$RUN_HEALTH" = "y" ] && echo "  ? Health checks"
[ "$GEN_EVIDENCE" = "y" ] && echo "  ? Evidence bundle"
echo ""
echo "Next Steps:"
echo "1. Review documentation: docs/RUNBOOKS.md"
echo "2. Schedule quarterly DR drills"
echo "3. Configure monitoring alerts"
echo "4. Set up on-call rotation"
echo "5. Begin SOC 2 Type II audit process"
echo ""
echo -e "${BLUE}?? Documentation:${NC}"
echo "  - Setup Guide: PRODUCTION_GRADE_IMPLEMENTATION_SUMMARY.md"
echo "  - Runbooks: docs/RUNBOOKS.md"
echo "  - DR/BCP: docs/DR_BCP.md"
echo "  - Incident Response: docs/INCIDENT_RUNBOOK.md"
echo "  - Audit Readiness: docs/AUDIT_READINESS_CHECKLIST.md"
echo ""