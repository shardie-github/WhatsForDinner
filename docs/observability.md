# Observability Guide

## Overview

This document describes the observability infrastructure for "What's for Dinner", including logging, metrics, tracing, and health checks.

---

## What We Measure

### Logs

**Structured Logging** via `apps/web/src/lib/logger.ts`

- **Storage**: `logs` table in Supabase
- **Levels**: error, warn, info, debug
- **Fields**:
  - `level`: Log level
  - `message`: Log message
  - `context`: Additional context (JSON)
  - `user_id`: User identifier (if applicable)
  - `session_id`: Session identifier
  - `source`: 'frontend' | 'api' | 'edge_function' | 'system'
  - `component`: Component name
  - `timestamp`: ISO timestamp
  - `stack_trace`: Error stack trace (if error)

**Example**:
```typescript
import { logger } from '@/lib/logger';

await logger.error('Failed to generate recipe', {
  error: error.message,
  recipe_id: recipeId,
  user_id: userId,
}, 'api', 'recipe-generation');
```

### Metrics

**Metrics System** via `apps/web/src/lib/monitoring.ts`

- **Storage**: `system_metrics` table
- **Types**:
  - `api_performance`: API response times, throughput
  - `user_engagement`: User activity, feature usage
  - `error_rate`: Error counts and rates
  - `cost_analysis`: AI costs, infrastructure costs

**Example**:
```typescript
import { monitoringSystem } from '@/lib/monitoring';

await monitoringSystem.recordMetric('recipe_generation_latency', 1234, {
  model: 'gpt-4',
  endpoint: '/api/dinner',
});
```

### Traces

**Distributed Tracing** via `apps/web/src/lib/observability.ts`

- **Storage**: `traces`, `trace_spans` tables (implied from code structure)
- **Utilities**: `withTrace()`, `withSpan()`, `trackError()`

**Example**:
```typescript
import { withTrace } from '@/lib/observability';

await withTrace('recipe-generation', async (spanId) => {
  // Your code here
  // Spans automatically capture timing and errors
}, userId, sessionId, requestId);
```

### Error Tracking

**Error Reports** via `apps/web/src/lib/observability.ts`

- **Storage**: `error_reports` table
- **Fields**: error_type, message, stack_trace, user_id, session_id, context, severity, resolved status

---

## Where It Ships

### Primary Storage: Supabase

All observability data is stored in Supabase PostgreSQL:

- `logs` - Structured logs
- `system_metrics` - Performance and business metrics
- `analytics_events` - Product analytics events
- `error_reports` - Error tracking
- `traces` - Distributed traces (if table exists)
- `trace_spans` - Trace spans (if table exists)

### External Services

- **Sentry**: Error tracking and alerting (`@sentry/nextjs`)
- **PostHog**: Product analytics (`posthog-js`)
- **Supabase Dashboard**: Built-in analytics and monitoring

---

## How to Query

### Logs

```sql
-- Recent errors
SELECT * FROM logs
WHERE level = 'error'
  AND timestamp >= NOW() - INTERVAL '24 hours'
ORDER BY timestamp DESC
LIMIT 100;

-- Errors by component
SELECT 
  component,
  COUNT(*) as error_count
FROM logs
WHERE level = 'error'
  AND timestamp >= NOW() - INTERVAL '7 days'
GROUP BY component
ORDER BY error_count DESC;
```

### Metrics

```sql
-- API Performance (p50, p95, p99)
SELECT 
  metric_type,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY value) as p50,
  PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY value) as p95,
  PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY value) as p99,
  AVG(value) as avg,
  COUNT(*) as count
FROM system_metrics
WHERE metric_type = 'api_performance'
  AND timestamp >= NOW() - INTERVAL '24 hours'
GROUP BY metric_type;

-- Error Rate
SELECT 
  DATE_TRUNC('hour', timestamp) as hour,
  COUNT(*) FILTER (WHERE metric_type = 'error_rate') as error_count,
  AVG(value) FILTER (WHERE metric_type = 'error_rate') as avg_error_rate
FROM system_metrics
WHERE metric_type = 'error_rate'
  AND timestamp >= NOW() - INTERVAL '24 hours'
GROUP BY hour
ORDER BY hour DESC;
```

