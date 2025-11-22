# CI & Code Cleanup Audit Report
**Staff Engineer + Platform Reliability Lead Assessment**

**Date:** 2025-01-27  
**Scope:** Complete CI/CD pipeline rationalization and code structure cleanup  
**Goal:** Every PR to main runs a small, clear set of checks that almost always pass unless there is a real bug.

---

## A. CODE & STRUCTURE SNAPSHOT

### Repository Structure

**Monorepo Type:** Turborepo-based monorepo with pnpm workspaces

**Top-Level Directories:**
- `apps/` - 7 applications (web, mobile, api-docs, chef-marketplace, community-portal, referral)
- `packages/` - Shared packages (server, ui, utils, theme, config, adapters, analytics, testing)
- `scripts/` - 167 utility scripts (many overlapping responsibilities)
- `agents/` - 12 agent files (unified-agent, reliability-agent, etc.)
- `ops/` - Operations tooling (84 files)
- `tools/` - Development tools
- `tests/` - Test files (12 files, minimal coverage)
- `supabase/` - Database migrations and functions
- `prisma/` - Prisma schema and migrations
- `infra/` - Infrastructure as code (Terraform)
- `docs/`, `DOCS/`, `REPORTS/` - Documentation (multiple overlapping directories)

**Key Findings:**
1. **Massive script sprawl**: 167 scripts in `scripts/` directory with unclear ownership
2. **Duplicate documentation**: `docs/`, `DOCS/`, `REPORTS/` all contain markdown files
3. **Inconsistent naming**: Mix of kebab-case, camelCase, and snake_case across directories
4. **Agent pattern unclear**: `agents/` directory has 12 files but unclear how they're orchestrated
5. **Test structure fragmented**: Tests exist in `packages/server/src/__tests__/`, `tests/`, `packages/testing/`, and inline with source

### Code Quality Patterns

**Strengths:**
- TypeScript strict mode enabled
- Monorepo structure with clear package boundaries
- Turbo pipeline configured for caching

**Issues:**
1. **Multiple ESLint configs**: 8 different `eslint.config.*` files across apps/packages
2. **Inconsistent import styles**: Mix of relative imports, `@/*` aliases, and package imports
3. **Dead code indicators**: `ts-prune`, `knip`, `depcheck` scripts exist but reports show unused exports
4. **Package.json script sprawl**: 225+ npm scripts, many overlapping (e.g., `test`, `test:ci`, `test:coverage`, `test:watch`)

---

## B. CI & CHECKS SNAPSHOT

### Workflow Inventory

**Total Workflows:** 58 YAML files in `.github/workflows/`

**Workflow Categories:**

#### Core CI (Overlapping):
- `ci.yml` - Main CI with test, lint, type-check, build, smoke tests
- `ci-cd.yml` - Full pipeline with lint, type-check, test, build, deploy
- `build.yml` - Build and test (duplicates ci.yml functionality)
- `pre-merge-validation.yml` - Pre-merge checks (runs same checks as ci.yml)
- `quality-gates.yml` - Quality gates (duplicates type-check + test)

#### Testing (Redundant):
- `test-coverage-gate.yml` - Coverage threshold check
- `e2e.yml` - E2E smoke tests
- `architectural-integrity-tests.yml` - Architecture tests
- `integration-audit.yml` - Integration tests
- `api-contract-testing.yml` - API contract tests

#### Security (Multiple Scans):
- `security.yml` - Comprehensive security (Snyk, CodeQL, SBOM, Trivy, Gitleaks, OWASP ZAP, OPA)
- `secrets-scan.yml` - Secret scanning (duplicates security.yml)
- `trust.yml` - Trust/audit checks

#### Code Quality (Overlapping):
- `code-hygiene.yml` - Type-check, lint, unused exports, depcheck
- `wiring-check.yml` - Connectivity verification

#### Deployment (Multiple):
- `deploy.yml` - Generic deployment
- `deploy-main.yml` - Main branch deployment
- `deploy-web.yml` - Web app deployment
- `canary-deploy.yml` - Canary deployment
- `vercel-promotion.yml` - Vercel promotion workflow
- `vercel-guard.yml` - Vercel guard checks
- `release-pipeline.yml` - Release pipeline
- `final_assurance_release.yml` - Final release checks

#### Scheduled/Nightly (Should NOT run on PRs):
- `nightly-drift-report.yml` - Architectural drift (scheduled)
- `nightly-etl.yml` - ETL jobs (scheduled)
- `watcher-cron.yml` - Watcher cron jobs (scheduled)
- `weekly-maint.yml` - Weekly maintenance (scheduled)
- `systems-metrics.yml` - Systems metrics (scheduled)
- `telemetry.yml` - Telemetry collection (scheduled)

#### Specialized (Should be Optional):
- `benchmarks.yml` - Performance benchmarks
- `chaos.yml` - Chaos engineering tests
- `dr-drill.yml` - Disaster recovery drills
- `compliance.yml` - Compliance checks
- `regtech.yml` - Regulatory tech checks
- `revenue.yml` - Revenue checks
- `reliability-orchestrator.yml` - Reliability orchestration
- `remediation_orchestrator.yml` - Remediation orchestration
- `ops-ci.yml` - Ops CI (matrix builds)
- `ops-matrix-ci.yml` - Another ops CI variant
- `supabase-ci.yml` - Supabase-specific CI
- `supabase-delta-apply.yml` - Supabase delta migrations
- `schema-validation.yml` - Schema validation
- `data-quality.yml` - Data quality checks
- `project-governance.yml` - Project governance
- `code-review-sla.yml` - Code review SLA tracking
- `docs-pdf.yml` - PDF documentation generation
- `mobile.yml` - Mobile-specific checks
- `mobile-release.yml` - Mobile release
- `preview-pr.yml` - PR preview
- `preflight.yml` - Preflight checks
- `futurecheck.yml` - Future checks
- `gap-sprint.yml` - Gap sprint
- `ai-audit.yml` - AI audit
- `meta-audit.yml` - Meta audit
- `ui-ingest.yml` - UI ingest
- `agent-runner.yml` - Agent runner
- `aurora-prime-doctor.yml` - Aurora prime doctor

