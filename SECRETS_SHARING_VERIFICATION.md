# Secrets Sharing Verification Guide

## 🎯 Purpose

This document verifies that all critical secrets are properly shared between the three platforms:
1. **GitHub Secrets** (for CI/CD workflows)
2. **Vercel Environment Variables** (for runtime)
3. **Supabase Secrets** (for database/edge functions)

## ✅ Verification Script

Run the verification script to check sharing status:

```bash
node scripts/verify-secrets-sharing.mjs
```

This will show:
- ✅ Which secrets are properly shared
- ⚠️ Which secrets are missing from platforms
- 📊 A sharing matrix showing where each secret should go

---

## 📊 Secrets Sharing Matrix

### Critical Secrets That Must Be Shared

| Variable | Vercel | GitHub | Supabase | Notes |
|----------|--------|--------|----------|-------|
| **NEXT_PUBLIC_SUPABASE_URL** | ✅ | ✅ | ❌ | Required for runtime + CI/CD tests |
| **NEXT_PUBLIC_SUPABASE_ANON_KEY** | ✅ | ✅ | ❌ | Required for runtime + CI/CD tests |
| **SUPABASE_SERVICE_ROLE_KEY** | ✅ | ✅ | ❌ | Required for server-side + CI/CD operations |
| **SUPABASE_JWT_SECRET** | ✅ | ❌ | ❌ | Server-side only. Get FROM Supabase, store IN Vercel |
| **SUPABASE_DB_URL** | ✅ | ❌ | ❌ | Optional but recommended |
| **DATABASE_URL** | ✅ | ❌ | ❌ | Optional, alias for SUPABASE_DB_URL |

### GitHub-Only Secrets (CI/CD)

| Variable | Vercel | GitHub | Supabase | Notes |
|----------|--------|--------|----------|-------|
| **VERCEL_TOKEN** | ❌ | ✅ | ❌ | For Vercel deployments |
| **VERCEL_ORG_ID** | ❌ | ✅ | ❌ | For Vercel deployments |
| **VERCEL_PROJECT_ID** | ❌ | ✅ | ❌ | For Vercel deployments |
| **SUPABASE_ACCESS_TOKEN** | ❌ | ✅ | ❌ | For Supabase CLI operations |
| **SUPABASE_PROJECT_REF** | ❌ | ✅ | ❌ | For Supabase CLI operations |

---

## 🔑 Detailed Sharing Requirements

### 1. NEXT_PUBLIC_SUPABASE_URL

**Required in:**
- ✅ **Vercel Environment Variables** (Production, Preview, Development)
- ✅ **GitHub Secrets** (for CI/CD tests)

**Get from:**
- Supabase Dashboard → Project Settings → API

**How to add:**
- **Vercel**: Dashboard → Project → Settings → Environment Variables → Add New
- **GitHub**: Repository → Settings → Secrets and variables → Actions → New repository secret

**Why shared:**
- Needed at runtime for client-side Supabase connections
- Needed in CI/CD for running tests that connect to Supabase

---

### 2. NEXT_PUBLIC_SUPABASE_ANON_KEY

**Required in:**
- ✅ **Vercel Environment Variables** (Production, Preview, Development)
- ✅ **GitHub Secrets** (for CI/CD tests)

**Get from:**
- Supabase Dashboard → Project Settings → API

**How to add:**
- **Vercel**: Dashboard → Project → Settings → Environment Variables → Add New
- **GitHub**: Repository → Settings → Secrets and variables → Actions → New repository secret

**Why shared:**
- Needed at runtime for client-side Supabase authentication
- Needed in CI/CD for running tests that authenticate users

---

### 3. SUPABASE_SERVICE_ROLE_KEY

**Required in:**
- ✅ **Vercel Environment Variables** (Production, Preview, Development)
- ✅ **GitHub Secrets** (for CI/CD database operations)

**Get from:**
- Supabase Dashboard → Project Settings → API
- ⚠️ **NEVER expose to client-side code**

**How to add:**
- **Vercel**: Dashboard → Project → Settings → Environment Variables → Add New → Type: Secret
- **GitHub**: Repository → Settings → Secrets and variables → Actions → New repository secret

**Why shared:**
- Needed at runtime for server-side admin operations
- Needed in CI/CD for database migrations, RLS checks, and smoke tests

---

### 4. SUPABASE_JWT_SECRET ⚠️ **CRITICAL**