### Error Reports

```sql
-- Unresolved errors
SELECT 
  error_type,
  COUNT(*) as count,
  MAX(created_at) as latest
FROM error_reports
WHERE resolved = false
GROUP BY error_type
ORDER BY count DESC;

-- Error trend
SELECT 
  DATE_TRUNC('day', created_at) as day,
  COUNT(*) as error_count
FROM error_reports
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY day
ORDER BY day DESC;
```

---

## Health Checks

### Endpoints

1. **`/api/health`** - Basic health check
   - Checks: Database connectivity
   - Returns: 200 if healthy, 503 if unhealthy

2. **`/api/readyz`** - Readiness probe (NEW)
   - Checks: Database, API endpoints, external services
   - Returns: 200 if ready, 503 if not ready, 200 with degraded status if degraded
   - Use for: Kubernetes readiness probes, load balancer health checks

3. **`/api/observability/health`** - Observability system health
   - Checks: Logging, tracing, monitoring system health
   - Returns: Overall system health status

### Implementation

Health checks use `apps/web/src/lib/healthCheck.ts`:

```typescript
import { healthCheckSystem } from '@/lib/healthCheck';

const health = await healthCheckSystem.runHealthChecks();
// Returns: { overall, checks, timestamp, version, uptime, environment }
```

---

## Request Correlation

All logs, traces, and errors include correlation IDs:

- `user_id`: User identifier
- `session_id`: Session identifier (client-side)
- `request_id`: Request identifier (server-side)
- `trace_id`: Distributed trace identifier

This enables end-to-end request tracing across services.

---

## Alerting

### Current Alerting

- **Sentry**: Automatic error alerts (configured in Sentry dashboard)
- **Supabase**: Database alerts (configured in Supabase dashboard)

### Recommended Alerts

1. **Error Rate**: Alert if error rate >0.1% for 5 minutes
2. **API Latency**: Alert if p95 latency >3s for 10 minutes
3. **Health Check Failures**: Alert if `/api/readyz` returns 503
4. **Database Connectivity**: Alert if health check fails
5. **Background Jobs**: Alert if job failure rate >1%

---

## Dashboards

### Recommended Dashboards

1. **System Health Dashboard**
   - Health check status (all endpoints)
   - Database connectivity
   - External service status

2. **Performance Dashboard**
   - API latency (p50, p95, p99)
   - Request throughput
   - Error rate

3. **Error Dashboard**
   - Error counts by type
   - Error trends
   - Unresolved errors

4. **Cost Dashboard** (if applicable)
   - AI API costs
   - Infrastructure costs
   - Cost per user/metric

---

## Best Practices

1. **Log Levels**
   - `error`: Errors that need attention
   - `warn`: Warnings that may indicate issues
   - `info`: Important application events
   - `debug`: Detailed debugging information (dev only)

2. **Correlation IDs**
   - Always include `user_id`, `session_id`, and `request_id` in logs
   - Use `withTrace()` for automatic trace correlation

3. **Metrics**
   - Record metrics for all critical operations
   - Use consistent metric naming: `component_operation_metric`

4. **Error Tracking**
   - Use `trackError()` for all caught errors
   - Include context in error tracking

5. **Performance**
   - Track latency for all external API calls
   - Use tracing for complex operations

---

## Integration Points

### Sentry

- Configured via `@sentry/nextjs`
- Automatically tracks unhandled errors
- Manual tracking via `Sentry.captureException()`

### PostHog

- Client-side product analytics
- Events also sent to Supabase for server-side analysis

### Supabase

- All observability data stored in Supabase
- Use Supabase dashboard for basic queries
- Use SQL editor for complex queries

---

## Next Steps

1. ? Observability infrastructure implemented
2. ? Health checks created
3. ? Documentation created
4. ? Set up automated dashboards
5. ? Configure alerting rules
6. ? Set up log retention policies
7. ? Implement distributed tracing storage (if not already implemented)

---

*Last updated: 2025-01-21*