### CI Configuration Issues

**Version Inconsistencies:**
- Node.js: Mix of `18` and `20` (package.json specifies `>=18.0.0 <21.0.0`)
- pnpm: Mix of `8`, `9`, and `9.0.0` (package.json specifies `>=8.0.0`)
- Action versions: Mix of `@v2`, `@v3`, `@v4` for same actions

**Failure Masking:**
- 34 instances of `continue-on-error: true` across 15 workflows
- Many workflows use `|| true` or `|| echo` to suppress failures
- Test failures marked as non-blocking in `ci.yml` (line 77: `continue-on-error: true`)

**Trigger Overlap:**
- Most workflows trigger on `pull_request` to `main`
- Many scheduled workflows ALSO trigger on PRs (should be schedule-only)
- No clear distinction between "required" and "optional" checks

**Estimated Check Count Per PR:**
- **Current:** ~40-50 checks per PR (many redundant)
- **Target:** 5-8 core checks

---

## C. WHY SO MANY FAILING CHECKS (HYPOTHESES)

### Top 10 Failure Reasons

1. **Workflow Overlap & Redundancy**
   - Same checks run multiple times (lint runs in ci.yml, ci-cd.yml, code-hygiene.yml, quality-gates.yml)
   - Different workflows use different tool versions/configs, causing inconsistent results

2. **Version Drift**
   - Node 18 vs 20 inconsistencies cause environment-specific failures
   - pnpm version mismatches (8 vs 9) cause lockfile issues
   - Action version mismatches cause deprecated API usage

3. **Missing Secrets/Environment Variables**
   - Many workflows require `DATABASE_URL`, `SUPABASE_*` secrets but don't gracefully handle missing secrets
   - Some workflows fail hard when secrets are missing instead of skipping

4. **Flaky Tests**
   - Tests marked with `continue-on-error: true` suggest known flakiness
   - E2E tests likely flaky due to timing/network issues
   - Database-dependent tests may fail due to connection issues

5. **Overly Broad Triggers**
   - Scheduled/nightly workflows running on PRs when they shouldn't
   - Heavy checks (chaos, benchmarks, DR drills) running on every PR

6. **Missing Dependencies**
   - Some workflows assume scripts/tools exist that may not be installed
   - Prisma client generation may fail if DATABASE_URL is missing

7. **Test Setup Complexity**
   - Tests require database, Supabase, and multiple env vars
   - No clear test fixtures or mocking strategy
   - Integration tests may fail due to external service dependencies

8. **Build Order Issues**
   - Some workflows build packages in wrong order
   - Turbo cache may be invalidated incorrectly

9. **Resource Constraints**
   - Too many parallel jobs may exhaust GitHub Actions resources
   - Timeouts (15 min) may be too short for some checks

10. **Legacy/Dead Code Paths**
    - Workflows reference scripts/files that no longer exist
    - Some workflows are experimental and never cleaned up

---

## D. TARGET STATE (CODE + CI)

### Target Code Principles

1. **Single Source of Truth**
   - One ESLint config (shared base, apps can extend)
   - One TypeScript config (root tsconfig.json with references)
   - One test runner configuration

2. **Clear Package Boundaries**
   - No circular dependencies between packages
   - Explicit exports in package.json
   - Internal packages prefixed with `@whats-for-dinner/`

3. **Testability First**
   - All business logic in pure functions or testable classes
   - No side effects at import time
   - Dependency injection for external services

4. **Consistent Naming**
   - Directories: kebab-case
   - Files: kebab-case for configs, camelCase for components
   - Exports: camelCase for functions, PascalCase for classes/components

5. **Dead Code Elimination**
   - Regular `knip` runs to identify unused code
   - `ts-prune` to find unused exports
   - Automated cleanup of dead code paths

6. **Documentation Co-location**
   - One `docs/` directory (not `docs/`, `DOCS/`, `REPORTS/`)
   - README.md in each package/app explaining purpose
   - API docs generated from code

7. **Script Consolidation**
   - Group related scripts (e.g., `scripts/db/*`, `scripts/test/*`)
   - One entry point per category (`scripts/db/migrate.ts` not 10 separate files)
   - Clear documentation of what each script does

8. **Type Safety**
   - Strict TypeScript everywhere
   - No `any` types (use `unknown` and type guards)
   - Runtime validation with Zod for external data

### Target CI Check Set

**Core Checks (Required for PR Merge):**

1. **lint**
   - Purpose: Enforce code style and catch common errors
   - Tools: ESLint (shared config)
   - Runtime: ~2-3 minutes
   - Blocking: Yes

2. **type-check**
   - Purpose: Ensure TypeScript types are correct
   - Tools: `tsc --noEmit`
   - Runtime: ~3-5 minutes
   - Blocking: Yes

3. **test** (Unit + Integration)
   - Purpose: Verify core functionality works
   - Tools: Vitest (or Jest)
   - Runtime: ~5-8 minutes
   - Blocking: Yes
   - Note: Fast tests only (< 1s each), integration tests in separate job

4. **build**
   - Purpose: Ensure code compiles and builds successfully
   - Tools: Turbo build
   - Runtime: ~5-10 minutes
   - Blocking: Yes

**Optional Checks (Non-Blocking, Informational):**

