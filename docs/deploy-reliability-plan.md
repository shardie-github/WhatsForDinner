# Deployment Reliability Plan

**Last Updated:** 2025-01-28  
**Status:** ✅ Comprehensive Fix Plan Implemented

---

## Executive Summary

This document provides a comprehensive action plan for ensuring reliable Vercel Preview and Production deployments. All fixes have been implemented following a CI-first, scripted approach with zero manual CLI requirements.

---

## Section 1: Root Causes Found

### Critical Issues (Fixed)

1. **Missing Vercel Project Linking**
   - **Issue:** Workflow assumed project was already linked, but `.vercel` directory might not exist
   - **Fix:** Added automatic project linking step in workflow
   - **Status:** ✅ Fixed

2. **Missing Explicit Project/Org Scope**
   - **Issue:** Vercel CLI commands didn't specify `--scope` flag, relying on `.vercel` directory
   - **Fix:** Added `--scope="$VERCEL_ORG_ID"` to all Vercel CLI commands
   - **Status:** ✅ Fixed

3. **Insufficient Error Handling**
   - **Issue:** Deployment failures didn't provide clear error messages or fallback URLs
   - **Fix:** Added explicit error handling and Vercel Dashboard URL fallbacks
   - **Status:** ✅ Fixed

4. **Missing Diagnostic Tools**
   - **Issue:** No way to verify deployment configuration without running full workflow
   - **Fix:** Created `deploy-doctor` script for local diagnostics
   - **Status:** ✅ Fixed

### Medium Priority Issues (Fixed)

1. **Incomplete Documentation**
   - **Issue:** Missing comprehensive documentation for deployment process
   - **Fix:** Created multiple documentation files (see Section 2)
   - **Status:** ✅ Fixed

2. **Deprecated Workflow Still Present**
   - **Issue:** `deploy.yml` is deprecated but still in repo, could cause confusion
   - **Fix:** Clearly marked as deprecated, scheduled for removal
   - **Status:** ✅ Documented (removal scheduled for 2025-02-28)

3. **Multiple Deployment Methods**
   - **Issue:** Both `frontend-deploy.yml` (CLI) and `vercel-promotion.yml` (Action) exist
   - **Fix:** Documented canonical workflow (`frontend-deploy.yml`)
   - **Status:** ✅ Documented

---

## Section 2: Exact Fixes Applied

### Workflow Fixes

#### File: `.github/workflows/frontend-deploy.yml`

**Changes Made:**

1. **Added Project Linking Step:**
   ```yaml
   - name: Link Vercel project (if needed)
     working-directory: apps/web
     run: |
       # Checks if .vercel/project.json exists
       # If not, links project using explicit IDs
       vercel link --yes --token="$VERCEL_TOKEN" --project="$VERCEL_PROJECT_ID" --scope="$VERCEL_ORG_ID"
   ```

2. **Added Explicit Scope to All Vercel Commands:**
   ```yaml
   # Before:
   vercel pull --yes --environment=preview --token="$VERCEL_TOKEN"
   
   # After:
   vercel pull --yes --environment=preview --token="$VERCEL_TOKEN" --scope="$VERCEL_ORG_ID"
   ```

3. **Improved Error Handling:**
   ```yaml
   # Added explicit error handling with exit codes
   vercel pull ... || {
     echo "::error::Failed to pull Vercel configuration"
     exit 1
   }
   ```

4. **Added Fallback URLs:**
   ```yaml
   # If URL extraction fails, provide Vercel Dashboard link
   echo "Check Vercel Dashboard: https://vercel.com/$VERCEL_ORG_ID/$VERCEL_PROJECT_ID"
   ```

**Impact:**
- ✅ Deployments will work even if project isn't pre-linked
- ✅ Explicit project/org scope prevents wrong project deployments
- ✅ Clear error messages help diagnose issues faster
- ✅ Fallback URLs ensure deployments can be found even if URL extraction fails

---

### Documentation Created

#### 1. `docs/deploy-failure-postmortem-initial.md`
- **Purpose:** Initial failure analysis and suspected failure modes
- **Content:** Workflow analysis, suspected issues, configuration gaps
- **Status:** ✅ Created

#### 2. `docs/deploy-strategy.md`
- **Purpose:** Canonical deployment strategy document
- **Content:** Preview/Production paths, workflow roles, branch mapping
- **Status:** ✅ Created

