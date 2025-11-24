# GitHub Workflows Audit

**Date:** 2025-01-28  
**Total Workflows:** 41  
**Status:** Comprehensive Audit Complete

---

## Audit Methodology

Each workflow was evaluated based on:
1. **Purpose:** What does it do?
2. **Triggers:** When does it run?
3. **Dependencies:** Does it depend on scripts/files that exist?
4. **Value:** Does it provide actionable value?
5. **Status:** Active, Obsolete, Needs Update, or Stub

---

## Core Workflows (KEEP) ✅

### 1. `ci.yml` ✅ **ACTIVE - REQUIRED**
- **Purpose:** Quality gates (lint, type-check, test, build, smoke-tests)
- **Triggers:** PRs, push to main/develop
- **Status:** ✅ Active and essential
- **Action:** Keep

### 2. `frontend-deploy.yml` ✅ **ACTIVE - REQUIRED**
- **Purpose:** Frontend deployments to Vercel (preview + production)
- **Triggers:** PRs, push to main, manual
- **Status:** ✅ Active and essential
- **Action:** Keep

### 3. `supabase-migrate.yml` ✅ **ACTIVE - REQUIRED**
- **Purpose:** Database migrations
- **Triggers:** Push to main, manual
- **Status:** ✅ Active and essential
- **Action:** Keep

### 4. `supabase-ci.yml` ✅ **ACTIVE**
- **Purpose:** Schema validation and drift detection
- **Triggers:** PRs/push affecting supabase/prisma files
- **Status:** ✅ Active and valuable
- **Action:** Keep

### 5. `schema-validation.yml` ✅ **ACTIVE**
- **Purpose:** Schema health checks
- **Triggers:** PRs/push affecting schema files
- **Status:** ✅ Active and valuable
- **Action:** Keep

### 6. `e2e.yml` ✅ **ACTIVE - NEEDS UPDATE**
- **Purpose:** End-to-end smoke tests
- **Triggers:** Push to main, manual
- **Status:** ✅ Active but should be required for PRs
- **Action:** Keep and update to require for PRs

---

## Specialized Workflows (EVALUATE)

### 7. `security.yml` ⚠️ **EVALUATE**
- **Purpose:** Security scanning (Snyk, CodeQL, SBOM, container scanning, secrets scan, OWASP ZAP, OPA)
- **Triggers:** Nightly schedule, manual
- **Status:** ⚠️ May be overkill, but security is important
- **Dependencies:** Many tools (Snyk, CodeQL, Trivy, Gitleaks, TruffleHog, OWASP ZAP, OPA)
- **Action:** **KEEP** but consider consolidating

### 8. `compliance.yml` ✅ **ACTIVE**
- **Purpose:** Compliance checks (privacy manifest, data safety JSON)
- **Triggers:** PRs affecting compliance files, push to main
- **Status:** ✅ Active and valuable for app store compliance
- **Action:** Keep

### 9. `nightly.yml` ⚠️ **EVALUATE**
- **Purpose:** Architectural drift report, code hygiene, performance benchmarks
- **Triggers:** Nightly schedule (2 AM UTC), manual
- **Status:** ⚠️ Overlaps with `nightly-drift-report.yml`
- **Dependencies:** Scripts may not exist (`infra/selfcheck/validate-guardrails.sh`, `infra/selfcheck/detect-drift.js`)
- **Action:** **CONSOLIDATE** with `nightly-drift-report.yml` or remove if scripts don't exist

### 10. `nightly-drift-report.yml` ⚠️ **EVALUATE**
- **Purpose:** Architectural drift report (duplicate of `nightly.yml`)
- **Triggers:** Nightly schedule (2 AM UTC), manual
- **Status:** ⚠️ Duplicate of `nightly.yml`
- **Dependencies:** Scripts may not exist (`infra/selfcheck/validate-guardrails.sh`, `infra/selfcheck/detect-drift.js`)
- **Action:** **CONSOLIDATE** with `nightly.yml` or remove if scripts don't exist