5. **test-coverage**
   - Purpose: Track test coverage trends
   - Tools: Coverage reporters
   - Runtime: ~8-10 minutes
   - Blocking: No (warns if < 80%)

6. **bundle-size**
   - Purpose: Prevent bundle size regressions
   - Tools: Bundle analyzer
   - Runtime: ~3-5 minutes
   - Blocking: No (warns if > threshold)

**Nightly/Scheduled Only:**

7. **security-scan**
   - Purpose: Deep security analysis
   - Tools: Snyk, CodeQL, Trivy
   - Runtime: ~15-20 minutes
   - Frequency: Daily at 2 AM UTC

8. **e2e-tests**
   - Purpose: Full end-to-end validation
   - Tools: Playwright
   - Runtime: ~10-15 minutes
   - Frequency: On push to main, not on PRs

9. **performance-benchmarks**
   - Purpose: Performance regression detection
   - Tools: Lighthouse CI, custom benchmarks
   - Runtime: ~10-15 minutes
   - Frequency: Weekly

10. **code-hygiene**
    - Purpose: Dead code detection, dependency audit
    - Tools: knip, ts-prune, depcheck
    - Runtime: ~5-8 minutes
    - Frequency: Weekly

### What to Disable / Consolidate

**Disable Entirely:**
- `final_assurance_release.yml` - Redundant with release-pipeline.yml
- `gap-sprint.yml` - One-off workflow
- `futurecheck.yml` - Experimental, unclear purpose
- `meta-audit.yml` - Redundant with other audits
- `ui-ingest.yml` - Unclear purpose
- `aurora-prime-doctor.yml` - Specialized tool, not for CI
- `code-review-sla.yml` - Should be dashboard/metric, not CI check
- `docs-pdf.yml` - Can be manual or scheduled
- `preview-pr.yml` - Use Vercel previews instead
- `preflight.yml` - Redundant with ci.yml

**Move to Scheduled/Nightly:**
- `nightly-drift-report.yml` - Already scheduled, ensure it doesn't run on PRs
- `nightly-etl.yml` - Already scheduled
- `watcher-cron.yml` - Already scheduled
- `weekly-maint.yml` - Already scheduled
- `systems-metrics.yml` - Already scheduled
- `telemetry.yml` - Already scheduled
- `chaos.yml` - Move to weekly schedule
- `dr-drill.yml` - Move to monthly schedule
- `benchmarks.yml` - Move to weekly schedule
- `compliance.yml` - Move to weekly schedule
- `regtech.yml` - Move to weekly schedule
- `revenue.yml` - Move to weekly schedule
- `data-quality.yml` - Move to weekly schedule
- `project-governance.yml` - Move to weekly schedule

**Consolidate:**
- Merge `ci.yml`, `ci-cd.yml`, `build.yml`, `pre-merge-validation.yml`, `quality-gates.yml` → **Single `ci.yml`**
- Merge `security.yml` and `secrets-scan.yml` → **Single `security.yml`** (nightly)
- Merge `code-hygiene.yml` and `wiring-check.yml` → **Part of `ci.yml`** (non-blocking)
- Merge `deploy.yml`, `deploy-main.yml`, `deploy-web.yml` → **Single `deploy.yml`**
- Merge `ops-ci.yml` and `ops-matrix-ci.yml` → **Single `ops-ci.yml`** (if needed)
- Merge `supabase-ci.yml` and `supabase-delta-apply.yml` → **Single `supabase-ci.yml`**
- Merge `test-coverage-gate.yml` → **Part of `ci.yml`** (non-blocking job)

**Keep but Make Optional:**
- `e2e.yml` - Run on push to main only, not PRs
- `architectural-integrity-tests.yml` - Run weekly
- `integration-audit.yml` - Run weekly
- `api-contract-testing.yml` - Run on API changes only
- `trust.yml` - Run weekly
- `mobile.yml` and `mobile-release.yml` - Run on mobile changes only
- `agent-runner.yml` - Run weekly
- `reliability-orchestrator.yml` - Run weekly
- `remediation_orchestrator.yml` - Run weekly

---

## E. WORKFLOW REWRITE PLAN

### Current Workflow Inventory

