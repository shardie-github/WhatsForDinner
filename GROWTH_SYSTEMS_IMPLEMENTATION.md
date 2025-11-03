# Growth Systems Implementation Summary

This document describes the production-grade growth systems implemented for the Nomad monorepo.

## Overview

The implementation includes:
- **CRM Adapters** (SendGrid + Klaviyo switchable)
- **Email/Push/In-App Journey Orchestration**
- **Privacy-Safe Attribution**
- **Referrals & Promo Codes**
- **Experiments/A-B Framework** (client + server)
- **Pricing/Paywall/Offer Tests**
- **Growth Analytics & Guardrails**

## Files Created

### Database & Schema
- `packages/server/db/migrations/0002_growth_systems.sql` - Full migration with RLS
- Updated `packages/server/src/db/schema.ts` - Drizzle schema definitions

### CRM Adapters
- `packages/adapters/crm/sendgrid.ts` - SendGrid adapter
- `packages/adapters/crm/klaviyo.ts` - Klaviyo adapter
- `packages/adapters/crm/noop.ts` - Disabled mode adapter
- `packages/adapters/crm/types.ts` - Type definitions
- `packages/adapters/crm/index.ts` - Factory pattern
- `packages/adapters/crm/package.json` - Package dependencies

### Core Services
- `packages/server/src/experiments/service.ts` - Experiment assignment, exposure tracking, guardrails
- `packages/server/src/journeys/engine.ts` - Journey orchestration engine with built-in journeys

### API Routes
- `packages/server/src/routes/referrals.ts` - Referrals API (code, track, claim, me)
- `packages/server/src/routes/paywall.ts` - Paywall config with A/B testing
- `packages/server/src/routes/experiments.ts` - Experiments API (assignments, exposure)

### Jobs & Workers
- `packages/server/src/jobs/journeysRunner.ts` - Journey processor
- `packages/server/src/jobs/digestRunner.ts` - Weekly digest composer
- `packages/server/src/jobs/anomalyGuard.ts` - Guardrail monitor
- `packages/server/src/jobs/priceRollout.ts` - Pricing/promo activator
- Updated `packages/server/src/queue/index.ts` - Added new job types

### Email Templates
- `apps/web/emails/Welcome.tsx` - Welcome email
- `apps/web/emails/WeeklyDigest.tsx` - Weekly digest
- `apps/web/emails/PremiumUpsell.tsx` - Premium upsell
- `apps/web/emails/Winback.tsx` - Winback campaign
- `apps/web/emails/ReferralInvite.tsx` - Referral invite
- `apps/web/emails/Receipt.tsx` - Receipt/invoice

### Client-Side
- `packages/data/src/experiments.ts` - React hooks for experiments
- `packages/ui/MessageCenter/index.tsx` - In-app message center component

### Tests
- `packages/server/src/testing/referrals.spec.ts` - Referrals API tests
- `packages/server/src/testing/paywall.spec.ts` - Paywall API tests

## Environment Variables

Add to `.env.example` and your environment:

```bash
# CRM Provider
CRM_PROVIDER=sendgrid  # or 'klaviyo' or 'noop'

# SendGrid
SENDGRID_API_KEY=SG.xxx
SENDGRID_FROM=no-reply@nomad.app
SENDGRID_FROM_NAME=Nomad

# Klaviyo
KLAVIYO_API_KEY=xxx
KLAVIYO_LIST_ID=xxx

# Deep Links
BRANCH_OR_DEEPLINK_BASE=https://nomad.app/r

# Experiments
EXPERIMENTS_KILL_SWITCH=false  # Set to 'true' to enable guardrail auto-pause
```

## Setup Instructions

### 1. Database Migration

Run the migration to create all growth tables:

```bash
cd packages/server
pnpm db:migrate
```

Or manually apply:
```bash
psql $DATABASE_URL -f db/migrations/0002_growth_systems.sql
```

### 2. Install Dependencies

```bash
# Root
pnpm install

# CRM adapter needs @sendgrid/mail (already in server package.json)
# Client-side needs @tanstack/react-query for experiments hook
```

### 3. Configure CRM Provider

Set `CRM_PROVIDER` env var and configure credentials for your chosen provider.

### 4. Start Queue Workers

```bash
# Start the queue worker
pnpm queue:worker

# Or run individual job types:
# - journeys: Every 15 min
# - digest_weekly: Weekly on Sunday 08:00
# - anomaly_guard: Hourly
# - price_rollout: Hourly
```

## Usage Examples

### Seed a Sample Referral Program

```sql
INSERT INTO referral_programs (slug, active, reward_sender, reward_receiver)
VALUES (
  'default',
  true,
  '{"type": "trial_days", "value": 7}'::jsonb,
  '{"type": "trial_days", "value": 7}'::jsonb
);
```

### Start an Experiment

```sql
-- Create experiment
INSERT INTO experiments (key, description, status, primary_metric, guardrail_metrics)
VALUES (
  'exp_paywall_2025q4',
  'Paywall variant test',
  'running',
  'conversion_rate',
  '["crash_rate", "purchase_rate"]'::jsonb
);

-- Add variants
INSERT INTO experiment_variants (experiment_id, key, weight, meta)
VALUES
  ((SELECT id FROM experiments WHERE key = 'exp_paywall_2025q4'), 'control', 50, '{}'::jsonb),
  ((SELECT id FROM experiments WHERE key = 'exp_paywall_2025q4'), 'variant_a', 50, '{"type": "value_stack"}'::jsonb);
```

