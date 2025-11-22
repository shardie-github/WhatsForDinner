#!/usr/bin/env node
/**
 * Branch Protection Setup Script
 * Sets up branch protection rules for main branch
 * 
 * Usage:
 *   GITHUB_TOKEN=your_token node scripts/setup-branch-protection.mjs
 * 
 * Or use GitHub CLI:
 *   gh auth login
 *   node scripts/setup-branch-protection.mjs
 */

import { Octokit } from '@octokit/rest';
import { execSync } from 'child_process';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = process.env.GITHUB_REPOSITORY_OWNER || process.env.GITHUB_REPOSITORY?.split('/')[0];
const REPO_NAME = process.env.GITHUB_REPOSITORY?.split('/')[1] || process.env.GITHUB_REPOSITORY?.split('/')[1];

if (!GITHUB_TOKEN && !process.env.GH_TOKEN) {
  console.error('❌ GITHUB_TOKEN or GH_TOKEN environment variable is required');
  console.error('   Or run: gh auth login');
  process.exit(1);
}

const token = GITHUB_TOKEN || process.env.GH_TOKEN;
const octokit = new Octokit({ auth: token });

// Get repo info from git if not provided
let owner = REPO_OWNER;
let repo = REPO_NAME;

if (!owner || !repo) {
  try {
    const remoteUrl = execSync('git config --get remote.origin.url', { encoding: 'utf-8' }).trim();
    const match = remoteUrl.match(/github\.com[/:]([^/]+)\/([^/]+?)(?:\.git)?$/);
    if (match) {
      owner = match[1];
      repo = match[2];
    }
  } catch (error) {
    console.error('❌ Could not determine repository. Please set GITHUB_REPOSITORY_OWNER and GITHUB_REPOSITORY');
    process.exit(1);
  }
}

console.log(`🔒 Setting up branch protection for ${owner}/${repo}\n`);

const REQUIRED_CHECKS = [
  'ci/lint',
  'ci/type-check',
  'ci/test',
  'ci/build',
];

async function setupBranchProtection() {
  try {
    // Check if branch protection already exists
    let existingRules;
    try {
      const { data } = await octokit.rest.repos.getBranchProtection({
        owner,
        repo,
        branch: 'main',
      });
      existingRules = data;
      console.log('⚠️  Branch protection already exists. Updating...\n');
    } catch (error) {
      if (error.status === 404) {
        console.log('📝 Creating new branch protection rules...\n');
      } else {
        throw error;
      }
    }

    // Set up branch protection
    const protectionConfig = {
      owner,
      repo,
      branch: 'main',
      required_status_checks: {
        strict: true, // Require branches to be up to date
        contexts: REQUIRED_CHECKS,
      },
      enforce_admins: false, // Allow admins to bypass (can change if needed)
      required_pull_request_reviews: {
        required_approving_review_count: 1,
        dismiss_stale_reviews: true,
        require_code_owner_reviews: false,
        require_last_push_approval: false,
      },
      restrictions: null, // No user/team restrictions
      allow_force_pushes: false,
      allow_deletions: false,
      required_linear_history: false,
      allow_squash_merge: true,
      allow_merge_commit: true,
      allow_rebase_merge: true,
      required_conversation_resolution: true,
    };

    await octokit.rest.repos.updateBranchProtection(protectionConfig);

    console.log('✅ Branch protection rules updated!\n');
    console.log('📋 Required Checks:');
    REQUIRED_CHECKS.forEach(check => {
      console.log(`   ✅ ${check}`);
    });
    console.log('\n📝 Settings:');
    console.log('   ✅ Require branches to be up to date');
    console.log('   ✅ Require pull request reviews (1 approval)');
    console.log('   ✅ Dismiss stale reviews');
    console.log('   ✅ Require conversation resolution');
    console.log('   ❌ Force pushes disabled');
    console.log('   ❌ Branch deletion disabled');
    console.log('   ✅ Allow squash merge');
    console.log('   ✅ Allow merge commit');
    console.log('   ✅ Allow rebase merge');

    console.log('\n💡 To verify, run:');
    console.log(`   gh api repos/${owner}/${repo}/branches/main/protection`);

  } catch (error) {
    if (error.status === 403) {
      console.error('❌ Permission denied. Make sure your token has admin access to the repository.');
      console.error('   Required permissions: repo (admin)');
    } else if (error.status === 404) {
      console.error('❌ Repository or branch not found.');
      console.error(`   Repository: ${owner}/${repo}`);
      console.error('   Branch: main');
    } else {
      console.error('❌ Error:', error.message);
      if (error.response) {
        console.error('   Response:', JSON.stringify(error.response.data, null, 2));
      }
    }
    process.exit(1);
  }
}

// Alternative: Use GitHub CLI if available
function setupWithGHCLI() {
  try {
    execSync('which gh', { stdio: 'ignore' });
    console.log('📝 Using GitHub CLI to set up branch protection...\n');

    const checks = REQUIRED_CHECKS.join(' ');
    
    execSync(`gh api repos/${owner}/${repo}/branches/main/protection \
      -X PUT \
      -f required_status_checks='{"strict":true,"contexts":${JSON.stringify(REQUIRED_CHECKS)}}' \
      -f enforce_admins=false \
      -f required_pull_request_reviews='{"required_approving_review_count":1,"dismiss_stale_reviews":true}' \
      -f restrictions=null \
      -f allow_force_pushes=false \
      -f allow_deletions=false \
      -f required_linear_history=false \
      -f allow_squash_merge=true \
      -f allow_merge_commit=true \
      -f allow_rebase_merge=true \
      -f required_conversation_resolution=true`, { stdio: 'inherit' });

    console.log('\n✅ Branch protection rules set up via GitHub CLI!');
  } catch (error) {
    console.log('⚠️  GitHub CLI not available or failed, trying API...\n');
    setupBranchProtection();
  }
}

// Try GitHub CLI first, fall back to API
if (!GITHUB_TOKEN && process.env.GH_TOKEN) {
  setupWithGHCLI();
} else {
  setupBranchProtection();
}
