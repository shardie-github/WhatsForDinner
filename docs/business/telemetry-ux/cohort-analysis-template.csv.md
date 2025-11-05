# Cohort Analysis Template

**What's for Dinner? — Cohort Analysis Guide**

## Overview

This document explains how to use the cohort analysis template (`cohort-analysis-template.csv`) to track user retention by cohort.

**Purpose**: Track retention by cohort (monthly signup cohorts) to identify retention trends and improvements.

**Update Frequency**: Monthly

---

## Template Structure

### CSV Format

**Columns**:
- `cohort`: Signup month (e.g., "2024-01")
- `users`: Number of users in cohort
- `day_0`: Day 0 retention (100% - all users)
- `day_7`: Day 7 retention (% of users active on day 7)
- `day_14`: Day 14 retention (% of users active on day 14)
- `day_21`: Day 21 retention (% of users active on day 21)
- `day_30`: Day 30 retention (% of users active on day 30)
- `day_60`: Day 60 retention (% of users active on day 60)
- `day_90`: Day 90 retention (% of users active on day 90)

**Rows**: Monthly cohorts (one row per month)

---

## How to Use

### Step 1: Track User Signups

**Process**:
- Track users by signup month (cohort)
- Count users in each cohort
- Update `users` column monthly

**Example**:
- January 2024: 50 users signed up → `cohort: 2024-01, users: 50`

---

### Step 2: Calculate Retention

**Process**:
- For each cohort, calculate retention at day 7, 14, 21, 30, 60, 90
- Retention = (Users active on day X / Total users in cohort) × 100

**Example**:
- January 2024 cohort: 50 users
- Day 7: 23 users active → 23/50 = 46% retention
- Day 30: 14 users active → 14/50 = 28% retention

---

### Step 3: Analyze Trends

**Analysis**:
- Compare retention across cohorts (improving or declining?)
- Identify retention patterns (when do users drop off?)
- Track improvements (are retention rates improving over time?)

**Insights**:
- **Improving Retention**: If later cohorts have higher retention than earlier cohorts
- **Declining Retention**: If later cohorts have lower retention than earlier cohorts
- **Drop-Off Points**: Identify when users drop off (day 7, day 30, etc.)

---

## Example Analysis

### Retention Trends

**January 2024 Cohort**:
- Day 7: 45% retention
- Day 30: 28% retention
- Day 90: 18% retention

**February 2024 Cohort**:
- Day 7: 48% retention (+3% improvement)
- Day 30: 30% retention (+2% improvement)
- Day 90: 20% retention (+2% improvement)

**Insight**: Retention improving over time (onboarding improvements, product improvements)

---

### Drop-Off Analysis

**Common Drop-Off Points**:
- **Day 0-7**: 50% drop-off (onboarding issues, initial value not clear)
- **Day 7-30**: 20% drop-off (engagement issues, value not delivered)
- **Day 30-90**: 10% drop-off (retention issues, product-market fit)

**Actions**:
- **Day 0-7**: Improve onboarding, clarify value proposition
- **Day 7-30**: Improve engagement, deliver value faster
- **Day 30-90**: Improve retention, build habit-forming features

---

## Retention Targets

### Target Retention Rates

**Day 7**: 40%+ retention (target: 45%+)  
**Day 30**: 25%+ retention (target: 30%+)  
**Day 90**: 15%+ retention (target: 20%+)

**Benchmark**: Compare to industry benchmarks (meal planning apps, mobile apps)

---

## Visualization

### Cohort Retention Chart

**Chart Type**: Heatmap or line chart

**Heatmap**:
- X-axis: Days (0, 7, 14, 21, 30, 60, 90)
- Y-axis: Cohorts (2024-01, 2024-02, 2024-03, etc.)
- Colors: Retention % (green = high, red = low)

**Line Chart**:
- X-axis: Days (0, 7, 14, 21, 30, 60, 90)
- Y-axis: Retention %
- Lines: One line per cohort

**Tools**: Excel, Google Sheets, Python (matplotlib), R (ggplot2)

---

## Monthly Updates

### Update Process

**Monthly**:
1. Add new cohort row (current month)
2. Calculate retention for previous cohorts (day 7, 14, 21, 30, 60, 90)
3. Analyze trends (compare cohorts, identify improvements)
4. Take action (improve onboarding, engagement, retention)

**Frequency**: Monthly (after month-end)

---

## Conclusion

**Cohort Analysis Purpose**: Track retention by cohort to identify retention trends and improvements.

**Key Metrics**: Day 7 retention (40%+), Day 30 retention (25%+), Day 90 retention (15%+).

**Success Criteria**: Improving retention over time (later cohorts have higher retention than earlier cohorts).

---

*Last Updated: [Auto-generated via CI]*
