# Experiment: Channel Attribution & CAC Optimization

**Slug:** `channel-attribution-optimization`  
**Status:** Ready to start  
**Created:** 2025-01-09  
**Owner:** Growth Team + Data Team

---

## Hypothesis

**If** we implement proper multi-touch attribution and optimize channel allocation based on actual CAC and LTV by channel,  
**Then** we can reduce overall CAC by 15-20% and improve LTV:CAC ratio,  
**Because** we'll shift spend from inefficient channels to efficient ones and optimize bidding strategies.

---

## Success Metrics

### Primary Metric
- **CAC Reduction:** 15-20% reduction in overall CAC
- **Metric Name:** `cac` (from `metrics_daily`)
- **Baseline:** $45 (Base scenario)
- **Target:** $36-38 (15-20% reduction)

### Secondary Metrics
- **LTV:CAC Ratio:** Improve from 6.67 to 7.5+
- **Channel Efficiency:** Identify top 3 channels by LTV:CAC
- **Revenue Attribution:** Accurate attribution across channels

---

## Success Threshold

**Primary:** CAC reduction of 15% or more (from $45 to $38.25 or lower)  
**Secondary:** LTV:CAC ratio improvement to 7.5+  
**Timeline:** 30 days to see impact

---

## Sample Size Heuristic

**Minimum Sample Size:** 1,000 conversions per channel for statistical significance  
**Current Traffic:** Analyze last 30 days of data  
**Estimated Duration:** 30 days (analysis + optimization + measurement)

**Statistical Significance:** p < 0.05 for channel comparison

---

## Rollout Plan

### Phase 1: Data Collection & Analysis (Days 1-7)
1. Implement multi-touch attribution tracking
2. Collect 7 days of baseline data
3. Analyze CAC and LTV by channel
4. Identify top-performing and underperforming channels

### Phase 2: Optimization (Days 8-14)
1. Reduce spend on channels with CAC > $50
2. Increase spend on channels with CAC < $40 and LTV:CAC > 8
3. Optimize bidding strategies for efficient channels
4. Monitor daily for negative signals

### Phase 3: Measurement (Days 15-30)
1. Measure CAC reduction vs. baseline
2. Track LTV:CAC ratio improvement
3. Monitor revenue impact (should be neutral or positive)
4. Document learnings and recommendations

---

## Rollback Plan

**Trigger Conditions:**
- CAC increases by > 10% vs. baseline
- Revenue decreases by > 5% vs. baseline
- LTV:CAC ratio decreases below 6.0

**Rollback Steps:**
1. Immediately revert channel allocation to baseline
2. Restore original bidding strategies
3. Analyze root cause of negative impact
4. Document learnings for future experiments

**Rollback Time:** < 24 hours

---

## Dependencies

- **Tables:** `spend`, `orders`, `events`, `metrics_daily`
- **ETL Scripts:** `pull_ads_meta.ts`, `pull_ads_tiktok.ts`, `compute_metrics.ts`
- **Attribution Model:** Multi-touch attribution implementation
- **Dashboard:** Channel performance dashboard

---

## Risk Assessment

**Risk Level:** Low  
**Risks:**
- Attribution model may not be accurate initially
- Channel optimization may reduce overall traffic
- Bidding changes may take time to stabilize

**Mitigation:**
- Start with conservative optimization (10% shift)
- Monitor daily for negative signals
- Have rollback plan ready
- Validate attribution model with historical data

---

## Expected Financial Impact

**30-Day Impact:**
- CAC reduction: 15-20% ($45 → $36-38)
- LTV:CAC improvement: 6.67 → 7.5+
- Revenue impact: Neutral to +5% (through better conversion)

**90-Day Impact:**
- Sustained CAC reduction
- Improved cash runway
- Better unit economics for scaling

---

## Measurement Plan

### Daily Monitoring
- CAC by channel
- LTV:CAC ratio by channel
- Revenue by channel
- Conversion rate by channel

### Weekly Review
- Overall CAC trend
- Channel allocation changes
- Statistical significance check
- Risk assessment

### 30-Day Review
- Final CAC reduction measurement
- LTV:CAC ratio improvement
- Revenue impact assessment
- Recommendations for next steps

---

## Notes

- This experiment is primarily data-driven and requires minimal product changes
- Focus on Meta and TikTok channels initially (highest spend)
- Consider Google Ads if applicable
- Attribution model should account for 7-day lookback window

---

**Next Steps:**
1. Set up multi-touch attribution tracking
2. Collect baseline data
3. Begin analysis
4. Start optimization
