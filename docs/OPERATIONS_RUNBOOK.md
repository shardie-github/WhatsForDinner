# Operations Runbook

**Purpose**: Step-by-step procedures for common operational tasks, incidents, and maintenance.  
**Audience**: On-call engineers, DevOps, support team  
**Last Updated**: 2025-01-09

---

## QUICK REFERENCE

### Emergency Contacts

- **On-Call Engineer**: [Check PagerDuty/Slack]
- **Security Lead**: [Check team directory]
- **Privacy Officer**: `PRIVACY_OFFICER_EMAIL` env var
- **Supabase Support**: [Supabase Dashboard → Support]
- **Vercel Support**: [Vercel Dashboard → Support]

### Critical Commands

```bash
# Health check
npm run health:check

# Database status
npm run db:perf --check

# Secrets validation
npm run secrets:validate

# Cost monitoring
npm run cost:guard --check

# Security scan
npm run secrets:scan --check
```

---

## INCIDENT RESPONSE

### Severity Levels

- **P0 (Critical)**: Service down, data loss, security breach
- **P1 (High)**: Major feature broken, performance degradation
- **P2 (Medium)**: Minor feature broken, non-critical errors
- **P3 (Low)**: Cosmetic issues, minor bugs

### Incident Response Process

1. **Acknowledge** (within 5 minutes)
   - Confirm incident in Slack/PagerDuty
   - Create incident ticket
   - Notify team

2. **Assess** (within 15 minutes)
   - Check health endpoints (`/api/healthz`)
   - Review error logs (Sentry, Supabase logs)
   - Identify affected users/features

3. **Contain** (immediate)
   - Disable affected features (feature flags)
   - Rollback deployment if needed (`vercel rollback`)
   - Isolate affected systems

4. **Resolve** (target: < 1 hour for P0)
   - Apply fix
   - Verify resolution
   - Monitor for recurrence

5. **Post-Mortem** (within 1 week)
   - Document root cause
   - Identify prevention measures
   - Update runbook

---

## COMMON INCIDENTS

### Database Connection Errors

**Symptoms**: `ECONNREFUSED`, `timeout`, `too many connections`

**Diagnosis**:
```bash
# Check database status
npm run db:perf --check

# Check connection pool usage (Supabase Dashboard)
# Metrics → Database → Connection Pool

# Check for long-running queries
psql $DATABASE_URL -c "SELECT pid, now() - query_start as duration, query FROM pg_stat_activity WHERE state = 'active' AND query NOT LIKE '%pg_stat_activity%';"
```

**Resolution**:
1. **Connection pool exhausted**:
   - Increase pool size in Supabase Dashboard
   - Kill idle connections: `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle' AND now() - state_change > interval '5 minutes';`
   - Check for connection leaks (connections not closed)

2. **Database overloaded**:
   - Identify slow queries (see "Slow Query Investigation")
   - Add database indexes
   - Scale up database (Supabase Dashboard)

3. **Network issues**:
   - Check Supabase status page
   - Verify `DATABASE_URL` is correct
   - Test connection: `psql $DATABASE_URL -c "SELECT 1;"`

---

### OpenAI API Failures

**Symptoms**: Meal generation fails, `429 Too Many Requests`, `500 Internal Server Error`

**Diagnosis**:
```bash
# Check OpenAI status
curl https://status.openai.com/api/v2/status.json

# Check API usage/costs
npm run cost:guard --check

# Check error logs
# Sentry → Filter by "OpenAI" or "generateRecipes"
```

**Resolution**:
1. **Rate limiting (429)**:
   - Check rate limits: OpenAI Dashboard → Usage
   - Implement exponential backoff (see "Circuit Breaker Implementation")
   - Reduce request frequency (increase rate limit window)

2. **API outage**:
   - Enable fallback to cached recipes
   - Show user-friendly error message
   - Monitor OpenAI status page

