# Vercel Troubleshooting Guide

**Last Updated:** 2025-01-28  
**Status:** ✅ Complete Troubleshooting Reference

---

## Overview

This guide helps diagnose and fix common Vercel deployment issues. All fixes are CI-first and scripted—no manual CLI work required.

---

## Common Issues & Solutions

### Issue 1: No Preview Deployment Appears for PRs

**Symptoms:**
- PR opened but no preview deployment URL
- GitHub Actions workflow runs but no Vercel deployment

**Diagnosis Steps:**

1. **Check GitHub Actions Workflow:**
   ```bash
   # Check if workflow is triggered
   # Go to: GitHub → Actions → Frontend CI/CD
   # Look for workflow run for your PR
   ```

2. **Check Workflow Logs:**
   - Open the workflow run
   - Check `build-and-test` job - must pass
   - Check `deploy` job - look for errors

3. **Check Vercel Secrets:**
   ```bash
   # Run deploy-doctor script
   pnpm deploy:doctor
   ```
   - Verify `VERCEL_TOKEN` is set
   - Verify `VERCEL_ORG_ID` is set
   - Verify `VERCEL_PROJECT_ID` is set

**Common Causes & Fixes:**

#### Cause 1: Missing Vercel Secrets

**Fix:**
1. Go to GitHub Repository → Settings → Secrets and variables → Actions
2. Add missing secrets:
   - `VERCEL_TOKEN` - Get from https://vercel.com/account/tokens
   - `VERCEL_ORG_ID` - Get from Vercel Dashboard → Team Settings
   - `VERCEL_PROJECT_ID` - Get from Vercel Dashboard → Project Settings

#### Cause 2: Build-and-Test Job Failed

**Fix:**
- Check `build-and-test` job logs for errors
- Fix lint/type-check/test errors
- Ensure all dependencies are installed correctly

#### Cause 3: Vercel Project Not Linked

**Fix:**
- The workflow now includes automatic project linking
- If it still fails, check Vercel Dashboard → Project Settings → General
- Verify project root directory is set to `apps/web`

#### Cause 4: Wrong Vercel Project/Org IDs

**Fix:**
1. Verify `VERCEL_ORG_ID` matches your Vercel organization
2. Verify `VERCEL_PROJECT_ID` matches your Vercel project
3. Check Vercel Dashboard → Project Settings → General for correct IDs

---

### Issue 2: No Production Deploy on Push to main

**Symptoms:**
- Push to `main` but no production deployment
- GitHub Actions workflow doesn't trigger or fails

**Diagnosis Steps:**

1. **Check Workflow Trigger:**
   ```yaml
   # .github/workflows/frontend-deploy.yml should have:
   on:
     push:
       branches: [main]
   ```

2. **Check Workflow Logs:**
   - Open workflow run for the push to `main`
   - Check if `deploy` job ran
   - Check if production deployment step executed

3. **Check Branch Name:**
   - Ensure branch is exactly `main` (not `master` or `Main`)

**Common Causes & Fixes:**

#### Cause 1: Workflow Not Triggering

**Fix:**
- Verify workflow file exists: `.github/workflows/frontend-deploy.yml`
- Verify workflow is not disabled in GitHub settings
- Check if workflow has correct branch filter: `branches: [main]`

#### Cause 2: Deploy Job Skipped

**Fix:**
- Check `build-and-test` job - must pass for `deploy` to run
- Check deploy job condition - should allow `main` branch pushes
- Verify job dependencies are correct

#### Cause 3: Production Deployment Step Failed

**Fix:**
- Check deployment step logs for Vercel errors
- Verify production environment variables are set in Vercel Dashboard
- Check Vercel token permissions

---

### Issue 3: Workflow Runs But Fails During Deploy

**Symptoms:**
- Workflow triggers correctly
- Build-and-test passes
- Deploy job fails with Vercel errors

**Common Error Messages:**

#### "Failed to pull Vercel configuration"

**Causes:**
- Invalid `VERCEL_TOKEN`
- Wrong `VERCEL_ORG_ID` or `VERCEL_PROJECT_ID`
- Vercel project not accessible with provided token

**Fix:**
1. Verify `VERCEL_TOKEN` is valid and not expired
2. Regenerate token if needed: https://vercel.com/account/tokens
3. Verify `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` are correct
4. Check token has access to the project

#### "Vercel build failed"

**Causes:**
- Build errors in code
- Missing environment variables
- Node version mismatch

**Fix:**
1. Check build logs for specific errors
2. Verify required environment variables are set in Vercel Dashboard
3. Check Node version matches (should be 20.x)
4. Run build locally: `cd apps/web && pnpm build`

#### "Project not found" or "Not linked"

**Causes:**
- Vercel project not linked
- Wrong project ID

**Fix:**
- The workflow now includes automatic project linking
- If it still fails, verify project exists in Vercel Dashboard
- Check project root directory is `apps/web`

---

### Issue 4: Vercel Git Integration Conflict

**Symptoms:**
- Deployments appear in Vercel Dashboard but not from GitHub Actions
- "Already deploying" errors
- Double deployments

**Diagnosis:**

1. **Check Vercel Git Integration:**
   - Go to Vercel Dashboard → Project → Settings → Git
   - Check if Git Integration is enabled
   - Check which branch it's connected to

2. **Check GitHub Actions:**
   - Verify `frontend-deploy.yml` workflow is active
   - Check if both are trying to deploy same branch

**Fix:**

**Option 1: Disable Vercel Git Integration (Recommended)**

