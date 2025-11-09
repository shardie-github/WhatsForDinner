# Leverage Points: Top Bottleneck + 3 Experiments

**Generated:** 2025-01-09  
**Scope:** Highest-impact improvements for delivery velocity and reliability  
**Method:** Value Stream Map analysis + code review findings

---

## Top Bottleneck: Review Queue Time

**Current State:**
- Review queue time: ~1.5-23.5 hours (highly variable)
- Average PR review time: Unknown (no telemetry)
- PR approval rate: Unknown
- No SLA enforcement despite `.github/workflows/code-review-sla.yml` existing

**Impact:**
- **Lead Time:** Blocks delivery (largest component of total lead time)
- **Developer Experience:** Frustration, context switching
- **Velocity:** Reduced feature delivery speed

**Root Causes:**
1. No auto-assignment (relies on manual CODEOWNERS)
2. No PR size limits (large PRs take longer to review)
3. No SLA enforcement (workflow exists but metrics unknown)
4. Reviewers may be overloaded (no visibility)

**Metric:** Average time from PR creation to first review comment

**Current Baseline:** Unknown (need to measure)

**Target:** <2 hours (from VSM target)

**Owner:** `@team-leads` (per RACI)

**2-Week Target:** Reduce average review queue time by 50% (e.g., from 12 hours to 6 hours)

**Experiments:**

### Experiment 1: Auto-Assignment via CODEOWNERS
- **Hypothesis:** Auto-assigning reviewers based on CODEOWNERS will reduce queue time
- **Implementation:** Configure GitHub auto-assignment in repository settings
- **Metric:** Time to first review comment
- **Success Criteria:** <2 hours for 80% of PRs

### Experiment 2: PR Size Limits
- **Hypothesis:** Enforcing <300 LOC per PR will reduce review time per PR
- **Implementation:** Add GitHub Action to check PR size, block if >300 LOC
- **Metric:** Average PR review time
- **Success Criteria:** <30 minutes per PR

### Experiment 3: Review SLA Enforcement
- **Hypothesis:** Enforcing SLA with alerts will improve reviewer responsiveness
- **Implementation:** Enhance `.github/workflows/code-review-sla.yml` to alert on SLA violations
- **Metric:** SLA compliance rate (% of PRs reviewed within SLA)
- **Success Criteria:** >90% compliance

---

## Experiment 2: Parallelize CI Jobs

**Current State:**
- CI cycle time: ~12 minutes
- Jobs run sequentially (type-check → lint → test → build)
- Some jobs could run in parallel

**Impact:**
- **Feedback Time:** Faster feedback to developers
- **Developer Experience:** Less waiting
- **Velocity:** Slightly improved (not the biggest bottleneck)

**Metric:** CI cycle time (time from start to completion)

**Current Baseline:** ~12 minutes

**Target:** <8 minutes

**Owner:** `@devops-team` (per RACI)

**2-Week Target:** Reduce CI cycle time by 33% (from 12min to 8min)

**Experiments:**

### Experiment 1: Parallelize Type-Check and Lint
- **Hypothesis:** Type-check and lint can run in parallel (no dependencies)
- **Implementation:** Split into separate jobs in `.github/workflows/ci.yml`
- **Metric:** CI cycle time
- **Success Criteria:** <10 minutes

### Experiment 2: Cache Prisma Client Generation
- **Hypothesis:** Caching Prisma Client generation will reduce CI time
- **Implementation:** Cache Prisma Client in GitHub Actions cache
- **Metric:** Prisma generation time
- **Success Criteria:** <30 seconds (from ~2 minutes)

### Experiment 3: Parallelize Test Suites
- **Hypothesis:** Splitting tests into parallel jobs will reduce test time
- **Implementation:** Use test matrix strategy to run tests in parallel
- **Metric:** Test execution time
- **Success Criteria:** <5 minutes (from ~8 minutes)

---

## Experiment 3: Add Canary Deployments

**Current State:**
- Deployment strategy: All-or-nothing (deploy to 100% of users)
- No gradual rollout
- High risk of breaking production
- Rollback requires full redeploy

**Impact:**
- **Reliability:** Reduced risk of production incidents
- **Confidence:** Safer deployments
- **MTTR:** Faster recovery (canary can be stopped quickly)

