# Metrics Dashboard Specification

**Purpose:** Define metrics dashboard requirements for finance model, automation monitoring, and growth experiments.

**Timezone:** America/Toronto

---

## Dashboard Overview

### 1. Financial Metrics Dashboard

**Purpose:** Real-time view of financial KPIs vs. forecast

**Key Metrics:**
- Revenue (actual vs. forecast by scenario)
- Gross Margin % (actual vs. target 70%)
- EBITDA Margin % (actual vs. target 20%)
- CAC (actual vs. forecast)
- LTV (actual vs. forecast)
- LTV:CAC Ratio (actual vs. target 3.0+)
- Refund Rate % (actual vs. threshold 6%)
- Cash Flow (actual vs. forecast)
- Cumulative Cash (actual vs. forecast)
- Cash Runway (months)

**Visualizations:**
- Time series: Revenue, Cash Flow, Cumulative Cash
- Bar chart: Actual vs. Forecast (Base/Optimistic/Conservative)
- Gauge: LTV:CAC Ratio, Gross Margin %, EBITDA Margin %
- Alert indicators: Refund Rate > 6%, CAC > $60, LTV:CAC < 3.0

**Data Source:** `metrics_daily` table

**Update Frequency:** Daily (after ETL completion)

---

### 2. Automation & ETL Dashboard

**Purpose:** Monitor ETL job execution and data pipeline health

**Key Metrics:**
- ETL Job Status (last 7 days)
- Records Processed (by job)
- Records Inserted/Updated/Failed (by job)
- Job Duration (by job)
- Error Rate (by job)
- Data Freshness (last successful pull per source)

**Visualizations:**
- Status timeline: Job execution over time
- Bar chart: Records processed by job
- Error log: Recent failures with error messages
- Health score: Overall pipeline health (0-100)

**Data Source:** `etl_logs` table

**Update Frequency:** Real-time (after each ETL job)

**Alerts:**
- Job failure (status = 'failed')
- High error rate (> 5% records failed)
- Stale data (> 24 hours since last successful pull)

---

### 3. Growth Experiments Dashboard

**Purpose:** Track experiment performance and impact on metrics

**Key Metrics:**
- Active Experiments (count)
- Experiment Status (draft/running/paused/completed)
- Success Metric Value (by experiment)
- Success Threshold (by experiment)
- Sample Size Progress (by experiment)
- Impact on Revenue/CAC/LTV (by experiment)

**Visualizations:**
- Experiment timeline: Start/end dates
- Success metric chart: Actual vs. threshold
- Impact analysis: Revenue/CAC/LTV before vs. after
- Statistical significance: p-value, confidence interval

**Data Source:** `experiments` table + `metrics_daily` (with experiment breakdown)

**Update Frequency:** Real-time (after each experiment update)

---

### 4. Channel Performance Dashboard

**Purpose:** Compare marketing channel efficiency

**Key Metrics:**
- Spend by Channel (Meta, TikTok, Google, Organic)
- Revenue by Channel (attributed)
- CAC by Channel
- ROAS (Return on Ad Spend) by Channel
- Conversion Rate by Channel
- Impressions, Clicks, Conversions by Channel

**Visualizations:**
- Stacked bar: Spend vs. Revenue by channel
- Line chart: CAC trend by channel
- Table: Channel comparison (CAC, ROAS, Conversion Rate)
- Funnel: Impressions → Clicks → Conversions by channel

**Data Source:** `spend` table + `orders` table (with attribution)

**Update Frequency:** Daily (after ETL completion)

---

## Dashboard Implementation Options

### Option 1: Supabase Dashboard (Built-in)
- Use Supabase Dashboard with custom SQL queries
- Pros: No additional setup, integrated with database
- Cons: Limited customization, basic visualizations

### Option 2: Metabase / Redash
- Open-source BI tools
- Pros: Rich visualizations, easy setup, SQL-based
- Cons: Requires additional infrastructure

### Option 3: Custom React Dashboard
- Build custom dashboard using React + Chart.js/Recharts
- Pros: Full control, integrated with app
- Cons: More development effort

### Option 4: Google Data Studio / Looker Studio
- Free BI tool from Google
- Pros: Easy to use, good visualizations, free
- Cons: Requires data connector setup

---

## SQL Queries for Dashboards

### Financial Metrics Query
```sql
SELECT 
  metric_date,
  metric_name,
  metric_value,
  metric_unit
FROM metrics_daily
WHERE metric_date >= CURRENT_DATE - INTERVAL '30 days'
  AND metric_name IN ('revenue', 'cac', 'ltv', 'ltv_cac_ratio', 'gross_margin_pct', 'ebitda_margin_pct', 'refund_rate', 'cash_flow', 'cumulative_cash')
ORDER BY metric_date DESC, metric_name;
```

### ETL Job Status Query
```sql
SELECT 
  job_name,
  status,
  started_at,
  completed_at,
  records_processed,
  records_inserted,
  records_failed,
  error_message
FROM etl_logs
WHERE started_at >= CURRENT_DATE - INTERVAL '7 days'
ORDER BY started_at DESC;
```

### Channel Performance Query
```sql
SELECT 
  channel,
  date,
  SUM(spend_cents) as total_spend,
  SUM(conversions) as total_conversions,
  SUM(conversion_value_cents) as total_revenue,
  CASE 
    WHEN SUM(conversions) > 0 THEN SUM(spend_cents) / SUM(conversions)
    ELSE 0
  END as cac
FROM spend
WHERE date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY channel, date
ORDER BY date DESC, channel;
```

### Experiment Performance Query
```sql
SELECT 
  e.slug,
  e.name,
  e.status,
  e.success_metric,
  e.success_threshold,
  m.metric_value as actual_value,
  m.metric_date
FROM experiments e
LEFT JOIN metrics_daily m ON m.metric_name = e.success_metric
WHERE e.status = 'running'
ORDER BY e.started_at DESC;
```

---

## Alert Configuration

### Financial Alerts
- **Refund Rate > 6%:** Email/Slack notification
- **CAC > $60:** Email/Slack notification
- **LTV:CAC < 3.0:** Email/Slack notification
- **Cash Runway < 3 months:** Urgent email/Slack notification

### ETL Alerts
- **Job Failure:** Immediate email/Slack notification
- **Error Rate > 5%:** Email/Slack notification
- **Stale Data (> 24h):** Email/Slack notification

### Experiment Alerts
- **Success Threshold Met:** Email/Slack notification
- **Statistical Significance Achieved:** Email/Slack notification
- **Experiment Failure:** Email/Slack notification

---

## Access Control

- **Financial Dashboard:** Finance team, executives
- **ETL Dashboard:** Engineering team, data team
- **Growth Experiments Dashboard:** Growth team, product team
- **Channel Performance Dashboard:** Marketing team, growth team

---

## Next Steps

1. Choose dashboard implementation option
2. Set up data connectors
3. Create initial dashboards
4. Configure alerts
5. Set up access control
6. Document dashboard usage

---

**Last Updated:** 2025-01-09  
**Owner:** Data Team
