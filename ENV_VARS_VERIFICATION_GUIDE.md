# Environment Variables Verification Guide

## Quick Summary

This guide helps you verify that all environment variables are properly configured and identifies where critical ones (especially `SUPABASE_JWT_SECRET`) should be placed.

## 🔍 Running Verification

Run the verification script to check your environment variable configuration:

```bash
node scripts/verify-env-vars.mjs
```

This script will:
- ✅ Check which critical variables are configured
- ❌ Identify missing critical variables
- 📍 Show where each variable should be placed
- ⚠️ Highlight the critical `SUPABASE_JWT_SECRET` variable

---

## 🔑 Critical Variables Overview

### Required for Application to Work

| Variable | Where to Configure | Description |
|----------|-------------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | **Vercel** | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **Vercel** | Supabase anonymous key (client-safe) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Vercel** + **GitHub Secrets** | Service role key (server-side only) |
| `SUPABASE_JWT_SECRET` | **Vercel** | JWT secret for token verification ⚠️ **CRITICAL** |

### Optional (but commonly used)

| Variable | Where to Configure | Description |
|----------|-------------------|-------------|
| `DATABASE_URL` or `SUPABASE_DB_URL` | **Vercel** | Database connection string |
| `NODE_ENV` | **Vercel** | Environment mode (production/development) |

### GitHub Secrets (for CI/CD only)

| Variable | Where to Configure | Description |
|----------|-------------------|-------------|
| `VERCEL_TOKEN` | **GitHub Secrets** | Vercel API token |
| `VERCEL_ORG_ID` | **GitHub Secrets** | Vercel organization ID |
| `VERCEL_PROJECT_ID` | **GitHub Secrets** | Vercel project ID |
| `SUPABASE_ACCESS_TOKEN` | **GitHub Secrets** | Supabase CLI access token |
| `SUPABASE_PROJECT_REF` | **GitHub Secrets** | Supabase project reference |

---

## 🎯 SUPABASE_JWT_SECRET - Critical Variable

### Why it's needed:
- Used for server-side JWT token verification in:
  - `packages/server/src/auth/index.ts` - User authentication
  - `packages/server/src/auth/partner.ts` - Partner authentication
- Required for API routes that need authentication

### Where to get it:
1. Go to **Supabase Dashboard**
2. Select your project
3. Navigate to **Project Settings → API**
4. Scroll to **JWT Settings**
5. Copy the **JWT Secret** value

### Where to put it:
✅ **Vercel Environment Variables** (NOT in Supabase secrets)
- Go to Vercel Dashboard → Your Project
- Navigate to **Settings → Environment Variables**
- Add:
  - Name: `SUPABASE_JWT_SECRET`
  - Value: (paste the JWT secret from Supabase)
  - Environment: Select **Production**, **Preview**, and **Development**
  - Type: **Secret** (not plain text)