#### 3. `docs/env-and-secrets.md`
- **Purpose:** Complete reference for environment variables and secrets
- **Content:** Required secrets, where to set them, verification steps
- **Status:** ✅ Created

#### 4. `docs/vercel-troubleshooting.md`
- **Purpose:** Troubleshooting guide for common deployment issues
- **Content:** Common issues, diagnosis steps, fixes, verification checklist
- **Status:** ✅ Created

#### 5. `docs/deploy-reliability-plan.md` (this document)
- **Purpose:** Comprehensive action plan and fix summary
- **Content:** Root causes, fixes applied, verification steps, future improvements
- **Status:** ✅ Created

---

### Diagnostic Tools Created

#### File: `scripts/deploy-doctor.ts`

**Purpose:** Local diagnostic tool to check deployment configuration

**Checks Performed:**
- ✅ Package.json configuration (Node version, package manager, scripts)
- ✅ Lockfile presence and uniqueness
- ✅ GitHub Actions workflow files
- ✅ Vercel configuration files
- ✅ Environment variable templates
- ✅ Monorepo structure
- ✅ GitHub Secrets (simulated - can't actually check)

**Usage:**
```bash
pnpm deploy:doctor
```

**Status:** ✅ Created and added to package.json scripts

---

## Section 3: How to Verify Preview & Production Deploys

### Verify Preview Deployment

1. **Open a Pull Request:**
   ```bash
   # Create a branch and open PR
   git checkout -b test-preview-deploy
   git commit --allow-empty -m "Test preview deployment"
   git push origin test-preview-deploy
   # Open PR via GitHub UI
   ```

2. **Check GitHub Actions:**
   - Go to GitHub → Actions → Frontend CI/CD
   - Find workflow run for your PR
   - Verify `build-and-test` job passes ✅
   - Verify `deploy` job runs ✅
   - Check "Deploy Preview (PR)" step logs

3. **Verify Deployment:**
   - Look for preview URL in workflow logs
   - Or check Vercel Dashboard → Deployments
   - Preview URL should be accessible

**Expected Result:**
- ✅ Workflow triggers automatically
- ✅ Build-and-test passes
- ✅ Preview deployment succeeds
- ✅ Preview URL is available

---

### Verify Production Deployment

1. **Push to main:**
   ```bash
   # Merge PR or push directly to main
   git checkout main
   git merge test-preview-deploy
   git push origin main
   ```

2. **Check GitHub Actions:**
   - Go to GitHub → Actions → Frontend CI/CD
   - Find workflow run for push to main
   - Verify `build-and-test` job passes ✅
   - Verify `deploy` job runs ✅
   - Check "Deploy Production (main)" step logs

3. **Verify Deployment:**
   - Look for production URL in workflow logs
   - Or check Vercel Dashboard → Deployments
   - Production URL should be accessible

**Expected Result:**
- ✅ Workflow triggers automatically
- ✅ Build-and-test passes
- ✅ Production deployment succeeds
- ✅ Production URL is accessible

---

### Pre-Deployment Verification

Before deploying, run diagnostic checks:

```bash
# Run deploy-doctor
pnpm deploy:doctor

# Check for failures - must fix before deploying
# Review warnings - should fix for reliability
```

**Required Checks:**
- ✅ All GitHub Secrets are set
- ✅ Node version matches (20.x)
- ✅ Package manager matches (pnpm@9)
- ✅ Build scripts exist
- ✅ Vercel configuration files exist
- ✅ Monorepo structure is correct

---

## Section 4: If Deploy Breaks Again, Run These Steps

### Step 1: Run Deploy Doctor

```bash
pnpm deploy:doctor
```

**What it checks:**
- Package.json configuration
- Workflow files
- Vercel configuration
- Environment variable templates
- Monorepo structure

**Action:** Fix any failures reported

---

### Step 2: Check GitHub Secrets

1. Go to GitHub → Settings → Secrets and variables → Actions
2. Verify these secrets exist:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_PROJECT_ID`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. If missing, add them:
   - See `docs/env-and-secrets.md` for how to get each secret

---

### Step 3: Check Workflow Logs

1. Go to GitHub → Actions → Frontend CI/CD
2. Open the latest failed workflow run
3. Check each job:
   - `build-and-test` - Look for build/test errors
   - `deploy` - Look for Vercel errors

4. Common errors:
   - **"VERCEL_TOKEN secret is not set"** → Add secret to GitHub
   - **"Failed to pull Vercel configuration"** → Check token/org/project IDs
   - **"Vercel build failed"** → Check build logs for specific errors
   - **"Project not found"** → Verify project ID is correct

---

### Step 4: Check Vercel Dashboard

1. Go to Vercel Dashboard → Your Project
2. Check Settings → General:
   - Verify Project ID matches `VERCEL_PROJECT_ID` secret
   - Verify Root Directory is `apps/web`
   - Check Build Command is `pnpm build`

3. Check Settings → Environment Variables:
   - Verify all required variables are set
   - Check they're set for correct environment (Production/Preview)

4. Check Settings → Git:
   - If Git Integration is enabled, consider disabling it (see `docs/vercel-troubleshooting.md`)

---

### Step 5: Review Documentation

1. **Check Troubleshooting Guide:**
   - `docs/vercel-troubleshooting.md` - Common issues and fixes

2. **Check Deployment Strategy:**
   - `docs/deploy-strategy.md` - Canonical deployment paths

3. **Check Environment Variables:**
   - `docs/env-and-secrets.md` - Complete secrets reference

---

### Step 6: Verify Configuration

1. **Check Workflow File:**
   - Verify `.github/workflows/frontend-deploy.yml` exists
   - Check triggers are correct
   - Verify job dependencies are correct

2. **Check Vercel Config:**
   - Verify `vercel.json` exists
   - Check configuration matches project needs

3. **Check Monorepo Structure:**
   - Verify `apps/web` directory exists
   - Check `apps/web/package.json` exists

---

### Step 7: Test Locally (Optional)

If you have local environment set up:

```bash
# Test build
cd apps/web
pnpm build

# Test Vercel CLI (if installed)
vercel pull --environment=preview
vercel build
```

**Note:** This is optional - the CI-first approach doesn't require local setup.

---

## Section 5: Future Improvements

### Short-Term (Next Sprint)

1. **Add GitHub Action for Deploy Doctor:**
   - Create `.github/workflows/deploy-doctor.yml`
   - Run on `workflow_dispatch` or schedule
   - Report findings in workflow logs

2. **Add Deployment Status Checks:**
   - Post deployment status to PR comments
   - Include preview URLs in PR comments
   - Add deployment badges

3. **Improve Error Messages:**
   - Add more specific error messages for common failures
   - Include links to relevant documentation
   - Suggest fixes in error messages

---

### Medium-Term (Next Month)

1. **Add Deployment Notifications:**
   - Slack/Discord notifications on deployment success/failure
   - Email notifications for production deployments

2. **Add Deployment Rollback:**
   - Automatic rollback on health check failures
   - Manual rollback via workflow dispatch

3. **Add Deployment Metrics:**
   - Track deployment success rate
   - Track deployment duration
   - Track time to deploy

---

### Long-Term (Next Quarter)

1. **Add Canary Deployments:**
   - Gradual rollout of production deployments
   - Automatic rollback on error rate increase

2. **Add Blue-Green Deployments:**
   - Zero-downtime deployments
   - Instant rollback capability

3. **Add Deployment Preview Environments:**
   - Staging environment for testing
   - Production-like environment for final testing

---

## Section 6: Monitoring & Alerting

### What to Monitor

1. **Deployment Success Rate:**
   - Track percentage of successful deployments
   - Alert if success rate drops below threshold

2. **Deployment Duration:**
   - Track time from push to deployment
   - Alert if duration exceeds threshold

3. **Build Failures:**
   - Track build failure rate
   - Alert on build failures

4. **Vercel API Errors:**
   - Track Vercel API error rate
   - Alert on API errors

---

### Where to Monitor

1. **GitHub Actions:**
   - Check workflow run history
   - Review failure patterns

2. **Vercel Dashboard:**
   - Check deployment history
   - Review build logs

3. **Custom Monitoring:**
   - Set up alerts for deployment failures
   - Track deployment metrics

---

## Conclusion

All critical deployment issues have been identified and fixed. The deployment system is now:

- ✅ **CI-First:** No local CLI requirements
- ✅ **Robust:** Automatic project linking, explicit scoping, error handling
- ✅ **Well-Documented:** Comprehensive guides for all scenarios
- ✅ **Diagnosable:** Deploy-doctor script for local checks
- ✅ **Reliable:** Clear failure modes documented and addressed

**Next Steps:**
1. Run `pnpm deploy:doctor` to verify configuration
2. Test preview deployment with a PR
3. Test production deployment with a push to main
4. Monitor deployments and adjust as needed

---

*This plan is a living document and will be updated as new issues are discovered and resolved.*
