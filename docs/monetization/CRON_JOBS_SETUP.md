# Cron Jobs Setup Guide

## Automated Jobs for Monetization

### 1. Affiliate Payouts (Monthly)
**Path**: `/api/cron/affiliate-payouts`  
**Schedule**: First day of month at midnight  
**Purpose**: Process affiliate commission payouts

**Configuration**:
- Set `CRON_SECRET` in environment variables
- Configure in Vercel Cron (vercel.json included)
- Or use external cron service (cron-job.org, etc.)

### 2. Data Aggregation (Daily)
**Path**: `/api/cron/data-aggregation`  
**Schedule**: Daily at 2 AM  
**Purpose**: Aggregate and anonymize data for insights

**Configuration**:
- Same `CRON_SECRET` as above
- Automatically updates insight packages

## Vercel Setup

Already configured in `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/affiliate-payouts",
      "schedule": "0 0 1 * *"
    },
    {
      "path": "/api/cron/data-aggregation",
      "schedule": "0 2 * * *"
    }
  ]
}
```

## Manual Testing

```bash
# Test affiliate payouts
curl -H "Authorization: Bearer $CRON_SECRET" \
  https://your-domain.com/api/cron/affiliate-payouts

# Test data aggregation
curl -H "Authorization: Bearer $CRON_SECRET" \
  https://your-domain.com/api/cron/data-aggregation
```

**Status**: ✅ Pre-configured and ready!