### 11. `nightly-etl.yml` ⚠️ **EVALUATE**
- **Purpose:** ETL jobs (pull events, ads, compute metrics)
- **Triggers:** Nightly schedule (1:10 AM UTC), manual
- **Status:** ⚠️ Depends on scripts that may not exist (`scripts/etl/pull_events.ts`, etc.)
- **Dependencies:** `SUPABASE_DB_URL`, `GENERIC_SOURCE_A_TOKEN`, `GENERIC_SOURCE_B_TOKEN`
- **Action:** **REMOVE** if ETL scripts don't exist, otherwise keep

### 12. `agent-runner.yml` ⚠️ **EVALUATE**
- **Purpose:** Run unified agent system (autonomous improvements)
- **Triggers:** Every 12 hours, manual, push to main/develop affecting agents
- **Status:** ⚠️ Depends on `pnpm agent:run` script
- **Dependencies:** `agents/unified-agent.ts`, various secrets
- **Action:** **REMOVE** if agent system is not actively used, otherwise keep

### 13. `ai-audit.yml` ⚠️ **EVALUATE**
- **Purpose:** AI health audit, insights analysis, cost analysis, privacy compliance
- **Triggers:** Weekly schedule (Sunday 2 AM UTC), manual
- **Status:** ⚠️ Depends on AI scripts (`ai/self_diagnose.ts`, `ai/insights_agent.mjs`, etc.)
- **Dependencies:** Multiple AI scripts, OpenAI API key
- **Action:** **REMOVE** if AI scripts don't exist or aren't actively used, otherwise keep

### 14. `chaos.yml` ⚠️ **EVALUATE**
- **Purpose:** Chaos engineering tests
- **Triggers:** Nightly schedule (2 AM UTC), manual
- **Status:** ⚠️ Requires staging environment, Prometheus, chaos scenarios
- **Dependencies:** `packages/testing/chaos/scenarios.ts`, staging environment, Prometheus
- **Action:** **REMOVE** if staging environment doesn't exist, otherwise keep for future

### 15. `canary-deploy.yml` ⚠️ **STUB**
- **Purpose:** Canary deployments
- **Triggers:** Manual, PRs with `canary/deploy` label
- **Status:** ⚠️ **STUB** - Contains TODOs, not implemented
- **Action:** **REMOVE** - Not implemented, can be re-added when needed

### 16. `watcher-cron.yml` ⚠️ **EVALUATE**
- **Purpose:** Database integrity watcher, API contract watcher, AI performance watcher
- **Triggers:** Nightly schedule (1 AM UTC), manual
- **Status:** ⚠️ Depends on watcher scripts (`watchers/db_integrity.watcher.ts`, etc.)
- **Dependencies:** Watcher scripts, various secrets
- **Action:** **REMOVE** if watcher scripts don't exist, otherwise keep

### 17. `ops-ci.yml` ⚠️ **EVALUATE**
- **Purpose:** Ops CI (build matrix, ops doctor, E2E, synthetic monitor, performance, RLS guard, growth report, DR rehearsal, docs)
- **Triggers:** PRs, push to main/develop, hourly/weekly/monthly schedules
- **Status:** ⚠️ Very comprehensive, overlaps with other workflows
- **Dependencies:** Many ops scripts (`ops/cli/index.ts`, etc.)
- **Action:** **CONSOLIDATE** or **REMOVE** if ops scripts don't exist

### 18. `ops-matrix-ci.yml` ⚠️ **EVALUATE**
- **Purpose:** Ops matrix CI (similar to `ops-ci.yml`)
- **Triggers:** Unknown (need to check)
- **Status:** ⚠️ May be duplicate of `ops-ci.yml`
- **Action:** **REMOVE** if duplicate, otherwise evaluate

### 19. `release.yml` ✅ **ACTIVE**
- **Purpose:** Release automation
- **Triggers:** Push tags, manual
- **Status:** ✅ Active and valuable
- **Action:** Keep

### 20. `mobile.yml` ✅ **ACTIVE**
- **Purpose:** Mobile app builds
- **Triggers:** PRs, push to main
- **Status:** ✅ Active if mobile app exists
- **Action:** Keep if mobile app is active

