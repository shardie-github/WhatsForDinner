# GitHub Secrets Setup Guide

**Last Updated:** 2025-01-28  
**Purpose:** Complete guide for setting up GitHub Secrets for CI/CD

---

## Overview

GitHub Secrets are used by GitHub Actions workflows to securely access external services and APIs. This guide covers all required and optional secrets for this repository.

---

## Required Secrets (Core CI/CD)

### Vercel Deployment Secrets

**Required for:** `frontend-deploy.yml`

1. **`VERCEL_TOKEN`**
   - **Description:** Vercel API token for deployments
   - **How to get:**
     1. Go to [Vercel Dashboard](https://vercel.com/account/tokens)
     2. Click "Create Token"
     3. Name it (e.g., "GitHub Actions")
     4. Copy the token
   - **Required:** ✅ Yes
   - **Used in:** Frontend deployments

2. **`VERCEL_ORG_ID`**
   - **Description:** Vercel organization ID
   - **How to get:**
     1. Go to Vercel Dashboard → Settings → General
     2. Copy "Organization ID"
   - **Required:** ✅ Yes
   - **Used in:** Frontend deployments

3. **`VERCEL_PROJECT_ID`**
   - **Description:** Vercel project ID
   - **How to get:**
     1. Go to Vercel Dashboard → Project → Settings → General
     2. Copy "Project ID"
   - **Required:** ✅ Yes
   - **Used in:** Frontend deployments

### Supabase Secrets

**Required for:** `supabase-migrate.yml`, `supabase-ci.yml`

4. **`SUPABASE_ACCESS_TOKEN`**
   - **Description:** Supabase CLI access token
   - **How to get:**
     1. Go to [Supabase Dashboard](https://supabase.com/dashboard/account/tokens)
     2. Click "Generate new token"
     3. Copy the token
   - **Required:** ✅ Yes
   - **Used in:** Database migrations

5. **`SUPABASE_PROJECT_REF`**
   - **Description:** Supabase project reference ID
   - **How to get:**
     1. Go to Supabase Dashboard → Project Settings → General
     2. Copy "Reference ID"
   - **Required:** ✅ Yes
   - **Used in:** Database migrations, schema validation

6. **`DATABASE_URL`**
   - **Description:** PostgreSQL connection string
   - **Format:** `postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres?sslmode=require`
   - **How to get:**
     1. Go to Supabase Dashboard → Project Settings → Database
     2. Copy "Connection string" (use "URI" format)
     3. Replace `<password>` with your database password
   - **Required:** ✅ Yes (for migrations, schema validation)
   - **Used in:** Database migrations, schema validation, smoke tests

### Application Secrets

**Required for:** Builds, tests, deployments

7. **`NEXT_PUBLIC_SUPABASE_URL`**
   - **Description:** Public Supabase URL
   - **Format:** `https://<project-ref>.supabase.co`
   - **How to get:**
     1. Go to Supabase Dashboard → Project Settings → API
     2. Copy "Project URL"
   - **Required:** ✅ Yes
   - **Used in:** Builds, tests, deployments

8. **`NEXT_PUBLIC_SUPABASE_ANON_KEY`**
   - **Description:** Public Supabase anonymous key
   - **How to get:**
     1. Go to Supabase Dashboard → Project Settings → API
     2. Copy "anon public" key
   - **Required:** ✅ Yes
   - **Used in:** Builds, tests, deployments

9. **`SUPABASE_SERVICE_ROLE_KEY`**
   - **Description:** Supabase service role key (server-only)
   - **How to get:**
     1. Go to Supabase Dashboard → Project Settings → API
     2. Copy "service_role" key (⚠️ Keep secret!)
   - **Required:** ✅ Yes (for smoke tests, API routes)
   - **Used in:** Smoke tests, API routes, server-side operations

---

## Optional Secrets

### OpenAI (for AI features)

10. **`OPENAI_API_KEY`**
    - **Description:** OpenAI API key for meal generation
    - **How to get:**
      1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
      2. Click "Create new secret key"
      3. Copy the key
    - **Required:** ⚠️ Optional (only if using AI features)
    - **Used in:** AI meal generation, AI audit workflows

### Stripe (for payments)

11. **`STRIPE_SECRET_KEY`**
    - **Description:** Stripe secret key
    - **How to get:**
      1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
      2. Copy "Secret key"
    - **Required:** ⚠️ Optional (only if using payments)
    - **Used in:** Payment processing

12. **`STRIPE_WEBHOOK_SECRET`**
    - **Description:** Stripe webhook secret
    - **How to get:**
      1. Go to Stripe Dashboard → Developers → Webhooks
      2. Create or select webhook endpoint
      3. Copy "Signing secret"
    - **Required:** ⚠️ Optional (only if using webhooks)
    - **Used in:** Webhook verification

### Monitoring & Observability

13. **`SENTRY_DSN`**
    - **Description:** Sentry DSN for error tracking
    - **How to get:**
      1. Go to [Sentry](https://sentry.io/settings/)
      2. Create project or select existing
      3. Copy DSN
    - **Required:** ⚠️ Optional
    - **Used in:** Error tracking

14. **`PROD_URL`**
    - **Description:** Production URL for E2E tests
    - **Format:** `https://your-domain.com`
    - **Required:** ⚠️ Optional (defaults to localhost)
    - **Used in:** E2E tests

### Security Scanning

15. **`SNYK_TOKEN`**
    - **Description:** Snyk API token for security scanning
    - **How to get:**
      1. Go to [Snyk](https://app.snyk.io/account)
      2. Copy API token
    - **Required:** ⚠️ Optional (only if using Snyk)
    - **Used in:** Security workflow

### Notifications

16. **`SLACK_WEBHOOK_URL`**
    - **Description:** Slack webhook URL for notifications
    - **How to get:**
      1. Go to Slack → Apps → Incoming Webhooks
      2. Create webhook
      3. Copy webhook URL
    - **Required:** ⚠️ Optional
    - **Used in:** Workflow notifications

---

## How to Set Secrets

### Via GitHub Web Interface

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Enter the **Name** (exactly as listed above)
5. Enter the **Value**
6. Click **Add secret**

### Via GitHub CLI

```bash
# Install GitHub CLI if not already installed
# brew install gh (macOS)
# Or download from https://cli.github.com

# Authenticate
gh auth login

# Set a secret
gh secret set VERCEL_TOKEN --body "your-token-here"

# Set multiple secrets from a file
gh secret set --env-file .env.secrets
```

### Via Terraform (if using Infrastructure as Code)

```hcl
resource "github_actions_secret" "vercel_token" {
  repository      = "your-repo-name"
  secret_name     = "VERCEL_TOKEN"
  plaintext_value = var.vercel_token
}
```

---

## Verification

### Check Secrets Are Set

```bash
# List all secrets (names only, not values)
gh secret list

# Or via GitHub web interface
# Settings → Secrets and variables → Actions
```

### Test Workflows

1. **Test Frontend Deploy:**
   ```bash
   # Create a test PR or push to main
   # Check GitHub Actions → frontend-deploy.yml
   ```

2. **Test Migrations:**
   ```bash
   # Push to main (affecting supabase/migrations)
   # Check GitHub Actions → supabase-migrate.yml
   ```

3. **Test Smoke Tests:**
   ```bash
   # Create a PR
   # Check GitHub Actions → ci.yml → smoke-tests job
   ```

---

## Security Best Practices

### ✅ Do

1. **Rotate Regularly:** Rotate secrets every 90 days
2. **Use Different Keys:** Use different keys for dev/staging/prod
3. **Limit Access:** Only grant access to necessary secrets
4. **Audit Usage:** Regularly audit secret usage
5. **Use Environments:** Use GitHub Environments for production secrets

### ❌ Don't

1. **Commit Secrets:** Never commit secrets to git
2. **Share Secrets:** Don't share secrets in chat/email
3. **Use Production Keys Locally:** Use separate dev keys
4. **Expose in Logs:** Don't log secrets (GitHub Actions hides them automatically)
5. **Hardcode:** Don't hardcode secrets in workflows

---

## Troubleshooting

### Secret Not Found Error

**Error:** `Secret not found: VERCEL_TOKEN`

**Solution:**
1. Verify secret name matches exactly (case-sensitive)
2. Check secret is set in correct repository
3. Verify you have access to repository secrets

### Secret Expired Error

**Error:** `Authentication failed` or `Invalid token`

**Solution:**
1. Regenerate the token from the service (Vercel, Supabase, etc.)
2. Update the secret in GitHub
3. Re-run the workflow

### Secret Not Available in Workflow

**Error:** Secret exists but workflow can't access it

**Solution:**
1. Check workflow has `secrets: read` permission
2. Verify secret is set at repository level (not environment level)
3. Check workflow syntax: `${{ secrets.SECRET_NAME }}`

---

## Complete Secret Checklist

### Required for Basic CI/CD
- [ ] `VERCEL_TOKEN`
- [ ] `VERCEL_ORG_ID`
- [ ] `VERCEL_PROJECT_ID`
- [ ] `SUPABASE_ACCESS_TOKEN`
- [ ] `SUPABASE_PROJECT_REF`
- [ ] `DATABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`

### Optional (Add as Needed)
- [ ] `OPENAI_API_KEY` (for AI features)
- [ ] `STRIPE_SECRET_KEY` (for payments)
- [ ] `STRIPE_WEBHOOK_SECRET` (for webhooks)
- [ ] `SENTRY_DSN` (for error tracking)
- [ ] `PROD_URL` (for E2E tests)
- [ ] `SNYK_TOKEN` (for security scanning)
- [ ] `SLACK_WEBHOOK_URL` (for notifications)

---

## Next Steps

1. ✅ Set all required secrets
2. ✅ Test workflows to verify secrets work
3. ✅ Document any custom secrets you add
4. ✅ Set up secret rotation schedule
5. ✅ Review secret access permissions

---

## Additional Resources

- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Vercel API Tokens](https://vercel.com/account/tokens)
- [Supabase Access Tokens](https://supabase.com/dashboard/account/tokens)
- [GitHub CLI Documentation](https://cli.github.com/manual/)

---

**Status:** ✅ Complete setup guide ready for use
