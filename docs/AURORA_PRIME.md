# 🌟 Aurora Prime Autopilot — Full-Stack Orchestrator

**Aurora Prime** is an autonomous full-stack orchestrator responsible for validating, healing, and deploying the entire application stack end-to-end across **GitHub → Supabase → Vercel → Expo** without requiring any local `.env` files.

## 🎯 Mission Objectives

### 1. Environment Verification
- Confirms repository uses GitHub Secrets for all sensitive configuration
- Validates that Supabase, Vercel, Expo, and GitHub Actions reference the same secrets consistently
- Automatically rewrites workflow files if mismatches are found

### 2. Supabase — Migration & Schema Health
- Pulls latest migrations
- Runs dry-run diff against live Supabase Postgres schema
- Creates missing tables, functions, RLS policies (never duplicates existing ones)
- Ensures Prisma (WASM engine) and database schema are aligned
- Creates fallback migrations for any drift detected
- Verifies tables, columns, indexes, triggers, RLS policies, and Edge Functions
- Confirms `supabase status` returns healthy

### 3. Vercel — Frontend Deployment Check
- Validates correct Vercel project is linked
- Confirms environment variables automatically sync from GitHub
- Detects if deployment points to wrong branch or project
- Fixes routing or environment mismatches
- Triggers fresh production deployment
- Verifies live deployment uses latest commit

### 4. Expo — Mobile App Deployment
- Confirms secrets and public URLs match Supabase
- Ensures EAS configuration references GitHub Secrets correctly
- Validates OTA updates are enabled
- Runs simulated build check
- Confirms schema compatibility across mobile → backend

### 5. CI/CD Pipeline Autopilot
- Detects broken GitHub Actions workflows
- Patches missing permissions, triggers, or tokens
- Adds safety checks:
  - Schema drift detection
  - Deploy confirmation
  - Rollback guardrails
- Adds automated "Doctor" job that:
  - Runs Prisma validate
  - Checks Supabase schema
  - Ensures Vercel targets correct project
  - Confirms Expo configs

### 6. Self-Healing Logic
At any sign of:
- Deployment mismatch
- Branch misalignment
- Secret inconsistency
- Missing tables
- Invalid schema
- Edge function failure
- Mobile config drift

Aurora Prime creates a fix, applies it, documents the change, and re-runs the check.

## 🚀 Usage

### Run Aurora Prime Autopilot

```bash
pnpm aurora:prime
```

Or directly:

```bash
pnpm tsx scripts/aurora-prime-autopilot.ts
```

### In CI/CD

The Aurora Prime Doctor workflow runs automatically:
- Every 6 hours on schedule
- On push to `main` branch
- Manually via `workflow_dispatch`

## 📋 Required GitHub Secrets

Ensure these secrets are configured in your GitHub repository:

### Core Supabase
- `SUPABASE_URL` - Full Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (admin access)
- `SUPABASE_ANON_KEY` - Anonymous/public key
- `NEXT_PUBLIC_SUPABASE_URL` - Public Supabase URL (for web)
- `EXPO_PUBLIC_SUPABASE_URL` - Public Supabase URL (for mobile)
- `SUPABASE_PROJECT_REF` - Project reference ID
- `SUPABASE_DB_URL` - Direct database connection string

### Vercel
- `VERCEL_TOKEN` - Vercel API token
- `VERCEL_ORG_ID` - Vercel organization ID
- `VERCEL_PROJECT_ID` - Vercel project ID
- `VERCEL_PROJECT_DOMAIN` - Production domain (optional)

### Expo
- `EXPO_TOKEN` - Expo access token
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key for mobile (optional, falls back to SUPABASE_ANON_KEY)
- `APPLE_ID` - Apple Developer account (for iOS submission)
- `APPLE_APP_SPECIFIC_PASSWORD` - Apple app-specific password
- `GOOGLE_SERVICE_ACCOUNT_JSON` - Google service account JSON (for Android submission)

## 📊 Output Format

Every run ends with a comprehensive status report:

```
🌟 AURORA PRIME — FULL SYSTEM STATUS
════════════════════════════════════════════════════════════
Supabase:              [Healthy / FIXED / Needs Attention]
Vercel Deployment:     [Healthy / FIXED / Needs Attention]
Expo (iOS/Android):    [Healthy / FIXED / Needs Attention]
GitHub Actions:        [Healthy / FIXED / Needs Attention]
Secrets Alignment:     [Healthy / FIXED / Needs Attention]
Schema Drift:          [None / Auto-repaired / Needs Manual Review]
════════════════════════════════════════════════════════════

🔧 AUTO-REPAIRS APPLIED:
  ✅ Created Doctor workflow at .github/workflows/aurora-prime-doctor.yml

⚠️  ISSUES DETECTED:
  • Issue description here

📋 RECOMMENDED NEXT ACTIONS:
  • Action item 1
  • Action item 2
```

