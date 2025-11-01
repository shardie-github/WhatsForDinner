# On-Call Runbook

## Overview

This runbook provides guidance for on-call engineers responding to incidents.

---

## Where Logs, Metrics, and Alerts Live

### Logs

- **Supabase Dashboard**: `logs` table
  - Query via SQL editor
  - Filter by level, component, timestamp
- **Sentry**: Error logs and stack traces
- **Vercel Logs**: Application logs (Vercel dashboard)

### Metrics

- **Supabase Dashboard**: `system_metrics` table
  - Query via SQL editor
  - Metrics: api_performance, user_engagement, error_rate, cost_analysis
- **Sentry**: Error rates and trends
- **PostHog**: Product analytics metrics

### Alerts

- **Sentry**: Automatic error alerts (configured in Sentry dashboard)
- **Supabase**: Database alerts (configured in Supabase dashboard)
- **GitHub Actions**: CI/CD failure notifications

### Dashboards

**Recommended Dashboards** (set up in Supabase or external tool):

1. **System Health Dashboard**
   - `/api/health` status
   - `/api/readyz` status
   - Database connectivity

2. **Error Dashboard**
   - Error counts by type
   - Error trends (24h, 7d)
   - Unresolved errors

3. **Performance Dashboard**
   - API latency (p50, p95, p99)
   - Request throughput
   - Error rate

---

## Common Failures & Solutions

### 1. Health Check Failures

**Symptom**: `/api/health` or `/api/readyz` returns 503

**Investigation**:
```bash
# Check health endpoint
curl https://your-app.vercel.app/api/health

# Check readiness
curl https://your-app.vercel.app/api/readyz

# Check Vercel logs
# (Via Vercel dashboard)
```

**Common Causes**:
- Database connectivity issues
- Environment variables missing
- External service (OpenAI) downtime

**Resolution**:
1. Check Supabase status
2. Verify environment variables in Vercel
3. Check external service status
4. If persistent, consider rollback (see [rollback.md](./rollback.md))

### 2. High Error Rate

**Symptom**: Error rate >0.1% for 5+ minutes

**Investigation**:
```sql
-- Check error rate
SELECT 
  COUNT(*) FILTER (WHERE event_type = 'error_occurred') as error_count,
  COUNT(*) as total_events,
  ROUND(100.0 * COUNT(*) FILTER (WHERE event_type = 'error_occurred') / COUNT(*), 4) as error_rate_pct
FROM analytics_events
WHERE timestamp >= NOW() - INTERVAL '1 hour';

-- Check error types
SELECT 
  error_type,
  COUNT(*) as count
FROM error_reports
WHERE resolved = false
  AND created_at >= NOW() - INTERVAL '1 hour'
GROUP BY error_type
ORDER BY count DESC;
```

**Common Causes**:
- API endpoint failures
- Database query failures
- External service (OpenAI) errors
- Validation errors

**Resolution**:
1. Identify error pattern (check Sentry)
2. Check recent deployments
3. Verify external service status
4. If widespread, consider rollback

### 3. High API Latency

**Symptom**: p95 latency >3s for 10+ minutes

**Investigation**:
```sql
-- Check API latency
SELECT 
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY api_latency_ms) as p50_ms,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY api_latency_ms) as p95_ms,
  PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY api_latency_ms) as p99_ms,
  AVG(api_latency_ms) as avg_ms
FROM recipe_metrics
WHERE generated_at >= NOW() - INTERVAL '1 hour';
```

**Common Causes**:
- OpenAI API slow response
- Database slow queries
- High load
- Network issues

**Resolution**:
1. Check OpenAI status
2. Review database query performance
3. Check for DDoS/abuse
4. Scale if needed (Vercel auto-scales)

### 4. Database Connectivity Issues

**Symptom**: Database queries failing, health check reports database unhealthy

**Investigation**:
```bash
# Check Supabase status
# (Via Supabase dashboard)

# Check connection from app
curl https://your-app.vercel.app/api/health
```

**Common Causes**:
- Supabase downtime
- Connection pool exhaustion
- Network issues
- Credentials expired

