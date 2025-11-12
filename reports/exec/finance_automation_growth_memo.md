# Finance → Automation → Growth Orchestrator Memo

**Generated:** 2025-01-27  
**Status:** Ready for Execution  
**Owner:** Growth Lead  
**Timeline:** 30/60/90-day plan

---

## Executive Summary

This memo outlines the integrated Finance → Automation → Growth workflow, connecting financial modeling, automated ETL, and growth experimentation into a self-healing system.

**Top 5 Actions:**
1. Enable monetization channels (Week 1)
2. Activate automated ETL with DQ gates (Week 1)
3. Launch Pre-fill Onboarding experiment (Week 2)
4. Validate financial model with real data (Week 4)
5. Scale successful experiments (Week 8)

---

## Finance Model

### Current State
- **Revenue:** $0 (channels built but not enabled)
- **Users:** 0 active users
- **CAC:** $45 (projected)
- **LTV:** $150 (projected)
- **LTV/CAC:** 3.33x (projected)

### 30-Day Target
- **Revenue:** $5,000 MRR
- **Users:** 100 active users
- **CAC:** $42 (validated)
- **LTV:** $165 (validated)
- **LTV/CAC:** 3.93x

### 60-Day Target
- **Revenue:** $12,000 MRR
- **Users:** 300 active users
- **CAC:** $38 (optimized)
- **LTV:** $180 (improved)
- **LTV/CAC:** 4.74x

### 90-Day Target
- **Revenue:** $45,000 MRR
- **Users:** 2,000 active users
- **CAC:** $38 (maintained)
- **LTV:** $180 (maintained)
- **LTV/CAC:** 4.74x

**Model Files:**
- `/models/finance_model.csv` - Raw data
- `/models/assumptions.json` - Assumptions with confidence
- `/reports/finance/forecast.md` - Full forecast

---

## Automation Stack

### ETL Pipeline
- **Frequency:** Daily at 01:10 America/Toronto
- **Sources:** Source A (ads), Source B (ads), Events (app)
- **Destination:** Supabase (events, spend, metrics_daily tables)
- **Features:** Dry-run support, retries, idempotent upserts

### Data Quality Gates
- **Pre-ETL:** Source reachability, auth validation, DB health
- **Post-ETL:** Row counts, completeness, uniqueness, freshness
- **Alerts:** Slack notifications on failures

### Metrics Rollup
- **Frequency:** Daily (after ETL)
- **Function:** `recompute_metrics_daily(start, end)`
- **Output:** Aggregated metrics in `metrics_daily` table

**Automation Files:**
- `/scripts/etl/pull_ads_source_a.ts` - Source A ETL
- `/scripts/etl/pull_ads_source_b.ts` - Source B ETL
- `/scripts/etl/pull_events.ts` - Events ETL
- `/scripts/etl/compute_metrics.ts` - Metrics computation
- `/infra/gh-actions/nightly-etl.yml` - CI/CD automation
- `/infra/cron/etl.cron` - Cron reference

---

## Growth Experiments Portfolio

### Experiment 1: Pre-fill Onboarding (Priority: 9.5)
- **Hypothesis:** Pre-filling pantry reduces activation time <2 min, increases activation rate to 75%
- **Launch:** Week 2
- **Duration:** 30 days
- **Success Signal:** Activation rate 75%+, time <2 min

### Experiment 2: Referral Program (Priority: 6.4)
- **Hypothesis:** Referral program drives 20% of new users, reduces CAC to $20
- **Launch:** Week 2
- **Duration:** 90 days
- **Success Signal:** Referral rate 20%+, blended CAC $20

### Experiment 3: Grocery Integration Conversion (Priority: 4.2)
- **Hypothesis:** Grocery CTA increases free-to-paid conversion 2x
- **Launch:** Week 3
- **Duration:** 60 days
- **Success Signal:** Grocery user conversion 10%+

### Experiment 4: Retention Email Automation (Priority: 2.1)
- **Hypothesis:** Weekly emails increase 30-day retention to 46%
- **Launch:** Week 5
- **Duration:** 90 days
- **Success Signal:** 30-day retention 46%+

