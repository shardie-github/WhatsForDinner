#!/usr/bin/env node

/**
 * Automated Release Manager for What's for Dinner Ecosystem
 * Handles semantic versioning, changelog generation, and deployment orchestration
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class ReleaseManager {
  constructor() {
    this.version = null;
    this.changelog = '';
    this.isPrerelease = false;
    this.deploymentChannels = ['canary', 'staging', 'production'];
  }

  /**
   * Initialize release process
   */
  async initialize() {
    console.log('🚀 Initializing Release Manager...');
    
    // Check if we're in a git repository
    try {
      execSync('git status', { stdio: 'pipe' });
    } catch (error) {
      throw new Error('Not in a git repository');
    }

    // Load current version
    this.loadCurrentVersion();
    
    console.log(`📦 Current version: ${this.version}`);
  }

  /**
   * Load current version from package.json
   */
  loadCurrentVersion() {
    const packagePath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    this.version = packageJson.version;
  }

  /**
   * Generate next version based on conventional commits
   */
  async generateNextVersion() {
    console.log('🔍 Analyzing commits for version bump...');
    
    try {
      // Get commits since last tag
      const lastTag = execSync('git describe --tags --abbrev=0', { encoding: 'utf8' }).trim();
      const commits = execSync(`git log ${lastTag}..HEAD --oneline`, { encoding: 'utf8' });
      
      let versionBump = 'patch'; // default
      
      // Analyze commit types
      const lines = commits.split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        if (line.match(/^[a-f0-9]+ feat\(/)) {
          versionBump = 'minor';
          break;
        } else if (line.match(/^[a-f0-9]+ feat!:|^[a-f0-9]+ BREAKING CHANGE/)) {
          versionBump = 'major';
          break;
        }
      }
      
      console.log(`📈 Version bump type: ${versionBump}`);
      
      // Generate new version
      const [major, minor, patch] = this.version.split('.').map(Number);
      let newVersion;
      
      switch (versionBump) {
        case 'major':
          newVersion = `${major + 1}.0.0`;
          break;
        case 'minor':
          newVersion = `${major}.${minor + 1}.0`;
          break;
        case 'patch':
        default:
          newVersion = `${major}.${minor}.${patch + 1}`;
          break;
      }
      
      // Check if this is a prerelease
      const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
      if (branch === 'develop') {
        newVersion += '-beta.1';
        this.isPrerelease = true;
      } else if (branch === 'alpha') {
        newVersion += '-alpha.1';
        this.isPrerelease = true;
      }
      
      return newVersion;
    } catch (error) {
      console.warn('⚠️  Could not analyze commits, using patch version');
      const [major, minor, patch] = this.version.split('.').map(Number);
      return `${major}.${minor}.${patch + 1}`;
    }
  }

  /**
   * Generate changelog from conventional commits
   */
  async generateChangelog() {
    console.log('📝 Generating changelog...');
    
    try {
      // Get commits since last tag
      const lastTag = execSync('git describe --tags --abbrev=0', { encoding: 'utf8' }).trim();
      const commits = execSync(`git log ${lastTag}..HEAD --pretty=format:"%h %s"`, { encoding: 'utf8' });
      
      const lines = commits.split('\n').filter(line => line.trim());
      
      const changelog = {
        features: [],
        fixes: [],
        breaking: [],
        other: []
      };
      
      for (const line of lines) {
        const match = line.match(/^([a-f0-9]+) (feat|fix|perf|refactor|docs|style|chore|test|build|ci)(\(.+\))?(!)?: (.+)/);
        if (match) {
          const [, hash, type, scope, breaking, message] = match;
          const entry = {
            hash: hash.substring(0, 7),
            type,
            scope: scope ? scope.slice(1, -1) : null,
            breaking: !!breaking,
            message
          };
          
          if (type === 'feat') {
            changelog.features.push(entry);
          } else if (type === 'fix') {
            changelog.fixes.push(entry);
          } else if (entry.breaking) {
            changelog.breaking.push(entry);
          } else {
            changelog.other.push(entry);
          }
        }
      }
      
      // Format changelog
      let changelogText = `# Changelog\n\n`;
      changelogText += `All notable changes to this project will be documented in this file.\n\n`;
      changelogText += `## [${this.version}] - ${new Date().toISOString().split('T')[0]}\n\n`;
      
      if (changelog.breaking.length > 0) {
        changelogText += `### ⚠️ Breaking Changes\n`;
        changelog.breaking.forEach(entry => {
          changelogText += `- ${entry.message} (${entry.hash})\n`;
        });
        changelogText += `\n`;
      }
      
      if (changelog.features.length > 0) {
        changelogText += `### ✨ Features\n`;
        changelog.features.forEach(entry => {
          const scope = entry.scope ? `**${entry.scope}**: ` : '';
          changelogText += `- ${scope}${entry.message} (${entry.hash})\n`;
        });
        changelogText += `\n`;
      }
      
      if (changelog.fixes.length > 0) {
        changelogText += `### 🐛 Bug Fixes\n`;
        changelog.fixes.forEach(entry => {
          const scope = entry.scope ? `**${entry.scope}**: ` : '';
          changelogText += `- ${scope}${entry.message} (${entry.hash})\n`;
        });
        changelogText += `\n`;
      }
      
      if (changelog.other.length > 0) {
        changelogText += `### 🔧 Other Changes\n`;
        changelog.other.forEach(entry => {
          const scope = entry.scope ? `**${entry.scope}**: ` : '';
          changelogText += `- ${scope}${entry.message} (${entry.hash})\n`;
        });
        changelogText += `\n`;
      }
      
      this.changelog = changelogText;
      return changelogText;
    } catch (error) {
      console.warn('⚠️  Could not generate changelog from commits');
      return `# Changelog\n\n## [${this.version}] - ${new Date().toISOString().split('T')[0]}\n\n- Release ${this.version}\n`;
    }
  }

  /**
   * Update package.json version
   */
  async updateVersion(newVersion) {
    console.log(`📦 Updating version to ${newVersion}...`);
    
    const packagePath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    packageJson.version = newVersion;
    this.version = newVersion;
    
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
    
    console.log(`✅ Version updated to ${newVersion}`);
  }

  /**
   * Create git tag
   */
  async createTag() {
    console.log(`🏷️  Creating git tag v${this.version}...`);
    
    try {
      execSync(`git add package.json CHANGELOG.md`, { stdio: 'inherit' });
      execSync(`git commit -m "chore: release v${this.version}"`, { stdio: 'inherit' });
      execSync(`git tag -a v${this.version} -m "Release v${this.version}"`, { stdio: 'inherit' });
      
      console.log(`✅ Tag v${this.version} created`);
    } catch (error) {
      console.error('❌ Failed to create tag:', error.message);
      throw error;
    }
  }

  /**
   * Deploy to specified channel
   */
  async deploy(channel) {
    console.log(`🚀 Deploying to ${channel} channel...`);
    
    const deploymentScripts = {
      canary: 'npm run deploy:canary',
      staging: 'npm run deploy:staging',
      production: 'npm run deploy:production'
    };
    
    if (deploymentScripts[channel]) {
      try {
        execSync(deploymentScripts[channel], { stdio: 'inherit' });
        console.log(`✅ Deployed to ${channel}`);
      } catch (error) {
        console.error(`❌ Failed to deploy to ${channel}:`, error.message);
        throw error;
      }
    } else {
      console.warn(`⚠️  No deployment script for ${channel}`);
    }
  }

  /**
   * Run health checks
   */
  async healthCheck() {
    console.log('🔍 Running health checks...');
    
    try {
      // Run tests
      execSync('npm run test:ci', { stdio: 'inherit' });
      
      // Run linting
      execSync('npm run lint', { stdio: 'inherit' });
      
      // Run type checking
      execSync('npm run type-check', { stdio: 'inherit' });
      
      console.log('✅ All health checks passed');
    } catch (error) {
      console.error('❌ Health checks failed:', error.message);
      throw error;
    }
  }

  /**
   * Send notifications
   */
  async sendNotification(type, message) {
    console.log(`📢 Sending ${type} notification...`);
    
    // This would integrate with your notification system
    // For now, just log the message
    console.log(`Notification: ${message}`);
  }

  /**
   * Main release process
   */
  async release(options = {}) {
    try {
      await this.initialize();
      
      // Generate next version
      const newVersion = await this.generateNextVersion();
      
      // Generate changelog
      await this.generateChangelog();
      
      // Update version
      await this.updateVersion(newVersion);
      
      // Write changelog to file
      fs.writeFileSync('CHANGELOG.md', this.changelog);
      
      // Run health checks
      if (!options.skipHealthCheck) {
        await this.healthCheck();
      }
      
      // Create tag
      if (!options.dryRun) {
        await this.createTag();
      }
      
      // Deploy to channels
      if (options.deploy && !options.dryRun) {
        for (const channel of options.deploy) {
          await this.deploy(channel);
        }
      }
      
      // Send notifications
      await this.sendNotification('success', `Release ${newVersion} completed successfully`);
      
      console.log(`🎉 Release ${newVersion} completed successfully!`);
      
    } catch (error) {
      console.error('❌ Release failed:', error.message);
      await this.sendNotification('error', `Release failed: ${error.message}`);
      process.exit(1);
    }
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    dryRun: args.includes('--dry-run'),
    skipHealthCheck: args.includes('--skip-health-check'),
    deploy: args.filter(arg => arg.startsWith('--deploy=')).map(arg => arg.split('=')[1])
  };
  
  const releaseManager = new ReleaseManager();
  releaseManager.release(options);
}

module.exports = ReleaseManager;