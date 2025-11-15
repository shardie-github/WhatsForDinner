# READY: Product Simplification Sprint

**Type:** Realignment  
**Priority:** HIGH  
**Owner:** Product Lead  
**KPI:** User feedback "easier to use", activation time <2 min  
**30-Day Signal:** User feedback score improves, activation time reduced from 40 min → 2 min  
**Impact:** HIGH  
**Effort:** MEDIUM  
**Confidence:** 85%  
**Priority Score:** 8.5 (Impact × Confidence ÷ Effort)

---

## Problem

Product vision declared "simple meal planning" but execution includes 200+ API endpoints, federation, nomad features, marketplace, community portal. This complexity slows execution and confuses users.

**Evidence:**
- 200+ API endpoints documented
- Enterprise features (federation, nomad) present
- Multiple apps (web, mobile, marketplace, community)
- User activation time: 40 minutes (target: <2 min)

---

## Solution

1. **Archive non-core features:**
   - Federation features → archive
   - Nomad features → archive
   - Community portal → archive (keep for future)
   - Marketplace → archive (keep for future)

2. **Simplify to core flow:**
   - Pantry → Meal Suggestions → Grocery List
   - Remove complexity from onboarding
   - Focus on single-user experience first

3. **Reduce API surface:**
   - Consolidate endpoints
   - Remove unused endpoints
   - Document core API only

4. **Measure impact:**
   - Track activation time
   - Collect user feedback
   - Monitor retention

---

## Acceptance Criteria

- [x] Non-core features archived (script created: `pnpm archive:non-core`)
- [ ] Core flow simplified: Pantry → Suggestions → List (requires implementation)
- [ ] API endpoints reduced to <50 core endpoints (requires audit and consolidation)
- [ ] Activation time <2 min (from 40 min) (requires monitoring)
- [ ] User feedback score improves (requires implementation and monitoring)

---

## 30-Day Success Signal

User feedback: "easier to use", activation time <2 min, retention maintained or improved.

---

## Related

- `/backlog/READY_realignment_001.md` - Revenue Activation
- `/backlog/READY_realignment_005.md` - Solo Positioning
- `/reports/exec/unaligned_audit.md` - Full audit report
