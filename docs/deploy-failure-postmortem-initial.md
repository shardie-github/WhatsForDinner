# Deployment Failure Postmortem - Initial Analysis

**Date:** 2025-01-28  
**Status:** 🔍 Investigation Phase  
**Scope:** Vercel Preview & Production Deployment Failures

---

## Executive Summary

This document captures the initial forensic analysis of deployment failures for Vercel Preview (PRs) and Production (main branch) deployments. The analysis is based purely on configuration inspection, as we do not have access to GitHub Actions runtime logs.

---

## Existing Workflows Analysis

### 1. `frontend-deploy.yml` (Primary Deployment Workflow)

**Status:** ✅ Active (intended to be canonical)

**Triggers:**
- `pull_request` → All branches (`branches: ['*']`)
- `push` → `main` branch only
- `workflow_dispatch` → Manual trigger

**Structure:**
- **Job 1:** `build-and-test` - Runs lint, type-check, tests, builds
- **Job 2:** `deploy` - Depends on `build-and-test`, deploys to Vercel

**Potential Issues Identified:**

1. **Deploy Job Condition:**
   ```yaml
   if: |
     github.event_name == 'pull_request' || 
     github.ref == 'refs/heads/main' || 
     github.event_name == 'workflow_dispatch'
   ```
   - ✅ This condition is correct and should allow all intended triggers
   - ✅ Individual steps have more specific conditions (good)

2. **Working Directory:**
   - Uses `working-directory: apps/web` for deploy steps
   - ⚠️ **RISK:** Assumes Vercel project is linked to `apps/web` subdirectory
   - ⚠️ **RISK:** No verification that `.vercel` directory exists or is configured

3. **Vercel CLI Commands:**
   - Uses `vercel pull --yes --environment=preview|production`
   - Uses `vercel build`
   - Uses `vercel deploy --prebuilt`
   - ⚠️ **RISK:** No explicit project linking (`vercel link`) before pull
   - ⚠️ **RISK:** No verification that VERCEL_ORG_ID and VERCEL_PROJECT_ID match actual project

4. **Secret Verification:**
   - ✅ Has explicit secret verification step (good)
   - ✅ Fails fast if secrets missing (good)

5. **Concurrency:**
   ```yaml
   concurrency:
     group: frontend-deploy-${{ github.ref }}
     cancel-in-progress: true
   ```
   - ✅ Correctly configured to cancel in-progress deployments

---

### 2. `deploy.yml` (Deprecated)

**Status:** ⚠️ DEPRECATED but still present

**Issues:**
- Has disabled triggers (commented out `on:` section)
- Marked for removal by 2025-02-28
- ⚠️ **RISK:** Could cause confusion if someone accidentally enables it
- ⚠️ **RISK:** Mixed concerns (frontend deploy + database migrations)

**Recommendation:** Remove immediately or rename to `.deprecated.yml`

---

### 3. `vercel-promotion.yml` (Alternative Deployment Method)

**Status:** ⚠️ Uses different deployment approach

**Issues:**
- Uses `amondnet/vercel-action@v25` instead of Vercel CLI
- Only triggers on `workflow_dispatch` (manual)
- ⚠️ **RISK:** Creates confusion about which workflow is canonical
- ⚠️ **RISK:** Different deployment method may have different behavior

**Recommendation:** Document which workflow is canonical, or consolidate

---

## Suspected Failure Modes

### Failure Mode 1: Workflow Not Triggering

**Likelihood:** 🟡 Medium

**Possible Causes:**

1. **Branch Filter Issues:**
   - ✅ `frontend-deploy.yml` triggers on `pull_request` with `branches: ['*']` - should work
   - ✅ Triggers on `push` to `main` - should work
   - ✅ No `paths` filters that would prevent triggering

2. **Workflow Disabled:**
   - ⚠️ Could be disabled in GitHub repository settings
   - ⚠️ Could be disabled at organization level

3. **Required Checks Blocking:**
   - ⚠️ If `build-and-test` fails, `deploy` won't run (expected behavior)
   - ⚠️ If other required checks fail, PR might not merge (expected)

**Evidence Needed:**
- Check GitHub Actions tab for workflow runs
- Check if workflow appears in Actions list
- Check if workflow is disabled in settings

---

### Failure Mode 2: Workflow Runs But Deploy Step Skipped

**Likelihood:** 🟡 Medium

**Possible Causes:**

1. **Job Dependency:**
   - ✅ `deploy` job has `needs: build-and-test` - correct
   - ⚠️ If `build-and-test` fails, `deploy` won't run (expected)

2. **Condition Logic:**
   - ✅ Deploy job condition looks correct
   - ✅ Individual step conditions look correct
   - ⚠️ Could fail if `github.ref` doesn't match expected format

3. **Concurrency Cancellation:**
   - ⚠️ If multiple commits pushed quickly, older deployments might be cancelled
   - ⚠️ This is intentional but could cause confusion

**Evidence Needed:**
- Check if `build-and-test` job completes successfully
- Check if `deploy` job appears but shows "skipped"
- Check concurrency group settings

---

### Failure Mode 3: Workflow Runs But Fails (Build/Env/Secrets/Vercel)

**Likelihood:** 🔴 High (most likely)

**Possible Causes:**

#### 3.1 Missing or Invalid Secrets

**Critical Secrets:**
- `VERCEL_TOKEN` - Required for all Vercel CLI operations
- `VERCEL_ORG_ID` - Required to identify organization
- `VERCEL_PROJECT_ID` - Required to identify project

