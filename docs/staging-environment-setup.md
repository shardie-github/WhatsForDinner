# Staging Environment Setup Guide

## Overview
This document provides instructions for setting up and maintaining a staging environment that mirrors production.

## Current Status
- [x] Staging environment configured
- [x] Separate Supabase project for staging
- [x] Staging domain configured
- [ ] Automated staging deployments
- [ ] Staging database seeding script

## Environment Configuration

### Staging Supabase Project
1. Create separate Supabase project for staging
2. Configure environment variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://staging-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=staging-anon-key
   SUPABASE_SERVICE_ROLE_KEY=staging-service-role-key
   ```

### Staging Domain
- **Staging URL**: `https://staging.whats-for-dinner.vercel.app`
- Configure in Vercel dashboard under project settings
- Point custom domain to staging branch

### Database Setup
1. Run migrations on staging database
2. Seed test data:
   ```bash
   pnpm run db:seed:staging
   ```
3. Configure RLS policies for staging users

## Deployment Process

### Automated Staging Deployments
Staging automatically deploys when changes are pushed to `staging` branch:

```bash
git checkout staging
git merge main
git push origin staging
```

### Manual Staging Deployment
```bash
pnpm run deploy:staging
```

## Testing Checklist

### Pre-Staging Deployment
- [ ] Run all tests locally
- [ ] Build succeeds without errors
- [ ] Type checking passes
- [ ] Linting passes
- [ ] Security scan passes

### Post-Staging Deployment
- [ ] Health check endpoint responds
- [ ] Authentication works
- [ ] Recipe generation works
- [ ] Database connections work
- [ ] Analytics tracking works
- [ ] Error tracking works

## Staging vs Production Differences

| Aspect | Staging | Production |
|--------|---------|------------|
| Database | Separate staging DB | Production DB |
| Domain | staging.whats-for-dinner.vercel.app | whats-for-dinner.vercel.app |
| Analytics | Test events | Real events |
| Error Tracking | Staging project | Production project |
| Stripe | Test mode | Live mode |
| OpenAI | Separate test key | Production key |

## Maintenance

### Weekly Tasks
- [ ] Verify staging environment is up
- [ ] Test latest features on staging
- [ ] Clean up test data
- [ ] Verify RLS policies work correctly

### Monthly Tasks
- [ ] Reset staging database with latest schema
- [ ] Update test data to match production structure
- [ ] Review and update staging environment variables

## Troubleshooting

### Common Issues

**Issue**: Staging deployment fails
- **Solution**: Check build logs, verify environment variables

**Issue**: Staging database connection errors
- **Solution**: Verify Supabase credentials, check connection pooling

**Issue**: Features work in staging but not production
- **Solution**: Compare environment variables, check feature flags

## Next Steps
1. Set up automated staging deployments via GitHub Actions
2. Create staging database seeding automation
3. Set up staging monitoring dashboard
4. Configure staging alerts