3. **Cost overrun**:
   - Check cost guard alerts
   - Implement per-user rate limits
   - Consider switching to cheaper model (`gpt-4o-mini`)

**Prevention**:
- Implement circuit breaker (see guardrail utilities)
- Add cost alerts (`npm run cost:guard`)
- Cache common recipe requests

---

### Payment Processing Failures

**Symptoms**: Stripe webhook failures, subscription renewals failing

**Diagnosis**:
```bash
# Check Stripe dashboard
# Stripe Dashboard → Events → Filter by "failed"

# Check webhook logs
# Vercel Dashboard → Functions → /api/stripe/webhook → Logs

# Check subscription status
psql $DATABASE_URL -c "SELECT id, status, current_period_end FROM subscriptions WHERE status != 'active' LIMIT 10;"
```

**Resolution**:
1. **Webhook failures**:
   - Check webhook signature validation
   - Verify `STRIPE_WEBHOOK_SECRET` is correct
   - Retry failed webhooks manually (Stripe Dashboard)

2. **Payment method expired**:
   - Notify users via email
   - Show in-app notification
   - Provide payment update link

3. **Stripe outage**:
   - Monitor Stripe status page
   - Queue payment retries
   - Extend grace period for subscriptions

**Prevention**:
- Implement webhook idempotency
- Add payment failure alerts
- Test webhook handlers regularly

---

### Slow Query Investigation

**Symptoms**: API timeouts, slow page loads, database CPU high

**Diagnosis**:
```bash
# Check slow queries
npm run db:perf --check

# Query slow query log (if enabled)
psql $DATABASE_URL -c "SELECT query, mean_exec_time, calls FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;"

# Check for missing indexes
psql $DATABASE_URL -c "SELECT schemaname, tablename, attname, n_distinct, correlation FROM pg_stats WHERE schemaname = 'public' AND n_distinct > 100 ORDER BY abs(correlation) DESC;"
```

**Resolution**:
1. **Missing indexes**:
   - Identify slow queries
   - Add indexes (create migration)
   - Test query performance

2. **N+1 queries**:
   - Review application code
   - Use batch queries or joins
   - Enable query logging to identify patterns

3. **Table bloat**:
   - Run `VACUUM ANALYZE` on affected tables
   - Consider partitioning large tables
   - Archive old data

**Prevention**:
- Add query timeouts (`MAX_QUERY_DURATION_MS`)
- Monitor slow query logs
- Regular database maintenance (`VACUUM`, `ANALYZE`)

---

### Secrets Exposure

**Symptoms**: Unauthorized access, API key abuse, cost spikes

**Diagnosis**:
```bash
# Scan for exposed secrets
npm run secrets:scan --check

# Check Git history (if secret was committed)
git log --all --full-history --source -- "*" | grep -i "api_key\|password\|secret"

# Check for secrets in error logs
# Sentry → Search for "API key" or "secret"
```

**Resolution**:
1. **Secret exposed in code**:
   - Rotate secret immediately (`npm run ops:rotate-secrets`)
   - Remove secret from Git history (`git filter-branch` or BFG Repo-Cleaner)
   - Update all systems using the secret

2. **Secret exposed in logs**:
   - Review log redaction config
   - Rotate secret
   - Update logger config to redact the field

3. **Secret exposed to client**:
   - Check client bundle (`npm run analyze:bundle`)
   - Rotate secret
   - Verify no `NEXT_PUBLIC_*` vars contain secrets

**Prevention**:
- Pre-commit hooks to prevent secrets in commits
- Regular secrets scanning
- Secrets stored in Supabase Vault only

---

## ROUTINE MAINTENANCE

### Daily Tasks

- [ ] **Health Check**: Verify all services operational
  ```bash
  npm run health:check
  ```

- [ ] **Error Review**: Check Sentry for new errors
  - Review P0/P1 errors
  - Triage and assign

