# Environment Variables Quick Reference

## 🎯 Your Question: How to verify variables are being picked up and where critical ones should go

### Quick Answer:
1. **Run the verification script**: `node scripts/verify-env-vars.mjs`
2. **Critical variable**: `SUPABASE_JWT_SECRET` - goes in **Vercel** (not Supabase secrets)
3. **Rest should be in**: GitHub Secrets (for CI/CD) and Vercel (for runtime)

---

## 🔑 SUPABASE_JWT_SECRET - Where to Put It

### ✅ Correct Location: **Vercel Environment Variables**

**Steps:**
1. Go to **Supabase Dashboard** → Your Project → **Settings → API**
2. Scroll to **JWT Settings** section
3. Copy the **JWT Secret** value
4. Go to **Vercel Dashboard** → Your Project → **Settings → Environment Variables**
5. Add new variable:
   - **Name**: `SUPABASE_JWT_SECRET`
   - **Value**: (paste the JWT secret from Supabase)
   - **Environment**: Select Production, Preview, Development
   - **Type**: Secret (not plain text)
6. Click **Save**

### ❌ Wrong Locations:
- ❌ **NOT** in Supabase Secrets (it's the secret FROM Supabase)
- ❌ **NOT** in GitHub Secrets (it's for runtime, not CI/CD)
- ❌ **NOT** prefixed with `NEXT_PUBLIC_` (server-side only)

### Why it's needed:
- Used in `packages/server/src/auth/index.ts` for JWT verification
- Used in `packages/server/src/auth/partner.ts` for partner authentication
- Required for API routes that need authentication

---

## 📍 Where Each Variable Should Go

### Vercel Environment Variables (Runtime)
**For**: Variables needed when your app runs

| Variable | Required? | Notes |
|----------|-----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Yes | Get from Supabase Dashboard → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Yes | Get from Supabase Dashboard → API |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Yes | Get from Supabase Dashboard → API |
| `SUPABASE_JWT_SECRET` | ✅ Yes | Get from Supabase Dashboard → API → JWT Secret |
| `DATABASE_URL` or `SUPABASE_DB_URL` | ⚠️ Optional | Get from Supabase Dashboard → Database |
| `NODE_ENV` | ⚠️ Optional | Usually `production` |

### GitHub Secrets (CI/CD Only)
**For**: Variables needed in GitHub Actions workflows

| Variable | Required? | Notes |
|----------|-----------|-------|
| `VERCEL_TOKEN` | ⚠️ If using CI/CD | Vercel Dashboard → Settings → Tokens |
| `VERCEL_ORG_ID` | ⚠️ If using CI/CD | Vercel Dashboard → Team Settings |
| `VERCEL_PROJECT_ID` | ⚠️ If using CI/CD | Vercel Dashboard → Project Settings |
| `SUPABASE_ACCESS_TOKEN` | ⚠️ If using CI/CD | Supabase Dashboard → Account Settings |
| `SUPABASE_PROJECT_REF` | ⚠️ If using CI/CD | Supabase Dashboard → Project Settings |
| `SUPABASE_SERVICE_ROLE_KEY` | ⚠️ If using CI/CD | Same as Vercel, but for CI/CD |

### Supabase Secrets
**For**: Secrets stored in Supabase (edge functions, etc.)

**Note**: `SUPABASE_JWT_SECRET` should **NOT** be here. It's a value you GET from Supabase, not store in Supabase.

---

## ✅ How to Verify Variables Are Being Picked Up

### Method 1: Run the Verification Script
```bash
node scripts/verify-env-vars.mjs
```

This will show:
- ✅ Which variables are configured
- ❌ Which variables are missing
- 📍 Where each variable should go

### Method 2: Check Vercel Deployment Logs
1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on latest deployment
3. Check build logs for "Missing environment variable" errors
4. If you see errors, add the missing variables

### Method 3: Test in Production/Preview
1. Deploy to Vercel
2. Check browser console for errors
3. Test API routes (especially auth endpoints)
4. If you get "SUPABASE_JWT_SECRET must be set" errors, add it to Vercel

### Method 4: Check Runtime Access (Development Only)
⚠️ **Only for debugging** - Delete after testing

Create a temporary test endpoint:
```typescript
// apps/web/src/app/api/test-env/route.ts
export async function GET() {
  return Response.json({
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    hasJwtSecret: !!process.env.SUPABASE_JWT_SECRET,
    // DO NOT return actual values - only check if they exist
  });
}
```

Visit `/api/test-env` to see which variables are available.

---

## 🚨 Common Issues & Solutions

### Issue: "SUPABASE_JWT_SECRET must be set" error
**Cause**: Variable not configured in Vercel
**Solution**: 
1. Get JWT secret from Supabase Dashboard → Project Settings → API → JWT Secret
2. Add to Vercel Environment Variables
3. Redeploy

### Issue: Variables not available in production
**Cause**: Variables only set for Preview/Development
**Solution**: 
- Edit each variable in Vercel
- Make sure "Production" environment is selected
- Redeploy

### Issue: Can't deploy to production (Vercel limits)
**Cause**: Free tier resource limits
**Solution**: 
- ✅ Variables are still configured correctly
- ✅ You can deploy to Preview/Staging
- ✅ Production will work when you upgrade

---

## 📋 Critical Variables Checklist

Make sure these are in **Vercel**:

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `SUPABASE_JWT_SECRET` ⚠️ **Most critical - often missing!**

Make sure these are in **GitHub Secrets** (if using CI/CD):

- [ ] `VERCEL_TOKEN`
- [ ] `VERCEL_ORG_ID`
- [ ] `VERCEL_PROJECT_ID`
- [ ] `SUPABASE_ACCESS_TOKEN`
- [ ] `SUPABASE_PROJECT_REF`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (also needed for CI/CD)

---

## 🎯 Summary

**Your concern**: "Thinking only supabase jwt token but don't know where to put it"

**Answer**: 
- ✅ Put `SUPABASE_JWT_SECRET` in **Vercel Environment Variables**
- ❌ NOT in Supabase secrets
- ❌ NOT in GitHub Secrets
- ✅ Get the value from Supabase Dashboard → Project Settings → API → JWT Secret

**Rest should be in**:
- ✅ **GitHub Secrets**: For CI/CD workflows
- ✅ **Vercel**: For runtime (production, preview, development)

**Can't deploy to production due to Vercel limits?**
- ✅ Variables are still configured correctly
- ✅ They'll work when you upgrade
- ✅ Preview deployments will work with the same variables
