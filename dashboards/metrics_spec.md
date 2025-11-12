# Metrics Specification & Dashboard KPIs

**Generated:** 2025-01-27  
**Purpose:** Define KPIs, data quality tiles, and dashboard structure

---

## Core KPIs

### Revenue Metrics
- **MRR (Monthly Recurring Revenue):** Sum of all subscription revenue per month
- **ARR (Annual Recurring Revenue):** MRR × 12
- **Revenue by Channel:** Affiliate, API, Marketplace, Data Insights, Subscriptions
- **Revenue Growth Rate:** MoM % change

### User Metrics
- **Active Users (DAU/MAU):** Daily/Monthly active users
- **New Users:** Users who signed up in period
- **Activation Rate:** % of signups who generate first meal plan
- **Retention (7/30/90-day):** % of users active after N days

### Unit Economics
- **CAC (Customer Acquisition Cost):** Total marketing spend / new users
- **LTV (Lifetime Value):** Average revenue per user × average lifetime
- **LTV/CAC Ratio:** Target >3x
- **Payback Period:** Time to recover CAC

### Product Metrics
- **Time-to-Activation:** Minutes from signup to first meal plan
- **Pantry-First Suggestions:** % of suggestions using existing pantry items
- **Grocery Integration Usage:** % of users using grocery sync
- **Solo vs. Family Users:** Split and respective metrics

### Data Quality Metrics
- **Data Freshness:** Hours since last ETL run
- **Completeness:** % of required fields populated
- **Uniqueness:** Duplicate detection rate
- **Validity:** % of records passing validation rules

---

## Dashboard Tiles

### Revenue Dashboard
1. **MRR Trend** (line chart, last 90 days)
2. **Revenue by Channel** (stacked bar, current month)
3. **ARR Projection** (number, current)
4. **Revenue Growth Rate** (sparkline, MoM)

### User Dashboard
1. **Active Users Trend** (line chart, DAU/MAU, last 90 days)
2. **Activation Rate** (gauge, current)
3. **Retention Cohort** (heatmap, 7/30/90-day)
4. **New Users by Source** (pie chart, current month)

### Unit Economics Dashboard
1. **CAC Trend** (line chart, last 90 days)
2. **LTV Trend** (line chart, last 90 days)
3. **LTV/CAC Ratio** (gauge, current)
4. **Payback Period** (number, current)

### Product Dashboard
1. **Time-to-Activation** (histogram, last 30 days)
2. **Pantry-First Suggestions** (gauge, current)
3. **Grocery Integration Usage** (bar chart, last 30 days)
4. **Solo vs. Family Split** (pie chart, current)

### Data Quality Dashboard
1. **ETL Status** (status tile, last run time, success/failure)
2. **Data Freshness** (gauge, hours since last run)
3. **Completeness** (gauge, % complete)
4. **Uniqueness** (gauge, duplicate rate)
5. **Validity** (gauge, % valid)

---

## Data Quality Gates

### Pre-ETL Checks
- [ ] Source APIs reachable
- [ ] Authentication tokens valid
- [ ] Database connection healthy
- [ ] Required tables exist

### Post-ETL Checks
- [ ] Row counts > 0 (or expected range)
- [ ] Required fields NOT NULL
- [ ] No duplicate primary keys
- [ ] Data freshness < 24 hours
- [ ] Foreign key constraints satisfied

### Alert Thresholds
- **Data Freshness > 24h:** Warning
- **Data Freshness > 48h:** Critical
- **Completeness < 90%:** Warning
- **Completeness < 80%:** Critical
- **Duplicate Rate > 1%:** Warning
- **Duplicate Rate > 5%:** Critical

---

## Data Sources

### Events Table
- **Source:** Application events (signups, activations, meal plans)
- **Frequency:** Real-time (via application)
- **Key Fields:** event_name, event_time, user_id, metadata

### Spend Table
- **Source:** Ads platforms (Source A, Source B)
- **Frequency:** Daily (via ETL)
- **Key Fields:** platform, date, spend, impressions, clicks

### Metrics Daily Table
- **Source:** Aggregated from events + spend
- **Frequency:** Daily (via rollup)
- **Key Fields:** date, mrr, active_users, cac, ltv

---

## Implementation Notes

- **Dashboard Tool:** Use Supabase Dashboard, Grafana, or custom React dashboard
- **Refresh Frequency:** Real-time for events, hourly for metrics, daily for rollups
- **Retention:** Keep raw events 90 days, aggregated metrics 2 years
- **Backup:** Daily backups of metrics_daily table

---

**Related Files:**
- `/scripts/etl/compute_metrics.ts` - Metrics computation
- `/scripts/agents/run_data_quality.ts` - DQ checks
- `/tests/data_quality.sql` - DQ SQL queries
