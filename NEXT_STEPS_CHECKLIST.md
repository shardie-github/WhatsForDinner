# Next Steps Checklist

## ✅ Completed Implementation

All CI cleanup tasks have been completed:
- ✅ Deleted 20 redundant workflows
- ✅ Consolidated CI workflows into single `ci.yml`
- ✅ Standardized versions (Node 20, pnpm 9)
- ✅ Created monitoring scripts
- ✅ Created branch protection setup script
- ✅ Created metrics tracking workflow

## 🎯 Immediate Actions Required

### 1. Set Up Branch Protection (5 minutes)

**Option A: Using GitHub CLI (Recommended)**
```bash
# Authenticate
gh auth login

# Run setup script
node scripts/setup-branch-protection.mjs
```

**Option B: Manual Setup**
1. Go to GitHub → Settings → Branches
2. Add/edit rule for `main` branch
3. Require status checks: `ci/lint`, `ci/type-check`, `ci/test`, `ci/build`
4. Require PR reviews: 1 approval
5. Require branches to be up to date: ✅

**Verify:**
```bash
gh api repos/OWNER/REPO/branches/main/protection
```

### 2. Test the New CI Workflow (10 minutes)

Create a test PR to verify:
1. Only 4 required checks run: `ci/lint`, `ci/type-check`, `ci/test`, `ci/build`
2. Optional checks run but don't block: `ci/test-coverage`, `ci/code-hygiene`
3. All checks pass (or identify issues to fix)

**Test PR:**
```bash
git checkout -b test/ci-cleanup
# Make a small change
git commit -m "test: verify new CI workflow"
git push origin test/ci-cleanup
# Create PR on GitHub
```

### 3. Start Monitoring Metrics (5 minutes)

**One-time setup:**
```bash
# Set GitHub token
export GITHUB_TOKEN=your_token_here

# Or use GitHub CLI token
export GITHUB_TOKEN=$(gh auth token)
```

**Run initial analysis:**
```bash
# Analyze last 7 days
node scripts/ci-monitor.mjs

# Track metrics
node scripts/ci-metrics-tracker.mjs
```

**Automated tracking:**
- Metrics are automatically collected daily via `ci-metrics.yml` workflow
- Reports saved to `reports/ci-metrics/`

### 4. Review First Week Metrics (After 7 days)

After the new CI has run for a week:

```bash
# Review metrics
node scripts/ci-monitor.mjs --days=7

# Check thresholds
# - Pass rate should be > 95%
# - Avg runtime should be < 15 minutes
# - Avg checks should be ≤ 8
```

**If thresholds not met:**
- Review failures and fix flaky tests
- Optimize slow jobs
- Consider further consolidation

## 📊 Weekly Tasks

### Every Monday

1. **Review CI Metrics**
   ```bash
   node scripts/ci-monitor.mjs --days=7
   ```

2. **Check for Flaky Tests**
   - Review failed runs
   - Identify patterns
   - Fix or mark as flaky

3. **Review Workflow Performance**
   - Check runtime trends
   - Optimize slow jobs
   - Consider caching improvements

## 📈 Monthly Tasks

### First Monday of Month

1. **Comprehensive Review**
   ```bash
   node scripts/ci-monitor.mjs --days=30
   ```

2. **Workflow Consolidation Review**
   - Review remaining 39 workflows
   - Identify further consolidation opportunities
   - Consider merging similar workflows

3. **Documentation Update**
   - Update `docs/CI_SETUP.md` with learnings
   - Document any new patterns
   - Update troubleshooting guide

## 🎯 Success Criteria

### Week 1 Goals
- [ ] Branch protection rules set up
- [ ] Test PR created and verified
- [ ] Initial metrics collected
- [ ] All required checks passing

### Week 2-4 Goals
- [ ] Pass rate > 95%
- [ ] Avg runtime < 15 minutes
- [ ] Avg checks ≤ 8 per PR
- [ ] No flaky tests

### Month 1 Goals
- [ ] All metrics within targets
- [ ] Team comfortable with new CI
- [ ] Documentation complete
- [ ] Further optimizations identified

## 🚨 Troubleshooting

### Checks Not Showing Up

1. **Verify workflow file name**: Must be `ci.yml`
2. **Check job names**: Must match exactly (`lint`, `type-check`, `test`, `build`)
3. **Verify triggers**: Workflow must trigger on `pull_request`
4. **Wait a few minutes**: GitHub needs time to register checks

### Branch Protection Not Working

1. **Check permissions**: Token needs `repo` (admin) scope
2. **Verify branch name**: Must be `main` (not `master`)
3. **Check workflow runs**: At least one successful run needed
4. **Review GitHub UI**: Settings → Branches → main branch rule

### Metrics Collection Failing

1. **Check token**: Must have `repo` scope
2. **Verify workflow exists**: CI workflow must have run at least once
3. **Check repository name**: Format must be `owner/repo`
4. **Review error messages**: Script will show specific errors

## 📝 Quick Reference

### Key Commands

```bash
# Set up branch protection
node scripts/setup-branch-protection.mjs

# Monitor CI metrics
node scripts/ci-monitor.mjs

# Track metrics continuously
node scripts/ci-metrics-tracker.mjs --watch

# Run CI checks locally
pnpm ci
```

### Key Files

- **CI Workflow**: `.github/workflows/ci.yml`
- **Setup Guide**: `docs/CI_SETUP.md`
- **Metrics Reports**: `reports/ci-metrics/`
- **This Checklist**: `NEXT_STEPS_CHECKLIST.md`

### Key Metrics

- **Pass Rate**: > 95% (target)
- **Runtime**: < 15 minutes (target)
- **Checks**: ≤ 8 per PR (target)
- **Flakiness**: < 1% (target)

## 🎉 You're Ready!

All implementation is complete. Follow the checklist above to:
1. Set up branch protection
2. Test the new CI
3. Start monitoring metrics
4. Review and optimize

Good luck! 🚀
