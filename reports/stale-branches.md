# Branch Curator — Stale/Merged Cleanup Report

**Generated:** 2025-01-09

## Executive Summary

📊 **Merged branches:** Many branches have been merged to main  
⚠️ **Unmerged branches:** 19+ branches not merged  
🔍 **Analysis:** Review needed before cleanup

## Merged Branches (Safe to Delete)

The following branches have been merged into `main`:

```
remotes/origin/chore/all-in-finisher-2024-12-19
remotes/origin/cursor/analyze-product-gaps-for-premium-offering-d4ab
remotes/origin/cursor/audit-and-enhance-trust-layer-f250
remotes/origin/cursor/audit-and-secure-supabase-database-dfa4
remotes/origin/cursor/automate-app-finalization-personalization-and-monetization-70b2
remotes/origin/cursor/automate-canadian-venture-operations-suite-1302
remotes/origin/cursor/automate-ci-cd-for-frontend-and-backend-0989
remotes/origin/cursor/automate-devops-best-practices-for-what-s-for-dinner-cd43
remotes/origin/cursor/automate-full-stack-testing-with-ci-ba5c
remotes/origin/cursor/automate-production-finalization-and-polish-pipeline-7325
remotes/origin/cursor/automate-production-framework-with-ops-cli-b82c
remotes/origin/cursor/automate-production-framework-with-termux-and-wasm-16dc
remotes/origin/cursor/automate-safe-and-auditable-releases-across-platforms-1465
remotes/origin/cursor/automate-viral-growth-engine-with-ai-9fc3
remotes/origin/cursor/automate-what-s-for-dinner-ecosystem-saas-2f4a
remotes/origin/cursor/automated-backend-security-and-error-remediation-f235
remotes/origin/cursor/automated-supabase-backend-audit-and-repair-da15
```

**⚠️ Note:** These are remote branches. Verify they're fully merged before deletion.

## Unmerged Branches (Review Required)

The following branches have NOT been merged:

```
remotes/origin/chore/repo-cleanup-full-20251026
remotes/origin/chore/safe-cleanup-foundation
remotes/origin/chore/stepback-baseline
remotes/origin/cursor/address-critical-and-high-priority-service-items-2c36
remotes/origin/cursor/automate-integration-performance-and-accessibility-audits-497e
remotes/origin/cursor/build-a-self-governing-privacy-guardian-system-af82
remotes/origin/cursor/codebase-and-go-live-audit-checklist-cc27
remotes/origin/cursor/explore-project-enhancements-618d
remotes/origin/cursor/finalize-outstanding-agent-and-audit-items-for-deployment-2da0
remotes/origin/cursor/generate-supbase-tables-and-rls-policies-6886
remotes/origin/cursor/prepare-repository-for-go-live-readiness-7a75
remotes/origin/cursor/prepare-repository-for-go-live-readiness-ef31
remotes/origin/cursor/productionize-expo-supabase-vercel-app-b9d8
remotes/origin/cursor/refactor-and-enhance-the-what-s-for-dinner-repository-ae81
remotes/origin/cursor/setup-database-and-follow-updates-c405
remotes/origin/cursor/setup-supabase-project-tables-and-backend-d19b
remotes/origin/cursor/unified-hardonia-repo-agent-8c6f
remotes/origin/cursor/verify-environment-variable-updates-and-placement-00c7
remotes/origin/dependabot/npm_and_yarn/npm_and_yarn-e6a81f5c20
remotes/origin/test/ci-workflow-verification
```

## Recommendations

### Safe Actions (After Verification)

1. **Delete merged branches** (after confirming merge):
   ```bash
   # For each merged branch:
   git push origin --delete <branch-name>
   ```

2. **Archive old unmerged branches** (if no longer needed):
   ```bash
   # Create archive branch first
   git branch archive/<branch-name> <branch-name>
   git push origin archive/<branch-name>
   # Then delete original
   git push origin --delete <branch-name>
   ```

### Review Required

1. **Check unmerged branches:**
   - Review PR status
   - Determine if still needed
   - Archive or delete if obsolete

2. **Check last commit date:**
   ```bash
   git for-each-ref --format='%(refname:short) %(committerdate)' refs/remotes/origin | sort -k2
   ```

3. **Identify stale branches** (>90 days old):
   - Mark for review
   - Contact branch owners
   - Archive or delete if abandoned

## Automated Cleanup Script (Safe Commands)

**⚠️ WARNING:** Review before executing. No automatic deletions performed.

```bash
#!/bin/bash
# Review merged branches
echo "Merged branches (safe to delete after verification):"
git branch -r --merged origin/main | grep -v "origin/main" | grep -v "origin/HEAD"

# Check last activity
echo "\nLast activity per branch:"
git for-each-ref --format='%(refname:short) %(committerdate:relative)' refs/remotes/origin | sort -k2

# Archive old branches (>90 days)
# git for-each-ref --format='%(refname:short) %(committerdate:unix)' refs/remotes/origin | \
#   awk -v cutoff=$(date -d '90 days ago' +%s) '$2 < cutoff {print $1}' | \
#   xargs -I {} git branch archive/{} {}
```

## Next Steps

1. ✅ **Report generated** - No destructive actions taken
2. ⏳ **Manual review required** - Verify merged status
3. ⏳ **Owner consultation** - Check with team before deletion
4. ⏳ **Create issue** - Document cleanup plan in `ops: stale branches report`

## Issue Template

**Title:** `ops: stale branches report`

**Body:**
```
This report identifies merged and unmerged branches for cleanup.

**Merged branches:** [List above]
**Unmerged branches:** [List above]

**Action items:**
1. Verify merged branches are fully merged
2. Review unmerged branches for relevance
3. Archive or delete obsolete branches
4. Update branch protection rules if needed

**Commands provided:** See reports/stale-branches.md
```