| Workflow | Purpose | Status | Action |
|----------|---------|--------|--------|
| `ci.yml` | Core CI | Keep | Clean up, make primary |
| `ci-cd.yml` | Full pipeline | Merge | Into ci.yml |
| `build.yml` | Build + test | Merge | Into ci.yml |
| `pre-merge-validation.yml` | Pre-merge checks | Merge | Into ci.yml |
| `quality-gates.yml` | Quality gates | Merge | Into ci.yml |
| `test-coverage-gate.yml` | Coverage check | Merge | Into ci.yml (non-blocking) |
| `e2e.yml` | E2E tests | Keep | Push to main only |
| `security.yml` | Security scans | Keep | Nightly only |
| `secrets-scan.yml` | Secret scanning | Merge | Into security.yml |
| `code-hygiene.yml` | Code hygiene | Merge | Into ci.yml (non-blocking) |
| `wiring-check.yml` | Connectivity | Merge | Into ci.yml (non-blocking) |
| `schema-validation.yml` | Schema validation | Keep | On schema changes only |
| `deploy.yml` | Generic deploy | Merge | Into deploy-main.yml |
| `deploy-main.yml` | Main deploy | Keep | Clean up |
| `deploy-web.yml` | Web deploy | Merge | Into deploy-main.yml |
| `canary-deploy.yml` | Canary deploy | Keep | Optional |
| `vercel-promotion.yml` | Vercel promotion | Keep | Manual trigger |
| `vercel-guard.yml` | Vercel guard | Keep | On Vercel changes |
| `release-pipeline.yml` | Release | Keep | Clean up |
| `final_assurance_release.yml` | Final checks | Delete | Redundant |
| `nightly-drift-report.yml` | Drift report | Keep | Scheduled only |
| `nightly-etl.yml` | E2E jobs | Keep | Scheduled only |
| `watcher-cron.yml` | Watchers | Keep | Scheduled only |
| `weekly-maint.yml` | Weekly maint | Keep | Scheduled only |
| `systems-metrics.yml` | Metrics | Keep | Scheduled only |
| `telemetry.yml` | Telemetry | Keep | Scheduled only |
| `benchmarks.yml` | Benchmarks | Keep | Weekly schedule |
| `chaos.yml` | Chaos tests | Keep | Weekly schedule |
| `dr-drill.yml` | DR drill | Keep | Monthly schedule |
| `compliance.yml` | Compliance | Keep | Weekly schedule |
| `regtech.yml` | Regtech | Keep | Weekly schedule |
| `revenue.yml` | Revenue | Keep | Weekly schedule |
| `data-quality.yml` | Data quality | Keep | Weekly schedule |
| `project-governance.yml` | Governance | Keep | Weekly schedule |
| `architectural-integrity-tests.yml` | Arch tests | Keep | Weekly schedule |
| `integration-audit.yml` | Integration | Keep | Weekly schedule |
| `api-contract-testing.yml` | API contracts | Keep | On API changes |
| `trust.yml` | Trust/audit | Keep | Weekly schedule |
| `ops-ci.yml` | Ops CI | Keep | Clean up |
| `ops-matrix-ci.yml` | Ops matrix | Merge | Into ops-ci.yml |
| `supabase-ci.yml` | Supabase CI | Keep | Clean up |
| `supabase-delta-apply.yml` | Supabase delta | Merge | Into supabase-ci.yml |
| `mobile.yml` | Mobile checks | Keep | On mobile changes |
| `mobile-release.yml` | Mobile release | Keep | On mobile changes |
| `agent-runner.yml` | Agent runner | Keep | Weekly schedule |
| `reliability-orchestrator.yml` | Reliability | Keep | Weekly schedule |
| `remediation_orchestrator.yml` | Remediation | Keep | Weekly schedule |
| `code-review-sla.yml` | Review SLA | Delete | Not a CI check |
| `docs-pdf.yml` | PDF docs | Delete | Manual/scheduled |
| `preview-pr.yml` | PR preview | Delete | Use Vercel |
| `preflight.yml` | Preflight | Delete | Redundant |
| `futurecheck.yml` | Future check | Delete | Unclear purpose |
| `gap-sprint.yml` | Gap sprint | Delete | One-off |
| `ai-audit.yml` | AI audit | Keep | Weekly schedule |
| `meta-audit.yml` | Meta audit | Delete | Redundant |
| `ui-ingest.yml` | UI ingest | Delete | Unclear purpose |
| `aurora-prime-doctor.yml` | Aurora doctor | Delete | Specialized tool |

### Proposed Workflow Set

**1. `ci.yml` (Primary CI - Required for PRs)**
- **Triggers:** `pull_request` to `main`, `push` to `main`
- **Jobs:**
  - `lint` - ESLint check (blocking)
  - `type-check` - TypeScript check (blocking)
  - `test` - Unit + integration tests (blocking)
  - `build` - Build all packages/apps (blocking)
  - `test-coverage` - Coverage report (non-blocking, informational)
  - `code-hygiene` - Dead code detection (non-blocking, informational)
- **Runtime:** ~15-20 minutes total
- **Matrix:** None (keep it simple)

**2. `e2e.yml` (E2E Tests - Push to Main Only)**
- **Triggers:** `push` to `main` only (NOT on PRs)
- **Jobs:**
  - `e2e-smoke` - Playwright smoke tests
- **Runtime:** ~10-15 minutes
- **Blocking:** No (informational, but should pass)

**3. `security.yml` (Security Scans - Nightly)**
- **Triggers:** `schedule: cron: '0 2 * * *'` (2 AM UTC daily), `workflow_dispatch`
- **Jobs:**
  - `secrets-scan` - Gitleaks + TruffleHog
  - `dependency-scan` - Snyk + npm audit
  - `codeql-analysis` - CodeQL
  - `sbom-generation` - SBOM generation
- **Runtime:** ~20-30 minutes
- **Blocking:** No (creates GitHub Security alerts)

**4. `deploy.yml` (Deployment - Push to Main)**
- **Triggers:** `push` to `main`
- **Jobs:**
  - `deploy-staging` - Deploy to staging (if develop branch)
  - `deploy-production` - Deploy to production (if main branch)
- **Runtime:** ~10-15 minutes
- **Blocking:** Yes (must pass before merge, but runs after merge)

**5. `nightly.yml` (Nightly Jobs - Scheduled)**
- **Triggers:** `schedule: cron: '0 2 * * *'` (2 AM UTC daily)
- **Jobs:**
  - `drift-report` - Architectural drift detection
  - `code-hygiene-deep` - Deep code hygiene (knip, ts-prune)
  - `performance-benchmarks` - Performance benchmarks
  - `chaos-tests` - Chaos engineering (weekly)
  - `compliance-check` - Compliance checks (weekly)
- **Runtime:** ~30-45 minutes
- **Blocking:** No

**6. `release.yml` (Release Pipeline - Manual)**
- **Triggers:** `workflow_dispatch` with version input
- **Jobs:**
  - `validate-release` - Pre-release validation
  - `build-release` - Build release artifacts
  - `deploy-release` - Deploy to production
  - `create-release` - Create GitHub release
- **Runtime:** ~20-30 minutes
- **Blocking:** N/A (manual trigger)

**7. `supabase-ci.yml` (Supabase - On Schema Changes)**
- **Triggers:** `pull_request` with paths: `['supabase/**', 'prisma/**']`
- **Jobs:**
  - `validate-migrations` - Validate migrations
  - `test-rls` - Test RLS policies
