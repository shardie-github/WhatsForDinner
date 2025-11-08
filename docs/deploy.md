# Deployment Guide

This guide covers deploying the application to Vercel with Supabase backend.

## Prerequisites

- Vercel account
- Supabase project (ref: `ghqyxhbyyirveptgwoqm`)
- GitHub repository connected to Vercel

## One-Time Setup

### 1. Link Vercel Project

```bash
cd apps/web  # or root if monorepo
vercel link
```

Follow prompts to link to existing project or create new.

### 2. Pull Environment Variables

```bash
vercel env pull .env.local
```

This downloads environment variables from Vercel to `.env.local`.

### 3. Set Environment Variables in Vercel

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add all variables from `.env.example` (see [secrets.md](./secrets.md) for details).

**Required variables:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_JWT_SECRET`
- `DATABASE_URL`
- `PRISMA_CLIENT_ENGINE_TYPE=wasm`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`

### 4. Configure Build Settings

In Vercel Dashboard → Settings → Build & Development Settings:

**Build Command:**
```bash
pnpm install && pnpm prisma generate && pnpm build
```

**Install Command:**
```bash
pnpm install --frozen-lockfile
```

**Output Directory:**
```
.next
```

### 5. Deploy Database Migrations

Before first deployment, run migrations:

```bash
pnpm prisma migrate deploy
```

Or use Supabase Dashboard SQL Editor to run migrations manually.

## Deployment Process

### Automatic Deployment (Recommended)

1. Push to `main` branch
2. Vercel automatically builds and deploys
3. Check deployment logs in Vercel Dashboard

### Manual Deployment

```bash
vercel --prod
```

## Post-Deployment Verification

### 1. Check Health Endpoint

```bash
curl https://your-app.vercel.app/api/healthz
```

Should return `{"ok": true, ...}`

### 2. Run Reality Check

```bash
pnpm doctor
```

### 3. Verify Database

```bash
pnpm prisma studio
```

Opens Prisma Studio to inspect database.

## Environment-Specific Configuration

### Production

- Use production Supabase project
- Set `NEXT_PUBLIC_APP_ENV=production`
- Use production OAuth credentials
- Enable monitoring and alerts

### Staging

- Use staging Supabase project (or separate schema)
- Set `NEXT_PUBLIC_APP_ENV=staging`
- Use staging OAuth credentials

### Preview Deployments

- Vercel automatically creates preview deployments for PRs
- Uses same environment variables as production (or separate staging env)
- Test before merging to main

## Continuous Deployment

### GitHub Actions

The `.github/workflows/ci.yml` workflow:

1. Runs tests on every push/PR
2. Deploys migrations on `main` branch push
3. Runs smoke tests after deployment

### Manual Migration Deployment

If migrations need to be run manually:

```bash
# Set DATABASE_URL
export DATABASE_URL="postgresql://..."

# Deploy migrations
pnpm prisma migrate deploy

# Verify
pnpm prisma migrate status
```

## Troubleshooting

### Build Fails

1. Check build logs in Vercel Dashboard
2. Verify `PRISMA_CLIENT_ENGINE_TYPE=wasm` is set
3. Ensure all environment variables are configured
4. Check `package.json` scripts are correct

### Migration Fails

1. Check `DATABASE_URL` is correct
2. Verify service role key has permissions
3. Review migration files for errors
4. Check database connection from Vercel

### Health Check Fails After Deployment

1. Verify environment variables are set in Vercel
2. Check Supabase project is active
3. Review application logs in Vercel
4. Test database connection manually

### Environment Variables Not Available

1. Check variables are set for correct environment (Production/Preview)
2. Redeploy after adding variables
3. Verify variable names match exactly (case-sensitive)

## Rollback

See [rollback.md](./rollback.md) for database rollback procedures.

## Next Steps

- Set up monitoring and alerts
- Configure custom domain
- Enable analytics
- Set up error tracking (Sentry, etc.)
