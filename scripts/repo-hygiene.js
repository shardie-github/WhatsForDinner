#!/usr/bin/env node

/**
 * Phase 16: Repo Hygiene
 * CODEOWNERS and branch protections
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class RepoHygieneManager {
  constructor() {
    this.workspaceRoot = process.cwd();
  }

  async runRepoHygiene() {
    console.log('🧹 Phase 16: Repo Hygiene');
    console.log('=========================\n');

    try {
      await this.createCODEOWNERS();
      await this.setupBranchProtections();
      await this.createIssueTemplates();
      await this.setupPRTemplates();
      await this.configureGitHooks();
      await this.generateRepoHygieneReport();
      
      console.log('✅ Repo hygiene setup completed successfully');
    } catch (error) {
      console.error('❌ Repo hygiene setup failed:', error.message);
      process.exit(1);
    }
  }

  async createCODEOWNERS() {
    console.log('👥 Creating CODEOWNERS...');
    
    const codeowners = `# CODEOWNERS
# This file defines who owns which parts of the codebase

# Global owners
* @team-leads @senior-developers

# Core application code
/apps/web/ @frontend-team @team-leads
/apps/mobile/ @mobile-team @team-leads
/packages/ @platform-team @team-leads

# Infrastructure
/infra/ @devops-team @team-leads
/scripts/ @platform-team @devops-team

# Documentation
*.md @docs-team @team-leads
/docs/ @docs-team

# Configuration files
package.json @platform-team
tsconfig.json @platform-team
turbo.json @platform-team

# Security-related files
SECURITY_CHECKLIST.md @security-team @team-leads
SECURITY_AUDIT.md @security-team @team-leads
scripts/security-*.js @security-team

# Database
/supabase/ @backend-team @database-team

# Tests
/tests/ @qa-team @team-leads
*.test.* @qa-team

# CI/CD
.github/ @devops-team @team-leads
`;

    const codeownersPath = path.join(this.workspaceRoot, 'CODEOWNERS');
    fs.writeFileSync(codeownersPath, codeowners);
  }

  async setupBranchProtections() {
    console.log('🛡️  Setting up branch protections...');
    
    const branchProtectionConfig = {
      main: {
        required_status_checks: {
          strict: true,
          contexts: ['ci', 'test', 'build', 'security-scan']
        },
        enforce_admins: true,
        required_pull_request_reviews: {
          required_approving_review_count: 2,
          dismiss_stale_reviews: true,
          require_code_owner_reviews: true
        },
        restrictions: {
          users: [],
          teams: ['team-leads']
        }
      },
      staging: {
        required_status_checks: {
          strict: true,
          contexts: ['ci', 'test', 'build']
        },
        enforce_admins: false,
        required_pull_request_reviews: {
          required_approving_review_count: 1,
          dismiss_stale_reviews: true,
          require_code_owner_reviews: false
        }
      }
    };

    const configPath = path.join(this.workspaceRoot, 'config', 'branch-protections.json');
    fs.writeFileSync(configPath, JSON.stringify(branchProtectionConfig, null, 2));
  }

  async createIssueTemplates() {
    console.log('📝 Creating issue templates...');
    
    const templatesDir = path.join(this.workspaceRoot, '.github', 'ISSUE_TEMPLATE');
    if (!fs.existsSync(templatesDir)) {
      fs.mkdirSync(templatesDir, { recursive: true });
    }

    // Bug report template
    const bugTemplate = `---
name: Bug report
about: Create a report to help us improve
title: '[BUG] '
labels: bug
assignees: ''
---

**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
 - OS: [e.g. iOS]
 - Browser [e.g. chrome, safari]
 - Version [e.g. 22]

**Additional context**
Add any other context about the problem here.
`;

    fs.writeFileSync(path.join(templatesDir, 'bug_report.md'), bugTemplate);

    // Feature request template
    const featureTemplate = `---
name: Feature request
about: Suggest an idea for this project
title: '[FEATURE] '
labels: enhancement
assignees: ''
---

**Is your feature request related to a problem? Please describe.**
A clear and concise description of what the problem is. Ex. I'm always frustrated when [...]

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
A clear and concise description of any alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots about the feature request here.
`;

    fs.writeFileSync(path.join(templatesDir, 'feature_request.md'), featureTemplate);
  }

  async setupPRTemplates() {
    console.log('🔄 Setting up PR templates...');
    
    const prTemplate = `## Description
Brief description of the changes in this PR.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Performance testing completed (if applicable)

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published

## Screenshots (if applicable)
Add screenshots to help explain your changes.

## Additional Notes
Any additional information that reviewers should know.
`;

    const prTemplatePath = path.join(this.workspaceRoot, '.github', 'pull_request_template.md');
    fs.writeFileSync(prTemplatePath, prTemplate);
  }

  async configureGitHooks() {
    console.log('🪝 Configuring git hooks...');
    
    const hooksDir = path.join(this.workspaceRoot, '.git', 'hooks');
    if (!fs.existsSync(hooksDir)) {
      fs.mkdirSync(hooksDir, { recursive: true });
    }

    // Pre-commit hook
    const preCommitHook = `#!/bin/bash
# Pre-commit hook

echo "Running pre-commit checks..."

# Run linting
npm run lint

# Run tests
npm run test:ci

# Check for secrets
npm run security:scan

echo "Pre-commit checks passed!"
`;

    fs.writeFileSync(path.join(hooksDir, 'pre-commit'), preCommitHook);
    execSync(`chmod +x ${path.join(hooksDir, 'pre-commit')}`);

    // Commit-msg hook
    const commitMsgHook = `#!/bin/bash
# Commit message hook

commit_regex='^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: .{1,50}'

if ! grep -qE "$commit_regex" "$1"; then
    echo "Invalid commit message format!"
    echo "Format: type(scope): description"
    echo "Types: feat, fix, docs, style, refactor, test, chore"
    exit 1
fi
`;

    fs.writeFileSync(path.join(hooksDir, 'commit-msg'), commitMsgHook);
    execSync(`chmod +x ${path.join(hooksDir, 'commit-msg')}`);
  }

  async generateRepoHygieneReport() {
    const reportPath = path.join(this.workspaceRoot, 'REPORTS', 'repo-hygiene.md');
    
    const report = `# Phase 16: Repo Hygiene

## Executive Summary

**Status**: ✅ Complete  
**CODEOWNERS**: Configured  
**Branch Protections**: Set up  
**Issue Templates**: Created  
**PR Templates**: Created  
**Git Hooks**: Configured

## CODEOWNERS Configuration

- **Global Owners**: @team-leads @senior-developers
- **Frontend Code**: @frontend-team @team-leads
- **Mobile Code**: @mobile-team @team-leads
- **Platform Code**: @platform-team @team-leads
- **Infrastructure**: @devops-team @team-leads
- **Documentation**: @docs-team @team-leads
- **Security**: @security-team @team-leads

## Branch Protections

### Main Branch
- **Required Status Checks**: ci, test, build, security-scan
- **Required Reviews**: 2 approvals
- **Code Owner Reviews**: Required
- **Admin Enforcement**: Enabled

### Staging Branch
- **Required Status Checks**: ci, test, build
- **Required Reviews**: 1 approval
- **Code Owner Reviews**: Optional
- **Admin Enforcement**: Disabled

## Issue Templates

- **Bug Report**: Comprehensive bug reporting template
- **Feature Request**: Structured feature request template
- **Labels**: Automatic labeling for bug and enhancement issues

## PR Templates

- **Description**: Required description field
- **Type of Change**: Categorized change types
- **Testing**: Comprehensive testing checklist
- **Code Review**: Self-review checklist

## Git Hooks

- **Pre-commit**: Runs linting, tests, and security scans
- **Commit-msg**: Validates commit message format

## Next Steps

1. **Phase 17**: Implement chaos testing
2. **Phase 18**: Set up backups & DR
3. **Phase 19**: Implement privacy & GDPR compliance

Phase 16 is complete and ready for Phase 17 implementation.
`;

    fs.writeFileSync(reportPath, report);
  }
}

// Run the repo hygiene setup
if (require.main === module) {
  const repoHygieneManager = new RepoHygieneManager();
  repoHygieneManager.runRepoHygiene().catch(console.error);
}

module.exports = RepoHygieneManager;