#!/bin/bash

# Setup script for Slack and PagerDuty integrations

set -e

echo "?? Setting up Alerting Integrations"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}??  .env.local not found. Creating from .env.example...${NC}"
    cp .env.example .env.local
    echo -e "${GREEN}? Created .env.local${NC}"
fi

# Slack Webhook Setup
echo ""
echo "?? Slack Webhook Setup"
echo "1. Go to: https://api.slack.com/apps"
echo "2. Create a new app or select existing app"
echo "3. Go to 'Incoming Webhooks' and activate"
echo "4. Click 'Add New Webhook to Workspace'"
echo "5. Select #incidents channel (or create it)"
echo "6. Copy the webhook URL"
echo ""
read -p "Enter Slack webhook URL (or press Enter to skip): " SLACK_WEBHOOK

if [ ! -z "$SLACK_WEBHOOK" ]; then
    # Update .env.local
    if grep -q "SLACK_ALERT_WEBHOOK" .env.local; then
        sed -i.bak "s|SLACK_ALERT_WEBHOOK=.*|SLACK_ALERT_WEBHOOK=$SLACK_WEBHOOK|" .env.local
    else
        echo "SLACK_ALERT_WEBHOOK=$SLACK_WEBHOOK" >> .env.local
    fi
    echo -e "${GREEN}? Slack webhook configured${NC}"
else
    echo -e "${YELLOW}??  Slack webhook skipped${NC}"
fi

# PagerDuty Setup
echo ""
echo "?? PagerDuty Integration Setup"
echo "1. Go to: https://www.pagerduty.com/"
echo "2. Navigate to: Integrations > API > Services"
echo "3. Create a new service or select existing"
echo "4. Add 'Events API v2' integration"
echo "5. Copy the Integration Key (not the Service Key)"
echo ""
read -p "Enter PagerDuty Integration Key (or press Enter to skip): " PD_KEY

if [ ! -z "$PD_KEY" ]; then
    # Update .env.local
    if grep -q "PAGERDUTY_API_KEY" .env.local; then
        sed -i.bak "s|PAGERDUTY_API_KEY=.*|PAGERDUTY_API_KEY=$PD_KEY|" .env.local
    else
        echo "PAGERDUTY_API_KEY=$PD_KEY" >> .env.local
    fi
    echo -e "${GREEN}? PagerDuty API key configured${NC}"
else
    echo -e "${YELLOW}??  PagerDuty integration skipped${NC}"
fi

# Update alertmanager.yml if needed
echo ""
echo "?? Updating alertmanager.yml..."
if [ ! -z "$SLACK_WEBHOOK" ]; then
    # Note: alertmanager.yml uses env var substitution, so this is already handled
    echo -e "${GREEN}? Alertmanager will use SLACK_ALERT_WEBHOOK from environment${NC}"
fi

echo ""
echo -e "${GREEN}? Alert setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Test Slack webhook:"
echo "   curl -X POST \$SLACK_ALERT_WEBHOOK -d '{\"text\":\"Test alert\"}'"
echo ""
echo "2. Start observability stack:"
echo "   docker-compose -f docker-compose.observability.yml up -d"
echo ""
echo "3. Configure Grafana:"
echo "   - Open http://localhost:3001"
echo "   - Login: admin / admin (change password)"
echo "   - Import dashboards from grafana/dashboards/"