**Symptoms:**
- Workflow fails at "Verify Vercel secrets" step
- Or fails at `vercel pull` with authentication error

**Likelihood:** 🔴 High - Most common failure point

#### 3.2 Vercel Project Not Linked

**Symptoms:**
- `vercel pull` fails with "Project not found" or "Not linked"
- Missing `.vercel/project.json` or `.vercel/.gitignore`

**Likelihood:** 🟡 Medium - Could happen if project was reset or recreated

**Root Cause:**
- Vercel CLI requires project to be "linked" before pulling config
- In monorepo, project must be linked to `apps/web` subdirectory
- No explicit `vercel link` step in workflow

#### 3.3 Wrong Vercel Project/Org IDs

**Symptoms:**
- `vercel pull` succeeds but pulls wrong project config
- Deployment goes to wrong Vercel project

**Likelihood:** 🟡 Medium - Could happen if IDs were copied incorrectly

#### 3.4 Build Failures

**Symptoms:**
- `vercel build` fails with compilation errors
- Missing environment variables during build
- Type errors or lint errors

**Likelihood:** 🟡 Medium - Should be caught by `build-and-test` job

**Possible Causes:**
- Missing `NEXT_PUBLIC_*` env vars in Vercel project settings
- Build command mismatch between workflow and Vercel settings
- Node version mismatch

#### 3.5 Monorepo Configuration Issues

**Symptoms:**
- Vercel CLI can't find `package.json` or `next.config.js`
- Build fails because it's running in wrong directory

**Likelihood:** 🟡 Medium - Working directory is set but might not be enough

**Root Cause:**
- Vercel project might be configured for root directory, not `apps/web`
- Or vice versa - project configured for `apps/web` but workflow runs from root

---

### Failure Mode 4: Vercel Git Integration Conflict

**Likelihood:** 🟡 Medium

**Possible Causes:**

1. **Both GitHub Actions AND Vercel Git Integration Active:**
   - Vercel's native Git integration tries to deploy on every push
   - GitHub Actions also tries to deploy
   - Could cause race conditions or double deployments

2. **Vercel Git Integration Pointing at Wrong Branch:**
   - If Git Integration is configured for `develop` but we push to `main`
   - Or configured for `main` but we want to use Actions instead

**Symptoms:**
- Deployments appear in Vercel Dashboard but not from Actions
- Or deployments fail with "already deploying" errors

**Evidence Needed:**
- Check Vercel Dashboard → Project Settings → Git
- See if Git Integration is enabled
- Check which branch it's connected to

---

## Immediate "Can't Possibly Deploy" Issues

### 🔴 Critical Issues (Must Fix)

1. **No `.vercel` Directory Found:**
   - Project might not be linked to Vercel
   - `vercel pull` will fail without project link
   - **Fix:** Add explicit `vercel link` step OR ensure `.vercel` directory exists

2. **Missing Secrets:**
   - If `VERCEL_TOKEN`, `VERCEL_ORG_ID`, or `VERCEL_PROJECT_ID` are missing, deployment will fail
   - **Fix:** Document required secrets and add validation

3. **Deprecated Workflow Still Present:**
   - `deploy.yml` is deprecated but still in repo
   - Could cause confusion
   - **Fix:** Remove or clearly mark as deprecated

### 🟡 Medium Priority Issues

1. **Multiple Deployment Workflows:**
   - `frontend-deploy.yml` (CLI-based)
   - `vercel-promotion.yml` (Action-based)
   - Could cause confusion about which is canonical
   - **Fix:** Document canonical workflow, disable or remove others

2. **No Explicit Project Linking:**
   - Workflow assumes project is already linked
   - **Fix:** Add `vercel link` step OR document that linking must be done manually

3. **Monorepo Directory Assumptions:**
   - Workflow uses `working-directory: apps/web`
   - Assumes Vercel project is configured for this directory
   - **Fix:** Verify Vercel project root directory setting matches

---

## Configuration Gaps

### Missing Documentation

1. **Which workflow is canonical?**
   - `frontend-deploy.yml` appears to be canonical
   - But `vercel-promotion.yml` exists and uses different method
   - Need clear documentation

2. **Vercel Project Configuration:**
   - What is the Vercel project name?
   - What is the root directory setting?
   - Is Git Integration enabled or disabled?

3. **Required Secrets:**
   - List of all required secrets
   - Where to get them
   - How to verify they're correct

4. **Environment Variables:**
   - Which env vars are required for build?
   - Which are required for runtime?
   - Where should they be set (GitHub Secrets vs Vercel Dashboard)?

---

## Next Steps

1. ✅ **Create Deploy Strategy Document** - Establish canonical deploy paths
2. ✅ **Fix Workflow Triggering** - Ensure workflows fire correctly
3. ✅ **Fix Deploy Step Skipping** - Ensure deploy jobs run when they should
4. ✅ **Fix Build/Env/Secrets** - Ensure all required config is present
5. ✅ **Fix Vercel Configuration** - Ensure project is properly linked
6. ✅ **Create Diagnostic Tools** - Add `deploy-doctor` script
7. ✅ **Create Comprehensive Docs** - Document all failure modes and fixes

---

## Assumptions Made

Since we don't have access to GitHub Actions logs, we're making these assumptions:

1. **Workflow is enabled** - We assume workflows are not disabled in GitHub settings
2. **Secrets might be missing** - We assume secrets might not be configured
3. **Vercel project exists** - We assume Vercel project exists but might not be linked
4. **Git Integration might conflict** - We assume Vercel Git Integration might be enabled

All fixes will be defensive and handle these cases.

---

*This document will be updated as fixes are implemented.*
