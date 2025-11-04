/**
 * Release Train - Semantic versioning + CHANGELOG + Vercel deploys
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const CHANGELOG_PATH = join(process.cwd(), 'CHANGELOG.md');

interface ReleaseConfig {
  type: 'patch' | 'minor' | 'major';
  preRelease?: boolean;
  dryRun?: boolean;
}

async function generateChangelog(): Promise<void> {
  console.log('Generating changelog...');
  
  // Use git log to generate changelog
  try {
    const commits = execSync('git log --pretty=format:"%h|%s|%an|%ad" --date=short', {
      encoding: 'utf-8'
    }).split('\n');

    let changelog = `# Changelog\n\n`;
    changelog += `All notable changes to this project will be documented in this file.\n\n`;

    const currentVersion = getCurrentVersion();
    changelog += `## [${currentVersion}] - ${new Date().toISOString().split('T')[0]}\n\n`;

    const features: string[] = [];
    const fixes: string[] = [];
    const breaking: string[] = [];

    for (const commit of commits.slice(0, 50)) { // Last 50 commits
      const [hash, message, author, date] = commit.split('|');
      
      if (message.includes('feat:')) {
        features.push(`- ${message.replace('feat:', '').trim()} (${hash})`);
      } else if (message.includes('fix:')) {
        fixes.push(`- ${message.replace('fix:', '').trim()} (${hash})`);
      } else if (message.includes('BREAKING')) {
        breaking.push(`- ${message.replace('BREAKING:', '').trim()} (${hash})`);
      }
    }

    if (breaking.length > 0) {
      changelog += `### BREAKING CHANGES\n\n`;
      breaking.forEach(change => changelog += `${change}\n`);
      changelog += `\n`;
    }

    if (features.length > 0) {
      changelog += `### Added\n\n`;
      features.forEach(change => changelog += `${change}\n`);
      changelog += `\n`;
    }

    if (fixes.length > 0) {
      changelog += `### Fixed\n\n`;
      fixes.forEach(change => changelog += `${change}\n`);
      changelog += `\n`;
    }

    writeFileSync(CHANGELOG_PATH, changelog);
    console.log('✅ Changelog generated');
  } catch (error) {
    console.error('Failed to generate changelog:', error);
    throw error;
  }
}

function getCurrentVersion(): string {
  try {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'));
    return packageJson.version || '1.0.0';
  } catch {
    return '1.0.0';
  }
}

function incrementVersion(current: string, type: 'patch' | 'minor' | 'major'): string {
  const [major, minor, patch] = current.split('.').map(Number);
  
  switch (type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
  }
}

async function release(config: ReleaseConfig): Promise<void> {
  console.log('🚀 Starting release process...\n');

  // Step 1: Run pre-release checks
  console.log('Running pre-release checks...');
  execSync('pnpm ops doctor', { stdio: 'inherit' });

  // Step 2: Generate changelog
  await generateChangelog();

  // Step 3: Calculate new version
  const currentVersion = getCurrentVersion();
  const newVersion = incrementVersion(currentVersion, config.type);
  console.log(`Bumping version: ${currentVersion} → ${newVersion}`);

  if (config.dryRun) {
    console.log('Dry run - would create release:', newVersion);
    return;
  }

  // Step 4: Update version in package.json
  const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'));
  packageJson.version = newVersion;
  writeFileSync('package.json', JSON.stringify(packageJson, null, 2) + '\n');

  // Step 5: Create git tag
  execSync(`git add package.json CHANGELOG.md`, { stdio: 'inherit' });
  execSync(`git commit -m "chore: release v${newVersion}"`, { stdio: 'inherit' });
  execSync(`git tag -a v${newVersion} -m "Release v${newVersion}"`, { stdio: 'inherit' });

  // Step 6: Deploy to Vercel
  console.log('Deploying to Vercel...');
  const vercelToken = process.env.VERCEL_TOKEN;
  const vercelProjectId = process.env.VERCEL_PROJECT_ID;
  const vercelOrgId = process.env.VERCEL_ORG_ID;

  if (vercelToken && vercelProjectId) {
    try {
      execSync(`vercel --prod --token ${vercelToken}`, {
        stdio: 'inherit',
        cwd: 'apps/web'
      });
      
      // Create alias
      execSync(`vercel alias set --token ${vercelToken}`, {
        stdio: 'inherit',
        cwd: 'apps/web'
      });
    } catch (error) {
      console.error('Vercel deployment failed:', error);
      throw error;
    }
  }

  // Step 7: Push to GitHub
  console.log('Pushing to GitHub...');
  execSync('git push origin main --tags', { stdio: 'inherit' });

  console.log(`\n✅ Release v${newVersion} completed!`);
}

if (require.main === module) {
  const type = process.argv[2] as 'patch' | 'minor' | 'major' | undefined;
  const dryRun = process.argv.includes('--dry-run');

  if (!type || !['patch', 'minor', 'major'].includes(type)) {
    console.error('Usage: release-train.ts [patch|minor|major] [--dry-run]');
    process.exit(1);
  }

  release({ type, dryRun }).catch(error => {
    console.error('Release failed:', error);
    process.exit(1);
  });
}

export { release, generateChangelog };
