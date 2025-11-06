# Complete Secrets Verification Guide

## Quick Start

### Option 1: Verify Secrets Sharing (Code Analysis)
Checks if secrets are referenced in code/workflows:
```bash
node scripts/verify-secrets-sharing.mjs
```

### Option 2: Verify Secrets Across Platforms (Real API Check) ⭐ **RECOMMENDED**
Actually connects to Vercel, GitHub, and Supabase APIs:
```bash
# Set required environment variables
export VERCEL_TOKEN="your-token"
export VERCEL_PROJECT_ID="your-project-id"
export GITHUB_TOKEN="your-token"
export GITHUB_REPO="owner/repo"

# Run verification
node scripts/verify-secrets-platforms.mjs
```

## Script Comparison

| Script | What It Does | API Access | Best For |
|--------|--------------|------------|----------|
| `verify-secrets-sharing.mjs` | Analyzes code to see where secrets should be | ❌ No | Understanding requirements |
| `verify-secrets-platforms.mjs` | **Actually checks what's configured** | ✅ Yes | **Real verification** |
| `verify-env-vars.mjs` | Checks local environment variables | ❌ No | Local development |

## How to Use Platform Verification

### Step 1: Get Your Tokens

#### Vercel Token & Project ID
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. **Token**: Settings → Tokens → Create Token
3. **Project ID**: Project → Settings → General → Project ID

#### GitHub Token & Repo
1. Go to [GitHub Settings → Tokens](https://github.com/settings/tokens)
2. Generate new token (classic) with `repo` scope
3. **Repo format**: `owner/repo` (e.g., `myorg/myrepo`)

#### Supabase (Optional)
1. **URL**: Supabase Dashboard → Project Settings → API
2. **Service Role Key**: Same location → Service Role Key

### Step 2: Set Environment Variables

```bash
export VERCEL_TOKEN="vercel_token_here"
export VERCEL_PROJECT_ID="prj_xxxxx"
export GITHUB_TOKEN="ghp_xxxxx"
export GITHUB_REPO="your-org/your-repo"
export NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-key"
```

### Step 3: Run Verification

```bash
node scripts/verify-secrets-platforms.mjs
```

## What the Script Checks

### Critical Secrets Verified:

✅ **Must be in BOTH Vercel AND GitHub:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

✅ **Must be in Vercel ONLY:**
- `SUPABASE_JWT_SECRET` ⚠️ **Critical**
- `SUPABASE_DB_URL` (optional)
- `DATABASE_URL` (optional)

✅ **Must be in GitHub ONLY:**
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_PROJECT_REF`

## Example Output

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

✅ All secrets are properly configured!
```

## Troubleshooting

### "Missing credentials for API access"
**Solution**: Set the required environment variables. The script will check what it can with available credentials.

### "Failed to fetch Vercel env vars"
**Solution**: 
- Check `VERCEL_TOKEN` is valid
- Verify `VERCEL_PROJECT_ID` is correct
- Ensure you have access to the project

### "Failed to fetch GitHub secrets"
**Solution**:
- Check `GITHUB_TOKEN` has `repo` scope
- Verify `GITHUB_REPO` format: `owner/repo`
- Ensure token has repository access

## Security Best Practices

1. ✅ **Use environment variables** - Never hardcode tokens
2. ✅ **Rotate tokens regularly** - Especially if exposed
3. ✅ **Use least privilege** - GitHub tokens with minimal scopes
4. ✅ **Don't commit tokens** - Use `.env` files (gitignored) or CI/CD secrets

## Next Steps

After running verification:

1. **If secrets are missing**: Add them to the indicated platforms
2. **If incorrectly placed**: Move them to the correct platform
3. **Verify again**: Run the script again to confirm fixes
4. **Set up automation**: Use in CI/CD to verify regularly

## Documentation

- [Platform Verification README](scripts/verify-secrets-platforms-README.md) - Detailed usage
- [Secrets Sharing Guide](SECRETS_SHARING_VERIFICATION.md) - Sharing requirements
- [Quick Reference](ENV_VARS_QUICK_REFERENCE.md) - Quick lookup
