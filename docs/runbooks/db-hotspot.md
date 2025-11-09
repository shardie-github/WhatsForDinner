# Database Hotspot Runbook

## Severity Assessment

- **P1 (Critical):** Database unavailable or > 50% queries timing out
- **P2 (Major):** P95 query latency > 1000ms affecting > 25% of queries
- **P3 (Minor):** Elevated query latency affecting specific tables/queries

## Detection

### Automated Alerts
- Database connection failures
- Query timeout alerts
- Slow query alerts (> 1s)
- Connection pool exhaustion

### Manual Detection
- High API latency correlated with DB queries
- Supabase dashboard showing elevated metrics
- Application errors mentioning database timeouts

## Investigation Checklist

### 1. Immediate Checks (0-5 minutes)

```bash
# Check database health
curl https://your-domain.com/api/health/db | jq

# Check connection pool status
# Supabase Dashboard: Connection Pooling section

# Check active connections
# Supabase Dashboard: Database > Active Connections
```

### 2. Query Performance (5-15 minutes)

- [ ] Review slow query logs
- [ ] Check query execution times
- [ ] Identify hot tables/queries
- [ ] Review query patterns

**Supabase Dashboard:**
- Database > Query Performance
- Database > Slow Queries
- Database > Active Queries

### 3. Resource Utilization (15-30 minutes)

- [ ] Check CPU usage
- [ ] Check memory usage
- [ ] Check disk I/O
- [ ] Check connection count

**Common Issues:**
- Missing indexes
- Full table scans
- Lock contention
- Resource exhaustion

### 4. Application Patterns (30-45 minutes)

- [ ] Review N+1 query patterns
- [ ] Check for missing connection pooling
- [ ] Review transaction patterns
- [ ] Check for long-running transactions

## Mitigation Steps

### Immediate Actions

1. **Kill Long-Running Queries** (if safe)
   ```sql
   -- List active queries
   SELECT pid, now() - pg_stat_activity.query_start AS duration, query
   FROM pg_stat_activity
   WHERE state = 'active' AND now() - pg_stat_activity.query_start > interval '5 minutes';
   
   -- Kill specific query (use with caution)
   SELECT pg_terminate_backend(pid);
   ```

2. **Enable Query Cancellation**
   - Set statement timeout
   - Configure connection pool timeouts
   - Implement query retry logic

3. **Scale Resources** (if applicable)
   - Supabase: Scale database tier if needed
   - Increase connection pool size
   - Add read replicas for read-heavy workloads

### Long-term Fixes

1. **Add Indexes**
   ```sql
   -- Identify missing indexes
   -- Use EXPLAIN ANALYZE on slow queries
   -- Add indexes on frequently queried columns
   
   CREATE INDEX CONCURRENTLY idx_table_column ON table(column);
   ```

2. **Optimize Queries**
   - Rewrite inefficient queries
   - Add query result caching
   - Implement pagination
   - Use materialized views for complex aggregations

3. **Connection Pooling**
   - Verify connection pool configuration
   - Use Supabase connection pooler
   - Implement connection retry logic
   - Monitor connection pool metrics

4. **Architecture Changes**
   - Implement read replicas
   - Add caching layer (Redis)
   - Consider database sharding
   - Move analytics to separate database

## What to Capture

### Database Metrics
- Query execution times (P50, P95, P99)
- Active connection count
- Slow query count and details
- CPU/memory/disk usage
- Lock wait times

### Query Information
- Slow query SQL statements
- Query execution plans (EXPLAIN ANALYZE)
- Table sizes and row counts
- Index usage statistics

### Application Context
- Affected endpoints/features
- Request patterns during incident
- Recent code changes affecting queries
- Deployment history

## Dashboards & Tools

- **Supabase Dashboard:** Database performance metrics
- **Health Endpoint:** `/api/health/db`
- **Metrics Endpoint:** `/api/metrics?name=db_query_latency`
- **Admin Dashboard:** `/admin/metrics`

## Common Hotspot Scenarios

### Scenario 1: Missing Index

**Symptoms:**
- Specific queries very slow
- Full table scans in EXPLAIN output
- High CPU usage on specific queries

**Fix:**
```sql
-- Analyze query plan
EXPLAIN ANALYZE SELECT * FROM table WHERE column = 'value';

-- Add index
CREATE INDEX CONCURRENTLY idx_table_column ON table(column);
```

### Scenario 2: N+1 Query Problem

**Symptoms:**
- Many small queries instead of one large query
- High query count per request
- Elevated latency

**Fix:**
- Use JOINs or batch queries
- Implement data loader pattern
- Add query result caching

### Scenario 3: Connection Pool Exhaustion

**Symptoms:**
- Connection timeout errors
- "Too many connections" errors
- High connection count

**Fix:**
- Increase pool size (if resources allow)
- Review connection lifecycle
- Implement connection retry with backoff
- Use Supabase connection pooler

### Scenario 4: Lock Contention

**Symptoms:**
- Queries waiting on locks
- High lock wait times
- Deadlocks in logs

**Fix:**
- Review transaction patterns
- Reduce transaction duration
- Use appropriate isolation levels
- Implement retry logic for deadlocks

## Escalation

- **P1:** Immediate escalation to engineering lead + Supabase support
- **P2:** Notify on-call engineer
- **P3:** Log for weekly review

## Post-Incident

1. **Post-Mortem** (within 48 hours)
   - Document root cause
   - Identify contributing factors
   - Create action items
   - Update query patterns documentation

2. **Monitoring**
   - Set up slow query alerts
   - Monitor connection pool metrics
   - Track query performance trends
   - Regular query performance reviews

## Related Runbooks

- [API Latency](./api-latency.md)
- [Build Failure](./build-failure.md)
- [Restore](./restore.md)
- [Main Incident Runbook](../INCIDENT_RUNBOOK.md)

---

**Last Updated:** {{ timestamp }}  
**Owner:** DevOps Team
