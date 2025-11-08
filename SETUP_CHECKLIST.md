# Backend Reality Setup Checklist

Use this checklist to verify everything is configured correctly.

## Prerequisites

- [ ] Supabase project access (ref: `ghqyxhbyyirveptgwoqm`)
- [ ] Vercel account
- [ ] GitHub repository
- [ ] Node.js 18+ installed
- [ ] pnpm 8+ installed

## Step 1: Install Dependencies

```bash
pnpm install
```

- [ ] Dependencies installed successfully
- [ ] Prisma CLI available (`pnpm prisma --version`)

## Step 2: Configure Environment Variables

### Local Development

- [ ] Copied `.env.example` to `.env.local`
- [ ] Filled in `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Filled in `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Filled in `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Filled in `SUPABASE_JWT_SECRET`
- [ ] Configured `DATABASE_URL` with `sslmode=require`
- [ ] Set `PRISMA_CLIENT_ENGINE_TYPE=wasm`
- [ ] Set `NEXTAUTH_URL` and `NEXTAUTH_SECRET`

### Vercel

- [ ] Added all environment variables to Vercel project
- [ ] Set for Production environment
- [ ] Set for Preview environment (optional)
- [ ] Verified `PRISMA_CLIENT_ENGINE_TYPE=wasm`

### GitHub Actions

- [ ] Added secrets to GitHub repository
- [ ] Set `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Set `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Set `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Set `SUPABASE_JWT_SECRET`
- [ ] Set `DATABASE_URL`
- [ ] Set `PRISMA_CLIENT_ENGINE_TYPE=wasm`

## Step 3: Sync Prisma Schema from Supabase ⚠️ IMPORTANT

```bash
pnpm db:sync
```

**Why?** Prisma schema must match what's actually in Supabase database.

- [ ] Schema synced from Supabase successfully
- [ ] Backup created (check `prisma/schema.prisma.backup.*`)
- [ ] Prisma client generated automatically
- [ ] No errors in sync process

**Alternative (manual):**
```bash
npx prisma db pull
npx prisma format
npx prisma generate
```

## Step 4: Verify Prisma Schema

- [ ] Review `prisma/schema.prisma` matches Supabase tables
- [ ] Check for any missing tables or columns
- [ ] Verify `engineType = "wasm"` is set
- [ ] Run `git diff prisma/schema.prisma` to see changes

## Step 5: Deploy Database Migrations

### Prisma Migrations

```bash
pnpm prisma migrate deploy
```

- [ ] Migrations deployed successfully
- [ ] No migration errors
- [ ] Verified with `pnpm prisma migrate status`

### Supabase Migrations

Run in Supabase SQL Editor:

- [ ] `051_realtime_publication.sql` executed
- [ ] `052_rls_app_tables.sql` executed
- [ ] No SQL errors
- [ ] RLS policies created

## Step 5: Deploy Edge Functions

```bash
supabase functions deploy app-health
supabase functions deploy webhook-ingest
```

- [ ] `app-health` function deployed
- [ ] `webhook-ingest` function deployed
- [ ] Functions accessible via Supabase dashboard

## Step 7: Verify Setup

### Local Verification

```bash
pnpm doctor
```

- [ ] All checks passed
- [ ] No errors in output

### Health Endpoint

```bash
curl http://localhost:3000/api/healthz
```

- [ ] Returns `{"ok": true, ...}`
- [ ] Database check passes
- [ ] Auth check passes
- [ ] RLS check shows `effective: true`

### Edge Function

```bash
curl https://ghqyxhbyyirveptgwoqm.supabase.co/functions/v1/app-health \
  -H "Authorization: Bearer <anon-key>"
```

- [ ] Returns `{"ok": true, ...}`
- [ ] Database latency reported
- [ ] Auth check passes

## Step 7: Test CI/CD

- [ ] Push to branch triggers CI workflow
- [ ] CI workflow runs successfully
- [ ] Prisma generate works in CI
- [ ] Migrations check passes
- [ ] Build succeeds
- [ ] Smoke tests pass

## Step 8: Deploy to Production

### Vercel Deployment

- [ ] Pushed to `main` branch
- [ ] Vercel auto-deployed
- [ ] Build succeeded
- [ ] Environment variables available
- [ ] Health endpoint accessible

### Post-Deployment Verification

- [ ] Production health endpoint returns `{"ok": true}`
- [ ] Database queries work
- [ ] Auth flows work
- [ ] RLS policies enforced
- [ ] No errors in Vercel logs

## Troubleshooting

If any step fails:

1. Check `BACKEND_REALITY_SUMMARY.md` for details
2. Review relevant docs in `docs/` directory
3. Run `pnpm doctor` for diagnostics
4. Check Supabase dashboard for project status
5. Review Vercel deployment logs

## Success Criteria

- ✅ `pnpm prisma migrate deploy` succeeds
- ✅ `pnpm run build` passes
- ✅ `/api/healthz` returns `{"ok": true}`
- ✅ CI runs migrations and smoke tests
- ✅ RLS policies block unauthorized access
- ✅ All environment variables documented

---

**Status**: Ready for setup  
**Next**: Follow steps above in order
