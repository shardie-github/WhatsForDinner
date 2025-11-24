# Supabase Migrations via GitHub Actions

This repository uses GitHub Actions to automatically apply Supabase database migrations against the hosted Supabase project (`ramptcbrcfuudlrybzng`). This workflow runs on Ubuntu, allowing migrations to execute even if you're developing on platforms where the Supabase CLI isn't available (e.g., Android/Termux).

## What This Workflow Does

The `Supabase Migrations` workflow:

1. **Logs in** to Supabase using a personal access token stored in GitHub Secrets
2. **Links** the repository to your Supabase project (`ramptcbrcfuudlrybzng`)
3. **Applies** all pending migrations from `supabase/migrations/` using `supabase migration up`
4. **Fails fast** if any migration encounters an error

This replaces the need to run `supabase migration up` locally, which is especially useful if you're developing on platforms where the Supabase CLI cannot run (like Android ARM64).

## Prerequisites

Before using this workflow, you need:

1. A Supabase account with access to project `ramptcbrcfuudlrybzng`
2. A personal access token from Supabase (see below)
3. GitHub repository access to add secrets

## Creating a Supabase Access Token

1. **Log in** to the [Supabase Dashboard](https://app.supabase.com)
2. **Navigate** to your account settings:
   - Click your profile icon (top right)
   - Select **Account Settings**
3. **Go to Access Tokens**:
   - In the left sidebar, click **Access Tokens**
   - Or navigate directly to: https://app.supabase.com/account/tokens
4. **Create a new token**:
   - Click **Generate New Token**
   - Give it a descriptive name (e.g., "GitHub Actions Migrations")
   - Set appropriate expiration (or leave as "Never expires" for CI/CD)
   - Click **Generate Token**
5. **Copy the token immediately**:
   - ⚠️ **Important**: You can only see this token once
   - Copy it to a secure location temporarily (you'll add it to GitHub Secrets next)
   - The token should look like: `sbp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

## Adding the Token to GitHub Secrets

1. **Go to your GitHub repository** on GitHub.com
2. **Navigate to Settings**:
   - Click **Settings** (top navigation bar)
   - In the left sidebar, click **Secrets and variables** → **Actions**
3. **Add a new repository secret**:
   - Click **New repository secret**
   - **Name**: `SUPABASE_ACCESS_TOKEN` (must match exactly)
   - **Value**: Paste the Supabase access token you copied earlier
   - Click **Add secret**
4. **Verify**:
   - You should see `SUPABASE_ACCESS_TOKEN` listed in your secrets
   - ⚠️ **Never commit the token to your repository** - only store it in GitHub Secrets

## Triggering the Workflow

### Automatic Trigger

The workflow runs automatically on **every push to the `main` branch** that includes changes to migration files or the workflow itself.

### Manual Trigger

To run migrations manually:

1. **Go to the Actions tab** in your GitHub repository
2. **Select** the `Supabase Migrations` workflow from the left sidebar
3. **Click** `Run workflow` (top right)
4. **Select** the branch (usually `main`)
5. **Click** `Run workflow`

The workflow will start immediately and you can watch it execute in real-time.

## Verifying Migrations

### Check Workflow Status

1. **Go to Actions** → `Supabase Migrations`
2. **Find** the latest workflow run
3. **Check** the status:
   - ✅ **Green checkmark**: Migrations applied successfully
   - ❌ **Red X**: Migration failed - check the logs

### View Migration Logs

1. **Click** on the workflow run
2. **Expand** the `migrate` job
3. **Review** each step:
   - `Login to Supabase`: Should show successful authentication
   - `Link to Supabase project`: Should show project linking
   - `Run migrations`: Shows which migrations were applied

### Verify in Supabase Dashboard

1. **Log in** to [Supabase Dashboard](https://app.supabase.com)
2. **Select** your project (`ramptcbrcfuudlrybzng`)
3. **Go to** Database → Migrations
4. **Verify** that your migrations appear in the history
5. **Check** Database → Tables to confirm schema changes

## Troubleshooting

### Workflow Fails: "SUPABASE_ACCESS_TOKEN secret is not set"

- **Solution**: Add the `SUPABASE_ACCESS_TOKEN` secret to your GitHub repository (see "Adding the Token to GitHub Secrets" above)

### Workflow Fails: "Invalid token" or Authentication Error

- **Solution**: 
  - Verify the token is correct in GitHub Secrets
  - Generate a new token in Supabase and update the secret
  - Ensure the token hasn't expired

### Workflow Fails: "Project not found" or Link Error

- **Solution**: 
  - Verify project ref `ramptcbrcfuudlrybzng` is correct
  - Ensure your access token has permissions for this project
  - Check that the project exists and is accessible

### Migration Fails: SQL Error

- **Solution**:
  - Review the error message in the workflow logs
  - Check your migration SQL syntax
  - Verify the migration is compatible with your current database state
  - Test migrations locally first if possible

### Concurrent Migration Runs

- The workflow uses concurrency control to prevent overlapping runs
- If a migration is already running, new runs will wait
- Only one migration can run at a time per branch

## Important Caveats

⚠️ **Production Environment**: Migrations are executed against your **actual Supabase project** (`ramptcbrcfuudlrybzng`). Any destructive operations (DROP TABLE, DELETE, etc.) will affect your production/staging database.

⚠️ **Best Practices**:
- **Test migrations locally** first if possible
- **Use a staging project** during development, then update the workflow for production
- **Review migration files** before pushing to `main`
- **Backup your database** before running destructive migrations
- **Use transactions** in migrations where possible for rollback safety

⚠️ **Migration Order**: Migrations are applied in alphabetical order by filename. Use timestamp prefixes (e.g., `20240101000000_description.sql`) to ensure correct ordering.

## Workflow Configuration

The workflow is configured at `.github/workflows/supabase-migrate.yml`. Key settings:

- **Triggers**: Push to `main`, manual dispatch
- **Concurrency**: One migration run at a time per branch
- **Timeout**: 15 minutes
- **Node Version**: 20
- **Project Ref**: `ramptcbrcfuudlrybzng` (hardcoded, not a secret)

To change the project ref, edit the `SUPABASE_PROJECT_REF` environment variable in the workflow file.
