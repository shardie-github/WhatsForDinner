# Stack Credentials Sharing Guide

## Overview

This guide explains how to identify and share credentials between staging and production stacks.

## What Credentials Should Be Shared?

Some credentials should be **shared** between staging and production:
- Webhook secrets (for cross-environment webhook handling)
- Link signing secrets (for deep links)
- Admin JWT secrets (for admin panel access)
- DSAR verification secrets (for privacy compliance)
- Backup encryption keys (for disaster recovery)

Other credentials should be **separate** per environment:
- Supabase project URLs and keys (different projects per environment)
- Vercel project IDs (different projects per environment)
- Stripe keys (test vs live mode)
- Analytics keys (separate tracking per environment)

## Using the Credential Identification Tool

### Basic Usage

```bash
# Identify missing credentials (dry-run mode)
pnpm ops identify-stack-credentials

# Or use the alias
pnpm ops stack-creds
```

### Auto-Sharing Credentials

If you have `VERCEL_TOKEN` and `VERCEL_PROJECT_ID` set, you can attempt automatic sharing:

```bash
# Attempt to auto-share credentials via Vercel API
pnpm ops identify-stack-credentials --auto-share
```

**Note**: Auto-sharing requires:
- `VERCEL_TOKEN` - Your Vercel API token
- `VERCEL_PROJECT_ID` - Your Vercel project ID

### Output

The tool generates:
1. **Console output** - Shows missing credentials and their status
2. **Markdown report** - Saved to `ops/secrets/stack-credentials-report.md`

## Manual Credential Sharing

### Via Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com)
2. Select your project
3. Go to **Settings** > **Environment Variables**
4. For each missing credential:
   - Click **Add Environment Variable**
   - Enter the credential name
   - Paste the value from the source environment
   - Select the target environment (Production, Preview, or Development)
   - Click **Save**

### Via Vercel CLI

```bash
# Set an environment variable for production
vercel env add STRIPE_WEBHOOK_SECRET production

# Set for preview (staging)
vercel env add STRIPE_WEBHOOK_SECRET preview

# Set for all environments
vercel env add STRIPE_WEBHOOK_SECRET production preview development
```

### Via Supabase Dashboard

For Supabase-specific credentials (if applicable):

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** > **API**
4. Copy the relevant keys
5. Set them in Vercel environment variables for the target environment

## Credential Categories

### Always Shared Credentials

These should have the **same value** in both staging and production:

- `STRIPE_WEBHOOK_SECRET` - Stripe webhook verification
- `WEBHOOK_SECRET_PARTNER` - Partner webhook verification
- `WEBHOOK_SECRET_PAYMENTS` - Payment webhook verification
- `PARTNER_CONVERSION_HMAC_SECRET` - Partner conversion tracking
- `LINK_SIGNING_SECRET` - Deep link signing
- `DSAR_VERIFICATION_JWT_SECRET` - Privacy compliance
- `ADMIN_JWT_SECRET` - Admin panel authentication
- `ARTIFACTS_BUCKET_SIGNING_KEY` - Evidence storage signing
- `BACKUP_ENCRYPTION_KEY` - Backup encryption
- `EXCHANGE_RATE_API_KEY` - Exchange rate API (if shared)
- `GEOIP_LICENSE_KEY` - GeoIP detection (if shared)

### Environment-Specific Credentials

These should have **different values** per environment:

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `SUPABASE_DB_URL` - Database connection URL
- `VERCEL_TOKEN` - Vercel API token
- `VERCEL_PROJECT_ID` - Vercel project ID
- `STRIPE_SECRET_KEY` - Stripe secret (test vs live)
- `STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `NEXT_PUBLIC_APP_URL` - Application URL
- `CORS_ORIGINS` - CORS allowed origins

## Troubleshooting

### Credential Not Found

If a credential is missing from both environments:
1. Check if it's required (see `.env.example`)
2. Generate a new value if needed
3. Set it in both environments

### Auto-Share Fails

If auto-sharing fails:
1. Check that `VERCEL_TOKEN` is valid
2. Check that `VERCEL_PROJECT_ID` is correct
3. Verify you have permissions to modify environment variables
4. Use manual method instead

### Value Already Exists

If a credential already exists in the target environment:
- The tool will attempt to update it
- If update fails, manually update via Vercel dashboard

## Security Best Practices

1. **Never commit secrets** to version control
2. **Use encrypted storage** for environment variables
3. **Rotate secrets regularly** using `pnpm ops rotate-secrets`
4. **Use different keys** for test vs production when applicable
5. **Limit access** to who can view/modify credentials

## Regular Maintenance

Run this check regularly (e.g., weekly or before major deployments):

```bash
# Check for missing credentials
pnpm ops identify-stack-credentials

# Review the generated report
cat ops/secrets/stack-credentials-report.md
```

## Related Commands

```bash
# Rotate secrets
pnpm ops rotate-secrets

# Health check
pnpm ops doctor

# Security audit
pnpm security:audit
```