### Important Notes:
- ❌ **DO NOT** put this in Supabase secrets (it's the secret FROM Supabase)
- ❌ **DO NOT** prefix with `NEXT_PUBLIC_` (server-side only)
- ✅ This is a **server-side only** variable
- ✅ It should match the JWT secret in your Supabase project settings

---

## 📍 Where Variables Should Go

### Vercel Environment Variables
**Purpose**: Runtime environment variables for your Next.js application

**Configure in**: Vercel Dashboard → Project → Settings → Environment Variables

**Variables that belong here**:
- All `NEXT_PUBLIC_*` variables (exposed to browser)
- Server-side secrets (like `SUPABASE_JWT_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`)
- Database URLs
- API keys for services (Stripe, OpenAI, etc.)
- Feature flags and configuration

**How to add**:
1. Go to Vercel Dashboard
2. Select your project
3. Navigate to **Settings → Environment Variables**
4. Click **Add New**
5. Enter variable name and value
6. Select environments (Production, Preview, Development)
7. Choose type (Secret or Plain)
8. Click **Save**

### GitHub Secrets
**Purpose**: Secrets used in CI/CD workflows (GitHub Actions)

**Configure in**: GitHub Repository → Settings → Secrets and variables → Actions

**Variables that belong here**:
- `VERCEL_TOKEN` - For Vercel deployments
- `VERCEL_ORG_ID` - For Vercel deployments
- `VERCEL_PROJECT_ID` - For Vercel deployments
- `SUPABASE_ACCESS_TOKEN` - For Supabase CLI operations
- `SUPABASE_PROJECT_REF` - For Supabase CLI operations
- `SUPABASE_SERVICE_ROLE_KEY` - For CI/CD database operations

**How to add**:
1. Go to GitHub Repository
2. Navigate to **Settings → Secrets and variables → Actions**
3. Click **New repository secret**
4. Enter name and value
5. Click **Add secret**

### Supabase Secrets
**Purpose**: Secrets stored in Supabase for edge functions and database operations

**Note**: `SUPABASE_JWT_SECRET` should **NOT** be stored here. It's a value you GET from Supabase, not store in Supabase.

**Variables that might belong here**:
- Custom secrets for Supabase Edge Functions
- Database connection strings (if using Supabase CLI)

---

## ✅ Verification Checklist

After configuring variables, verify:

- [ ] Run `node scripts/verify-env-vars.mjs` - no missing critical variables
- [ ] `SUPABASE_JWT_SECRET` is configured in Vercel
- [ ] `NEXT_PUBLIC_SUPABASE_URL` is configured in Vercel
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` is configured in Vercel
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is configured in Vercel
- [ ] All `NEXT_PUBLIC_*` variables are in Vercel (not GitHub Secrets)
- [ ] All GitHub workflow secrets are in GitHub Secrets (not Vercel)
- [ ] Vercel deployment succeeds without environment variable errors
- [ ] API routes work (test authentication endpoints)
- [ ] No console errors about missing environment variables

---

## 🔍 How to Verify Variables Are Being Picked Up

### 1. Check Vercel Deployment Logs
- Go to Vercel Dashboard → Your Project → Deployments
- Click on a deployment
- Check the build logs for any "Missing environment variable" errors

### 2. Test in Production
- Deploy to Vercel
- Check browser console for errors
- Test API routes that require environment variables

### 3. Use the Verification Script
```bash
node scripts/verify-env-vars.mjs
```

This will check:
- Which variables are defined in `.env.example`
- Which variables are used in code
- Which variables are used in GitHub workflows
- Which critical variables are missing

### 4. Check Runtime Access (for debugging only)
⚠️ **Only for development/debugging** - Never expose secrets in production

You can temporarily add a test endpoint to verify variables are accessible:
```typescript
// apps/web/src/app/api/test-env/route.ts (DELETE AFTER TESTING)
export async function GET() {
  return Response.json({
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    hasJwtSecret: !!process.env.SUPABASE_JWT_SECRET,
    // DO NOT return actual values
  });
}
```

Then visit `/api/test-env` to verify variables are loaded.

---

## 🚨 Common Issues

### Issue: "SUPABASE_JWT_SECRET must be set" error
**Solution**: 
1. Get JWT secret from Supabase Dashboard → Project Settings → API → JWT Secret
2. Add it to Vercel Environment Variables as `SUPABASE_JWT_SECRET`
3. Redeploy your application

### Issue: Variables not available in production
**Solution**:
- Check that variables are set for the correct environment (Production)
- Ensure variables are saved in Vercel (not just local `.env.local`)
- Redeploy after adding variables

### Issue: Can't deploy to production due to Vercel limits
**Solution**:
- This is expected if you're on the free tier
- Variables are still configured correctly
- You can deploy to preview/staging environments
- Production deployment will work when you upgrade your plan

---

## 📚 Additional Resources

- [Vercel Environment Variables Docs](https://vercel.com/docs/projects/environment-variables)
- [GitHub Secrets Docs](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Supabase JWT Guide](https://supabase.com/docs/guides/auth/security/jwts)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

---

## 🔐 Security Best Practices

1. **Never commit secrets to git** - Use environment variables
2. **Use Vercel Secrets** - Mark sensitive variables as "Secret" in Vercel
3. **Rotate secrets regularly** - Especially for production
4. **Use different keys per environment** - dev, staging, production
5. **Mark client-safe variables** - Prefix with `NEXT_PUBLIC_` only if needed in browser
6. **Never expose service role keys** - `SUPABASE_SERVICE_ROLE_KEY` should never be in client code
7. **JWT secrets are server-only** - `SUPABASE_JWT_SECRET` should never be prefixed with `NEXT_PUBLIC_`
