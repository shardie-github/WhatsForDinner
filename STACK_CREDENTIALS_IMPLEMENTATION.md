# Stack Credentials Identification - Implementation Summary

## Overview

This implementation provides automated identification and sharing of credentials between staging and production stacks. It includes both automated API-based sharing (where possible) and comprehensive reporting for manual configuration.

## What Was Created

### 1. Main Script: `ops/cli/commands/identify-stack-credentials.ts`

A comprehensive TypeScript script that:
- Identifies missing credentials between staging and production
- Categorizes credentials into shared vs environment-specific
- Attempts automatic sharing via Vercel API (when credentials are available)
- Generates detailed reports for manual configuration
- Provides clear console output with actionable next steps

### 2. CLI Integration

Added to `ops/cli/index.ts`:
- New command: `identify-stack-credentials` (alias: `stack-creds`)
- Options:
  - `--dry-run` (default: true) - Run without making changes
  - `--auto-share` - Attempt to automatically share via Vercel API

### 3. Package.json Scripts

Added convenient npm scripts:
- `pnpm stack:creds` - Run credential identification (dry-run)
- `pnpm stack:creds:auto` - Run with auto-share enabled

### 4. Documentation

Created `docs/stack-credentials-guide.md` with:
- Complete usage instructions
- Credential categorization (shared vs separate)
- Manual sharing procedures
- Troubleshooting guide
- Security best practices

## How to Use

### Basic Usage (Identify Missing Credentials)

```bash
# Using npm script
pnpm stack:creds

# Using ops CLI directly
pnpm ops identify-stack-credentials

# Or with alias
pnpm ops stack-creds
```

### Auto-Share Credentials (When Possible)

```bash
# Set required environment variables first
export VERCEL_TOKEN=your-vercel-token
export VERCEL_PROJECT_ID=your-project-id

# Run with auto-share
pnpm stack:creds:auto

# Or
pnpm ops identify-stack-credentials --auto-share
```

### Manual Configuration

If auto-sharing is not available or fails:

1. Check the generated report: `ops/secrets/stack-credentials-report.md`
2. Follow the manual steps in `docs/stack-credentials-guide.md`
3. Use Vercel Dashboard or CLI to set environment variables

## Credential Categories

### Shared Credentials (Should Match)

These should have the same value in both staging and production:

- `STRIPE_WEBHOOK_SECRET`
- `WEBHOOK_SECRET_PARTNER`
- `WEBHOOK_SECRET_PAYMENTS`
- `PARTNER_CONVERSION_HMAC_SECRET`
- `LINK_SIGNING_SECRET`
- `DSAR_VERIFICATION_JWT_SECRET`
- `ADMIN_JWT_SECRET`
- `ARTIFACTS_BUCKET_SIGNING_KEY`
- `BACKUP_ENCRYPTION_KEY`
- `EXCHANGE_RATE_API_KEY`
- `GEOIP_LICENSE_KEY`

### Environment-Specific Credentials (Should Differ)

These should have different values per environment:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_URL`
- `VERCEL_PROJECT_ID`
- `STRIPE_SECRET_KEY` (test vs live)
- `NEXT_PUBLIC_APP_URL`
- Analytics keys (PostHog, Sentry, etc.)

## Automation Capabilities

### What Can Be Automated

The script can automatically share credentials via Vercel API when:
- `VERCEL_TOKEN` is set and valid
- `VERCEL_PROJECT_ID` is set
- Credential value is not a placeholder
- Credential is in the `VERCEL_AUTO_SHARE` list

### What Requires Manual Configuration

- Credentials not in the auto-share list
- When Vercel API credentials are not available
- When credential values are placeholders
- Supabase-specific credentials (different projects)

## Output

### Console Output

The script provides:
- Summary of credentials found
- List of missing shared credentials
- Auto-shareable vs manual configuration
- Actionable next steps

### Generated Reports

- **Markdown Report**: `ops/secrets/stack-credentials-report.md`
  - Detailed breakdown of missing credentials
  - Instructions for each credential
  - Commands for manual configuration

## Example Output

```
📊 Stack Credential Analysis Report
============================================================

📈 Summary:
   Staging credentials: 45
   Production credentials: 42
   Missing shared credentials: 3

🔍 Missing Shared Credentials:

📦 Credentials that can be auto-shared:
   🔵 STRIPE_WEBHOOK_SECRET (source: staging)
      Value: whsec_abc123...
   📝 Would set STRIPE_WEBHOOK_SECRET in production via Vercel API

✋ Credentials requiring manual configuration:
   🔵 ADMIN_JWT_SECRET (source: staging)
      Action: Manually copy ADMIN_JWT_SECRET to production stack
      Location:
         - Vercel: Dashboard > Project > Settings > Environment Variables
         - Supabase: Dashboard > Settings > API (if applicable)

📄 Full report saved to: ops/secrets/stack-credentials-report.md
```

## Integration with Existing Tools

This tool integrates with:
- `ops rotate-secrets` - For rotating credentials
- `ops doctor` - For health checks
- `ops check` - For validation checks

## Security Considerations

1. **Never commit secrets** - All credential values are handled securely
2. **Encrypted storage** - Vercel API uses encrypted environment variables
3. **Dry-run by default** - Prevents accidental changes
4. **Placeholder detection** - Skips auto-sharing for placeholder values
5. **Manual review** - Always review the report before manual configuration

## Next Steps

1. **Run the identification**:
   ```bash
   pnpm stack:creds
   ```

2. **Review the report**:
   ```bash
   cat ops/secrets/stack-credentials-report.md
   ```

3. **Configure missing credentials**:
   - Use auto-share if `VERCEL_TOKEN` is available
   - Or follow manual steps in the guide

4. **Regular maintenance**:
   - Run weekly or before major deployments
   - Keep credentials in sync between environments

## Troubleshooting

### "VERCEL_TOKEN not found"
- Set `export VERCEL_TOKEN=your-token`
- Or use manual configuration method

### "Credential already exists"
- The script will attempt to update it
- If update fails, manually update via Vercel dashboard

### "No staging .env file found"
- The script will check environment variables
- Create `.env.staging` file for better detection
- Or ensure staging credentials are in Vercel

## Related Documentation

- `docs/stack-credentials-guide.md` - Complete usage guide
- `docs/staging-environment-setup.md` - Staging environment setup
- `ops/cli/commands/rotate-secrets.ts` - Secret rotation