**Resolution**:
1. Check Supabase status page
2. Verify credentials in Vercel
3. Check connection pool settings
4. Contact Supabase support if needed

### 5. Recipe Generation Failures

**Symptom**: Recipe generation endpoint (`/api/dinner`) failing

**Investigation**:
```sql
-- Check recipe generation errors
SELECT 
  COUNT(*) FILTER (WHERE feedback_score IS NULL AND api_latency_ms = 0) as failures,
  COUNT(*) as total_attempts
FROM recipe_metrics
WHERE generated_at >= NOW() - INTERVAL '1 hour';
```

**Common Causes**:
- OpenAI API errors
- Rate limiting
- Invalid prompts
- Timeout issues

**Resolution**:
1. Check OpenAI status and rate limits
2. Verify API key is valid
3. Check for prompt injection attempts
4. Review recent code changes

---

## SLO & Error Budget Policy

### Service Level Objectives (SLOs)

1. **Availability**: 99.9% (43 minutes downtime per month)
2. **Error Rate**: <0.1% of all requests
3. **API Latency**: p95 <3s, p99 <5s
4. **Data Freshness**: Events available within 5 minutes

### Error Budget

- **Monthly Error Budget**: 0.1% of requests
- **Depletion Triggers**:
  - Reduce deployment frequency
  - Increase testing requirements
  - Post-incident review mandatory

### Alert Thresholds

- **Critical**: Error rate >1% OR availability <99%
- **Warning**: Error rate >0.1% OR p95 latency >3s
- **Info**: Error rate >0.05% OR p95 latency >2s

---

## Escalation Procedures

### Level 1: On-Call Engineer

- Respond within 15 minutes
- Investigate and resolve common issues
- Escalate if unable to resolve in 30 minutes

### Level 2: Senior Engineer / Tech Lead

- Escalate for:
  - Data loss incidents
  - Security incidents
  - Extended downtime (>10 minutes)
  - Unclear resolution path

### Level 3: Engineering Manager / CTO

- Escalate for:
  - Critical security breaches
  - Extended downtime (>1 hour)
  - Customer-facing data loss

---

## Communication Templates

### Incident Started

```
?? INCIDENT: [Brief description]
Status: Investigating
Impact: [User-facing impact]
Started: [Timestamp]
On-call: [Engineer name]
```

### Status Update

```
?? UPDATE: [Incident description]
Status: [Investigating/Mitigating/Resolved]
Current action: [What we're doing]
ETA: [Expected resolution time]
```

### Incident Resolved

```
? RESOLVED: [Incident description]
Duration: [Duration]
Root cause: [Brief root cause]
Resolution: [What fixed it]
Post-incident: [Link to post-mortem]
```

---

## Post-Incident Checklist

After resolving an incident:

- [ ] Document incident in post-mortem doc
- [ ] Identify root cause
- [ ] Create issues for follow-up actions
- [ ] Update runbooks if needed
- [ ] Communicate resolution to team
- [ ] Review error budget impact
- [ ] Schedule post-mortem meeting (if critical)

---

## Useful Queries

### Error Trends (Last 24 Hours)

```sql
SELECT 
  DATE_TRUNC('hour', created_at) as hour,
  COUNT(*) as error_count
FROM error_reports
WHERE created_at >= NOW() - INTERVAL '24 hours'
GROUP BY hour
ORDER BY hour DESC;
```

### Top Errors (Last Hour)

```sql
SELECT 
  error_type,
  COUNT(*) as count,
  MAX(created_at) as latest
FROM error_reports
WHERE created_at >= NOW() - INTERVAL '1 hour'
GROUP BY error_type
ORDER BY count DESC
LIMIT 10;
```

### User Impact (Last Hour)

```sql
SELECT 
  COUNT(DISTINCT user_id) as affected_users,
  COUNT(*) as total_errors
FROM error_reports
WHERE created_at >= NOW() - INTERVAL '1 hour'
  AND user_id IS NOT NULL;
```

---

*Last updated: 2025-01-21*
