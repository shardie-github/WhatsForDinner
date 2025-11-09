# Systems Scorecard

**Last Updated:** 2025-01-XX

## Metrics

| Metric | Value | Status | Trend |
|--------|-------|--------|-------|
| Open PRs | ~30+ | 🔴 | ⚠️ High |
| Stale PRs (>48h) | ~15-20 | 🔴 | ⚠️ High |
| Failed CI Runs (last week) | TBD | ⚠️ | - |
| Lead Time | 3-5 days | 🔴 | - |
| CI Duration | 15 min | 🟡 | - |
| Rework Rate | ~25% | 🟡 | - |
| Type Coverage | ~85-90% | 🟡 | - |
| Uptime | TBD | ⚠️ | - |

## Status Legend

- 🟢 Green: Within target
- 🟡 Amber: Needs attention
- 🔴 Red: Critical issue
- ⚠️ Unknown: Needs measurement

## Trends

See `systems/history/` for historical data.

**Note:** Initial baseline established. Weekly updates via `.github/workflows/systems-metrics.yml`.

## Key Insights

1. **Code Review Bottleneck:** 48-72h wait time is primary constraint
2. **PR Queue:** High number of open PRs indicates capacity issue
3. **CI Performance:** 15min duration is acceptable but can be optimized
4. **Type Coverage:** ~85-90% estimated, target is 95%

## Next Actions

1. ✅ Establish baseline metrics
2. Implement code review SLAs
3. Reduce PR queue length
4. Optimize CI pipeline
5. Improve type coverage

---

**Updated:** Weekly via scheduled workflow (Monday 04:40 UTC)