1. Go to Vercel Dashboard → Project → Settings → Git
2. Disconnect Git Integration
3. Rely solely on GitHub Actions for deployments

**Option 2: Use Different Branches**

1. Configure Vercel Git Integration for `develop` or `staging` branch
2. Keep GitHub Actions for `main` branch
3. This allows both but avoids conflicts

**Option 3: Remove GitHub Actions Workflow**

1. Remove or disable `frontend-deploy.yml`
2. Rely solely on Vercel Git Integration
3. **Not recommended** - loses CI-first approach

**Recommendation:** Use Option 1 - Disable Vercel Git Integration and use GitHub Actions exclusively.

---

### Issue 5: Environment Variables Not Available at Runtime

**Symptoms:**
- Deployment succeeds but app doesn't work
- "Environment variable not found" errors
- Missing `NEXT_PUBLIC_*` variables

**Diagnosis:**

1. **Check Vercel Dashboard:**
   - Go to Project → Settings → Environment Variables
   - Verify variables are set for correct environment (Production/Preview)
   - Check variable names match exactly (case-sensitive)

2. **Check Build Logs:**
   - Look for warnings about missing variables
   - Check if variables are pulled during `vercel pull`

**Fix:**

1. **Add Missing Variables:**
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Add missing variables
   - Set for correct environment (Production/Preview/Development)
   - Redeploy after adding variables

2. **Verify Variable Names:**
   - Ensure names match exactly (case-sensitive)
   - Check for typos
   - Verify `NEXT_PUBLIC_*` prefix for client-side variables

3. **Check Environment Scope:**
   - Production variables: Set for "Production" environment
   - Preview variables: Set for "Preview" environment
   - Some variables may need to be set for both

---

### Issue 6: Monorepo Configuration Issues

**Symptoms:**
- Build fails with "package.json not found"
- Vercel can't find Next.js app
- Wrong directory errors

**Diagnosis:**

1. **Check Vercel Project Settings:**
   - Go to Vercel Dashboard → Project → Settings → General
   - Check "Root Directory" setting
   - Should be `apps/web` for monorepo

2. **Check Workflow:**
   - Verify `working-directory: apps/web` is set in deploy steps
   - Check if build commands are correct

**Fix:**

1. **Set Root Directory in Vercel:**
   - Go to Vercel Dashboard → Project → Settings → General
   - Set "Root Directory" to `apps/web`
   - Save settings

2. **Verify Build Settings:**
   - Build Command: `pnpm build` (runs in `apps/web`)
   - Output Directory: `.next`
   - Install Command: `pnpm install --frozen-lockfile`

3. **Check Workflow:**
   - Ensure all deploy steps use `working-directory: apps/web`
   - Verify build commands match Vercel settings

---

## Diagnostic Tools

### Deploy Doctor Script

Run the diagnostic script to check configuration:

```bash
pnpm deploy:doctor
```

**Checks:**
- ✅ GitHub Secrets are set
- ✅ Node version matches
- ✅ Package manager matches
- ✅ Build scripts exist
- ✅ Vercel configuration files
- ✅ Environment variable templates

### Manual Checks

1. **Check GitHub Secrets:**
   - GitHub → Settings → Secrets and variables → Actions
   - Verify all required secrets are present

2. **Check Vercel Dashboard:**
   - Project → Settings → General
   - Verify project ID, org ID, root directory

3. **Check Vercel Environment Variables:**
   - Project → Settings → Environment Variables
   - Verify all required variables are set

4. **Check Workflow Logs:**
   - GitHub → Actions → Frontend CI/CD
   - Review latest workflow run logs

---

## Verification Checklist

Before reporting an issue, verify:

- [ ] GitHub Secrets are set (`VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`)
- [ ] Vercel project exists and is accessible
- [ ] Vercel project root directory is `apps/web`
- [ ] Environment variables are set in Vercel Dashboard
- [ ] Workflow file exists: `.github/workflows/frontend-deploy.yml`
- [ ] Workflow is not disabled in GitHub settings
- [ ] Branch name matches workflow filter (`main` for production)
- [ ] `build-and-test` job passes
- [ ] Vercel Git Integration is disabled (or configured for different branch)

---

## Getting Help

If issues persist after following this guide:

1. **Run Deploy Doctor:**
   ```bash
   pnpm deploy:doctor
   ```

2. **Check Workflow Logs:**
   - GitHub → Actions → Frontend CI/CD → [failed run]
   - Copy error messages

3. **Check Vercel Dashboard:**
   - Project → Deployments
   - Check latest deployment logs

4. **Review Documentation:**
   - [Deploy Strategy](./deploy-strategy.md)
   - [Environment Variables & Secrets](./env-and-secrets.md)
   - [Deploy Reliability Plan](./deploy-reliability-plan.md)

---

## Prevention

To prevent deployment issues:

1. **Set Up Secrets Early:**
   - Configure all required secrets before first deployment
   - Document where to get each secret

2. **Verify Configuration:**
   - Run `deploy-doctor` script regularly
   - Check Vercel project settings match workflow

3. **Test Preview Deployments:**
   - Open PRs to test preview deployments
   - Verify preview URLs work before merging

4. **Monitor Workflow Runs:**
   - Check GitHub Actions regularly
   - Fix failing workflows immediately

5. **Keep Documentation Updated:**
   - Update this guide as new issues are discovered
   - Document workarounds and fixes

---

*This guide is updated as new issues are discovered and resolved.*
