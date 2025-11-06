# Complete Setup Guide

## Overview

This guide covers all setup steps based on the execution reports.

## Prerequisites

- Node.js 18+ (currently: v22.21.1)
- pnpm 8+ (currently: 9.0.0)
- Supabase account and project
- Vercel account (optional, for deployment)

## Step 1: Install Dependencies

```bash
# Install all dependencies
pnpm install

# Install optional dependencies
npm install -g markdownlint-cli  # For markdown linting
```

## Step 2: Database Migration

See `DATABASE_MIGRATION_GUIDE.md` for detailed instructions.

Quick start:
1. Run migration SQL in Supabase Dashboard
2. Or use: `supabase db push`

## Step 3: Configure Environment Variables

```bash
# Copy example file
cp .env.example .env.local

# Set required variables
export NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
export SUPABASE_DB_URL="postgresql://..."

# Optional: Vercel
export VERCEL_TOKEN="your-vercel-token"
export VERCEL_PROJECT_ID="your-project-id"
```

## Step 4: Run Secrets Migration

```bash
# Preview migration
npm run secrets:migrate:dry-run

# Execute migration
npm run secrets:migrate

# Sync to Vercel
npm run secrets:sync
```

## Step 5: Verify Setup

```bash
# Run health checks
npm run health:check

# Run all checks
npm run check:all

# Verify secrets
npm run secrets:validate NEXT_PUBLIC_SUPABASE_URL SUPABASE_SERVICE_ROLE_KEY
```

## Step 6: Improve Test Coverage

Current coverage: 5% (target: 80%)

```bash
# Analyze coverage
node scripts/improve-test-coverage.mjs

# Review action plan
cat TEST_COVERAGE_ACTION_PLAN.json

# Add tests for critical paths
# (See recommendations in action plan)
```

## Step 7: Run Quality Checks

```bash
# Lint markdown
npm run docs:lint

# Scan for secrets
npm run secrets:scan

# Check supply chain
npm run supply-chain:audit

# Run all checks
npm run check:all
```

## Troubleshooting

### Missing Dependencies
If you see errors about missing packages:
```bash
pnpm install
```

### Database Connection Issues
- Verify SUPABASE_DB_URL is correct
- Check Supabase project is active
- Ensure service role key has proper permissions

### Secrets Migration Issues
- Verify all environment variables are set
- Check Supabase secrets_vault table exists
- Review migration logs in SECRETS_MIGRATION_REPORT.json

## Next Steps

1. ✅ Database migration completed
2. ✅ Environment variables configured
3. ✅ Secrets migrated to Supabase/Vercel
4. ✅ Test coverage improved
5. ✅ Quality checks passing

## Support

- Review execution reports: `SCRIPTS_EXECUTION_REPORT.md`
- Check remediation plans: `SECRETS_REMEDIATION_REPORT.json`
- Review test coverage plan: `TEST_COVERAGE_ACTION_PLAN.json`
