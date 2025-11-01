# Connection Pooling Guide

## Overview
This guide explains connection pooling configuration for Supabase PostgreSQL database.

## Current Status
- [x] Supabase connection pooling available
- [ ] Connection pool settings configured
- [ ] Pool monitoring enabled

## Supabase Connection Pooling

Supabase provides built-in connection pooling via PgBouncer. There are three connection modes:

### 1. Session Mode (Default)
- **Use case**: Standard queries, transactions
- **Connection string**: Standard `NEXT_PUBLIC_SUPABASE_URL`
- **Connection limit**: Managed by Supabase
- **Suitable for**: Most Next.js applications

### 2. Transaction Mode (Recommended for Serverless)
- **Use case**: Serverless functions, API routes
- **Connection string**: `https://<project-ref>.supabase.co` (same as session)
- **Pooling**: Handled automatically
- **Benefits**: Better for short-lived connections

### 3. Direct Connection
- **Use case**: Admin operations, migrations
- **Connection string**: Direct PostgreSQL connection
- **Note**: Bypasses connection pool, use sparingly

## Configuration

### Environment Variables
```env
# Standard Supabase URL (includes pooling)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

# Service role key for server-side operations
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Pool settings (if using custom pooling)
DATABASE_POOL_MAX=20
DATABASE_POOL_MIN=5
```

### Next.js API Routes
Connection pooling is handled automatically by Supabase client:

```typescript
import { createClient } from '@supabase/supabase-js'

// Client automatically uses connection pooling
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

## Best Practices

### 1. Reuse Client Instances
```typescript
// ? Good: Reuse client
const supabase = createClient(...)

// ? Bad: Create new client per request
function handler(req) {
  const supabase = createClient(...) // Don't do this
}
```

### 2. Close Connections Properly
Supabase client handles connection cleanup automatically, but for server-side:

```typescript
// Client cleanup is automatic in Next.js
// But be explicit for long-running processes:
async function longRunningTask() {
  const supabase = createClient(...)
  try {
    // Your operations
  } finally {
    // Connections are cleaned up automatically
  }
}
```

### 3. Monitor Connection Usage
```sql
-- Check active connections (admin only)
SELECT count(*) FROM pg_stat_activity WHERE datname = current_database();

-- Check connection pool stats (if using custom pooling)
SELECT * FROM pg_stat_database WHERE datname = current_database();
```

## Monitoring

### Supabase Dashboard
1. Go to Database ? Connection Pooling
2. View current connection usage
3. Monitor connection pool metrics
4. Set up alerts for high connection usage

### Application Monitoring
Monitor connection-related errors:
- "Too many connections"
- "Connection timeout"
- "Pool exhausted"

### Recommended Thresholds
- **Warning**: > 80% of pool capacity
- **Critical**: > 95% of pool capacity
- **Action**: Scale up or optimize queries

## Troubleshooting

### Issue: Too Many Connections
**Symptoms**: Errors about connection limits
**Solutions**:
1. Use connection pooling (Supabase handles this)
2. Reuse client instances
3. Close idle connections
4. Optimize long-running queries

### Issue: Connection Timeouts
**Symptoms**: Requests timeout or fail
**Solutions**:
1. Check network connectivity
2. Verify Supabase project status
3. Review query performance
4. Check for connection leaks

### Issue: Slow Queries
**Symptoms**: Database queries are slow
**Solutions**:
1. Check query execution plans
2. Add appropriate indexes
3. Optimize N+1 queries
4. Use connection pooling (transaction mode)

## Connection Pool Settings

### For Serverless (Vercel/Next.js)
Use default Supabase connection pooling:
- No additional configuration needed
- Supabase handles pooling automatically
- Works optimally with serverless functions

### For Traditional Servers
If using a traditional server setup:
```env
DATABASE_POOL_MAX=20
DATABASE_POOL_MIN=5
DATABASE_POOL_IDLE_TIMEOUT=30000
```

## Testing

### Connection Pool Test
```typescript
// Test connection pooling
async function testConnectionPool() {
  const clients = []
  
  // Create multiple clients (should share pool)
  for (let i = 0; i < 10; i++) {
    const client = createClient(...)
    clients.push(client)
  }
  
  // Run concurrent queries
  await Promise.all(
    clients.map(client => client.from('recipes').select('count'))
  )
}
```

### Load Testing
```bash
# Test connection pool under load
ab -n 1000 -c 10 https://your-app.com/api/recipes

# Monitor connection usage during test
```

## Next Steps
1. Verify connection pooling is working
2. Set up connection monitoring
3. Configure connection pool alerts
4. Document connection pool usage patterns
