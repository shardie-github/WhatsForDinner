# Secret Scanning in CI/CD

## Overview
This guide explains how to set up automated secret scanning in CI/CD pipelines to prevent accidental exposure of sensitive information.

## Current Status
- [x] Secret scanning script exists (`scripts/secrets-scan.mjs`)
- [ ] CI/CD integration configured
- [ ] Pre-commit hooks configured
- [ ] Automated alerts set up

## Existing Secret Scanning

### Script Location
`scripts/secrets-scan.mjs`

### Usage
```bash
# Run secret scan
pnpm run secrets:scan

# Check for secrets (exit 1 if found)
pnpm run secrets:scan --check
```

## CI/CD Integration

### GitHub Actions

Create `.github/workflows/secret-scan.yml`:

```yaml
name: Secret Scanning

on:
  pull_request:
    branches: [main, staging]
  push:
    branches: [main, staging]
  schedule:
    # Run daily at 2 AM
    - cron: '0 2 * * *'

jobs:
  scan-secrets:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run secret scan
        run: pnpm run secrets:scan --check
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      
      - name: GitHub Secret Scanning
        uses: github/super-linter@v4
        env:
          DEFAULT_BRANCH: main
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          VALIDATE_ALL_CODEBASE: true
```

### GitLab CI

Add to `.gitlab-ci.yml`:

```yaml
secret-scan:
  stage: test
  image: node:20
  script:
    - pnpm install
    - pnpm run secrets:scan --check
  only:
    - merge_requests
    - main
    - staging
```

## Pre-Commit Hooks

### Using Husky

```bash
# Install husky
pnpm add -D husky

# Initialize husky
npx husky init

# Add pre-commit hook
cat > .husky/pre-commit << 'EOF'
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm run secrets:scan --check
EOF

chmod +x .husky/pre-commit
```

### Manual Pre-Commit Hook

Create `.git/hooks/pre-commit`:

```bash
#!/bin/sh
# Pre-commit hook for secret scanning

echo "Running secret scan..."
pnpm run secrets:scan --check

if [ $? -ne 0 ]; then
  echo "? Secret scan failed. Commit blocked."
  exit 1
fi

echo "? Secret scan passed."
exit 0
```

Make it executable:
```bash
chmod +x .git/hooks/pre-commit
```

## GitHub Native Secret Scanning

GitHub provides built-in secret scanning:

### Enable in Repository Settings
1. Go to Settings ? Security ? Secret scanning
2. Enable "GitHub Advanced Security" (if available)
3. Enable "Push protection" (blocks commits with secrets)
4. Enable "Private repositories" (if applicable)

### Supported Secret Types
GitHub automatically scans for:
- API keys
- Database credentials
- OAuth tokens
- Service account keys
- And many more...

## GitGuardian Integration (Optional)

For enhanced secret detection:

### Setup
1. Sign up at [gitguardian.com](https://www.gitguardian.com)
2. Connect your GitHub repository
3. Configure scan settings
4. Set up alerts

### GitHub App
1. Install GitGuardian GitHub App
2. Grant necessary permissions
3. Configure webhooks
4. Set up Slack/email alerts

## Common Secrets to Scan For

### Current Patterns in Script
- API keys (various formats)
- Database URLs
- JWT secrets
- Private keys
- OAuth tokens
- Access tokens

### Additional Patterns
```javascript
// Add to secrets-scan.mjs
const patterns = [
  // AWS
  /AKIA[0-9A-Z]{16}/,
  // Stripe
  /sk_live_[0-9a-zA-Z]{24,}/,
  // GitHub
  /ghp_[0-9a-zA-Z]{36}/,
  // OpenAI
  /sk-[0-9a-zA-Z]{48}/,
  // Supabase
  /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9/,
];
```

## Alert Configuration

### Slack Alerts
```typescript
// In secrets-scan.mjs
async function sendSlackAlert(secret: string, file: string) {
  if (!process.env.SLACK_WEBHOOK_URL) return;

  await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: `?? Secret detected in ${file}`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*Secret detected in repository*\nFile: ${file}\nPattern: ${secret.substring(0, 20)}...`,
          },
        },
      ],
    }),
  });
}
```

### Email Alerts
```typescript
// Use email service (Resend, SendGrid, etc.)
async function sendEmailAlert(secret: string, file: string) {
  // Implementation using your email service
}
```

## Remediation

### If Secret is Found

1. **Immediately rotate the secret**:
   - Generate new API key/secret
   - Update in all environments
   - Revoke old secret

2. **Remove from git history**:
   ```bash
   # Use git-filter-repo or BFG Repo-Cleaner
   git filter-repo --path-sensitive "path/to/file"
   ```

3. **Force push** (if necessary):
   ```bash
   git push --force
   ```

4. **Update documentation**:
   - Document that secret was rotated
   - Update team about rotation

## Best Practices

### Prevention
1. **Never commit secrets**: Use environment variables
2. **Use .env.example**: Template without real values
3. **Use secret management**: Vercel Secrets, AWS Secrets Manager
4. **Code review**: Always review sensitive code
5. **Education**: Train team on secret management

### Detection
1. **Automated scanning**: Run on every commit
2. **Pre-commit hooks**: Catch before commit
3. **CI/CD checks**: Fail builds if secrets found
4. **Regular audits**: Weekly/monthly scans

## Monitoring

### Weekly Report
```bash
# Generate weekly secret scan report
pnpm run secrets:scan > reports/secret-scan-$(date +%Y%m%d).txt
```

### Metrics to Track
- Number of secrets detected
- Types of secrets found
- Files containing secrets
- Remediation time

## Next Steps
1. Integrate secret scanning into CI/CD
2. Set up pre-commit hooks
3. Configure GitHub secret scanning
4. Set up alert notifications
5. Document remediation procedures