- [ ] **Cost Monitoring**: Check for cost anomalies
  ```bash
  npm run cost:guard --check
  ```

### Weekly Tasks

- [ ] **Database Maintenance**: Check database health
  ```bash
  npm run db:perf --check
  npm run watcher:db
  ```

- [ ] **Security Scan**: Scan for vulnerabilities
  ```bash
  npm run secrets:scan --check
  npm run supply-chain:check
  ```

- [ ] **Backup Verification**: Verify backups are working
  ```bash
  npm run backup:verify
  ```

### Monthly Tasks

- [ ] **Secrets Rotation**: Rotate critical secrets
  ```bash
  npm run ops:rotate-secrets
  ```
  - Rotate: `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `OPENAI_API_KEY`

- [ ] **Compliance Audit**: Verify GDPR/CCPA compliance
  ```bash
  npm run compliance:check
  npm run privacy:compliance
  ```

- [ ] **Performance Review**: Review performance metrics
  ```bash
  npm run performance:audit
  npm run perf:compare
  ```

### Quarterly Tasks

- [ ] **Penetration Testing**: Security audit
  ```bash
  npm run security:pentest
  ```

- [ ] **Disaster Recovery Test**: Test backup/restore
  ```bash
  npm run backup:restore --dry-run
  ```

- [ ] **Risk Register Review**: Update risk register
  - Review `docs/RISK_REGISTER.md`
  - Add new risks
  - Update mitigation status

---

## DEPLOYMENT PROCEDURES

### Pre-Deployment Checklist

- [ ] **Tests Pass**: All tests green
  ```bash
  npm run test:ci
  ```

- [ ] **Security Scan**: No vulnerabilities
  ```bash
  npm run secrets:scan --check
  npm run supply-chain:check
  ```

- [ ] **RLS Testing**: RLS policies verified
  ```bash
  npm run rls:test --check
  ```

- [ ] **Performance Budget**: Bundle size within limits
  ```bash
  npm run bundle:check
  npm run performance:budget
  ```

- [ ] **Environment Variables**: All required vars set
  ```bash
  npm run secrets:validate
  ```

### Deployment Steps

1. **Create Release Branch**:
   ```bash
   git checkout -b release/v1.x.x
   ```

2. **Run Pre-Deployment Checks** (see above)

3. **Deploy to Staging**:
   ```bash
   npm run deploy:staging
   ```

4. **Smoke Test Staging**:
   ```bash
   npm run smoke:test
   ```

5. **Deploy to Production**:
   ```bash
   npm run deploy:production
   # Or via Vercel: vercel deploy --prod
   ```

6. **Verify Production**:
   - Check health endpoint: `https://your-domain.com/api/healthz`
   - Monitor error rates (Sentry)
   - Check performance metrics

7. **Rollback Plan** (if issues):
   ```bash
   vercel rollback
   ```

### Post-Deployment

- [ ] **Monitor Error Rates**: Watch Sentry for 1 hour
- [ ] **Monitor Performance**: Check Lighthouse scores
- [ ] **Verify Critical Features**: Test meal generation, payments
- [ ] **Update Documentation**: Update changelog, release notes

---

## FEATURE FLAG MANAGEMENT

### Enabling a Feature Flag

1. **Add Flag to Database**:
   ```sql
   INSERT INTO feature_flags (user_id, flags) 
   VALUES ('user-id', '{"new_feature": true}'::jsonb)
   ON CONFLICT (user_id) 
   UPDATE SET flags = feature_flags.flags || '{"new_feature": true}'::jsonb;
   ```

2. **Check Flag in Code**:
   ```typescript
   const { data } = await supabase
     .from('feature_flags')
     .select('flags')
     .eq('user_id', userId)
     .single();
   
   const enabled = data?.flags?.new_feature === true;
   ```

3. **Gradual Rollout**:
   - Enable for internal users first
   - Enable for 10% of users
   - Monitor error rates
   - Gradually increase to 100%

