# Value Stream Map — Commit to Customer Impact

**Generated:** 2025-01-09  
**Scope:** Code → CI → Deploy → Observability → Feedback

## Current State Value Stream

### Stages & Metrics

| Stage | Lead Time | Cycle Time | Queue/WIP | Rework % | Notes |
|-------|-----------|------------|-----------|----------|-------|
| **Code** | - | - | - | - | Development phase |
| **Commit** | <1 min | <1 min | 0 | 0% | Git commit |
| **CI Build** | 5-15 min | 5-15 min | 0-2 | 5-10% | GitHub Actions |
| **Test** | 3-10 min | 3-10 min | 0-1 | 5-15% | Unit + Integration |
| **Review** | 2-48 hours | 15-60 min | 2-10 PRs | 10-20% | PR review queue |
| **Merge** | <1 min | <1 min | 0 | 0% | Merge to main |
| **Deploy Preview** | 2-5 min | 2-5 min | 0-3 | 2-5% | Vercel preview |
| **Deploy Staging** | 5-10 min | 5-10 min | 0-1 | 5% | Manual trigger |
| **Deploy Production** | 10-30 min | 10-30 min | 0 | 5% | Manual approval |
| **Observability** | Real-time | Real-time | 0 | - | Sentry, PostHog |
| **Feedback Loop** | 1-24 hours | - | - | - | Error → Fix |

### Estimated Totals

- **Total Lead Time:** ~3-48 hours (code to production)
- **Total Cycle Time:** ~30-120 minutes (active work)
- **Total Rework:** ~15-30% (from PR reopen/failed CI)

### Bottlenecks Identified

1. **PR Review Queue** - Longest queue (2-48 hours)
2. **CI Build Time** - High variance (5-15 min)
3. **Manual Deploy** - Requires approval (10-30 min)

### Handoffs

1. Developer → CI (automated)
2. CI → Reviewer (notification)
3. Reviewer → Merge (manual)
4. Merge → Deploy (automated)
5. Deploy → Observability (automated)
6. Observability → Developer (alert)

## Improvement Opportunities

### Exploit Constraints

1. **Parallelize CI stages** - Run tests in parallel
2. **Protect review capacity** - Dedicated review slots
3. **Automate safe deploys** - Auto-deploy to staging

### Reduce Feedback Delay

1. **Auto-comment on PRs** - Performance/security diffs
2. **Real-time error alerts** - Immediate notification
3. **Deploy status dashboard** - Visibility into pipeline

### Reduce Rework

1. **Pre-merge checks** - Type/test/UX lint
2. **Local validation** - Run checks before push
3. **Better error messages** - Clear failure reasons

## Metrics to Track

- Lead time per stage (trending)
- Cycle time per stage (trending)
- Queue length per stage (daily snapshot)
- Rework rate (failed CI / total CI)
- MTTR (mean time to resolution)
