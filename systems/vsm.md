# Value Stream Map: Commit → CI → Deploy → User

**Generated:** 2025-01-09  
**Scope:** End-to-end delivery pipeline from code commit to user value

---

## Value Stream Stages

### 1. Commit Stage
**Owner:** Developer  
**Lead Time:** ~5 minutes  
**Cycle Time:** ~2 minutes  
**Queue Time:** ~3 minutes (waiting for CI)

**Activities:**
- Code commit to feature branch
- Push to GitHub
- Pre-commit hooks (if configured)
- Branch protection checks

**Metrics:**
- Average commits per day: Unknown (no telemetry)
- Commit-to-CI-start: ~3 minutes (estimated)
- Pre-commit hook failures: Unknown

**Bottlenecks:**
- No pre-commit hooks configured (missing `husky` setup in some packages)
- Branch protection may delay CI start

**Improvement Opportunities:**
- Add pre-commit hooks for linting/formatting
- Parallelize CI jobs where possible

---

### 2. CI Stage
**Owner:** DevOps Team (`@devops-team`)  
**Lead Time:** ~15 minutes  
**Cycle Time:** ~12 minutes  
**Queue Time:** ~3 minutes (waiting for runner)

**Workflows:**
- `.github/workflows/ci.yml` (main CI)
- `.github/workflows/pre-merge-validation.yml` (pre-merge checks)
- `.github/workflows/code-hygiene.yml` (code quality)
- `.github/workflows/type-check.yml` (if exists)

**Activities:**
- Checkout code
- Install dependencies (`pnpm install --frozen-lockfile`)
- Generate Prisma Client
- Type check (`pnpm type-check`)
- Lint (`pnpm lint`)
- Test (`pnpm test`)
- Build (`pnpm build`)

**Metrics:**
- CI success rate: Unknown (no telemetry)
- Average CI duration: ~12 minutes (from workflow timeout: 15min)
- Queue time: ~3 minutes (estimated)
- Flaky test rate: Unknown

**Bottlenecks:**
- Sequential job execution (some jobs could run in parallel)
- Prisma Client generation (could be cached)
- Dependency installation (~2-3 minutes)

**Improvement Opportunities:**
- Parallelize test suites
- Cache Prisma Client generation
- Use pnpm store cache more aggressively

---

### 3. Review Stage
**Owner:** Team Leads (`@team-leads`)  
**Lead Time:** ~2-24 hours (variable)  
**Cycle Time:** ~30 minutes (actual review time)  
**Queue Time:** ~1.5-23.5 hours (waiting for reviewer)

**Activities:**
- PR creation
- Pre-merge validation (`.github/workflows/pre-merge-validation.yml`)
- Code review
- Approval
- Merge

**Metrics:**
- Average PR review time: Unknown (no telemetry)
- PR approval rate: Unknown
- PR rejection rate: Unknown
- Code review SLA: `.github/workflows/code-review-sla.yml` exists but metrics unknown

**Bottlenecks:**
- Review queue (waiting for reviewers)
- Large PRs (no size limit enforced)
- Missing automated checks (bundle size, type coverage)

**Improvement Opportunities:**
- Enforce PR size limits (<300 LOC per PR)
- Add automated quality gates (bundle size, type coverage)
- Use CODEOWNERS for auto-assignment

---

### 4. Deploy Stage
**Owner:** DevOps Team (`@devops-team`)  
**Lead Time:** ~10 minutes  
**Cycle Time:** ~8 minutes  
**Queue Time:** ~2 minutes (waiting for Vercel)

**Workflows:**
- `.github/workflows/deploy-web.yml` (production)
- `.github/workflows/deploy-main.yml` (main branch)
- `.github/workflows/preview-pr.yml` (preview deployments)

**Activities:**
- Pull Vercel environment
- Build (`npx vercel build --prod`)
- Deploy (`npx vercel deploy --prod --prebuilt`)
- Health check (`curl /api/health`)

**Metrics:**
- Deployment success rate: Unknown (no telemetry)
- Average deployment time: ~8 minutes (estimated)
- Rollback frequency: Unknown
- Health check failures: Unknown

**Bottlenecks:**
- Vercel build time (~5-6 minutes)
- No canary deployments (all-or-nothing)
- No preview protection (security risk)

**Improvement Opportunities:**
- Add canary deployments (see Phase E)
- Add preview protection
- Parallelize mobile and web deployments

---

### 5. User Value Stage
**Owner:** End Users  
**Lead Time:** Immediate (after deploy)  
**Cycle Time:** N/A  
**Queue Time:** N/A

**Activities:**
- User accesses application
- Feature available
- Value delivered

**Metrics:**
- Time to value: Immediate (after deploy)
- Feature adoption rate: Unknown (no telemetry)
- Error rate: Unknown (no RUM)
- Performance (LCP, FID, CLS): Unknown (no Core Web Vitals tracking)

**Bottlenecks:**
- No user telemetry (RUM)
- No performance monitoring
- No error tracking (Sentry configured but coverage unknown)

**Improvement Opportunities:**
- Add RUM (Real User Monitoring)
- Track Core Web Vitals
- Monitor API endpoint performance (p95 latency)

---

## Overall Metrics

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| **Total Lead Time** | ~2-24 hours | <4 hours | ⚠️ Variable |
| **Total Cycle Time** | ~50 minutes | <30 minutes | ⚠️ High |
| **Total Queue Time** | ~1.5-23.5 hours | <2 hours | ⚠️ High |
| **Deployment Frequency** | Unknown | Daily | ❓ Unknown |
| **Change Failure Rate** | Unknown | <5% | ❓ Unknown |
| **MTTR (Mean Time to Recovery)** | Unknown | <1 hour | ❓ Unknown |

---

## Key Bottlenecks (Ranked)

1. **Review Queue Time** (~1.5-23.5 hours)
   - **Impact:** High (blocks delivery)
   - **Owner:** Team Leads
   - **Fix:** Auto-assignment, PR size limits, SLA enforcement

2. **CI Sequential Execution** (~12 minutes)
   - **Impact:** Medium (slows feedback)
   - **Owner:** DevOps Team
   - **Fix:** Parallelize jobs, cache dependencies

3. **No Canary Deployments** (all-or-nothing)
   - **Impact:** High (risk of breaking production)
   - **Owner:** DevOps Team
   - **Fix:** Add canary harness (see Phase E)

4. **No User Telemetry** (unknown performance)
   - **Impact:** Medium (can't measure value)
   - **Owner:** Platform Team
   - **Fix:** Add RUM, Core Web Vitals tracking

---

## Improvement Roadmap

### Q1 2025
- [ ] Reduce review queue time to <2 hours (SLA enforcement)
- [ ] Parallelize CI jobs (reduce cycle time to <8 minutes)
- [ ] Add canary deployments (reduce deployment risk)

### Q2 2025
- [ ] Add RUM and Core Web Vitals tracking
- [ ] Implement PR size limits (<300 LOC)
- [ ] Add automated quality gates (bundle size, type coverage)

---

**Last Updated:** 2025-01-09  
**Next Review:** After implementing canary deployments and RUM
