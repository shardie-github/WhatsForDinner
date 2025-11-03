# Nomad Monorepo Wiring Verification System

## Overview

A comprehensive connectivity verification system that proves every subsystem in the Nomad monorepo is actually connected and talking in reality.

## What Was Created

### 1. Wiring Harness (`tools/wiring/harness.ts`)
- Orchestrates full connectivity tests
- Checks: Environment, Health, Auth/RLS, Consent/Ads/Analytics, Core Product, Payments, Partner Network, Growth, Compliance, Jobs
- Generates JSON and Markdown reports
- Exit codes: 1 if failures, 0 if all pass/degraded

### 2. Wire Doctor (`tools/wiring/wire_doctor.ts`)
- Auto-fixes common miswires:
  - CSRF/CSRF headers missing
  - Missing env binding
  - GPT/AdMob disabled without consent
  - Fallbacks to house-ads/noop analytics
  - RLS policy gaps (suggests with diffs/migration files)

### 3. Environment Inventory (`tools/wiring/env_inventory.ts`)
- Scans codebase for env var usage
- Detects dead/unused secrets
- Reports required vs optional vars
- Identifies missing required vars

### 4. Contract Tests (`packages/testing/contracts/openapi.validate.spec.ts`)
- Validates runtime routes vs expected status codes
- Checks CSRF/CORS headers
- Flags 404/401 mismatches

### 5. E2E Tests
- **Web** (`packages/testing/e2e/wiring.web.spec.ts`): Playwright tests for full product loop
- **Jobs** (`packages/testing/e2e/jobs.spec.ts`): Queue/job verification
- **Mobile** (planned): Detox tests for mobile parity

### 6. Synthetic Fixtures (`packages/testing/fixtures/synthetic.ts`)
- Test users (A/B/C with different roles and plans)
- Partner sandbox configuration
- Sample SKUs, referral codes, coupons, paywall variants
- Consent states for testing

### 7. Sandbox Webhook Receivers
- `/api/_sandbox/partner-webhook`: Partner conversion webhook receiver with HMAC verification
- `/api/_sandbox/payments-webhook`: Stripe webhook receiver with signature verification
- Both store evidence snapshots

### 8. CI Workflow (`.github/workflows/wiring-check.yml`)
- Runs on push/PR to main/develop
- Daily schedule (2 AM UTC)
- Spins up Postgres + Redis services
- Runs all checks and uploads reports
- Comments on PRs with results

### 9. Developer Dashboard (`apps/web/app/admin/(console)/wiring/page.tsx`)
- Renders Connectivity Matrix
- Shows last run, failing checks
- Quick links to PRs/logs
- Status badge at `/wiring-status.json`

## Usage

### Local Setup

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Run environment inventory:**
   ```bash
   pnpm wiring:inventory
   ```

3. **Run wire doctor (auto-fix issues):**
   ```bash
   pnpm wiring:doctor
   ```

4. **Run full wiring harness:**
   ```bash
   pnpm wiring:run
   ```

5. **Run contract tests:**
   ```bash
   pnpm wiring:contracts
   ```

6. **Run E2E tests:**
   ```bash
   # Web (requires web server running)
   cd apps/web
   pnpm playwright test packages/testing/e2e/wiring.web.spec.ts
   
   # Jobs
   pnpm wiring:test:jobs
   ```

### View Reports

- **JSON Matrix**: `reports/connectivity/connectivity.json`
- **Markdown Report**: `reports/connectivity/wiring_report.md`
- **Environment Inventory**: `reports/connectivity/env_inventory.md`
- **Evidence Logs**: `reports/connectivity/evidence/`
- **Dashboard**: http://localhost:3000/admin/wiring

## Exit Criteria

- ? All RED ? GREEN or PRs opened with test coverage
- ? CI green (wiring-check is a required status check)
- ? Dashboard shows "All Connected"

## Safety & Fallbacks

- If third-party SDKs disallow headless use, stub via official mocks or local emulators
- If env vars are intentionally absent, switch adapter to `noop`/`house` and mark **degraded mode**
- Production secrets are never printed raw; masked fingerprints shown

## Next Steps

1. **Install dependencies**: `pnpm install`
2. **Run harness**: `pnpm wiring:run`
3. **Review failures**: Check `reports/connectivity/wiring_report.md`
4. **Apply fixes**: Use `pnpm wiring:doctor` or manual fixes
5. **Re-run**: Verify all checks pass
6. **Enable CI gate**: Add `wiring-check` as required status check on `main` branch

## Architecture Notes

The wiring system follows the "Golden Rule": Execute real end-to-end checks with synthetic users and transactions. If a dependency or secret is missing:
1. Fall back to a safe mock or local emulator
2. Document the delta
3. Open a fix PR

No placeholders are accepted - everything must be verifiable with evidence.