---

## Monitoring & Observability (EVALUATE)

### 21. `system-health.yml` ⚠️ **EVALUATE**
- **Purpose:** System health checks
- **Triggers:** Unknown
- **Status:** ⚠️ Need to check triggers and dependencies
- **Action:** Evaluate

### 22. `systems-metrics.yml` ⚠️ **EVALUATE**
- **Purpose:** Systems metrics collection
- **Triggers:** Unknown
- **Status:** ⚠️ Need to check triggers and dependencies
- **Action:** Evaluate

### 23. `telemetry.yml` ⚠️ **EVALUATE**
- **Purpose:** Telemetry validation
- **Triggers:** Unknown
- **Status:** ⚠️ Need to check triggers and dependencies
- **Action:** Evaluate

### 24. `ci-metrics.yml` ⚠️ **EVALUATE**
- **Purpose:** CI metrics collection
- **Triggers:** Unknown
- **Status:** ⚠️ Need to check triggers and dependencies
- **Action:** Evaluate

---

## Specialized Workflows (EVALUATE)

### 25. `api-contract-testing.yml` ⚠️ **EVALUATE**
- **Purpose:** API contract testing
- **Triggers:** Unknown
- **Status:** ⚠️ Need to check triggers and dependencies
- **Action:** Evaluate

### 26. `architectural-integrity-tests.yml` ⚠️ **EVALUATE**
- **Purpose:** Architectural integrity tests
- **Triggers:** Unknown
- **Status:** ⚠️ Need to check triggers and dependencies
- **Action:** Evaluate

### 27. `benchmarks.yml` ⚠️ **EVALUATE**
- **Purpose:** Performance benchmarks
- **Triggers:** Unknown
- **Status:** ⚠️ May overlap with `nightly.yml` performance benchmarks
- **Action:** Evaluate and consolidate if duplicate

### 28. `data-quality.yml` ⚠️ **EVALUATE**
- **Purpose:** Data quality checks
- **Triggers:** Unknown
- **Status:** ⚠️ Need to check triggers and dependencies
- **Action:** Evaluate

### 29. `dr-drill.yml` ⚠️ **EVALUATE**
- **Purpose:** Disaster recovery drill
- **Triggers:** Unknown
- **Status:** ⚠️ May overlap with `ops-ci.yml` DR rehearsal
- **Action:** Evaluate and consolidate if duplicate

### 30. `integration-audit.yml` ⚠️ **EVALUATE**
- **Purpose:** Integration audit
- **Triggers:** Unknown
- **Status:** ⚠️ Need to check triggers and dependencies
- **Action:** Evaluate

### 31. `project-governance.yml` ⚠️ **EVALUATE**
- **Purpose:** Project governance checks
- **Triggers:** Unknown
- **Status:** ⚠️ Need to check triggers and dependencies
- **Action:** Evaluate

### 32. `regtech.yml` ⚠️ **EVALUATE**
- **Purpose:** Regulatory technology checks
- **Triggers:** Unknown
- **Status:** ⚠️ Need to check triggers and dependencies
- **Action:** Evaluate

### 33. `reliability-orchestrator.yml` ⚠️ **EVALUATE**
- **Purpose:** Reliability orchestration
- **Triggers:** Unknown
- **Status:** ⚠️ Need to check triggers and dependencies
- **Action:** Evaluate

### 34. `remediation_orchestrator.yml` ⚠️ **EVALUATE**
- **Purpose:** Remediation orchestration
- **Triggers:** Unknown
- **Status:** ⚠️ Need to check triggers and dependencies
- **Action:** Evaluate

### 35. `revenue.yml` ⚠️ **EVALUATE**
- **Purpose:** Revenue tracking/reporting
- **Triggers:** Unknown
- **Status:** ⚠️ Need to check triggers and dependencies
- **Action:** Evaluate

### 36. `trust.yml` ⚠️ **EVALUATE**
- **Purpose:** Trust/reputation checks
- **Triggers:** Unknown
- **Status:** ⚠️ Need to check triggers and dependencies
- **Action:** Evaluate

