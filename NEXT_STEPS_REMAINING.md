# Remaining Next Steps

## ✅ Completed Automatically

All code, configurations, migrations, scripts, and documentation have been created and validated. See `COMPLETED_STEPS.md` for details.

## 🔧 Steps You Need to Complete

### 1. Fix Dependency Installation (if needed)

If `pnpm install` fails due to OpenTelemetry version conflicts:

```bash
# Option 1: Install Prisma separately
npm install -D prisma@^5.22.0 @prisma/client@^5.22.0

# Option 2: Fix OpenTelemetry versions in package.json
# Update @opentelemetry/exporter-otlp-http to ^0.26.0
```

### 2. Set Environment Variables

#### Local Development (.env.local)

```bash
cp .env.example .env.local
# Edit .env.local and fill in:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY  
# - SUPABASE_SERVICE_ROLE_KEY
# - SUPABASE_JWT_SECRET
# - DATABASE_URL (with sslmode=require)
# - PRISMA_CLIENT_ENGINE_TYPE=wasm
# - NEXTAUTH_URL
# - NEXTAUTH_SECRET
```

#### Vercel Dashboard

1. Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables
2. Add all variables from `.env.example`
3. Set for Production and Preview environments
4. See `docs/secrets.md` for exact list

#### GitHub Actions Secrets

1. Go to: GitHub → Your Repo → Settings → Secrets and variables → Actions
2. Add same variables as Vercel
3. See `docs/secrets.md` for exact list

### 3. Generate Prisma Client

```bash
# After setting DATABASE_URL in .env.local:
npx prisma generate

# Or if pnpm works:
pnpm prisma generate
```

### 4. Deploy Database Migrations

#### Prisma Migrations

```bash
# After setting DATABASE_URL:
npx prisma migrate deploy

# This will create the initial migration if tables don't exist
# Or apply pending migrations if they do
```

#### Supabase SQL Migrations

**Option 1: Supabase Dashboard (Recommended)**
1. Go to: https://supabase.com/dashboard/project/ghqyxhbyyirveptgwoqm
2. Navigate to: SQL Editor
3. Run `supabase/migrations/051_realtime_publication.sql`
4. Run `supabase/migrations/052_rls_app_tables.sql`

**Option 2: Supabase CLI**
```bash
supabase login
supabase link --project-ref ghqyxhbyyirveptgwoqm
supabase db push
```

### 5. Deploy Edge Functions

```bash
# Login to Supabase CLI
supabase login

# Deploy functions
supabase functions deploy app-health
supabase functions deploy webhook-ingest
```

### 6. Verify Everything Works

#### Local Verification

```bash
# Comprehensive check
npx tsx scripts/reality-check.ts

# Or quick smoke test
npx tsx scripts/smoke.ts

# Or check health endpoint (after starting dev server)
pnpm dev
# In another terminal:
curl http://localhost:3000/api/healthz
```

#### Production Verification

After deploying to Vercel:

```bash
# Check health endpoint
curl https://your-app.vercel.app/api/healthz

# Should return: {"ok": true, ...}
```

#### Edge Function Verification

```bash
curl https://ghqyxhbyyirveptgwoqm.supabase.co/functions/v1/app-health \
  -H "Authorization: Bearer YOUR_ANON_KEY"

# Should return: {"ok": true, "db": {...}, ...}
```

## Quick Start Commands

```bash
# 1. Setup environment
cp .env.example .env.local
# Edit .env.local with real values

# 2. Generate Prisma client
npx prisma generate

# 3. Deploy migrations
npx prisma migrate deploy

# 4. Start development
pnpm dev

# 5. Verify
npx tsx scripts/reality-check.ts
```

## Troubleshooting

### Prisma Client Generation Fails

- Ensure `DATABASE_URL` is set correctly
- Check `PRISMA_CLIENT_ENGINE_TYPE=wasm` is set
- Verify database is accessible

### Migrations Fail

- Verify `DATABASE_URL` includes `sslmode=require`
- Check `SUPABASE_SERVICE_ROLE_KEY` is correct
- Ensure Supabase project is active

### Health Check Fails

- Verify all environment variables are set
- Check Supabase project status
- Review application logs
- Run `npx tsx scripts/reality-check.ts` for details

## Documentation Reference

- `docs/secrets.md` - Secrets management
- `docs/dev.md` - Development setup
- `docs/deploy.md` - Deployment guide
- `docs/health.md` - Health check endpoints
- `docs/rollback.md` - Database rollback
- `SETUP_CHECKLIST.md` - Step-by-step checklist

## Support

If you encounter issues:
1. Check `COMPLETED_STEPS.md` for what was automated
2. Review relevant docs in `docs/` directory
3. Run `npx tsx scripts/reality-check.ts` for diagnostics
4. Check Supabase dashboard for project status

---

**Status**: All code ready, awaiting your credentials and deployment steps.
