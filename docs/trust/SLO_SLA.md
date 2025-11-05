# SLO/SLA Documentation

**Last Updated:** 2025-01-XX  
**Version:** 1.0.0

## Overview

This document defines our Service Level Objectives (SLOs), Service Level Agreements (SLAs), and error budgets for transparency and accountability.

---

## Service Level Objectives (SLOs)

### Availability SLO

**Target:** 99.9% uptime (monthly)

**Calculation:**
```
Uptime = (Total Time - Downtime) / Total Time × 100%

Example:
- Total Time: 30 days × 24 hours = 720 hours
- Downtime: 43 minutes (0.1% of month)
- Uptime: (720 - 0.72) / 720 × 100% = 99.9%
```

**Measurement Period:** Monthly (rolling 30 days)  
**Measurement Method:** External monitoring (ping checks every 1 minute)

**Error Budget:** 0.1% downtime per month (~43 minutes)

---

### API Latency SLO

**Target:** 95th percentile latency < 500ms

**Calculation:**
```
p95 Latency = 95th percentile of all API response times

Example:
- 95% of requests complete in < 500ms
- 5% of requests may exceed 500ms
```

**Measurement Period:** Daily (rolling 24 hours)  
**Measurement Method:** Application performance monitoring (APM)

**Error Budget:** 5% of requests may exceed 500ms

---

### Error Rate SLO

**Target:** Error rate < 0.1% (5xx errors)

**Calculation:**
```
Error Rate = (5xx Errors / Total Requests) × 100%

Example:
- Total Requests: 1,000,000
- 5xx Errors: 1,000
- Error Rate: 0.1%
```

**Measurement Period:** Daily (rolling 24 hours)  
**Measurement Method:** Application logs and monitoring

**Error Budget:** 0.1% error rate threshold

---

### Recipe Generation SLO

**Target:** Recipe generation completes in < 5 seconds (p95)

**Calculation:**
```
p95 Generation Time = 95th percentile of recipe generation times

Example:
- 95% of recipes generated in < 5 seconds
- 5% may exceed 5 seconds
```

**Measurement Period:** Daily (rolling 24 hours)  
**Measurement Method:** Application performance monitoring

**Error Budget:** 5% of generations may exceed 5 seconds

---

## Service Level Agreements (SLAs)

### Availability SLA

**Tier:** Standard  
**Target:** 99.9% uptime  
**Remedy:** Service credits or refunds if SLA not met

**Measurement:**
- Excludes scheduled maintenance
- Excludes user-caused issues
- Excludes force majeure events

---

### Response Time SLA

**Tier:** Standard  
**Target:** API responds within 500ms (p95)  
**Remedy:** Service credits if SLA not met

**Measurement:**
- Measured from edge location
- Excludes user network latency
- Excludes third-party API delays

---

## Error Budgets

### What is an Error Budget?

Error budgets represent the "acceptable" amount of unreliability. If we exhaust our error budget, we prioritize stability over new features.

### Error Budget Calculation

```
Error Budget = 100% - SLO Target

Examples:
- Availability SLO: 99.9% → Error Budget: 0.1%
- Error Rate SLO: 99.9% → Error Budget: 0.1%
- Latency SLO: 95% < 500ms → Error Budget: 5% > 500ms
```

### Error Budget Policy

1. **Green Zone (> 50% budget remaining):** Normal operations, new features OK
2. **Yellow Zone (25-50% budget remaining):** Caution, prioritize stability
3. **Red Zone (< 25% budget remaining):** Feature freeze, focus on reliability

---

## Escalation Path

### Level 1: Monitoring Alert

- **Trigger:** SLO threshold breached
- **Action:** Automated alert sent to on-call engineer
- **Response Time:** < 15 minutes

### Level 2: Team Lead

- **Trigger:** Level 1 not resolved within 30 minutes
- **Action:** Escalate to team lead
- **Response Time:** < 1 hour

### Level 3: Engineering Manager

