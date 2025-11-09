# Affiliate Marketing - Zero-Effort Setup Guide

## Overview
Affiliate marketing is **80% margin**, **low effort**, and **scales automatically** with your user base.

## Pre-Configured Setup ✅

### 1. Backend API (`/api/affiliate/*`)
- ✅ `/api/affiliate/register` - User registration
- ✅ `/api/affiliate/track` - Click/conversion tracking
- ✅ `/api/affiliate/commissions` - Commission calculation
- ✅ `/api/affiliate/dashboard` - Affiliate dashboard data

### 2. Database Schema
Already configured in Supabase:
- `affiliates` table
- `affiliate_clicks` table
- `affiliate_conversions` table
- `affiliate_commissions` table

### 3. Integration Points
- ✅ Automatic tracking on signup links
- ✅ Commission calculation on purchases
- ✅ Payout automation
- ✅ Dashboard UI ready

## How It Works

1. **User Signs Up as Affiliate** → Gets unique referral link
2. **Referral Clicks Link** → Tracked automatically
3. **Referral Makes Purchase** → Commission calculated
4. **Commission Paid** → Automated monthly payouts

## Revenue Calculation

```
Monthly Revenue = User Base × Conversion Rate × Average Order × Commission Rate
Example: 10,000 users × 5% × $20 × 10% = $1,000/month
```

## Zero-Effort Features

- ✅ **Automatic Link Generation** - Unique links for each affiliate
- ✅ **Click Tracking** - No code changes needed
- ✅ **Conversion Attribution** - Automatic commission calculation
- ✅ **Payout Automation** - Monthly automatic payments
- ✅ **Dashboard Ready** - Pre-built UI components

## Next Steps

1. **Enable in Admin Panel** → Toggle "Affiliate Marketing" ON
2. **Set Commission Rate** → Default 10% (configurable)
3. **Configure Payouts** → Connect Stripe for automatic payouts
4. **Done!** → System handles everything automatically

## API Usage

```typescript
// Register as affiliate (automatic on user signup if enabled)
POST /api/affiliate/register
{ userId: "user_123" }

// Track click (automatic via middleware)
POST /api/affiliate/track
{ affiliateId: "aff_123", referralId: "ref_456" }

// Get dashboard data
GET /api/affiliate/dashboard?userId=user_123
```

## Configuration

Set in environment variables:
```env
AFFILIATE_ENABLED=true
AFFILIATE_COMMISSION_RATE=10  # Percentage
AFFILIATE_COOKIE_DURATION=30  # Days
AFFILIATE_MIN_PAYOUT=50       # Minimum payout amount
```

**Status**: ✅ Ready to enable - Zero setup required!
