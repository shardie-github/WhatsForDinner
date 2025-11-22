# CI Cleanup: Before & After

## Current State (BEFORE)

### Workflow Count
```
58 workflow files
├── Core CI: 5 overlapping workflows
├── Testing: 5 redundant test workflows
├── Security: 2 overlapping security workflows
├── Deployment: 6 deployment workflows
├── Scheduled: 15+ workflows (but also run on PRs!)
└── Specialized: 25+ experimental/redundant workflows
```

### Checks Per PR
```
~40-50 checks per PR
├── Lint: Runs 4 times (ci.yml, ci-cd.yml, code-hygiene.yml, quality-gates.yml)
├── Type-check: Runs 4 times (same as lint)
├── Test: Runs 3 times (ci.yml, ci-cd.yml, quality-gates.yml)
├── Build: Runs 3 times (ci.yml, ci-cd.yml, build.yml)
├── Security: Runs 2 times (security.yml, secrets-scan.yml)
├── E2E: Runs on every PR (should be main only)
├── Nightly jobs: Run on PRs (should be scheduled only)
└── Experimental: Many workflows with unclear purpose
```

### Issues
- ❌ Version inconsistencies (Node 18 vs 20, pnpm 8 vs 9)
- ❌ 34 instances of `continue-on-error: true` masking failures
- ❌ Many workflows require secrets but fail hard when missing
- ❌ Flaky tests marked as non-blocking
- ❌ No clear distinction between required and optional checks
- ❌ Scheduled workflows also run on PRs

### Code Structure Issues
- ❌ 167 scripts in `scripts/` with unclear organization
- ❌ 3 documentation directories (`docs/`, `DOCS/`, `REPORTS/`)
- ❌ 8 different ESLint configs
- ❌ 225+ npm scripts in package.json
- ❌ Tests scattered across multiple locations

---

## Target State (AFTER)

### Workflow Count
```
6-8 workflow files
├── ci.yml (Core CI - PRs + main)
├── e2e.yml (E2E tests - main only)
├── security.yml (Security scans - nightly)
├── deploy.yml (Deployment - main)
├── nightly.yml (Nightly jobs - scheduled)
├── release.yml (Release - manual)
├── supabase-ci.yml (Supabase - on schema changes)
└── mobile.yml (Mobile - on mobile changes)
```

### Checks Per PR
```
5-8 checks per PR
├── Required (Blocking):
│   ├── ci/lint (1x)
│   ├── ci/type-check (1x)
│   ├── ci/test (1x)
│   └── ci/build (1x)
├── Optional (Non-blocking):
│   ├── ci/test-coverage (informational)
│   └── ci/code-hygiene (informational)
└── Conditional:
    ├── supabase-ci/validate-migrations (if schema changes)
    └── mobile/build-mobile (if mobile changes)
```

### Improvements
- ✅ Standardized versions (Node 20, pnpm 9)
- ✅ No failure masking (removed `continue-on-error` from blocking checks)
- ✅ Graceful secret handling (skip optional checks if secrets missing)
- ✅ Fixed flaky tests (proper mocking, timeouts)
- ✅ Clear required vs optional distinction
- ✅ Scheduled workflows only run on schedule

### Code Structure Improvements
- ✅ Organized scripts (`scripts/db/`, `scripts/test/`, etc.)
- ✅ Single `docs/` directory with clear structure
- ✅ Single base ESLint config (apps/packages extend)
- ✅ Reduced npm scripts (grouped, documented)
- ✅ Organized test structure (`__tests__/`, `__integration__/`, `__e2e__/`)

---

## Comparison Table

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Workflow Files** | 58 | 6-8 | 86% reduction |
| **Checks Per PR** | 40-50 | 5-8 | 84% reduction |
| **Required Checks** | Unclear | 4 | Clear |
| **CI Runtime** | ~30-45 min | < 15 min | 50% faster |
| **Pass Rate** | ~60-70% | > 95% | 35% improvement |
| **Flakiness** | High | < 1% | Significant reduction |
| **Version Consistency** | Mixed | Standardized | Fixed |
| **Failure Masking** | 34 instances | 0 | Fixed |
| **Documentation** | 3 directories | 1 directory | Consolidated |
| **Scripts** | 167 unorganized | Organized | Better maintainability |
| **ESLint Configs** | 8 different | 1 base + extends | Consistent |

---

## Workflow Consolidation Map

### Core CI Consolidation
```
BEFORE:
├── ci.yml (test, lint, type-check, build)
├── ci-cd.yml (lint, type-check, test, build, deploy)
├── build.yml (build, lint, type-check, test)
├── pre-merge-validation.yml (pre-merge checks)
└── quality-gates.yml (type-check, test, bundle-size)

AFTER:
└── ci.yml (lint, type-check, test, build, test-coverage, code-hygiene)
```

### Security Consolidation
```
BEFORE:
├── security.yml (Snyk, CodeQL, SBOM, Trivy, Gitleaks, OWASP ZAP, OPA)
└── secrets-scan.yml (Gitleaks, TruffleHog)

AFTER:
└── security.yml (Secrets scan, dependency scan, CodeQL, SBOM) - nightly only
```

