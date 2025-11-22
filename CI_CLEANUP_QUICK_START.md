# CI Cleanup Quick Start Guide

**TL;DR:** We have 58 workflows running ~40-50 checks per PR. Target: 6-8 workflows, 5-8 checks per PR, >95% pass rate.

---

## Immediate Actions (This Week)

### 1. Stop the Bleeding (Day 1-2)

**Delete These Workflows:**
```bash
rm .github/workflows/futurecheck.yml
rm .github/workflows/gap-sprint.yml
rm .github/workflows/meta-audit.yml
rm .github/workflows/ui-ingest.yml
rm .github/workflows/aurora-prime-doctor.yml
rm .github/workflows/final_assurance_release.yml
rm .github/workflows/code-review-sla.yml
rm .github/workflows/docs-pdf.yml
rm .github/workflows/preview-pr.yml
rm .github/workflows/preflight.yml
```

**Make These Scheduled-Only (Remove `pull_request` triggers):**
- `nightly-drift-report.yml`
- `nightly-etl.yml`
- `watcher-cron.yml`
- `weekly-maint.yml`
- `systems-metrics.yml`
- `telemetry.yml`
- `chaos.yml`
- `benchmarks.yml`
- `compliance.yml`
- `regtech.yml`
- `revenue.yml`
- `data-quality.yml`
- `project-governance.yml`

**Fix Version Inconsistencies:**
- Search all workflows for `node-version: '18'` → Change to `'20'`
- Search all workflows for `version: 8` → Change to `9`
- Search all workflows for `pnpm/action-setup@v2` → Change to `@v3` or `@v4`

### 2. Consolidate Core CI (Day 3-4)

**Merge into `ci.yml`:**
- `ci-cd.yml` → Delete after merging
- `build.yml` → Delete after merging
- `pre-merge-validation.yml` → Delete after merging
- `quality-gates.yml` → Delete after merging
- `test-coverage-gate.yml` → Merge as non-blocking job

**New `ci.yml` Structure:**
```yaml
jobs:
  lint:          # Blocking
  type-check:    # Blocking
  test:          # Blocking
  build:         # Blocking
  test-coverage: # Non-blocking (informational)
  code-hygiene:  # Non-blocking (informational)
```

### 3. Fix Failure Masking (Day 5)

**Remove `continue-on-error: true` from:**
- `ci.yml` → `test` job (line 77)
- `ci.yml` → `test-coverage` job (line 104)
- All other blocking checks

**Fix underlying issues:**
- Fix flaky tests
- Fix missing secrets handling
- Fix test setup issues

---

## Target Workflow Structure

### Required Workflows (6-8 total)

1. **`ci.yml`** - Core CI (PRs + main)
   - lint, type-check, test, build (blocking)
   - test-coverage, code-hygiene (non-blocking)

2. **`e2e.yml`** - E2E tests (main only, not PRs)
   - Playwright smoke tests

3. **`security.yml`** - Security scans (nightly only)
   - Secrets scan, dependency scan, CodeQL, SBOM

4. **`deploy.yml`** - Deployment (main only)
   - Deploy to staging/production

5. **`nightly.yml`** - Nightly jobs (scheduled)
   - Drift report, benchmarks, chaos tests, compliance

6. **`release.yml`** - Release pipeline (manual)
   - Release validation, build, deploy, GitHub release

7. **`supabase-ci.yml`** - Supabase checks (on schema changes)
   - Migration validation, RLS tests

8. **`mobile.yml`** - Mobile checks (on mobile changes)
   - Build mobile app, test mobile app

---

## Branch Protection Rules

**Required Checks:**
- `ci/lint`
- `ci/type-check`
- `ci/test`
- `ci/build`

**Optional Checks (Don't Block):**
- `ci/test-coverage`
- `ci/code-hygiene`
- All security/nightly checks

---

## Local Development

**Add to `package.json`:**
```json
{
  "scripts": {
    "ci": "pnpm ci:lint && pnpm ci:type-check && pnpm ci:test && pnpm ci:build",
    "ci:lint": "turbo run lint",
    "ci:type-check": "turbo run type-check",
    "ci:test": "turbo run test",
    "ci:build": "turbo run build"
  }
}
```

**Run before pushing:**
```bash
pnpm ci
```

---

## Success Metrics

- ✅ **Check count:** ≤ 8 per PR
- ✅ **Pass rate:** > 95%
- ✅ **Runtime:** < 15 minutes
- ✅ **Flakiness:** < 1%

---

## Quick Reference

**Workflows to Keep:**
- `ci.yml` (consolidated)
- `e2e.yml` (main only)
- `security.yml` (nightly)
- `deploy.yml` (main)
- `nightly.yml` (scheduled)
- `release.yml` (manual)
- `supabase-ci.yml` (on schema changes)
- `mobile.yml` (on mobile changes)

**Workflows to Delete:**
- All experimental/redundant workflows (10+ files)
- All duplicate CI workflows (4+ files)

**Workflows to Make Scheduled-Only:**
- All nightly/weekly/monthly workflows (15+ files)

---

## Next Steps

1. Review full audit: `CI_AND_CODE_CLEANUP_AUDIT.md`
2. Start with Week 1 actions (stop the bleeding)
3. Create PRs in order listed
4. Monitor metrics and iterate
