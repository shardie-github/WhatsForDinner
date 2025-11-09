# API Latency Runbook

## Severity Assessment

- **P1 (Critical):** P95 latency > 1000ms affecting > 50% of requests
- **P2 (Major):** P95 latency > 400ms affecting > 25% of requests
- **P3 (Minor):** P95 latency > 400ms affecting < 25% of requests

## Detection

### Automated Alerts
- SLO violation: API P95 > 400ms (from `ops.config.json`)
- Error rate spike correlated with latency
- Health check degradation

### Manual Detection
- User reports of slow responses
- Dashboard metrics showing elevated latency
- `/api/metrics` endpoint showing high values

## Investigation Checklist

### 1. Immediate Checks (0-5 minutes)

```bash
# Check current API health
curl https://your-domain.com/api/health | jq

# Check metrics endpoint
curl https://your-domain.com/api/metrics?name=api_latency_p95 | jq

# Check database connectivity
curl https://your-domain.com/api/health/db | jq
```

### 2. Database Performance (5-15 minutes)

- [ ] Check Supabase dashboard for query performance
- [ ] Review slow query logs
- [ ] Check connection pool utilization
- [ ] Verify database CPU/memory usage

**Common Issues:**
- Missing indexes
- Long-running queries
- Connection pool exhaustion
- Database resource constraints

### 3. Application Layer (15-30 minutes)

- [ ] Review recent deployments
- [ ] Check for memory leaks
- [ ] Review error logs for exceptions
- [ ] Check Vercel function execution times

**Common Issues:**
- Inefficient queries
- N+1 query problems
- Large payload processing
- Memory pressure

### 4. External Dependencies (30-45 minutes)

- [ ] Check third-party API response times
- [ ] Verify CDN performance
- [ ] Review edge function execution
- [ ] Check network latency

## Mitigation Steps

### Immediate Actions

1. **Scale Resources** (if applicable)
   ```bash
   # Vercel auto-scales, but check dashboard
   # Supabase: Check if scaling needed
   ```

2. **Enable Caching**
   - Check if cache headers are set
   - Verify CDN cache hit rate
   - Consider increasing cache TTL

3. **Reduce Load**
   - Temporarily disable non-critical features
   - Implement rate limiting if needed
   - Consider feature flag rollback

### Long-term Fixes

1. **Database Optimization**
   - Add missing indexes
   - Optimize slow queries
   - Consider read replicas for analytics

2. **Code Optimization**
   - Review query patterns
   - Implement pagination
   - Add request batching

3. **Architecture Changes**
   - Consider edge functions for static responses
   - Implement request queuing
   - Add response compression

## What to Capture

### Metrics
- P50, P95, P99 latency values
- Request rate during incident
- Error rate correlation
- Database query times
- External API response times

### Logs
- Application error logs
- Database slow query logs
- Edge function logs
- CDN access logs

### Timeline
- Detection time
- Investigation start
- Mitigation actions taken
- Resolution time

## Dashboards & Tools

- **Performance Dashboard:** `/admin/metrics`
- **API Metrics:** `/api/metrics`
- **Health Check:** `/api/health`
- **Supabase Dashboard:** Supabase project dashboard
- **Vercel Analytics:** Vercel dashboard

## Escalation

- **P1:** Immediate escalation to engineering lead
- **P2:** Notify on-call engineer
- **P3:** Log for weekly review

## Post-Incident

1. **Post-Mortem** (within 48 hours)
   - Document root cause
   - Identify contributing factors
   - Create action items
   - Update this runbook if needed

2. **Monitoring**
   - Verify SLO compliance restored
   - Monitor for 24 hours post-resolution
   - Check for recurrence patterns

## Related Runbooks

- [Build Failure](./build-failure.md)
- [Database Hotspot](./db-hotspot.md)
- [Main Incident Runbook](../INCIDENT_RUNBOOK.md)

---

**Last Updated:** {{ timestamp }}  
**Owner:** DevOps Team
