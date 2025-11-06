# Verify Secrets Across Platforms Script

## Overview

This script connects to Vercel, GitHub, and Supabase APIs to verify that critical secrets are properly configured in each platform.

## Features

- ✅ **Real API Verification**: Actually checks what's configured in each platform
- ✅ **Cross-Platform Comparison**: Shows where secrets should be vs where they are
- ✅ **Missing Detection**: Identifies secrets missing from required platforms
- ✅ **Incorrect Placement**: Warns if secrets are in wrong platforms
- ✅ **Comprehensive Report**: Shows full status of all critical secrets

## Prerequisites

### Required Environment Variables

To verify all platforms, you need:

```bash
# For Vercel API access
export VERCEL_TOKEN="your-vercel-token"
export VERCEL_PROJECT_ID="your-project-id"

# For GitHub API access
export GITHUB_TOKEN="your-github-token"
export GITHUB_REPO="owner/repo"  # e.g., "myorg/myrepo"

# For Supabase API access (optional)
export NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

### How to Get Tokens

#### Vercel Token
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to **Settings → Tokens**
3. Click **Create Token**
4. Copy the token

#### Vercel Project ID
1. Go to Vercel Dashboard → Your Project
2. Navigate to **Settings → General**
3. Copy the **Project ID**

#### GitHub Token
1. Go to [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
2. Click **Generate new token (classic)**
3. Select scopes: `repo` (for private repos) or `public_repo` (for public repos)
4. Copy the token

#### GitHub Repository
Format: `owner/repo`
- Example: `myusername/myproject`
- Or: `myorg/myproject`

## Usage

### Basic Usage

```bash
# Set required environment variables first
export VERCEL_TOKEN="your-token"
export VERCEL_PROJECT_ID="your-project-id"
export GITHUB_TOKEN="your-token"
export GITHUB_REPO="owner/repo"

# Run the script
node scripts/verify-secrets-platforms.mjs
```

### With .env File

Create a `.env` file (don't commit it):

```bash
VERCEL_TOKEN=your-vercel-token
VERCEL_PROJECT_ID=your-project-id
GITHUB_TOKEN=your-github-token
GITHUB_REPO=owner/repo
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Then run:

```bash
# Load .env and run
source .env  # or use: export $(cat .env | xargs)
node scripts/verify-secrets-platforms.mjs
```

### Partial Verification

The script will check what it can with available credentials:

- **No Vercel credentials**: Skips Vercel verification
- **No GitHub credentials**: Skips GitHub verification
- **No Supabase credentials**: Skips Supabase verification

It will warn you about missing credentials but continue with available platforms.

## Output

The script provides:

1. **✅ Correctly Configured**: Secrets that are in the right places
2. **❌ Missing Secrets**: Secrets that should be in a platform but aren't
3. **⚠️ Incorrectly Placed**: Secrets in wrong platforms
4. **📊 Summary**: Overall statistics

### Example Output

```
🔐 Verifying Secrets Across Platforms
======================================================================

📡 Fetching secrets from platforms...
   Fetching from Vercel...
   ✅ Found 12 Vercel environment variables
   Fetching from GitHub...
   ✅ Found 8 GitHub secrets
   Fetching from Supabase...
   ✅ Found 3 Supabase secrets

🔍 Verification Results
======================================================================

✅ CORRECTLY CONFIGURED
======================================================================

✅ NEXT_PUBLIC_SUPABASE_URL
   Supabase project URL
   ✓ Vercel: Configured
   ✓ GitHub: Configured
   ✓ Supabase: Not needed

❌ MISSING SECRETS
======================================================================

❌ SUPABASE_JWT_SECRET
   JWT secret for token verification
   Missing from: Vercel
   Required in:
     • Vercel Environment Variables

📊 SUMMARY
======================================================================
Total critical secrets: 11
Correctly configured: 8
Missing: 1
Incorrectly placed: 0

Vercel: 12 environment variables found
GitHub: 8 secrets found
Supabase: 3 secrets found
```

## Exit Codes

- **0**: All secrets are properly configured
- **1**: Missing or incorrectly placed secrets found

## Security Notes

⚠️ **Important Security Considerations**:

1. **Never commit tokens to git**: Use environment variables or secure secret management
2. **Use least privilege**: GitHub tokens should have minimal required scopes
3. **Rotate tokens regularly**: Especially if exposed or compromised
4. **Use CI/CD secrets**: In GitHub Actions, use `${{ secrets.TOKEN_NAME }}` instead of hardcoding

## Troubleshooting

### "Failed to fetch Vercel env vars"
- Check `VERCEL_TOKEN` is valid and has access to the project
- Verify `VERCEL_PROJECT_ID` is correct
- Ensure you have access to the Vercel project

### "Failed to fetch GitHub secrets"
- Check `GITHUB_TOKEN` is valid and has `repo` scope
- Verify `GITHUB_REPO` format is correct: `owner/repo`
- Ensure token has access to the repository

### "Failed to fetch Supabase secrets"
- Check `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are correct
- Verify `secrets_vault` table exists in your Supabase database
- Ensure service role key has access to the table

### "Missing credentials for API access"
- This is a warning, not an error
- The script will verify what it can with available credentials
- Add missing credentials to verify all platforms

## Integration with CI/CD

You can use this script in CI/CD to verify secrets are configured:

```yaml
# .github/workflows/verify-secrets.yml
name: Verify Secrets

on:
  schedule:
    - cron: '0 0 * * 0'  # Weekly
  workflow_dispatch:

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Verify Secrets
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          GITHUB_REPO: ${{ github.repository }}
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
        run: node scripts/verify-secrets-platforms.mjs
```

## Comparison with Other Scripts

| Script | Purpose | API Access |
|--------|---------|------------|
| `verify-secrets-sharing.mjs` | Checks code/workflow references | No - static analysis |
| `verify-secrets-platforms.mjs` | **Actually verifies platforms** | **Yes - real API calls** |
| `verify-env-vars.mjs` | Checks local environment | No - local only |

Use `verify-secrets-platforms.mjs` when you want to **actually verify** what's configured in each platform.
