# Secrets Management Tools Guide

## 🎯 Available Tools

### 1. **Secrets Health Dashboard** ⭐ NEW
**File**: `scripts/secrets-health-dashboard.mjs`

Comprehensive overview of all secrets with a nice dashboard view.

```bash
node scripts/secrets-health-dashboard.mjs
```

**Features:**
- ✅ Shows all secrets status at a glance
- ✅ Platform verification readiness check
- ✅ Critical secrets breakdown by category
- ✅ Quick actions and recommendations
- ✅ Color-coded status indicators

**Output:**
- Local environment status
- Platform API credentials status
- Secrets grouped by requirements
- Verification scripts availability
- Recommendations

---

### 2. **Secrets Export Tool** ⭐ NEW
**File**: `scripts/secrets-export.mjs`

Export secrets configuration (metadata only - no actual values) for backup/documentation.

```bash
# Export as JSON
node scripts/secrets-export.mjs json

# Export as Markdown
node scripts/secrets-export.mjs markdown
```

**Features:**
- ✅ Exports metadata only (no secret values)
- ✅ JSON and Markdown formats
- ✅ Platform requirements summary
- ✅ Usage statistics
- ✅ Safe for documentation

**Use Cases:**
- Backup configuration
- Documentation
- Onboarding new team members
- Audit trails

---

### 3. **Quick Secrets Check** ⭐ NEW
**File**: `scripts/secrets-quick-check.mjs`

Fast check for critical secrets - perfect for CI/CD.

```bash
node scripts/secrets-quick-check.mjs
```

**Features:**
- ⚡ Super fast (no API calls)
- ✅ Checks only critical secrets
- ✅ Exit code for CI/CD integration
- ✅ Minimal output

**Perfect for:**
- Pre-deployment checks
- CI/CD pipelines
- Quick health checks
- Automated monitoring

---

### 4. **Verify Environment Variables**
**File**: `scripts/verify-env-vars.mjs`

Detailed check of environment variable requirements.

```bash
node scripts/verify-env-vars.mjs
```

**Features:**
- ✅ Lists all required variables
- ✅ Shows where to get each value
- ✅ Identifies missing variables
- ✅ Provides configuration instructions

---

### 5. **Verify Secrets Sharing**
**File**: `scripts/verify-secrets-sharing.mjs`

Checks if secrets are properly shared across platforms (code analysis).

```bash
node scripts/verify-secrets-sharing.mjs
```

**Features:**
- ✅ Shows sharing matrix
- ✅ Identifies missing shares
- ✅ Platform requirements

---

### 6. **Verify Secrets Platforms** (API Verification)
**File**: `scripts/verify-secrets-platforms.mjs`

Actually connects to Vercel, GitHub, and Supabase APIs to verify secrets.

```bash
# Requires credentials
export VERCEL_TOKEN="..."
export VERCEL_PROJECT_ID="..."
export GITHUB_TOKEN="..."
export GITHUB_REPO="owner/repo"

node scripts/verify-secrets-platforms.mjs
```

**Features:**
- ✅ Real API verification
- ✅ Cross-platform comparison
- ✅ Actual configuration status

---

## 🚀 Quick Start

### For Quick Status Check:
```bash
node scripts/secrets-quick-check.mjs
```

### For Comprehensive Overview:
```bash
node scripts/secrets-health-dashboard.mjs
```

### For Detailed Analysis:
```bash
node scripts/verify-env-vars.mjs
node scripts/verify-secrets-sharing.mjs
```

### For API Verification:
```bash
# Set credentials first
export VERCEL_TOKEN="..."
export VERCEL_PROJECT_ID="..."
export GITHUB_TOKEN="..."
export GITHUB_REPO="owner/repo"

node scripts/verify-secrets-platforms.mjs
```

### For Export/Backup:
```bash
node scripts/secrets-export.mjs json
# or
node scripts/secrets-export.mjs markdown
```

---

## 📊 Tool Comparison

| Tool | Speed | API Calls | Use Case |
|------|-------|-----------|----------|
| `secrets-quick-check.mjs` | ⚡⚡⚡ Fast | ❌ No | CI/CD, quick checks |
| `secrets-health-dashboard.mjs` | ⚡⚡ Medium | ❌ No | Status overview |
| `verify-env-vars.mjs` | ⚡⚡ Medium | ❌ No | Requirements check |
| `verify-secrets-sharing.mjs` | ⚡⚡ Medium | ❌ No | Sharing analysis |
| `verify-secrets-platforms.mjs` | ⚡ Slow | ✅ Yes | Real verification |
| `secrets-export.mjs` | ⚡⚡ Medium | ❌ No | Documentation/backup |

---

## 🎯 Recommended Workflow

### Daily/Quick Check:
```bash
node scripts/secrets-quick-check.mjs
```

### Weekly Health Check:
```bash
node scripts/secrets-health-dashboard.mjs
```

### Before Deployment:
```bash
# 1. Quick check
node scripts/secrets-quick-check.mjs

# 2. Detailed verification
node scripts/verify-env-vars.mjs
node scripts/verify-secrets-sharing.mjs

# 3. API verification (if credentials available)
node scripts/verify-secrets-platforms.mjs
```

### For Documentation:
```bash
node scripts/secrets-export.mjs markdown
```

---

## 🔧 CI/CD Integration

### GitHub Actions Example:

```yaml
name: Secrets Check

on:
  push:
    branches: [main]
  schedule:
    - cron: '0 0 * * 0'  # Weekly

jobs:
  secrets-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Quick Secrets Check
        run: node scripts/secrets-quick-check.mjs
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
          SUPABASE_JWT_SECRET: ${{ secrets.SUPABASE_JWT_SECRET }}
      
      - name: Full Verification
        run: node scripts/verify-secrets-platforms.mjs
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
          VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          GITHUB_REPO: ${{ github.repository }}
```

---

## 📝 Notes

- ⚠️ **All tools are safe** - They don't expose actual secret values
- ✅ **Export tool** only exports metadata (no values)
- 🔒 **API verification** requires proper credentials
- ⚡ **Quick check** is fastest for CI/CD integration

---

## 🆘 Troubleshooting

### "Command not found"
Make sure you're in the project root and scripts are executable:
```bash
chmod +x scripts/*.mjs
```

### "Missing credentials"
Some tools require API credentials. Check the tool's documentation for required environment variables.

### "No secrets found"
Check that you're running in the correct environment or that environment variables are set.

---

## 📚 Related Documentation

- [Secrets Verification Guide](VERIFY_SECRETS_GUIDE.md)
- [Secrets Sharing Guide](SECRETS_SHARING_VERIFICATION.md)
- [Quick Reference](ENV_VARS_QUICK_REFERENCE.md)