**Metric:** Deployment failure rate (% of deployments causing incidents)

**Current Baseline:** Unknown (no telemetry)

**Target:** <5% (industry standard)

**Owner:** `@devops-team` (per RACI)

**2-Week Target:** Implement canary harness for `checkout` module (from inputs)

**Experiments:**

### Experiment 1: Vercel Preview → Canary Promotion
- **Hypothesis:** Using Vercel preview deployments as canary will reduce risk
- **Implementation:** Configure canary promotion workflow (see Phase E)
- **Metric:** Canary failure rate (% of canaries stopped before production)
- **Success Criteria:** >0% (any caught failures are wins)

### Experiment 2: Feature Flags for Gradual Rollout
- **Hypothesis:** Using feature flags will allow gradual rollout without canary infrastructure
- **Implementation:** Add feature flag system (if not exists) or use existing
- **Metric:** Feature flag usage (% of deployments using flags)
- **Success Criteria:** >50% of deployments use flags

### Experiment 3: Shadow Deployments
- **Hypothesis:** Shadow deployments (test new code without serving traffic) will catch issues
- **Implementation:** Deploy to shadow environment, compare metrics
- **Metric:** Shadow failure rate (% of shadows catching issues)
- **Success Criteria:** >0% (any caught failures are wins)

---

## Experiment 4: Add RUM and API Telemetry

**Current State:**
- No Real User Monitoring (RUM)
- No API endpoint telemetry (p95 latency unknown)
- No Core Web Vitals tracking
- Performance issues unknown until users report

**Impact:**
- **Observability:** Can't measure user experience
- **SLO Compliance:** Can't verify SLO targets (p95 <400ms, LCP <2.5s)
- **Performance:** Can't optimize what we can't measure

**Metric:** % of endpoints with telemetry coverage

**Current Baseline:** 0%

**Target:** 100% (all API endpoints)

**Owner:** `@platform-team` (per RACI)

**2-Week Target:** Add telemetry to top 10 API endpoints (see Phase C)

**Experiments:**

### Experiment 1: Add RUM to Web App
- **Hypothesis:** Adding RUM will reveal performance issues
- **Implementation:** Integrate Sentry RUM or similar (Sentry already configured)
- **Metric:** RUM coverage (% of page loads tracked)
- **Success Criteria:** >90% coverage

### Experiment 2: Instrument API Endpoints
- **Hypothesis:** Adding p95 latency tracking will reveal slow endpoints
- **Implementation:** Add middleware to track API response times (see Phase C)
- **Metric:** % of endpoints with telemetry
- **Success Criteria:** 100% (all endpoints)

### Experiment 3: Track Core Web Vitals
- **Hypothesis:** Tracking Core Web Vitals will reveal UX issues
- **Implementation:** Add web-vitals library (already in dependencies) and track LCP, FID, CLS
- **Metric:** Core Web Vitals compliance (% meeting SLO targets)
- **Success Criteria:** >80% of page loads meet SLO (LCP <2.5s)

---

## Prioritization Matrix

| Experiment | Impact | Effort | Priority | Owner | Timeline |
|------------|--------|--------|----------|-------|----------|
| **Review Queue Time** | High | Medium | P0 | `@team-leads` | 2 weeks |
| **Canary Deployments** | High | High | P1 | `@devops-team` | 2 weeks (stub) |
| **CI Parallelization** | Medium | Low | P1 | `@devops-team` | 1 week |
| **RUM/Telemetry** | Medium | Medium | P2 | `@platform-team` | 2 weeks |

---

## Success Metrics Dashboard

**Target Metrics (2 weeks):**

1. **Review Queue Time:** <6 hours (50% reduction)
2. **CI Cycle Time:** <8 minutes (33% reduction)
3. **Canary Harness:** Implemented for `checkout` module
4. **Telemetry Coverage:** 100% of top 10 API endpoints

**Measurement:**
- Review queue time: GitHub API (time from PR creation to first comment)
- CI cycle time: GitHub Actions workflow duration
- Canary deployments: Deployment logs (canary → production promotion)
- Telemetry coverage: Code review (% of endpoints with instrumentation)

---

**Last Updated:** 2025-01-09  
**Next Review:** After 2-week experiments complete
