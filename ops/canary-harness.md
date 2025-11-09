# Canary & Shadow Deploy Harness

**Generated:** 2025-01-09  
**Module:** `checkout` (from inputs)  
**Platform:** Vercel (web), Expo (mobile)

---

## Overview

Canary deployments allow gradual rollout of changes to a subset of users, reducing risk of production incidents. This document defines the canary harness for the `checkout` module.

---

## Canary Deployment Strategy

### Vercel Preview → Canary Promotion

**Flow:**
1. PR creates preview deployment (automatic)
2. Run smoke tests on preview
3. Promote preview to canary (5% traffic)
4. Monitor metrics for 1 hour
5. If healthy, promote to production (100%)
6. If unhealthy, stop canary and rollback

### Canary Flags

**Feature Flag:** `canary_checkout` (boolean)

**Usage:**
```typescript
// In checkout code
if (featureFlags.canary_checkout) {
  // New checkout flow
} else {
  // Stable checkout flow
}
```

---

## Shadow Deployments

**Purpose:** Test new code without serving traffic to users

**Implementation:**
- Deploy to shadow environment
- Replay production traffic (mirrored)
- Compare metrics (latency, error rate)
- No user impact

**Vercel Shadow:**
- Use Vercel preview deployments as shadow
- Mirror production traffic
- Compare metrics

---

## Stop-Loss Thresholds

**Metrics to Monitor:**
- Error rate: >1% → stop canary
- p95 latency: >600ms (1.5x SLO) → stop canary
- Conversion rate: <90% of baseline → stop canary
- Payment failures: >0.5% → stop canary

**Actions:**
1. **Stop Canary:** Immediately route 100% to stable
2. **Alert:** Notify team via Slack/PagerDuty
3. **Investigate:** Review logs/metrics
4. **Rollback:** Revert PR if needed

---

## Vercel Preview Rules

**Current:** Preview deployments are public (no auth)

**Required:** Add preview protection

**Implementation:**
```json
// vercel.json
{
  "preview": {
    "password": "$VERCEL_PREVIEW_PASSWORD"
  }
}
```

**Or:** Use Vercel's password protection feature

---

## Expo Channel Gates (Mobile)

**Channels:**
- `production` - Stable release
- `canary` - Canary release (5% users)
- `preview` - Preview/QA

**EAS Configuration:**
```json
// eas.json
{
  "build": {
    "production": {
      "channel": "production"
    },
    "canary": {
      "channel": "canary",
      "distribution": "internal"
    }
  }
}
```

**Rollout:**
- Canary: 5% of users
- Gradual: 25% → 50% → 100% (if healthy)

---

## Rollback Plan

### Vercel Rollback

**Command:**
```bash
# Rollback to previous deployment
cd apps/web && vercel rollback --token $VERCEL_TOKEN
```

**Or:** Use Vercel dashboard to promote previous deployment

### Expo Rollback

**Command:**
```bash
# Promote previous channel
eas update --channel production --branch main --message "Rollback"
```

---

## Monitoring

**Metrics to Track:**
- Error rate (target: <0.1%)
- p95 latency (target: <400ms per SLO)
- Conversion rate (target: ≥baseline)
- Payment success rate (target: >99.5%)

**Tools:**
- Sentry (errors)
- Vercel Analytics (performance)
- Custom telemetry (see Phase C)

---

## Implementation Checklist

- [ ] Add feature flag system (if not exists)
- [ ] Configure Vercel preview protection
- [ ] Set up canary promotion workflow
- [ ] Configure stop-loss thresholds
- [ ] Set up monitoring/alerts
- [ ] Document rollback procedures
- [ ] Test canary deployment (dry run)
- [ ] Train team on canary process

---

**Last Updated:** 2025-01-09  
**Next Review:** After first canary deployment
