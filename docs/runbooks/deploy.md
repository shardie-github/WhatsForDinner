# Deployment Runbook

## Overview

This runbook describes the deployment process for "What's for Dinner".

---

## Prerequisites

1. **Access**: Access to Vercel, Supabase, and GitHub
2. **Secrets**: All required secrets configured in GitHub Actions
3. **CI/CD**: GitHub Actions workflows configured and passing

---

## Deployment Environments

### Staging (`develop` branch)

- **Web**: Vercel Staging
- **Database**: Supabase Staging project
- **Auto-deploy**: On push to `develop` branch

### Production (`main` branch)

- **Web**: Vercel Production
- **Database**: Supabase Production project
- **Auto-deploy**: On push to `main` branch (after merge)

---

## One-Click Deployment Process

### Automatic (Recommended)

1. **Merge PR to `develop`** ? Staging auto-deploys
2. **Merge PR to `main`** ? Production auto-deploys

### Manual (If Needed)

1. Push to branch
2. Wait for CI/CD to pass
3. Deployment triggers automatically

---

## CLI Deployment Process

### Staging

```bash
# Ensure you're on develop branch
git checkout develop
git pull origin develop

# Build locally to verify
pnpm build

# Push to trigger deployment
git push origin develop
```

### Production

```bash
# Ensure you're on main branch
git checkout main
git pull origin main

# Build locally to verify
pnpm build

# Push to trigger deployment
git push origin main
```

---

## Required Checks

Before deployment, ensure these checks pass:

1. ? **Lint**: `pnpm lint`
2. ? **Type Check**: `pnpm type-check`
3. ? **Tests**: `pnpm test:ci`
4. ? **Build**: `pnpm build`
5. ? **Security Scan**: `pnpm secrets:scan`
6. ? **Bundle Check**: `pnpm bundle:check`

All checks are automatically run in CI/CD pipeline.

---

## Environment Variables

### Required Variables (Set in Vercel Dashboard)

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_APP_URL`
- `SENTRY_DSN` (optional)

### Per-Environment Configuration

- **Staging**: Use staging Supabase project
- **Production**: Use production Supabase project

---

## Database Migrations

### Automatic (Recommended)

Migrations run automatically via GitHub Actions:

```yaml
- name: Deploy to Supabase
  run: |
    cd whats-for-dinner
    supabase db push --project-ref ${{ secrets.SUPABASE_PROJECT_REF }}
```

### Manual (If Needed)

```bash
cd whats-for-dinner
supabase db push --project-ref YOUR_PROJECT_REF
```

---

## Post-Deploy Validation

After deployment, verify:

1. **Health Check**: `curl https://your-app.vercel.app/api/health`
2. **Readiness**: `curl https://your-app.vercel.app/api/readyz`
3. **Homepage**: Visit homepage, verify it loads
4. **Critical Flow**: Test recipe generation flow
5. **Error Monitoring**: Check Sentry for new errors

### Automated Validation

GitHub Actions includes smoke tests:

```bash
# Smoke tests run automatically after deployment
pnpm smoke:test
```

---

## Rollback Procedure

See [rollback.md](./rollback.md) for detailed rollback steps.

Quick rollback:

1. **Vercel**: Use Vercel dashboard to rollback deployment
2. **Database**: Revert migration if needed (see rollback.md)

---

## Deployment Verification Checklist

- [ ] CI/CD pipeline passed
- [ ] Health check returns 200
- [ ] Readiness check returns ready
- [ ] Homepage loads correctly
- [ ] Critical user flow works
- [ ] No new errors in Sentry
- [ ] Database migrations applied
- [ ] Environment variables set correctly

---

## Troubleshooting

### Deployment Fails in CI/CD

1. Check GitHub Actions logs
2. Verify secrets are set correctly
3. Check for breaking changes in dependencies
4. Verify build passes locally

### Health Check Fails After Deployment

1. Check Vercel logs
2. Verify environment variables
3. Check database connectivity
4. Review recent changes

### Database Migration Fails

1. Check Supabase logs
2. Verify migration SQL syntax
3. Check for schema conflicts
4. Review RLS policies

---

## Emergency Deployment

If urgent fix is needed:

1. Create hotfix branch
2. Make minimal changes
3. Run critical checks only: `pnpm lint && pnpm build`
4. Deploy to staging first for validation
5. Merge to main

---

*Last updated: 2025-01-21*