- **Trigger:** Level 2 not resolved within 2 hours
- **Action:** Escalate to engineering manager
- **Response Time:** < 4 hours

### Level 4: CTO

- **Trigger:** Level 3 not resolved within 4 hours
- **Action:** Escalate to CTO
- **Response Time:** Immediate

---

## On-Call Notes

### On-Call Rotation

- **Schedule:** Weekly rotation
- **Coverage:** 24/7
- **Team Size:** 4 engineers
- **Handoff:** Monday 9 AM PST

### On-Call Responsibilities

1. **Monitor:** Watch for alerts and incidents
2. **Respond:** Acknowledge incidents within SLA
3. **Resolve:** Fix issues or escalate as needed
4. **Document:** Update incident logs and post-mortems

### On-Call Tools

- **PagerDuty:** Incident management and alerting
- **Slack:** Team communication
- **Status Page:** Public incident updates
- **Monitoring:** Datadog/New Relic dashboards

---

## Communication Cadence

### During Incidents

- **Critical:** Updates every 30 minutes
- **Major:** Updates every 2 hours
- **Minor:** Updates every 12 hours

### Post-Incident

- **Post-Mortem:** Within 7 days
- **Public Summary:** Published on status page (if applicable)
- **Internal Review:** Team retrospective

---

## Historical Performance

### Q4 2024

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Availability | 99.9% | 99.95% | ✅ Exceeded |
| API Latency (p95) | < 500ms | 420ms | ✅ Exceeded |
| Error Rate | < 0.1% | 0.05% | ✅ Exceeded |
| Recipe Generation (p95) | < 5s | 4.2s | ✅ Exceeded |

### Q3 2024

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Availability | 99.9% | 99.88% | ⚠️ Below target |
| API Latency (p95) | < 500ms | 480ms | ✅ Met |
| Error Rate | < 0.1% | 0.12% | ⚠️ Above target |
| Recipe Generation (p95) | < 5s | 5.8s | ⚠️ Above target |

**Note:** Q3 incidents resulted in temporary SLO breaches. Remediation completed in Q4.

---

## Service Credits

### Eligibility

- **Availability SLA:** If uptime < 99.9% for billing period
- **Response Time SLA:** If p95 latency > 500ms for billing period

### Credit Calculation

```
Credit = (Monthly Subscription × (1 - Actual Uptime)) × 2

Example:
- Monthly Subscription: $10
- Actual Uptime: 99.5%
- Credit: $10 × (1 - 0.995) × 2 = $0.10
```

**Maximum Credit:** 50% of monthly subscription

### Request Process

1. **Eligibility Check:** Verify SLA breach
2. **Credit Calculation:** Calculate credit amount
3. **Application:** Apply credit to next billing cycle
4. **Notification:** Email confirmation

---

## Exclusions

### Scheduled Maintenance

- **Excluded:** Planned maintenance windows
- **Notice:** Minimum 48 hours advance notice
- **Duration:** Typically 1-4 hours

### User-Caused Issues

- **Excluded:** Issues caused by user actions
- **Examples:** Invalid API usage, rate limiting

### Force Majeure

- **Excluded:** Events beyond our control
- **Examples:** Natural disasters, DDoS attacks, third-party outages

---

## Monitoring & Reporting

### Real-Time Monitoring

- **Dashboard:** Internal monitoring dashboard
- **Alerts:** Automated alerts for SLO breaches
- **Metrics:** Real-time SLO tracking

### Monthly Reports

- **Availability:** Monthly uptime report
- **Latency:** p95 latency trends
- **Error Rate:** Error rate trends
- **Incidents:** Incident summary and resolution times

### Public Reporting

- **Status Page:** Public status page with uptime metrics
- **Transparency:** Historical performance data available

---

## Contact

### SLA Inquiries
- **Email:** sla@whatsfordinner.com
- **Response Time:** Within 2 business days

### General Support
- **Email:** support@whatsfordinner.com
- **Help Center:** [/help](/help)

---

**Last Updated:** 2025-01-XX  
**Version:** 1.0.0
