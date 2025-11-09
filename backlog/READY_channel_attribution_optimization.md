# Channel Attribution & CAC Optimization

**Owner:** Data Team + Growth Team  
**Status:** Ready  
**Priority:** High  
**Impact × Confidence ÷ Effort:** 8.0

---

## Objective

Implement multi-touch attribution tracking and optimize channel allocation based on actual CAC and LTV by channel to reduce overall CAC by 15-20% and improve LTV:CAC ratio.

**Why it matters:** Directly improves unit economics, extends cash runway, and enables more efficient growth scaling.

---

## Steps

1. **Set up multi-touch attribution tracking**
   - Implement attribution model (first-touch, last-touch, multi-touch)
   - Track user journey across channels
   - Store attribution data in `events` table

2. **Collect baseline data (7 days)**
   - Pull historical spend and order data
   - Calculate CAC and LTV by channel
   - Identify top-performing and underperforming channels

3. **Analyze channel performance**
   - Calculate CAC by channel (Meta, TikTok, Google, Organic)
   - Calculate LTV by channel (cohort analysis)
   - Calculate LTV:CAC ratio by channel
   - Identify optimization opportunities

4. **Optimize channel allocation**
   - Reduce spend on channels with CAC > $50
   - Increase spend on channels with CAC < $40 and LTV:CAC > 8
   - Optimize bidding strategies for efficient channels

5. **Monitor and measure (30 days)**
   - Track CAC reduction vs. baseline
   - Monitor LTV:CAC ratio improvement
   - Track revenue impact (should be neutral or positive)
   - Document learnings and recommendations

---

## Dependencies

- **Tables:** `spend`, `orders`, `events`, `metrics_daily`
- **ETL Scripts:** `pull_ads_meta.ts`, `pull_ads_tiktok.ts`, `compute_metrics.ts`
- **Attribution Model:** Multi-touch attribution implementation
- **Dashboard:** Channel performance dashboard (see `/dashboards/metrics_spec.md`)

---

## KPI

**Primary:** CAC reduction of 15% or more (from $45 to $38.25 or lower)  
**Secondary:** LTV:CAC ratio improvement to 7.5+  
**30-day signal:** CAC trending downward, channel allocation shifting to efficient channels

---

## Done When

- [ ] Multi-touch attribution tracking implemented
- [ ] Baseline CAC and LTV calculated by channel
- [ ] Channel allocation optimized based on data
- [ ] CAC reduced by 15% or more vs. baseline
- [ ] LTV:CAC ratio improved to 7.5+
- [ ] Results documented and recommendations provided

---

## Risk Assessment

**Risk Level:** Low  
**Mitigation:** Start with conservative optimization (10% shift), monitor daily, have rollback plan ready

---

## Estimated Effort

- **Data Analysis:** 3-5 days
- **Attribution Setup:** 2-3 days
- **Optimization:** 1-2 days
- **Monitoring:** Ongoing (1-2 hours/day)

**Total:** ~6-10 days + ongoing monitoring
