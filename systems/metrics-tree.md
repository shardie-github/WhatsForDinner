# Metrics Tree — Objective → Outcome → Proxy Metrics

**Generated:** 2025-01-XX  
**Framework:** Objective → Outcome Metrics → Proxy Metrics

## Objective: Product Excellence

### Outcome Metric: Customer Satisfaction (NPS/CSAT)
- **Target:** NPS > 50, CSAT > 4.5/5
- **Measurement:** Quarterly surveys, in-app feedback

#### Proxy Metrics:
1. **User Engagement**
   - Daily Active Users (DAU)
   - Weekly Active Users (WAU)
   - Session Duration
   - Pages per Session

2. **Feature Adoption**
   - % Users Using Core Features
   - Feature Completion Rate
   - Time to First Value

3. **Retention**
   - Day 7 Retention
   - Day 30 Retention
   - Churn Rate

---

## Objective: System Reliability

### Outcome Metric: Uptime (SLA)
- **Target:** 99.9% uptime (8.76 hours downtime/year)
- **Measurement:** Monitoring dashboards

#### Proxy Metrics:
1. **Availability**
   - Uptime Percentage
   - Mean Time Between Failures (MTBF)
   - Mean Time To Recovery (MTTR)

2. **Error Rates**
   - Error Rate (5xx)
   - API Error Rate
   - Client Error Rate (4xx)

3. **Performance**
   - p95 API Latency
   - p99 API Latency
   - Slowest Routes (top 10)
   - Database Query Time (p95)

---

## Objective: Developer Productivity

### Outcome Metric: Feature Delivery Speed
- **Target:** Reduce lead time by 50%
- **Measurement:** Value stream metrics

#### Proxy Metrics:
1. **Deployment Frequency**
   - Deploys per Week
   - Time to Deploy
   - Deployment Success Rate

2. **Code Quality**
   - Type Coverage %
   - Test Coverage %
   - Code Review Time
   - Rework Rate

3. **Developer Experience**
   - CI Pipeline Duration
   - Local Build Time
   - Time to First Contribution

---

## Objective: Business Growth

### Outcome Metric: Revenue Growth
- **Target:** 20% MoM growth
- **Measurement:** Revenue dashboards

#### Proxy Metrics:
1. **Acquisition**
   - New User Signups
   - Conversion Rate (Visitor → User)
   - Cost per Acquisition (CAC)

2. **Monetization**
   - Conversion Rate (Free → Paid)
   - Average Revenue Per User (ARPU)
   - Lifetime Value (LTV)

3. **Engagement**
   - Active Subscriptions
   - Feature Usage (Premium Features)
   - Referral Rate

---

## Metric Hierarchy Summary

```
Product Excellence
├── Customer Satisfaction (NPS/CSAT)
│   ├── User Engagement (DAU, WAU, Session Duration)
│   ├── Feature Adoption (% Users, Completion Rate)
│   └── Retention (D7, D30, Churn)
│
System Reliability
├── Uptime (99.9% SLA)
│   ├── Availability (MTBF, MTTR)
│   ├── Error Rates (5xx, API, 4xx)
│   └── Performance (p95 Latency, Slowest Routes)
│
Developer Productivity
├── Feature Delivery Speed (Lead Time)
│   ├── Deployment Frequency (Deploys/Week, TTD)
│   ├── Code Quality (Type Coverage, Test Coverage)
│   └── Developer Experience (CI Duration, Build Time)
│
Business Growth
├── Revenue Growth (20% MoM)
│   ├── Acquisition (Signups, Conversion, CAC)
│   ├── Monetization (Free→Paid, ARPU, LTV)
│   └── Engagement (Active Subs, Feature Usage)
```

## Measurement Plan

### Weekly Metrics
- DAU, WAU
- Error Rates
- Deployment Frequency
- CI Pipeline Duration

### Monthly Metrics
- NPS/CSAT
- Retention Rates
- Uptime %
- Revenue Growth
- Type/Test Coverage

### Quarterly Metrics
- Customer Satisfaction Surveys
- Feature Adoption Analysis
- Developer Productivity Review
- Business Metrics Review

## Dashboard Locations

- **Observability:** Grafana/Sentry dashboards
- **Analytics:** PostHog/Internal dashboards
- **Business:** Revenue dashboards
- **Engineering:** GitHub Actions metrics, CI dashboards

---

**Note:** Proxy metrics should be reviewed quarterly to ensure they remain predictive of outcome metrics.