### Deployment Consolidation
```
BEFORE:
├── deploy.yml (generic)
├── deploy-main.yml (main branch)
├── deploy-web.yml (web app)
├── canary-deploy.yml (canary)
├── vercel-promotion.yml (Vercel)
└── vercel-guard.yml (Vercel guard)

AFTER:
├── deploy.yml (staging/production)
└── release.yml (manual release pipeline)
```

### Scheduled Workflows
```
BEFORE:
├── nightly-drift-report.yml (scheduled + PRs ❌)
├── nightly-etl.yml (scheduled + PRs ❌)
├── watcher-cron.yml (scheduled + PRs ❌)
├── weekly-maint.yml (scheduled + PRs ❌)
├── systems-metrics.yml (scheduled + PRs ❌)
├── telemetry.yml (scheduled + PRs ❌)
├── chaos.yml (scheduled + PRs ❌)
├── benchmarks.yml (scheduled + PRs ❌)
└── ... (15+ more)

AFTER:
├── nightly.yml (scheduled only ✅)
│   ├── drift-report
│   ├── benchmarks
│   ├── chaos-tests
│   └── compliance-check
└── security.yml (scheduled only ✅)
```

---

## Check Flow Comparison

### BEFORE: PR Check Flow
```
PR Created
├── ci.yml runs (lint, type-check, test, build)
├── ci-cd.yml runs (lint, type-check, test, build) ← DUPLICATE
├── build.yml runs (lint, type-check, test, build) ← DUPLICATE
├── pre-merge-validation.yml runs ← DUPLICATE
├── quality-gates.yml runs (type-check, test) ← DUPLICATE
├── test-coverage-gate.yml runs ← DUPLICATE
├── e2e.yml runs ← Should be main only
├── security.yml runs ← Should be nightly
├── secrets-scan.yml runs ← DUPLICATE
├── code-hygiene.yml runs ← Should be weekly
├── wiring-check.yml runs ← Should be weekly
├── nightly-drift-report.yml runs ← Should be scheduled only
├── nightly-etl.yml runs ← Should be scheduled only
├── watcher-cron.yml runs ← Should be scheduled only
├── weekly-maint.yml runs ← Should be scheduled only
├── systems-metrics.yml runs ← Should be scheduled only
├── telemetry.yml runs ← Should be scheduled only
├── chaos.yml runs ← Should be weekly
├── benchmarks.yml runs ← Should be weekly
└── ... (20+ more workflows)

Result: 40-50 checks, many duplicates, many failures
```

### AFTER: PR Check Flow
```
PR Created
├── ci.yml runs
│   ├── lint (blocking) ✅
│   ├── type-check (blocking) ✅
│   ├── test (blocking) ✅
│   ├── build (blocking) ✅
│   ├── test-coverage (non-blocking) ℹ️
│   └── code-hygiene (non-blocking) ℹ️
├── supabase-ci.yml runs (if schema changes)
│   └── validate-migrations (blocking) ✅
└── mobile.yml runs (if mobile changes)
    └── build-mobile (blocking) ✅

Result: 5-8 checks, no duplicates, >95% pass rate
```

---

## Timeline

### Week 1: Stop the Bleeding
- Delete 10+ redundant workflows
- Move 15+ scheduled workflows to schedule-only
- Consolidate core CI into single workflow
- Fix version inconsistencies

**Result:** ~10-15 checks per PR (down from 40-50)

### Week 2: Fix Core Checks
- Fix linting issues
- Fix TypeScript errors
- Fix flaky tests
- Optimize CI runtime

**Result:** >95% pass rate on core checks

### Week 3: Code Cleanup
- Organize scripts directory
- Consolidate documentation
- Consolidate ESLint configs
- Remove dead code

**Result:** Cleaner codebase, easier maintenance

### Week 4: Test Architecture & Local Parity
- Reorganize test structure
- Add test fixtures/mocks
- Add `pnpm ci` command
- Add pre-commit hooks

**Result:** Better testability, local/CI parity

---

## Success Criteria

### Quantitative
- ✅ Workflow count: ≤ 8 (down from 58)
- ✅ Checks per PR: ≤ 8 (down from 40-50)
- ✅ Pass rate: > 95% (up from ~60-70%)
- ✅ CI runtime: < 15 min (down from ~30-45 min)
- ✅ Flakiness: < 1% (down from high)

### Qualitative
- ✅ Clear distinction between required and optional checks
- ✅ No failure masking (removed `continue-on-error` from blocking checks)
- ✅ Consistent versions across all workflows
- ✅ Scheduled workflows only run on schedule
- ✅ Better code organization and maintainability

---

## Next Steps

1. **Review** full audit: `CI_AND_CODE_CLEANUP_AUDIT.md`
2. **Start** with quick start guide: `CI_CLEANUP_QUICK_START.md`
3. **Execute** Week 1 actions (stop the bleeding)
4. **Monitor** metrics and iterate