**Required in:**
- ✅ **Vercel Environment Variables** (Production, Preview, Development)
- ❌ **NOT in GitHub Secrets** (not needed for CI/CD)
- ❌ **NOT in Supabase Secrets** (it's the secret FROM Supabase)

**Get from:**
- Supabase Dashboard → Project Settings → API → JWT Settings → JWT Secret

**How to add:**
1. Go to Supabase Dashboard → Project Settings → API
2. Scroll to **JWT Settings** section
3. Copy the **JWT Secret** value
4. Go to **Vercel Dashboard** → Project → Settings → Environment Variables
5. Add new variable:
   - **Name**: `SUPABASE_JWT_SECRET`
   - **Value**: (paste the JWT secret from Supabase)
   - **Type**: Secret (not plain text)
   - **Environments**: Production, Preview, Development
6. Click **Save**

**Why only Vercel:**
- Used for server-side JWT token verification in API routes
- Not needed in CI/CD workflows (tests use service role key)
- Not stored in Supabase (it's a value you GET from Supabase)

**Used in:**
- `packages/server/src/auth/index.ts` - User authentication
- `packages/server/src/auth/partner.ts` - Partner authentication

---

### 5. SUPABASE_DB_URL (Optional)

**Required in:**
- ✅ **Vercel Environment Variables** (Optional but recommended)
- ❌ **NOT in GitHub Secrets** (not needed for CI/CD)
- ❌ **NOT in Supabase Secrets** (optional)

**Get from:**
- Supabase Dashboard → Project Settings → Database → Connection String

**Format:**
```
postgresql://postgres:<PASSWORD>@db.<project-ref>.supabase.co:5432/postgres?sslmode=require
```

**Why optional:**
- Only needed if you need direct database access
- Can use Supabase client instead for most operations

---

### 6. DATABASE_URL (Optional)

**Required in:**
- ✅ **Vercel Environment Variables** (Optional)
- ❌ **NOT in GitHub Secrets**
- ❌ **NOT in Supabase Secrets**

**Note:** This is an alias for `SUPABASE_DB_URL`. You can use either one.

---

## 🚀 GitHub-Only Secrets (CI/CD)

These secrets are only needed in GitHub for CI/CD workflows and are NOT needed in Vercel:

### VERCEL_TOKEN
- **Where**: GitHub Secrets only
- **Purpose**: Authenticate with Vercel API for deployments
- **Get from**: Vercel Dashboard → Settings → Tokens

### VERCEL_ORG_ID
- **Where**: GitHub Secrets only
- **Purpose**: Identify Vercel organization for deployments
- **Get from**: Vercel Dashboard → Team Settings

### VERCEL_PROJECT_ID
- **Where**: GitHub Secrets only
- **Purpose**: Identify Vercel project for deployments
- **Get from**: Vercel Dashboard → Project Settings

### SUPABASE_ACCESS_TOKEN
- **Where**: GitHub Secrets only
- **Purpose**: Authenticate Supabase CLI for migrations
- **Get from**: Supabase Dashboard → Account Settings → Access Tokens

### SUPABASE_PROJECT_REF
- **Where**: GitHub Secrets only
- **Purpose**: Identify Supabase project for CLI operations
- **Get from**: Supabase Dashboard → Project Settings → General

---

## ✅ Verification Checklist

After configuring secrets, verify they're properly shared:

### Vercel Environment Variables
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Configured for Production, Preview, Development
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Configured for Production, Preview, Development
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Configured as Secret for Production, Preview, Development
- [ ] `SUPABASE_JWT_SECRET` - Configured as Secret for Production, Preview, Development
- [ ] `SUPABASE_DB_URL` (optional) - Configured if needed

### GitHub Secrets
- [ ] `NEXT_PUBLIC_SUPABASE_URL` - For CI/CD tests
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - For CI/CD tests
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - For CI/CD database operations
- [ ] `VERCEL_TOKEN` - For Vercel deployments
- [ ] `VERCEL_ORG_ID` - For Vercel deployments
- [ ] `VERCEL_PROJECT_ID` - For Vercel deployments
- [ ] `SUPABASE_ACCESS_TOKEN` - For Supabase CLI operations
- [ ] `SUPABASE_PROJECT_REF` - For Supabase CLI operations

### Supabase Secrets
- [ ] **Note**: Critical secrets should NOT be stored in Supabase secrets
- [ ] `SUPABASE_JWT_SECRET` is NOT stored here (it's FROM Supabase, not IN Supabase)

---

## 🔍 How to Verify Sharing

### Method 1: Run Verification Script
```bash
node scripts/verify-secrets-sharing.mjs
```

### Method 2: Check Vercel Dashboard
1. Go to Vercel Dashboard → Your Project
2. Navigate to Settings → Environment Variables
3. Verify all required variables are present
4. Check that they're enabled for the correct environments

### Method 3: Check GitHub Secrets
1. Go to GitHub Repository → Settings
2. Navigate to Secrets and variables → Actions
3. Verify all required secrets are present

### Method 4: Test Deployment
1. Deploy to Vercel
2. Check deployment logs for any "Missing environment variable" errors
3. Test API routes that require authentication
4. Verify CI/CD workflows run successfully

---

## 📋 Quick Reference

### Must Be in BOTH Vercel AND GitHub:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Must Be in Vercel ONLY:
- `SUPABASE_JWT_SECRET` (server-side only, not needed for CI/CD)

### Must Be in GitHub ONLY:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_PROJECT_REF`

### NOT in Supabase Secrets:
- `SUPABASE_JWT_SECRET` (it's the secret FROM Supabase, not stored IN Supabase)
- Other runtime secrets (they're for your application, not Supabase)

---

## 🚨 Common Issues

### Issue: Secrets not shared between platforms
**Solution**: 
- Add secrets to both Vercel and GitHub as indicated in the sharing matrix
- Use the verification script to identify missing secrets

### Issue: SUPABASE_JWT_SECRET missing
**Solution**:
1. Get JWT secret from Supabase Dashboard → Project Settings → API → JWT Secret
2. Add to Vercel Environment Variables (NOT GitHub, NOT Supabase)
3. Redeploy

### Issue: CI/CD workflows failing due to missing secrets
**Solution**:
- Ensure GitHub Secrets are configured for all secrets used in workflows
- Check workflow files to see which secrets are referenced
- Add missing secrets to GitHub Secrets

---

## 📚 Additional Resources

- [Vercel Environment Variables Documentation](https://vercel.com/docs/projects/environment-variables)
- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Supabase JWT Guide](https://supabase.com/docs/guides/auth/security/jwts)
- [Secrets Sync Script](../scripts/sync-secrets-supabase-vercel.mjs) - For syncing between Supabase and Vercel
