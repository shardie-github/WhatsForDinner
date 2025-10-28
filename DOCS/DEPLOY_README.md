# Deployment Guide

This guide covers the deployment process, checks, and troubleshooting for the Whats For Dinner application.

## Pre-Deployment Checks

### Required Checks
All checks must pass before deployment:

1. **Bundle Size Check**
   ```bash
   pnpm bundle:check
   ```
   - Client bundles: < 400 KB (fail), < 250 KB (warn)
   - Serverless bundles: < 1.5 MB (fail), < 1.2 MB (warn)

2. **Secrets Scan**
   ```bash
   node scripts/secrets-scan.mjs --check
   ```
   - No secrets in code
   - No SERVICE_ROLE in client bundles

3. **RLS Smoke Test**
   ```bash
   node scripts/rls-smoke.ts --check
   ```
   - Anonymous access properly blocked
   - Service role access working

4. **Database Performance**
   ```bash
   node scripts/db-slowquery-check.mjs --check
   ```
   - P95 queries < 300ms
   - All test queries passing

5. **Health Check**
   ```bash
   node scripts/healthcheck.js --check
   ```
   - Database connectivity
   - System health verification

### Optional Checks
These checks run conditionally:

1. **Micro-load Test**
   - Runs when PR has `perf-check` label
   - Tests API performance under load
   - P95 response time < 700ms

2. **Cost Guard**
   - Runs on main branch deployments
   - Monitors daily/monthly costs
   - Alerts on threshold breaches

## Deployment Process

### Automatic Deployment
Deployments are triggered automatically:

1. **Staging**: Push to `develop` branch
2. **Production**: Push to `main` branch

### Manual Deployment
```bash
# Deploy to staging
vercel --target staging

# Deploy to production
vercel --target production
```

## Environment Configuration

### Required Environment Variables

#### Supabase
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

#### Vercel
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

#### Optional
- `STAGING_URL` (for load testing)
- `NODE_ENV`

### Environment Parity
All environments must have the same required variables:
- Local development
- GitHub Actions
- Vercel Preview
- Vercel Production

## Bypassing Checks

### Emergency Bypass
In critical situations, checks can be bypassed with approval:

1. **Bundle Size Bypass**
   - Add `bypass-bundle-check` label to PR
   - Requires maintainer approval
   - Document reason in PR description

2. **Performance Bypass**
   - Add `bypass-perf-check` label to PR
   - Requires maintainer approval
   - Monitor performance post-deployment

### Bypass Process
1. Create PR with bypass label
2. Request maintainer review
3. Document bypass reason
4. Monitor post-deployment
5. Address issues in follow-up PR

## Monitoring Post-Deployment

### Health Endpoints
- **Health Check**: `/api/health`
- **Self Test**: `/api/selftest`
- **Status**: 200 = healthy, 503 = unhealthy

### Key Metrics
- **Uptime**: > 99.9%
- **Response Time**: P95 < 300ms
- **Error Rate**: < 0.1%
- **Bundle Size**: Within budgets

### Monitoring Tools
- Vercel Analytics
- Supabase Dashboard
- GitHub Actions
- Health check endpoints

## Troubleshooting

### Common Deployment Issues

#### Bundle Size Exceeded
1. Check for large dependencies
2. Verify tree shaking
3. Use dynamic imports
4. Optimize images

#### Database Performance Issues
1. Check query performance
2. Add missing indexes
3. Optimize query patterns
4. Review connection pooling

#### RLS Test Failures
1. Verify RLS policies
2. Check user permissions
3. Test with different roles
4. Review policy logic

#### Health Check Failures
1. Check database connectivity
2. Verify environment variables
3. Review error logs
4. Test endpoints manually

### Debug Commands
```bash
# Check system health
node scripts/healthcheck.js

# Run all checks
pnpm bundle:check
node scripts/secrets-scan.mjs --check
node scripts/rls-smoke.ts --check
node scripts/db-slowquery-check.mjs --check

# Generate reports
pnpm analyze:bundle
node scripts/cost-guard.mjs --artifact
```

## Rollback Procedures

### Automatic Rollback
- Vercel automatically rolls back on health check failures
- Rollback triggers after 3 consecutive failures
- Previous deployment is restored

### Manual Rollback
```bash
# List deployments
vercel ls

# Rollback to previous
vercel rollback [deployment_url]

# Promote specific deployment
vercel promote [deployment_url]
```

### Rollback Checklist
- [ ] Identify rollback target
- [ ] Execute rollback
- [ ] Verify system health
- [ ] Notify stakeholders
- [ ] Document rollback reason

## Security Considerations

### Secrets Management
- No secrets in code
- Use environment variables
- Rotate keys regularly
- Monitor for leaks

### Access Control
- RLS policies enforced
- Service role properly secured
- Anonymous access blocked
- Regular access reviews

### Monitoring
- Security scans in CI
- Dependency updates
- Vulnerability monitoring
- Incident response plan

## Performance Optimization

### Bundle Optimization
- Tree shaking enabled
- Code splitting configured
- Image optimization
- Compression enabled

### Database Optimization
- Proper indexing
- Query optimization
- Connection pooling
- Caching strategies

### Runtime Optimization
- ISR/SSR choices
- Edge functions
- CDN utilization
- Monitoring

## Cost Management

### Cost Monitoring
- Daily cost checks
- Monthly budget alerts
- Usage pattern analysis
- Optimization recommendations

### Cost Optimization
- Bundle size reduction
- Database query optimization
- Caching strategies
- Resource right-sizing

## Documentation

### Required Documentation
- [ ] Deployment guide (this document)
- [ ] Performance guidelines
- [ ] Runbooks
- [ ] API documentation

### Update Process
- [ ] Update docs with changes
- [ ] Review for accuracy
- [ ] Test procedures
- [ ] Train team

## Support

### Internal Support
- Slack: #dev-support
- GitHub Issues
- Team meetings

### External Support
- Vercel Support
- Supabase Support
- Documentation

### Escalation
- P0/P1: Immediate response
- P2/P3: Business hours
- Follow runbook procedures