### Experiment 5: Solo-First Onboarding (Priority: 1.8)
- **Hypothesis:** Solo-first flow increases solo activation 25%
- **Launch:** Week 6
- **Duration:** 60 days
- **Success Signal:** Solo activation 80%+

**Growth Files:**
- `/growth/portfolio.md` - Full portfolio
- `/growth/experiments/<slug>/plan.md` - Individual plans
- `/featureflags/flags.json` - Feature flags
- `/middleware/flags.ts` - Flag middleware

---

## 30/60/90-Day Plan

### 30 Days (Activation Phase)
**Week 1:**
- Enable monetization channels
- Activate automated ETL with DQ gates
- Set up monitoring and alerts

**Week 2:**
- Launch Pre-fill Onboarding experiment
- Launch Referral Program experiment
- Monitor baseline metrics

**Week 3:**
- Launch Grocery Integration Conversion experiment
- Review Week 2 experiment results
- Optimize based on early signals

**Week 4:**
- Validate financial model with real data
- Adjust assumptions based on actuals
- Review experiment results, iterate

**Success Criteria:**
- Revenue > $0
- 100+ active users
- At least one experiment showing positive signal
- Financial model validated with real data

---

### 60 Days (Optimization Phase)
**Week 5:**
- Launch Retention Email Automation experiment
- Scale successful experiments from Week 2-3
- Optimize CAC based on channel performance

**Week 6:**
- Launch Solo-First Onboarding experiment
- Review all experiment results
- Double down on winners, kill losers

**Week 7:**
- Optimize unit economics (CAC, LTV)
- Improve retention based on experiment learnings
- Scale acquisition channels

**Week 8:**
- Scale successful experiments
- Review financial model vs. actuals
- Plan next quarter experiments

**Success Criteria:**
- Revenue $12,000 MRR
- 300+ active users
- LTV/CAC >4x
- At least 2 experiments showing strong positive signals

---

### 90 Days (Scale Phase)
**Week 9-12:**
- Scale all successful experiments
- Optimize unit economics further
- Build new experiments based on learnings
- Review and update financial model

**Success Criteria:**
- Revenue $45,000 MRR
- 2,000+ active users
- LTV/CAC >4.5x
- Portfolio of 5+ successful experiments
- Financial model accurate within 10%

---

## Integration Points

### Finance ↔ Automation
- **ETL feeds financial model:** Daily metrics rollup → finance model validation
- **Financial model guides ETL:** Revenue targets → ETL source prioritization

### Automation ↔ Growth
- **ETL powers experiments:** Events data → experiment analysis
- **Experiments drive ETL:** New metrics → ETL pipeline expansion

### Finance ↔ Growth
- **Experiments validate financial model:** Real CAC/LTV → model updates
- **Financial model prioritizes experiments:** ROI targets → experiment selection

---

## Monitoring & Alerts

### Daily Checks
- ETL success/failure
- Data quality gates
- Revenue dashboard updates
- Experiment metrics

### Weekly Reviews
- Financial model vs. actuals
- Experiment results
- Unit economics trends
- Growth metrics

### Monthly Reviews
- Full financial forecast review
- Experiment portfolio performance
- Automation system health
- Growth strategy adjustments

---

## Next Steps

1. **Immediate (Week 1):**
   - [ ] Enable monetization channels
   - [ ] Activate automated ETL
   - [ ] Set up monitoring

2. **Short-term (Weeks 2-4):**
   - [ ] Launch experiments
   - [ ] Validate financial model
   - [ ] Review results

3. **Medium-term (Weeks 5-8):**
   - [ ] Scale successful experiments
   - [ ] Optimize unit economics
   - [ ] Plan next quarter

---

**Related Files:**
- `/models/finance_model.csv` - Financial data
- `/reports/finance/forecast.md` - Forecast details
- `/growth/portfolio.md` - Experiment portfolio
- `/dashboards/metrics_spec.md` - Dashboard KPIs
