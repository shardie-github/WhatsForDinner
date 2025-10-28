# Deployment Guide

This document provides comprehensive instructions for deploying the "What's for Dinner" application across GitHub, Vercel, and Supabase.

## Architecture Overview

```
GitHub Repository
├── CI/CD Pipeline (GitHub Actions)
├── Code Quality Gates
└── Security Scans
    ↓
Supabase Backend
├── Database Migrations
├── Edge Functions
├── RLS Policies
└── Authentication
    ↓
Vercel Frontend
├── Next.js Application
├── Environment Variables
└── Build Artifacts
```

## Prerequisites

### Required Accounts & Access
- GitHub repository with admin access
- Vercel account with project access
- Supabase project (ref: `ghqyxhbyyirveptgwoqm`)
- Node.js 18+ and pnpm 9+

### Required Secrets

#### GitHub Secrets
Configure these in your GitHub repository settings under Settings → Secrets and variables → Actions:

```
NEXT_PUBLIC_SUPABASE_URL=https://ghqyxhbyyirveptgwoqm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_URL=https://ghqyxhbyyirveptgwoqm.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_PROJECT_REF=ghqyxhbyyirveptgwoqm
SUPABASE_ACCESS_TOKEN=your_supabase_access_token
DATABASE_URL=postgresql://postgres:[password]@db.ghqyxhbyyirveptgwoqm.supabase.co:5432/postgres
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id
VERCEL_PREVIEW_URL=your_preview_url
OPENAI_API_KEY=sk-your_openai_key
STRIPE_SECRET_KEY=sk_test_your_stripe_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
JWT_SECRET=your_jwt_secret_32_chars_min
ENCRYPTION_KEY=your_encryption_key_32_chars
SENTRY_DSN=https://your_sentry_dsn
POSTHOG_KEY=your_posthog_key
RESEND_API_KEY=re_your_resend_key
```

#### Vercel Environment Variables
Configure these in your Vercel project settings under Settings → Environment Variables:

**Production Environment:**
- All the GitHub secrets above
- `NODE_ENV=production`
- `NEXT_RUNTIME=nodejs`

**Preview Environment:**
- All the GitHub secrets above
- `NODE_ENV=development`
- `NEXT_RUNTIME=nodejs`

## Deployment Process

### 1. Database Setup (Supabase)

#### Initial Setup
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref ghqyxhbyyirveptgwoqm

# Deploy migrations
supabase db push
```

#### Migration Management
```bash
# Create new migration
supabase migration new migration_name

# Apply migrations
supabase db push

# Check migration status
supabase migration list
```

### 2. Edge Functions Deployment

```bash
# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy function_name

# Set function secrets
supabase secrets set SECRET_NAME="secret_value" --project-ref ghqyxhbyyirveptgwoqm
```

### 3. Frontend Deployment (Vercel)

#### Automatic Deployment
The CI/CD pipeline automatically deploys:
- **Preview**: On push to `develop` branch
- **Production**: On push to `main` branch (with manual approval)

#### Manual Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## Order of Operations

### For Each Deployment:

1. **Database Migrations** (Supabase)
   - Run `supabase db push`
   - Verify migration success
   - Check for any drift

2. **Edge Functions** (Supabase)
   - Deploy all functions
   - Set required secrets
   - Test function endpoints

3. **Application Build** (Vercel)
   - Install dependencies
   - Run tests
   - Build application
   - Deploy to Vercel

4. **Health Checks**
   - Run smoke tests
   - Verify all endpoints
   - Check database connectivity

## Environment-Specific Configuration

### Development
- Uses local Supabase instance
- Hot reloading enabled
- Debug logging enabled

### Preview/Staging
- Uses Supabase preview environment
- Production-like configuration
- Full test suite runs

### Production
- Uses Supabase production environment
- Optimized builds
- Monitoring enabled
- Manual approval required

## Monitoring & Health Checks

### Health Check Endpoints
- `/api/health` - Basic application health
- `/api/health/database` - Database connectivity
- `/api/health/supabase` - Supabase services

### Monitoring Scripts
```bash
# Run comprehensive health check
node scripts/healthcheck.js

# Run RLS policy tests
node scripts/supabase-policy-smoke/index.js

# Validate environment
node scripts/validate-env.js
```

## Rollback Procedures

### Database Rollback
```bash
# List available migrations
supabase migration list

# Rollback to specific migration
supabase db reset --db-url "your_database_url"
```

### Application Rollback
```bash
# Rollback to previous Vercel deployment
vercel rollback [deployment-url]

# Or redeploy previous commit
git checkout [previous-commit]
vercel --prod
```

### Emergency Procedures
1. **Database Issues**: Disable new deployments, rollback migrations
2. **Application Issues**: Rollback to last known good deployment
3. **Security Issues**: Disable affected services, investigate, patch

## Security Considerations

### Environment Variables
- Never commit `.env` files
- Use different secrets for each environment
- Rotate secrets regularly
- Monitor secret access

### Database Security
- RLS policies are enforced
- Service role key only used server-side
- Regular security audits
- Backup procedures in place

### Application Security
- HTTPS enforced
- Security headers configured
- Input validation
- Rate limiting

## Troubleshooting

### Common Issues

#### Build Failures
- Check environment variables
- Verify Node.js version compatibility
- Check for dependency conflicts

#### Database Issues
- Verify connection strings
- Check migration status
- Review RLS policies

#### Deployment Issues
- Check Vercel logs
- Verify build artifacts
- Review environment configuration

### Debug Commands
```bash
# Check environment variables
node -e "console.log(process.env)"

# Test database connection
node scripts/healthcheck.js

# Validate configuration
node scripts/validate-env.js
```

## Support

For deployment issues:
1. Check GitHub Actions logs
2. Review Vercel deployment logs
3. Check Supabase logs
4. Run health check scripts
5. Contact development team

## Changelog

- **v1.0.0**: Initial deployment setup
- **v1.1.0**: Added comprehensive health checks
- **v1.2.0**: Implemented RLS policy testing
- **v1.3.0**: Added environment validation