- **Runtime:** ~5-10 minutes
- **Blocking:** Yes (if schema changes)

**8. `mobile.yml` (Mobile - On Mobile Changes)**
- **Triggers:** `pull_request` with paths: `['apps/mobile/**']`
- **Jobs:**
  - `build-mobile` - Build mobile app
  - `test-mobile` - Test mobile app
- **Runtime:** ~10-15 minutes
- **Blocking:** Yes (if mobile changes)

### Merge Guardrails

**Required Checks (Must Pass for Merge):**
1. `ci.yml` → `lint`
2. `ci.yml` → `type-check`
3. `ci.yml` → `test`
4. `ci.yml` → `build`
5. `supabase-ci.yml` → `validate-migrations` (if schema changes)
6. `mobile.yml` → `build-mobile` (if mobile changes)

**Optional Checks (Informational, Don't Block):**
- `ci.yml` → `test-coverage`
- `ci.yml` → `code-hygiene`
- `security.yml` → All jobs (nightly only)
- `nightly.yml` → All jobs (scheduled only)

**Branch Protection Rules:**
- Require status checks: `ci/lint`, `ci/type-check`, `ci/test`, `ci/build`
- Require branches to be up to date before merging
- Do not allow force pushes to main
- Do not allow deletions of main branch

---

## F. CODE CLEANUP & TEST ARCHITECTURE

### Code Cohesion Issues

**1. Script Sprawl (167 scripts)**
- **Problem:** Unclear ownership, many scripts do similar things
- **Example:** Multiple migration scripts, multiple test scripts, multiple health check scripts
- **Impact:** Hard to find the right script, maintenance burden

**2. Duplicate Documentation Directories**
- **Problem:** `docs/`, `DOCS/`, `REPORTS/` all contain markdown
- **Impact:** Unclear where to put new docs, hard to find existing docs

**3. Inconsistent ESLint Configs**
- **Problem:** 8 different ESLint config files with different rules
- **Impact:** Different lint results in different packages, confusion

**4. Agent Pattern Unclear**
- **Problem:** `agents/` directory has 12 files but unclear orchestration
- **Impact:** Hard to understand how agents work together

**5. Test Structure Fragmented**
- **Problem:** Tests in `packages/server/src/__tests__/`, `tests/`, `packages/testing/`, inline
- **Impact:** Hard to run all tests, unclear test organization

**6. Package.json Script Sprawl**
- **Problem:** 225+ npm scripts, many overlapping
- **Impact:** Hard to discover available commands, maintenance burden

**7. Import Style Inconsistency**
- **Problem:** Mix of relative imports (`../../`), `@/*` aliases, package imports
- **Impact:** Hard to refactor, unclear dependencies

**8. Dead Code Paths**
- **Problem:** Reports show unused exports, but code still exists
- **Impact:** Increased bundle size, maintenance burden

**9. Type Safety Gaps**
- **Problem:** Some `any` types, unclear runtime validation
- **Impact:** Runtime errors, harder to refactor

**10. Naming Inconsistency**
- **Problem:** Mix of kebab-case, camelCase, snake_case
- **Impact:** Hard to navigate, inconsistent API

### Code Cleanup Tasks

**Priority 1 (High Impact, Low Risk):**

1. **Consolidate Documentation**
   - Merge `DOCS/` and `REPORTS/` into `docs/`
   - Create `docs/architecture/`, `docs/api/`, `docs/guides/` structure
   - Update all references
   - **Files:** Move all markdown from `DOCS/` and `REPORTS/` to `docs/`

2. **Consolidate ESLint Configs**
   - Create `eslint.config.base.mjs` in root
   - All apps/packages extend base config
   - Remove duplicate configs
   - **Files:** `apps/*/eslint.config.mjs`, `packages/*/eslint.config.*`

3. **Organize Scripts Directory**
   - Create `scripts/db/`, `scripts/test/`, `scripts/deploy/`, `scripts/dev/`
   - Move related scripts into subdirectories
   - Create `scripts/README.md` documenting each script
   - **Files:** All 167 files in `scripts/`

4. **Remove Dead Code**
   - Run `knip` and `ts-prune` to identify unused code
   - Delete unused exports/files
   - **Files:** TBD based on knip/ts-prune output

5. **Standardize Import Paths**
   - Use `@whats-for-dinner/*` for all internal packages
   - Remove `@/*` aliases (or document when to use)
   - **Files:** All `.ts`/`.tsx` files

**Priority 2 (Medium Impact, Medium Risk):**

6. **Consolidate Test Structure**
   - Move all tests to `packages/*/src/__tests__/` or `apps/*/src/__tests__/`
   - Remove standalone `tests/` directory (or make it e2e only)
   - **Files:** `tests/`, `packages/testing/`

7. **Reduce Package.json Scripts**
   - Group related scripts (e.g., `db:*` → `db:migrate`, `db:studio`)
   - Remove duplicate scripts
   - Document scripts in `CONTRIBUTING.md`
   - **Files:** `package.json`

8. **Clarify Agent Pattern**
   - Document agent architecture in `docs/architecture/agents.md`
   - Create `agents/README.md` explaining each agent
   - **Files:** `agents/*.ts`

9. **Fix Type Safety**
   - Replace `any` with `unknown` + type guards
   - Add Zod schemas for external data
   - **Files:** All `.ts` files with `any` types

10. **Standardize Naming**
    - Convert all directories to kebab-case
    - Convert all config files to kebab-case
    - **Files:** All directories/files

**Priority 3 (Lower Impact, Higher Risk):**

11. **Refactor Large Files**
    - Identify files > 500 lines
    - Split into smaller modules
    - **Files:** TBD (need to scan)

12. **Extract Common Patterns**
    - Identify duplicated code patterns
    - Extract to shared utilities
    - **Files:** TBD (need to scan)

### Test Architecture Fixes

**Current Test Structure Issues:**
1. Tests scattered across multiple locations
2. No clear separation of unit vs integration vs e2e
3. Missing test fixtures/mocking strategy
4. Flaky tests due to external dependencies

**Proposed Test Structure:**

```
packages/
  server/
    src/
      __tests__/          # Unit tests (fast, isolated)
        *.test.ts
      __integration__/   # Integration tests (slower, with DB)
        *.integration.test.ts
apps/
  web/
    src/
      __tests__/          # Unit tests
        *.test.ts
      __e2e__/           # E2E tests (Playwright)
        *.e2e.test.ts
tests/                    # Shared test utilities
  fixtures/
  helpers/
  mocks/
```

**Test Improvements:**

1. **Separate Fast vs Slow Tests**
   - Unit tests: < 1s each, no external deps
   - Integration tests: Can use DB, but isolated
   - E2E tests: Full stack, run separately

2. **Add Test Fixtures**
   - Create `tests/fixtures/` for common test data
   - Use factories for test data generation
   - **Files:** `tests/fixtures/*.ts`

3. **Mock External Services**
   - Mock Supabase client in unit tests
   - Mock API calls in integration tests
   - **Files:** `tests/mocks/*.ts`

4. **Add Test Utilities**
   - Test helpers for common patterns
   - Custom matchers
   - **Files:** `tests/helpers/*.ts`

5. **Core Business Logic Tests (Must Have)**
   - Agent config loading (`agents/unified-agent.ts`)
   - Tool registry behavior (`packages/server/src/tools/`)
   - Workflow execution (`packages/server/src/jobs/`)
   - Auth/authorization (`packages/server/src/auth/`)
   - Database queries (`packages/server/src/db/`)
   - API routes (`packages/server/src/routes/`)

---

## G. CI STABILIZATION PLAN

### Phase 1: Stop the Bleeding (Week 1)

**Goal:** Reduce failing checks from ~40-50 to < 10

**Actions:**

1. **Disable Non-Critical Workflows**
   - Move all scheduled workflows to `schedule` only (remove `pull_request` triggers)
   - Disable experimental workflows (`futurecheck.yml`, `gap-sprint.yml`, etc.)
   - **Files:** All scheduled workflows

2. **Consolidate Core CI**
   - Merge `ci-cd.yml`, `build.yml`, `pre-merge-validation.yml`, `quality-gates.yml` into `ci.yml`
   - Remove duplicate jobs
   - **Files:** `.github/workflows/ci.yml`, delete others

3. **Fix Version Inconsistencies**
   - Standardize on Node 20 and pnpm 9
   - Update all workflows to use same versions
   - **Files:** All workflow files

4. **Remove Failure Masking**
   - Remove `continue-on-error: true` from blocking checks
   - Fix or remove flaky tests
   - **Files:** All workflow files

5. **Fix Missing Secrets Handling**
   - Add proper secret validation
   - Skip jobs gracefully if secrets missing (for optional checks)
   - **Files:** All workflow files

6. **Consolidate Security Scans**
   - Merge `secrets-scan.yml` into `security.yml`
   - Make `security.yml` nightly only
   - **Files:** `.github/workflows/security.yml`, delete `secrets-scan.yml`

7. **Fix Test Setup**
   - Ensure DATABASE_URL is available for tests that need it
   - Add test database setup/teardown
   - **Files:** Test files, workflow files

8. **Reduce Check Redundancy**
   - Remove duplicate lint/type-check/test jobs
   - Keep only one of each in `ci.yml`
   - **Files:** All workflow files

**Expected Outcome:** ~5-8 core checks per PR, all passing

### Phase 2: Fix Core Checks (Week 2)

**Goal:** Make core checks reliable and fast

**Actions:**

1. **Fix Linting**
   - Consolidate ESLint configs
   - Fix all lint errors
   - **Files:** ESLint configs, source files

2. **Fix Type Checking**
   - Fix all TypeScript errors
   - Remove `any` types
   - **Files:** All `.ts`/`.tsx` files

3. **Fix Tests**
   - Fix flaky tests
   - Add proper mocking
   - Separate fast vs slow tests
   - **Files:** Test files

4. **Fix Build**
   - Ensure all packages build successfully
   - Fix build order issues
   - **Files:** Build configs, source files

5. **Add Test Coverage**
   - Ensure coverage reports generate correctly
   - Set realistic coverage threshold (80%)
   - **Files:** Test configs, workflow files

6. **Optimize CI Runtime**
   - Use Turbo caching effectively
   - Parallelize independent jobs
   - **Files:** `turbo.json`, workflow files

**Expected Outcome:** Core checks pass > 95% of the time, runtime < 15 minutes

### Phase 3: Reintroduce Heavier Checks (Week 3+)

**Goal:** Add back valuable checks in a controlled way

**Actions:**

1. **Add E2E Tests (Non-Blocking)**
   - Run on push to main only
   - Fix flaky E2E tests
   - **Files:** `e2e.yml`, E2E test files

2. **Add Security Scans (Nightly)**
   - Run security scans nightly
   - Create GitHub Security alerts
   - **Files:** `security.yml`

3. **Add Performance Benchmarks (Weekly)**
   - Run benchmarks weekly
   - Track performance trends
   - **Files:** `nightly.yml`

4. **Add Code Hygiene (Weekly)**
   - Run knip/ts-prune weekly
   - Create issues for dead code
   - **Files:** `nightly.yml`

**Expected Outcome:** Valuable checks run without blocking PRs

### Definition of Done for Green CI

**Success Criteria:**

1. **Check Count:** ≤ 8 checks per PR (5 required, 3 optional)
2. **Pass Rate:** > 95% of PRs have all required checks passing
3. **Runtime:** Core checks complete in < 15 minutes
4. **Flakiness:** < 1% flaky test rate
5. **Blocking:** Only core checks block PR merge
6. **Documentation:** Clear documentation of what each check does
7. **Local Parity:** `pnpm ci` runs same checks as CI locally
8. **Monitoring:** Track check pass rates and alert on degradation

**Metrics to Track:**
- PR check pass rate (target: > 95%)
- Average CI runtime (target: < 15 min)
- Flaky test rate (target: < 1%)
- Number of checks per PR (target: ≤ 8)

---

## H. PR PLAN & LOCAL DEV PARITY

### PR Breakdown

**PR 1: Consolidate Core CI Workflows** [Low Risk]
- **Title:** "Consolidate CI workflows into single ci.yml"
- **Scope:** Merge ci-cd.yml, build.yml, pre-merge-validation.yml, quality-gates.yml into ci.yml
- **Files:**
  - `.github/workflows/ci.yml` (rewrite)
  - Delete: `ci-cd.yml`, `build.yml`, `pre-merge-validation.yml`, `quality-gates.yml`
- **Risk:** Low (just reorganizing, not changing logic)
- **Dependencies:** None
- **Testing:** Verify checks still run correctly

**PR 2: Fix Version Inconsistencies** [Low Risk]
- **Title:** "Standardize Node 20 and pnpm 9 across all workflows"
- **Scope:** Update all workflows to use Node 20 and pnpm 9
- **Files:** All `.github/workflows/*.yml` files
- **Risk:** Low (version updates)
- **Dependencies:** None
- **Testing:** Verify workflows run with new versions

**PR 3: Move Scheduled Workflows to Schedule-Only** [Low Risk]
- **Title:** "Move scheduled workflows to schedule-only triggers"
- **Scope:** Remove `pull_request` triggers from scheduled workflows
- **Files:** `nightly-*.yml`, `weekly-*.yml`, `watcher-cron.yml`, etc.
- **Risk:** Low (just changing triggers)
- **Dependencies:** None
- **Testing:** Verify scheduled workflows still run on schedule

**PR 4: Remove Failure Masking** [Medium Risk]
- **Title:** "Remove continue-on-error from blocking checks"
- **Scope:** Remove `continue-on-error: true` from required checks, fix underlying issues
- **Files:** All workflow files, test files
- **Risk:** Medium (may expose real failures)
- **Dependencies:** PR 1, PR 2
- **Testing:** Ensure all checks pass before merging

**PR 5: Consolidate Security Workflows** [Low Risk]
- **Title:** "Merge secrets-scan.yml into security.yml and make nightly-only"
- **Scope:** Merge secrets-scan.yml into security.yml, make security.yml nightly-only
- **Files:** `.github/workflows/security.yml`, delete `secrets-scan.yml`
- **Risk:** Low
- **Dependencies:** None
- **Testing:** Verify security scans still run nightly

**PR 6: Delete Redundant/Experimental Workflows** [Low Risk]
- **Title:** "Delete redundant and experimental workflows"
- **Scope:** Delete workflows identified for deletion
- **Files:** Delete: `final_assurance_release.yml`, `gap-sprint.yml`, `futurecheck.yml`, `meta-audit.yml`, `ui-ingest.yml`, `aurora-prime-doctor.yml`, `code-review-sla.yml`, `docs-pdf.yml`, `preview-pr.yml`, `preflight.yml`
- **Risk:** Low (deleting unused workflows)
- **Dependencies:** None
- **Testing:** Verify no references to deleted workflows

**PR 7: Consolidate ESLint Configs** [Medium Risk]
- **Title:** "Consolidate ESLint configs into shared base config"
- **Scope:** Create base ESLint config, all apps/packages extend it
- **Files:** Create `eslint.config.base.mjs`, update all `eslint.config.*` files
- **Risk:** Medium (may change lint results)
- **Dependencies:** None
- **Testing:** Run lint locally, fix any new errors

**PR 8: Organize Scripts Directory** [Low Risk]
- **Title:** "Organize scripts directory into subdirectories"
- **Scope:** Create `scripts/db/`, `scripts/test/`, `scripts/deploy/`, `scripts/dev/`, move related scripts
- **Files:** All files in `scripts/`, create `scripts/README.md`
- **Risk:** Low (just reorganizing)
- **Dependencies:** None
- **Testing:** Verify scripts still work after move

**PR 9: Consolidate Documentation** [Low Risk]
- **Title:** "Merge DOCS/ and REPORTS/ into docs/ directory"
- **Scope:** Move all markdown from DOCS/ and REPORTS/ to docs/, create structure
- **Files:** Move all markdown files, update references
- **Risk:** Low (just moving files)
- **Dependencies:** None
- **Testing:** Verify links still work

**PR 10: Add Local CI Parity** [Low Risk]
- **Title:** "Add pnpm ci command to run same checks as CI"
- **Scope:** Create `pnpm ci` script that runs lint, type-check, test, build
- **Files:** `package.json`, create `scripts/ci.mjs`
- **Risk:** Low
- **Dependencies:** PR 1, PR 7
- **Testing:** Run `pnpm ci` locally, verify it matches CI

### Local Dev & CI Parity

**Current State:**
- No single command to run all CI checks locally
- Developers must run `pnpm lint`, `pnpm type-check`, `pnpm test`, `pnpm build` separately
- Some checks only run in CI (e.g., coverage, code hygiene)

**Proposed Solution:**

**1. Add `pnpm ci` Command**
```json
{
  "scripts": {
    "ci": "node scripts/ci.mjs",
    "ci:lint": "turbo run lint",
    "ci:type-check": "turbo run type-check",
    "ci:test": "turbo run test",
    "ci:build": "turbo run build",
    "ci:full": "pnpm ci:lint && pnpm ci:type-check && pnpm ci:test && pnpm ci:build"
  }
}
```

**2. Create `scripts/ci.mjs`**
- Runs same checks as CI in same order
- Provides clear output
- Exits with correct code

**3. Update CONTRIBUTING.md**
- Document `pnpm ci` command
- Explain what each check does
- Provide troubleshooting tips

**4. Add Pre-Commit Hook (Optional)**
- Run `pnpm ci:lint` and `pnpm ci:type-check` on pre-commit
- Use Husky (already in repo)
- **Files:** `.husky/pre-commit`

**Benefits:**
- Developers can verify changes locally before pushing
- Reduces "works on my machine" issues
- Faster feedback loop
- Consistent with CI environment

---

## I. ACTION CHECKLIST

### Week 1: Stop the Bleeding

- [QW] **Disable pull_request triggers on scheduled workflows** (nightly-drift-report.yml, nightly-etl.yml, watcher-cron.yml, weekly-maint.yml, systems-metrics.yml, telemetry.yml)
- [QW] **Delete experimental workflows** (futurecheck.yml, gap-sprint.yml, meta-audit.yml, ui-ingest.yml, aurora-prime-doctor.yml)
- [QW] **Delete redundant workflows** (final_assurance_release.yml, code-review-sla.yml, docs-pdf.yml, preview-pr.yml, preflight.yml)
- [DW] **Merge ci-cd.yml, build.yml, pre-merge-validation.yml, quality-gates.yml into ci.yml**
- [DW] **Standardize Node 20 and pnpm 9 across all workflows**
- [QW] **Remove continue-on-error from blocking checks in ci.yml**
- [QW] **Merge secrets-scan.yml into security.yml, make security.yml nightly-only**
- [DW] **Fix missing secrets handling in workflows** (add proper validation/skipping)
- [QW] **Update branch protection rules** (require ci/lint, ci/type-check, ci/test, ci/build)

### Week 2: Fix Core Checks

- [DW] **Consolidate ESLint configs** (create base config, all apps/packages extend)
- [DW] **Fix all lint errors** (run lint, fix errors)
- [DW] **Fix all TypeScript errors** (run type-check, fix errors)
- [DW] **Fix flaky tests** (identify flaky tests, add proper mocking/timeouts)
- [DW] **Separate fast vs slow tests** (move slow tests to separate job)
- [QW] **Fix build issues** (ensure all packages build successfully)
- [QW] **Add test coverage reporting** (ensure coverage reports generate correctly)
- [DW] **Optimize CI runtime** (use Turbo caching, parallelize jobs)

### Week 3: Code Cleanup

- [DW] **Organize scripts directory** (create subdirectories, move related scripts)
- [DW] **Create scripts/README.md** (document each script)
- [DW] **Consolidate documentation** (merge DOCS/ and REPORTS/ into docs/)
- [DW] **Create docs/ structure** (architecture/, api/, guides/)
- [DW] **Remove dead code** (run knip/ts-prune, delete unused code)
- [DW] **Standardize import paths** (use @whats-for-dinner/* for internal packages)
- [DW] **Fix type safety** (replace any with unknown + type guards)
- [QW] **Standardize naming** (convert directories to kebab-case)

### Week 4: Test Architecture & Local Parity

- [DW] **Reorganize test structure** (move tests to __tests__/ directories)
- [DW] **Create test fixtures** (tests/fixtures/ for common test data)
- [DW] **Add test mocks** (tests/mocks/ for external services)
- [DW] **Add test utilities** (tests/helpers/ for common patterns)
- [DW] **Add core business logic tests** (agent config, tool registry, workflows, auth, DB, API routes)
- [QW] **Add pnpm ci command** (create scripts/ci.mjs)
- [QW] **Update CONTRIBUTING.md** (document pnpm ci, troubleshooting)
- [QW] **Add pre-commit hook** (run lint + type-check on pre-commit)

### Ongoing: Monitoring & Maintenance

- [QW] **Set up CI metrics dashboard** (track pass rates, runtime, flakiness)
- [QW] **Create weekly CI health report** (automated report of CI status)
- [QW] **Document workflow purposes** (add comments to each workflow explaining purpose)
- [QW] **Review and update workflows monthly** (remove unused, optimize slow ones)

---

## SUMMARY

**Current State:**
- 58 workflow files (should be ~6-8)
- ~40-50 checks per PR (should be ~5-8)
- Many failing checks due to overlap, version drift, flakiness
- Code structure messy (167 scripts, duplicate docs, inconsistent configs)

**Target State:**
- 6-8 workflow files (ci.yml, e2e.yml, security.yml, deploy.yml, nightly.yml, release.yml, supabase-ci.yml, mobile.yml)
- 5-8 checks per PR (4 required: lint, type-check, test, build; 1-4 optional)
- > 95% pass rate on required checks
- Clean code structure (organized scripts, single docs/, consistent configs)

**Key Principles:**
1. **Simplicity:** Fewer workflows, clearer purpose
2. **Reliability:** Core checks must pass > 95% of the time
3. **Speed:** Core checks complete in < 15 minutes
4. **Clarity:** Clear documentation of what each check does
5. **Parity:** Local `pnpm ci` matches CI exactly

**Success Metrics:**
- Check count: ≤ 8 per PR ✅
- Pass rate: > 95% ✅
- Runtime: < 15 minutes ✅
- Flakiness: < 1% ✅

---

**Next Steps:**
1. Review this audit with team
2. Prioritize PRs based on team capacity
3. Start with Week 1 (stop the bleeding)
4. Iterate based on results
