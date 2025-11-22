# CI Setup and Branch Protection

## Branch Protection Rules

### Required Checks

The following checks are required for merging PRs to `main`:

1. **`ci/lint`** - ESLint code style checks
2. **`ci/type-check`** - TypeScript type checking
3. **`ci/test`** - Unit and integration tests
4. **`ci/build`** - Build verification

### Setting Up Branch Protection

#### Option 1: Using GitHub CLI (Recommended)

```bash
# Authenticate with GitHub
gh auth login

# Run the setup script
node scripts/setup-branch-protection.mjs
```

#### Option 2: Using GitHub API

```bash
# Set your GitHub token
export GITHUB_TOKEN=your_token_here

# Run the setup script
node scripts/setup-branch-protection.mjs
```

#### Option 3: Manual Setup via GitHub UI

1. Go to your repository on GitHub
2. Navigate to **Settings** → **Branches**
3. Click **Add rule** or edit the existing rule for `main`
4. Configure the following:
   - ✅ **Require a pull request before merging**
     - Required approving reviews: 1
     - Dismiss stale pull request approvals when new commits are pushed: ✅
   - ✅ **Require status checks to pass before merging**
     - Require branches to be up to date before merging: ✅
     - Required status checks:
       - `ci/lint`
       - `ci/type-check`
       - `ci/test`
       - `ci/build`
   - ✅ **Require conversation resolution before merging**
   - ❌ **Do not allow force pushes**
   - ❌ **Do not allow deletions**
   - ✅ **Allow squash merging**
   - ✅ **Allow merge commits**
   - ✅ **Allow rebase merging**

### Verifying Branch Protection

```bash
# Using GitHub CLI
gh api repos/OWNER/REPO/branches/main/protection

# Or check in GitHub UI
# Settings → Branches → main branch rule
```

## CI Monitoring

### Track CI Metrics

```bash
# Collect metrics for last 7 days
GITHUB_TOKEN=your_token node scripts/ci-metrics-tracker.mjs

# Collect metrics for last 30 days
GITHUB_TOKEN=your_token node scripts/ci-metrics-tracker.mjs --days=30

# Watch mode (collects every hour)
GITHUB_TOKEN=your_token node scripts/ci-metrics-tracker.mjs --watch
```

### Analyze CI Performance

```bash
# Run comprehensive CI analysis
GITHUB_TOKEN=your_token node scripts/ci-monitor.mjs

# Analyze last 14 days
GITHUB_TOKEN=your_token DAYS_BACK=14 node scripts/ci-monitor.mjs
```

### Metrics Tracked

- **Pass Rate**: Percentage of successful CI runs (target: > 95%)
- **Average Runtime**: Average CI runtime in minutes (target: < 15 min)
- **Check Count**: Average number of checks per PR (target: ≤ 8)
- **Job Statistics**: Per-job pass rates and runtimes

### Automated Metrics Collection

Metrics are automatically collected daily via the `ci-metrics.yml` workflow.

Reports are saved to `reports/ci-metrics/` and can be viewed:
- In GitHub Actions artifacts
- Locally after running the scripts

## Local CI Parity

Run the same checks locally as CI:

```bash
# Run all CI checks
pnpm ci

# Or run individually
pnpm ci:lint
pnpm ci:type-check
pnpm ci:test
pnpm ci:build
```

## Troubleshooting

### Branch Protection Not Working

1. Verify the workflow file is named `ci.yml` (not `ci-cd.yml` or similar)
2. Check that job names match exactly: `lint`, `type-check`, `test`, `build`
3. Ensure the workflow runs on `pull_request` events
4. Verify the branch name is `main` (not `master`)

### Metrics Collection Failing

1. Ensure `GITHUB_TOKEN` has `repo` scope
2. Check that the CI workflow exists and has run at least once
3. Verify repository name format: `owner/repo`

### Checks Not Showing Up

1. Wait a few minutes after pushing - GitHub needs time to register checks
2. Ensure the workflow file is in `.github/workflows/`
3. Check workflow syntax is valid (use GitHub Actions validator)
4. Verify the workflow triggers on `pull_request` events

## Additional Resources

- [GitHub Branch Protection Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [CI Cleanup Audit Report](../CI_AND_CODE_CLEANUP_AUDIT.md)
