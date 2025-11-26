# GitHub Actions Automation Guide

**Last Updated**: 2025-01-28  
**Purpose**: Documentation for automated Supabase scripts execution via GitHub Actions

---

## Overview

The `.github/workflows/supabase-scripts-automation.yml` workflow automatically:

1. **Applies migrations** when migration files are added/changed in PRs
2. **Runs metrics collection** script (`pnpm metrics:collect`)
3. **Runs testimonial generation** script (`pnpm testimonials:generate`)
4. **Commits generated files** back to the PR branch
5. **Posts PR comments** with execution status

**No CLI access needed!** Just push your changes and the workflow handles everything.

---

## When It Runs

### Automatic Triggers

The workflow runs automatically when:

- **Pull Request**: Opened, synchronized (new commits), or reopened
  - Only if files in these paths changed:
    - `supabase/migrations/**`
    - `scripts/collect-metrics.mjs`
    - `scripts/send-testimonial-requests.mjs`
    - `yc/**`
    - `.github/workflows/supabase-scripts-automation.yml`

- **Push to main/master**: When migration or script files change

### Manual Trigger

You can also trigger it manually:

1. Go to **Actions** tab in GitHub
2. Select **"Supabase Scripts Automation"** workflow
3. Click **"Run workflow"**
4. Select branch and click **"Run workflow"**

---

## What It Does

### Step 1: Setup

- Checks out code
- Sets up pnpm and Node.js
- Installs dependencies
- Sets up Supabase CLI
- Logs in to Supabase using `SUPABASE_ACCESS_TOKEN`
- Links to Supabase project using `SUPABASE_PROJECT_REF`

### Step 2: Check & Apply Migrations

- Detects if migration files changed in the PR
- Applies migrations using `supabase db push` or `supabase migration up`
- Supports both `supabase/migrations/` and `apps/web/supabase/migrations/` directories

### Step 3: Run Metrics Collection

- Sets environment variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
- Runs `pnpm metrics:collect`
- Generates/updates `/yc/METRICS_COLLECTED.md`

### Step 4: Run Testimonial Generation

- Sets environment variables (same as above)
- Runs `pnpm testimonials:generate`
- Generates/updates `/yc/TESTIMONIAL_REQUESTS.md`

### Step 5: Commit Changes

- Checks if any files were generated/modified
- Commits changes back to the PR branch
- Commit message: `"chore: auto-update metrics and testimonial requests [skip ci]"`
- Pushes changes to the PR branch

### Step 6: Post PR Comment

- Creates a comment on the PR with:
  - Execution status
  - Files updated
  - Timestamps

---

## Required GitHub Secrets

Make sure these secrets are set in your GitHub repository:

### Required

- `SUPABASE_ACCESS_TOKEN` - Supabase access token for CLI authentication
- `SUPABASE_PROJECT_REF` - Your Supabase project reference ID
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (for RPC calls)

### Optional

- `SUPABASE_DB_URL` - Direct database connection URL (for advanced operations)

---

## How to Set Up Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Add each secret:
   - **Name**: `SUPABASE_ACCESS_TOKEN`
   - **Value**: Your Supabase access token (get from Supabase Dashboard → Account → Access Tokens)
5. Repeat for all required secrets

---

## Workflow Behavior

### On Pull Requests

1. **Detects changes** in migration/script files
2. **Applies migrations** if new migrations detected
3. **Runs scripts** (metrics + testimonials)
4. **Commits results** back to PR branch
5. **Posts comment** with status

### On Push to Main

1. **Applies migrations** if migration files changed
2. **Runs scripts** (metrics + testimonials)
3. **Does NOT commit** (to avoid conflicts)

### Manual Trigger

1. **Checks for migrations** in repository
2. **Applies migrations** if found
3. **Runs scripts** (metrics + testimonials)
4. **Commits results** if run on a PR branch

---

## Troubleshooting

### Workflow Not Running

**Check**:
- Are the required secrets set?
- Did you change files in the trigger paths?
- Is the workflow file in `.github/workflows/`?

**Solution**:
- Verify secrets in Settings → Secrets
- Check workflow file syntax (YAML)
- Try manual trigger to test

### Migration Application Fails

**Common errors**:
- `SUPABASE_ACCESS_TOKEN` not set or invalid
- `SUPABASE_PROJECT_REF` not set or invalid
- Migration syntax errors

**Solution**:
- Verify secrets are correct
- Check migration SQL syntax
- Test migration locally first

### Scripts Fail

**Common errors**:
- `NEXT_PUBLIC_SUPABASE_URL` not set
- `SUPABASE_SERVICE_ROLE_KEY` not set
- Database functions don't exist (migration not applied)

**Solution**:
- Verify secrets are set
- Ensure migrations were applied first
- Check script logs in workflow output

### Files Not Committed

**Possible reasons**:
- No changes detected (files already up to date)
- Push failed (permissions issue)
- Workflow running on main branch (doesn't commit on main)

**Solution**:
- Check workflow logs for "No changes to commit"
- Verify workflow has `contents: write` permission
- Run on PR branch, not main

---

## Workflow Permissions

The workflow requires these permissions:

```yaml
permissions:
  contents: write      # To commit generated files
  pull-requests: write # To post PR comments
```

These are set in the workflow file and should work automatically.

---

## Example Workflow Run

### Scenario: Adding a new migration

1. **Create PR** with new migration file:
   ```
   supabase/migrations/20250129_new_feature.sql
   ```

2. **Push to PR branch**

3. **Workflow runs**:
   - Detects migration file changed
   - Applies migration to Supabase
   - Runs metrics collection
   - Runs testimonial generation
   - Commits results to PR

4. **Check PR**:
   - See workflow status (green checkmark)
   - See PR comment with execution details
   - See new commit: "chore: auto-update metrics and testimonial requests"

---

## Best Practices

1. **Review generated files** before merging PR
2. **Test migrations locally** before pushing
3. **Check workflow logs** if something fails
4. **Don't edit generated files manually** (they'll be overwritten)
5. **Use PRs** for all changes (workflow works best on PRs)

---

## Related Documentation

- `/docs/ACTION_PLAN_IMPLEMENTATION.md` - Step-by-step action plan guide
- `/yc/METRICS_COLLECTED.md` - Generated metrics file
- `/yc/TESTIMONIAL_REQUESTS.md` - Generated testimonial requests file
- `/scripts/collect-metrics.mjs` - Metrics collection script
- `/scripts/send-testimonial-requests.mjs` - Testimonial generation script

---

**Last Updated**: 2025-01-28  
**Status**: ✅ Active and ready to use
