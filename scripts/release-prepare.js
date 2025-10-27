#!/usr/bin/env node

/**
 * Release Preparation Script
 * Prepares a new release with version bumping and changelog generation
 */

const fs = require('fs');
const { execSync } = require('child_process');

class ReleasePreparer {
  constructor() {
    this.packageJsonPath = 'package.json';
    this.changelogPath = 'CHANGELOG.md';
  }

  async prepareRelease() {
    console.log('📋 Preparing release...');
    
    try {
      const currentVersion = this.getCurrentVersion();
      const newVersion = this.bumpVersion(currentVersion);
      
      await this.updateVersion(newVersion);
      await this.generateChangelog();
      await this.createReleaseBranch();
      await this.commitChanges(newVersion);
      
      console.log(`✅ Release ${newVersion} prepared successfully`);
    } catch (error) {
      console.error('❌ Release preparation failed:', error.message);
      process.exit(1);
    }
  }

  getCurrentVersion() {
    const packageJson = JSON.parse(fs.readFileSync(this.packageJsonPath, 'utf8'));
    return packageJson.version;
  }

  bumpVersion(version, type = 'patch') {
    const [major, minor, patch] = version.split('.').map(Number);
    
    switch (type) {
      case 'major':
        return `${major + 1}.0.0`;
      case 'minor':
        return `${major}.${minor + 1}.0`;
      case 'patch':
      default:
        return `${major}.${minor}.${patch + 1}`;
    }
  }

  async updateVersion(newVersion) {
    console.log(`📝 Updating version to ${newVersion}...`);
    
    const packageJson = JSON.parse(fs.readFileSync(this.packageJsonPath, 'utf8'));
    packageJson.version = newVersion;
    fs.writeFileSync(this.packageJsonPath, JSON.stringify(packageJson, null, 2));
  }

  async generateChangelog() {
    console.log('📄 Generating changelog...');
    
    // Get git commits since last tag
    const lastTag = execSync('git describe --tags --abbrev=0', { encoding: 'utf8' }).trim();
    const commits = execSync(`git log ${lastTag}..HEAD --oneline`, { encoding: 'utf8' });
    
    const changelogEntry = `## [${this.getCurrentVersion()}] - ${new Date().toISOString().split('T')[0]}

### Added
- New features and enhancements

### Changed
- Changes to existing functionality

### Fixed
- Bug fixes

### Commits
${commits.split('\n').map(commit => `- ${commit}`).join('\n')}
`;

    // Prepend to changelog
    const existingChangelog = fs.existsSync(this.changelogPath) 
      ? fs.readFileSync(this.changelogPath, 'utf8') 
      : '# Changelog\n\n';
    
    fs.writeFileSync(this.changelogPath, changelogEntry + '\n' + existingChangelog);
  }

  async createReleaseBranch() {
    const version = this.getCurrentVersion();
    const branchName = `release/${version}`;
    
    console.log(`🌿 Creating release branch ${branchName}...`);
    execSync(`git checkout -b ${branchName}`);
  }

  async commitChanges(version) {
    console.log('💾 Committing changes...');
    
    execSync('git add package.json CHANGELOG.md');
    execSync(`git commit -m "chore: prepare release ${version}"`);
  }
}

// Run release preparation
const releasePreparer = new ReleasePreparer();
releasePreparer.prepareRelease().catch(console.error);