### Create a Referral Code

```typescript
// POST /api/referrals/code
{
  "program_slug": "default"
}

// Response:
{
  "code": "ABC12345",
  "program_id": "uuid"
}
```

### Track Referral Click

```typescript
// POST /api/referrals/track
{
  "code": "ABC12345",
  "referee_email": "friend@example.com",
  "anon_id": "anon_xxx"  // optional
}
```

### Claim Referral on Signup

```typescript
// POST /api/referrals/claim
{
  "code": "ABC12345",
  "referee_user_id": "uuid",  // or referee_email
  "referee_email": "friend@example.com"
}

// Response includes applied_offer if eligible
```

### Get Paywall Config

```typescript
// GET /api/paywall/config?platform=web&country=US&plan=monthly
{
  "variant": "control",
  "config": {
    "type": "value_stack",
    "props": { ... }
  },
  "pricing": {
    "price_cents": 999,
    "currency": "USD",
    "plan": "monthly"
  },
  "activeOffer": null,
  "experimentKey": "exp_paywall_2025q4"
}
```

### Use Experiment Hook (Client)

```typescript
import { useExperiment } from '@whats-for-dinner/data/experiments';

function MyComponent() {
  const { variant, meta, trackExposure } = useExperiment('exp_paywall_2025q4', {
    userId: user?.id,
    autoTrack: true,
  });

  useEffect(() => {
    if (variant === 'variant_a') {
      // Show variant A UI
    }
  }, [variant]);

  return <div>Variant: {variant}</div>;
}
```

### Trigger Journey Manually (Admin)

```typescript
import { triggerJourneyStep } from '../journeys/engine';

await triggerJourneyStep(
  userId,
  'onboarding',
  'welcome'
);
```

## Built-In Journeys

1. **Onboarding Activation**
   - D0: Welcome email
   - D2: Planner tips
   - D4: First week plan nudge

2. **Premium Upsell**
   - After 3 plan generations: contextual upsell
   - 3 days later: paywall email if not converted

3. **Churn Save**
   - Detects downgrade/intended cancel ? offers trial days or % off

4. **Winback**
   - 7-14 days inactive users ? "restart with new recipes"

## Worker Commands

```bash
# Journeys runner (every 15 min)
pnpm queue:worker --job journeys

# Weekly digest (Sunday 08:00)
pnpm queue:worker --job digest_weekly

# Anomaly guard (hourly)
pnpm queue:worker --job anomaly_guard

# Price rollout (hourly)
pnpm queue:worker --job price_rollout
```

Or schedule via cron:

```bash
# Add to crontab
*/15 * * * * cd /app && pnpm queue:worker --job journeys
0 8 * * 0 cd /app && pnpm queue:worker --job digest_weekly
0 * * * * cd /app && pnpm queue:worker --job anomaly_guard
0 * * * * cd /app && pnpm queue:worker --job price_rollout
```

## Email Template Preview

To preview email templates in dev:

```bash
cd apps/web
# Install @react-email/components if not already
pnpm add @react-email/components

# Use React Email CLI or Next.js API route to render
# Example API route: /api/emails/preview/[template]
```

## Testing

```bash
# Run tests
cd packages/server
pnpm test

# Specific test file
pnpm test referrals.spec.ts
pnpm test paywall.spec.ts
```

## API Endpoints Summary

- `POST /api/referrals/programs` - Create referral program (admin)
- `POST /api/referrals/code` - Generate referral code
- `POST /api/referrals/track` - Track referral click
- `POST /api/referrals/claim` - Claim referral on signup/purchase
- `GET /api/referrals/me` - Get user referral stats
- `GET /api/paywall/config` - Get paywall config with variant
- `POST /api/paywall/impression` - Track paywall view
- `POST /api/paywall/cta` - Track paywall CTA click
- `GET /api/experiments/assignments` - Batch fetch assignments
- `POST /api/experiments/exposure` - Track experiment exposure
- `POST /api/subscribe` - Email subscription (to be implemented)
- `POST /api/journeys/trigger` - Manual journey trigger (admin, to be implemented)
- `POST /api/offer/apply` - Apply promo offer (to be implemented)

## Next Steps

1. **Attribution System**: Implement client-side UTM capture (see `packages/data/src/attribution.ts` - to be created)
2. **Push Notifications**: Integrate Expo Notifications for mobile
3. **In-App Messages**: Connect MessageCenter to backend API
4. **Paywall Screens**: Implement `apps/web/app/paywall/page.tsx` and `apps/mobile/src/screens/Paywall.tsx`
5. **Referrals Screen**: Create UI for sharing referral codes
6. **Metrics Dashboard**: Build growth analytics dashboard
7. **E2E Tests**: Add Playwright/Detox tests for full flows

## Notes

- All operations are idempotent where applicable
- Consent gating respected throughout
- Privacy-by-default (no device fingerprinting)
- RLS policies enforce user ownership
- Sticky experiment assignments prevent flickering
- Guardrails auto-pause experiments if thresholds breached
