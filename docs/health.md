# Health Check Endpoints

This document describes the health check endpoints available in the application.

## API Health Endpoint

### `/api/healthz`

Returns comprehensive health status of all backend services.

#### Request

```bash
curl http://localhost:3000/api/healthz
```

#### Response

```json
{
  "ok": true,
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production",
  "checks": {
    "database": {
      "healthy": true,
      "latency": 45
    },
    "auth": {
      "healthy": true
    },
    "storage": {
      "healthy": true
    },
    "rls": {
      "effective": true,
      "unauthReadBlocked": true,
      "authReadAllowed": true
    }
  },
  "responseTime": 120
}
```

#### Status Codes

- `200` - All checks passed (healthy)
- `503` - Some checks failed (degraded/unhealthy)

#### Check Details

- **database**: Database connectivity and latency
- **auth**: Supabase Auth service availability
- **storage**: Supabase Storage service availability (if configured)
- **rls**: Row Level Security effectiveness check

## Edge Function Health Endpoint

### `app-health` Edge Function

Supabase Edge Function for health checks.

#### Request

```bash
curl https://ghqyxhbyyirveptgwoqm.supabase.co/functions/v1/app-health \
  -H "Authorization: Bearer <anon-key>"
```

#### Response

```json
{
  "ok": true,
  "db": {
    "ok": true,
    "latency": 30
  },
  "auth": {
    "ok": true
  },
  "realtime": {
    "ok": true
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Monitoring Integration

### Vercel Monitoring

The `/api/healthz` endpoint is automatically monitored by Vercel if deployed there.

### Custom Monitoring

Set up monitoring to hit these endpoints:

```bash
# Cron job example (every 5 minutes)
*/5 * * * * curl -f https://your-app.vercel.app/api/healthz || alert
```

### Health Check Script

Run the comprehensive reality check:

```bash
pnpm doctor
```

This validates:
- Environment variables
- Supabase REST API
- Prisma database connection
- Realtime subscription
- Storage upload/download (if configured)

## Troubleshooting

### Health Check Fails

1. Check environment variables are set correctly
2. Verify Supabase project is active
3. Check database connection string
4. Review application logs

### Database Check Fails

- Verify `DATABASE_URL` is correct
- Check database is accessible from your network
- Ensure SSL mode is `require` for Supabase

### Auth Check Fails

- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
- Check Supabase Auth service status
- Review Supabase dashboard for errors

### RLS Check Fails

- Verify RLS policies are enabled on tables
- Check migration `052_rls_app_tables.sql` was applied
- Review RLS policy definitions
