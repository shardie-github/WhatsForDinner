# READY_realignment_002: Unblock GTM Launch

**Type:** Realignment  
**Priority:** 6.4 (Impact × Confidence ÷ Time)  
**Owner:** Engineering Lead  
**Status:** Ready  
**Estimated Effort:** 14 days

## Objective

Fix GTM blocker (test coverage) to enable launch readiness.

## Steps

1. Add test coverage tool to CI (Jest coverage, 2 days)
2. Set coverage gate: fail builds if <80% (1 day)
3. Increase test coverage to 80%+ (10 days)
4. Fix critical bugs identified in GTM audit (1 day)
5. Re-run GTM audit, verify score >90 (1 day)

## Success Criteria

- GTM audit score >90
- Test coverage >80%
- All critical bugs fixed
- CI fails builds below coverage threshold

## KPI

**Target:** GTM readiness: READY (from NOT_READY)

## 30-Day Signal

GTM audit score >90, test coverage >80%

## Dependencies

None

## Impact

**High** - Unblocks launch readiness, enables go-to-market execution

## Risk

Low - Straightforward technical task