### Disabling a Feature Flag (Kill Switch)

```sql
-- Disable for all users
UPDATE feature_flags 
SET flags = flags - 'new_feature';

-- Or disable globally via env var
EXPERIMENTS_KILL_SWITCH=true
```

---

## DATABASE OPERATIONS

### Running Migrations

```bash
# Development
npm run db:migrate:dev

# Production (via Supabase)
supabase db push

# Or manually
psql $DATABASE_URL -f supabase/migrations/XXX_migration.sql
```

### Backup & Restore

```bash
# Create backup
npm run backup:run

# Verify backup
npm run backup:verify

# Restore backup
npm run backup:restore
```

### Database Maintenance

```bash
# Vacuum and analyze
psql $DATABASE_URL -c "VACUUM ANALYZE;"

# Check table sizes
psql $DATABASE_URL -c "SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size FROM pg_tables WHERE schemaname = 'public' ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"

# Check index usage
psql $DATABASE_URL -c "SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch FROM pg_stat_user_indexes ORDER BY idx_scan ASC;"
```

---

## MONITORING & ALERTING

### Key Metrics to Monitor

1. **Error Rate**: < 1% of requests
   - Alert if: Error rate > 5%
   - Check: Sentry dashboard

2. **Response Time**: P95 < 2s
   - Alert if: P95 > 5s
   - Check: Vercel Analytics, OpenTelemetry

3. **Database Connections**: < 80% of pool
   - Alert if: Pool usage > 90%
   - Check: Supabase Dashboard → Database → Connection Pool

4. **Cost**: Within budget
   - Alert if: Daily cost > threshold
   - Check: `npm run cost:guard --check`

5. **API Rate Limits**: < 80% of limit
   - Alert if: Rate limit usage > 90%
   - Check: OpenAI Dashboard, Stripe Dashboard

### Setting Up Alerts

- **Sentry**: Error rate alerts (configure in Sentry dashboard)
- **Vercel**: Deployment alerts (configure in Vercel dashboard)
- **Supabase**: Database alerts (configure in Supabase dashboard)
- **Custom**: Slack webhooks (`SLACK_ALERT_WEBHOOK`), PagerDuty (`PAGERDUTY_API_KEY`)

---

## TROUBLESHOOTING GUIDE

### API Returns 500 Error

1. Check error logs (Sentry)
2. Check database connection (`npm run db:perf`)
3. Check third-party API status (OpenAI, Stripe)
4. Check environment variables (`npm run secrets:validate`)
5. Check recent deployments (Vercel dashboard)

### Slow Performance

1. Check database queries (`npm run db:perf`)
2. Check bundle size (`npm run analyze:bundle`)
3. Check third-party API latency
4. Check CDN cache hit rate (Vercel Analytics)
5. Review performance budgets (`npm run performance:budget`)

### Users Can't Access Data

1. Check RLS policies (`npm run rls:test`)
2. Check authentication (`getTenantContext` working?)
3. Check database connectivity
4. Check user permissions (household memberships)

---

## ESCALATION PATHS

1. **Level 1 (On-Call Engineer)**: Initial triage, common incidents
2. **Level 2 (Senior Engineer)**: Complex issues, architecture problems
3. **Level 3 (Engineering Lead/CTO)**: Critical incidents, security breaches
4. **Level 4 (External Support)**: Vendor issues (Supabase, Vercel, Stripe)

---

## REFERENCES

- [Risk Register](./RISK_REGISTER.md) - Risk assessment
- [Security Checklist](./SECURITY_CHECKLIST.md) - Security controls
- [Architecture Guide](../ARCHITECTURE.md) - System architecture
- [Secrets Migration Guide](./SECRETS_MIGRATION_GUIDE.md) - Secrets management

---

**Last Updated**: 2025-01-09  
**Next Review**: 2025-04-09