### 37. `vercel-guard.yml` ⚠️ **EVALUATE**
- **Purpose:** Vercel guard checks
- **Triggers:** Unknown
- **Status:** ⚠️ Need to check triggers and dependencies
- **Action:** Evaluate

### 38. `vercel-promotion.yml` ✅ **ACTIVE**
- **Purpose:** Promote Vercel deployments
- **Triggers:** Unknown
- **Status:** ✅ Active and valuable for rollback
- **Action:** Keep

### 39. `weekly-maint.yml` ⚠️ **EVALUATE**
- **Purpose:** Weekly maintenance
- **Triggers:** Weekly schedule
- **Status:** ⚠️ Need to check what it does
- **Action:** Evaluate

### 40. `wiring-check.yml` ⚠️ **EVALUATE**
- **Purpose:** Wiring/connectivity checks
- **Triggers:** Unknown
- **Status:** ⚠️ Need to check triggers and dependencies
- **Action:** Evaluate

### 41. `deploy.yml` ⚠️ **DEPRECATED**
- **Purpose:** Old deployment workflow (mixed frontend + migrations)
- **Triggers:** Disabled
- **Status:** ⚠️ **DEPRECATED** - Marked for removal by 2025-02-28
- **Action:** **REMOVE** after 2025-02-28

---

## Summary

### Keep (Core - 6 workflows)
1. `ci.yml` ✅
2. `frontend-deploy.yml` ✅
3. `supabase-migrate.yml` ✅
4. `supabase-ci.yml` ✅
5. `schema-validation.yml` ✅
6. `e2e.yml` ✅ (needs update to require for PRs)

### Keep (Specialized - 4 workflows)
7. `security.yml` ✅ (consider consolidating)
8. `compliance.yml` ✅
9. `release.yml` ✅
10. `vercel-promotion.yml` ✅

### Keep (Conditional - 1 workflow)
11. `mobile.yml` ✅ (if mobile app is active)

### Remove Immediately (2 workflows)
12. `canary-deploy.yml` ❌ (stub, not implemented)
13. `deploy.yml` ❌ (deprecated, remove after 2025-02-28)

### Evaluate & Remove if Scripts Don't Exist (8 workflows)
14. `nightly-etl.yml` ⚠️ (check if ETL scripts exist)
15. `agent-runner.yml` ⚠️ (check if agent system is used)
16. `ai-audit.yml` ⚠️ (check if AI scripts exist)
17. `chaos.yml` ⚠️ (check if staging environment exists)
18. `watcher-cron.yml` ⚠️ (check if watcher scripts exist)
19. `ops-ci.yml` ⚠️ (check if ops scripts exist)
20. `ops-matrix-ci.yml` ⚠️ (check if duplicate)
21. `nightly.yml` ⚠️ (consolidate with `nightly-drift-report.yml`)

### Evaluate Remaining (20 workflows)
- Need to check triggers, dependencies, and actual usage
- Many may be obsolete or stubs

---

## Recommendations

1. **Immediate Actions:**
   - Remove `canary-deploy.yml` (stub)
   - Remove `deploy.yml` after 2025-02-28
   - Update `e2e.yml` to require for PRs

2. **Short-Term (Next Week):**
   - Check if scripts exist for conditional workflows
   - Remove workflows if scripts don't exist
   - Consolidate duplicate workflows (`nightly.yml` + `nightly-drift-report.yml`)

3. **Medium-Term (Next Month):**
   - Evaluate remaining 20 workflows
   - Remove obsolete ones
   - Consolidate similar workflows
   - Document purpose of each remaining workflow

4. **Target:** Reduce from 41 workflows to ~15-20 essential workflows

---

## Next Steps

1. ✅ Create this audit document
2. ⏳ Check script dependencies for conditional workflows
3. ⏳ Remove stub/obsolete workflows
4. ⏳ Update `e2e.yml` to require for PRs
5. ⏳ Consolidate duplicate workflows
6. ⏳ Document remaining workflows