## 🔧 Rules of Operation

1. **Never asks the user questions** — decides and fixes autonomously
2. **Never generates placeholder code** — produces production-ready patches only
3. **Never duplicates schema objects** — creates only what's missing
4. **Assumes Termux is not used** for this workflow
5. **If something is already configured correctly** → verifies and confirms it
6. **If something is broken** → repairs it
7. **Every run is a full-stack smoke test**

## 🏗️ Architecture

### Core Components

1. **AuroraPrime Class** (`scripts/aurora-prime-autopilot.ts`)
   - Main orchestrator
   - Coordinates all validation and repair operations
   - Generates comprehensive status reports

2. **Doctor Workflow** (`.github/workflows/aurora-prime-doctor.yml`)
   - Automated CI/CD health checks
   - Runs Prisma validation
   - Checks Supabase schema
   - Verifies Vercel and Expo configurations

3. **Enhanced Workflows**
   - Mobile workflow includes Supabase environment variables
   - Supabase delta workflow uses consistent secret names
   - All workflows reference GitHub Secrets consistently

## 🔍 Validation Checks

### Environment Verification
- Scans all GitHub workflow files
- Verifies required secrets are referenced
- Checks for consistent secret naming

### Supabase Health
- Validates `config.toml` exists
- Counts migration files
- Checks Prisma schema (WASM engine)
- Verifies Edge Functions structure
- Attempts Supabase CLI validation

### Vercel Health
- Validates `vercel.json` configuration
- Checks deployment workflow secrets
- Verifies web app directory structure

### Expo Health
- Validates `app.json` and `eas.json`
- Checks OTA updates configuration
- Verifies mobile workflow secrets
- Ensures Supabase URL is configured

### CI/CD Health
- Scans all workflow files
- Checks for Doctor job
- Validates secret references
- Creates missing Doctor workflow if needed

### Secrets Alignment
- Maps secret usage across workflows
- Detects inconsistencies
- Identifies missing secret references

### Schema Drift
- Checks for drift detection in Supabase CI
- Counts migration files
- Validates migration structure

## 🛠️ Self-Healing Capabilities

Aurora Prime automatically:

1. **Creates missing workflows** (e.g., Doctor job)
2. **Fixes secret references** in workflows
3. **Adds missing environment variables** to build steps
4. **Standardizes secret names** across workflows
5. **Documents all changes** in status report

## 📝 Integration with Existing Tools

Aurora Prime integrates with:

- **Prisma** - Validates schema and generates client
- **Supabase CLI** - Checks schema and applies migrations
- **Vercel CLI** - Validates project configuration
- **EAS CLI** - Checks Expo configuration
- **GitHub Actions** - Validates and fixes workflows

## 🚨 Troubleshooting

### Aurora Prime reports "Needs Attention"

1. Check the issues list in the status report
2. Review recommended actions
3. Run the suggested commands
4. Re-run Aurora Prime to verify fixes

### Secrets not found

1. Verify secrets are set in GitHub repository settings
2. Check secret names match exactly (case-sensitive)
3. Ensure secrets are available to workflows (not restricted by environment)

### Schema drift detected

1. Review the drift summary
2. Generate a new migration: `supabase db diff --use-migra -f migration_name`
3. Review and commit the migration
4. Re-run Aurora Prime

## 🔐 Security

- **No local `.env` files** - All secrets originate from GitHub
- **Read-only validation** - Aurora Prime doesn't modify production data
- **Dry-run migrations** - Schema checks don't apply changes
- **Secret validation** - Ensures secrets are referenced, not exposed

## 📚 Related Documentation

- [GitHub Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Supabase Migrations](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Expo EAS Build](https://docs.expo.dev/build/introduction/)

## 🎯 Primary Directive

**Ensure the entire system works as if a senior engineer manually validated everything, every time.**

- If a link is broken → fix it
- If a mismatch exists → unify it
- If a drift is detected → migrate it
- If deployment fails → redeploy
- If a config is missing → write it
- If a dependency is outdated → update it
- If no issues are found → prove it with logs

---

**Aurora Prime Autopilot** — Autonomous Full-Stack Orchestration
