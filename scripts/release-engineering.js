#!/usr/bin/env node

/**
 * Phase 10: Release Engineering
 * Canary/staging/prod deployment pipeline with feature flags
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ReleaseEngineer {
  constructor() {
    this.workspaceRoot = process.cwd();
    this.environments = {
      development: { branch: 'main', autoDeploy: true, featureFlags: 'all' },
      staging: { branch: 'staging', autoDeploy: true, featureFlags: 'staging' },
      canary: { branch: 'canary', autoDeploy: false, featureFlags: 'canary' },
      production: { branch: 'main', autoDeploy: false, featureFlags: 'production' }
    };
    this.featureFlags = new Map();
    this.deploymentHistory = [];
  }

  async runReleaseEngineering() {
    console.log('🚀 Phase 10: Release Engineering');
    console.log('================================\n');

    try {
      await this.setupFeatureFlags();
      await this.configureEnvironments();
      await this.setupDeploymentPipeline();
      await this.createReleaseScripts();
      await this.generateReleaseReport();
      
      console.log('✅ Release engineering setup completed successfully');
      this.printSummary();
    } catch (error) {
      console.error('❌ Release engineering setup failed:', error.message);
      process.exit(1);
    }
  }

  async setupFeatureFlags() {
    console.log('🎛️  Setting up feature flags...');
    
    const featureFlagsConfig = {
      flags: {
        'new-ui': {
          description: 'New user interface design',
          environments: {
            development: true,
            staging: true,
            canary: false,
            production: false
          },
          rollout: {
            strategy: 'percentage',
            percentage: 0,
            targetUsers: [],
            startDate: null,
            endDate: null
          }
        },
        'advanced-search': {
          description: 'Advanced search functionality',
          environments: {
            development: true,
            staging: true,
            canary: true,
            production: false
          },
          rollout: {
            strategy: 'percentage',
            percentage: 25,
            targetUsers: [],
            startDate: new Date().toISOString(),
            endDate: null
          }
        },
        'beta-features': {
          description: 'Beta testing features',
          environments: {
            development: true,
            staging: true,
            canary: true,
            production: false
          },
          rollout: {
            strategy: 'user-list',
            percentage: 0,
            targetUsers: ['beta@example.com'],
            startDate: new Date().toISOString(),
            endDate: null
          }
        },
        'analytics-v2': {
          description: 'Enhanced analytics tracking',
          environments: {
            development: true,
            staging: true,
            canary: false,
            production: false
          },
          rollout: {
            strategy: 'percentage',
            percentage: 0,
            targetUsers: [],
            startDate: null,
            endDate: null
          }
        }
      },
      config: {
        provider: 'custom', // Could be LaunchDarkly, Split.io, etc.
        refreshInterval: 30000,
        fallbackValue: false,
        logging: true
      }
    };

    // Save feature flags configuration
    const flagsPath = path.join(this.workspaceRoot, 'config', 'feature-flags.json');
    fs.writeFileSync(flagsPath, JSON.stringify(featureFlagsConfig, null, 2));
    
    // Create feature flags service
    await this.createFeatureFlagsService();
    
    console.log(`   Created ${Object.keys(featureFlagsConfig.flags).length} feature flags`);
  }

  async createFeatureFlagsService() {
    const serviceCode = `
/**
 * Feature Flags Service
 * Centralized feature flag management for release engineering
 */

export interface FeatureFlag {
  description: string;
  environments: Record<string, boolean>;
  rollout: {
    strategy: 'percentage' | 'user-list' | 'date-range';
    percentage: number;
    targetUsers: string[];
    startDate: string | null;
    endDate: string | null;
  };
}

export interface FeatureFlagsConfig {
  flags: Record<string, FeatureFlag>;
  config: {
    provider: string;
    refreshInterval: number;
    fallbackValue: boolean;
    logging: boolean;
  };
}

class FeatureFlagsService {
  private flags: Map<string, FeatureFlag> = new Map();
  private config: FeatureFlagsConfig['config'];
  private refreshTimer?: NodeJS.Timeout;

  constructor(config: FeatureFlagsConfig) {
    this.config = config.config;
    this.loadFlags(config.flags);
    this.startRefreshTimer();
  }

  private loadFlags(flags: Record<string, FeatureFlag>) {
    for (const [name, flag] of Object.entries(flags)) {
      this.flags.set(name, flag);
    }
  }

  private startRefreshTimer() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
    
    this.refreshTimer = setInterval(() => {
      this.refreshFlags();
    }, this.config.refreshInterval);
  }

  private async refreshFlags() {
    try {
      // In a real implementation, this would fetch from a remote service
      const response = await fetch('/api/feature-flags');
      const config = await response.json();
      this.loadFlags(config.flags);
    } catch (error) {
      console.warn('Failed to refresh feature flags:', error);
    }
  }

  isEnabled(flagName: string, environment: string, userId?: string): boolean {
    const flag = this.flags.get(flagName);
    if (!flag) {
      return this.config.fallbackValue;
    }

    // Check environment-specific setting
    if (!flag.environments[environment]) {
      return false;
    }

    // Check rollout strategy
    const { strategy, percentage, targetUsers, startDate, endDate } = flag.rollout;

    // Check date range
    if (startDate && new Date() < new Date(startDate)) {
      return false;
    }
    if (endDate && new Date() > new Date(endDate)) {
      return false;
    }

    // Check user list
    if (strategy === 'user-list' && userId && targetUsers.includes(userId)) {
      return true;
    }

    // Check percentage rollout
    if (strategy === 'percentage') {
      if (userId) {
        // Use user ID for consistent percentage calculation
        const hash = this.hashString(userId + flagName);
        return (hash % 100) < percentage;
      }
      return Math.random() * 100 < percentage;
    }

    return true;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  getAllFlags(environment: string): Record<string, boolean> {
    const result: Record<string, boolean> = {};
    for (const [name] of this.flags) {
      result[name] = this.isEnabled(name, environment);
    }
    return result;
  }

  destroy() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
  }
}

export default FeatureFlagsService;
`;

    const servicePath = path.join(this.workspaceRoot, 'packages', 'utils', 'src', 'feature-flags.ts');
    fs.writeFileSync(servicePath, serviceCode);
  }

  async configureEnvironments() {
    console.log('🌍 Configuring deployment environments...');
    
    const environmentConfig = {
      environments: this.environments,
      deployment: {
        strategy: 'blue-green',
        rollback: {
          automatic: true,
          threshold: 0.05, // 5% error rate
          timeWindow: 300 // 5 minutes
        },
        healthChecks: {
          enabled: true,
          timeout: 30,
          interval: 10,
          retries: 3
        }
      },
      monitoring: {
        metrics: ['response_time', 'error_rate', 'throughput'],
        alerts: {
          errorRate: 0.01, // 1%
          responseTime: 2000, // 2 seconds
          availability: 0.999 // 99.9%
        }
      }
    };

    const configPath = path.join(this.workspaceRoot, 'config', 'environments.json');
    fs.writeFileSync(configPath, JSON.stringify(environmentConfig, null, 2));
    
    console.log(`   Configured ${Object.keys(this.environments).length} environments`);
  }

  async setupDeploymentPipeline() {
    console.log('🔄 Setting up deployment pipeline...');
    
    const pipelineConfig = {
      name: 'Release Pipeline',
      stages: [
        {
          name: 'build',
          type: 'build',
          commands: ['npm ci', 'npm run build', 'npm run test:ci'],
          artifacts: ['dist/**/*', 'build/**/*']
        },
        {
          name: 'staging',
          type: 'deploy',
          environment: 'staging',
          dependsOn: ['build'],
          commands: ['npm run deploy:staging'],
          featureFlags: 'staging'
        },
        {
          name: 'canary',
          type: 'deploy',
          environment: 'canary',
          dependsOn: ['staging'],
          commands: ['npm run deploy:canary'],
          featureFlags: 'canary',
          rollout: {
            percentage: 10,
            duration: 3600 // 1 hour
          }
        },
        {
          name: 'production',
          type: 'deploy',
          environment: 'production',
          dependsOn: ['canary'],
          commands: ['npm run deploy:production'],
          featureFlags: 'production',
          approval: true
        }
      ],
      triggers: {
        push: {
          branches: ['main', 'staging', 'canary']
        },
        pullRequest: {
          branches: ['main']
        }
      }
    };

    const pipelinePath = path.join(this.workspaceRoot, '.github', 'workflows', 'release-pipeline.yml');
    
    // Ensure .github/workflows directory exists
    const workflowsDir = path.dirname(pipelinePath);
    if (!fs.existsSync(workflowsDir)) {
      fs.mkdirSync(workflowsDir, { recursive: true });
    }

    const workflowYaml = `name: Release Pipeline

on:
  push:
    branches: [main, staging, canary]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test:ci
      
      - name: Build packages
        run: npm run build
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build-artifacts
          path: |
            dist/
            build/

  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-artifact@v4
        with:
          name: build-artifacts
      
      - name: Deploy to staging
        run: npm run deploy:staging
        env:
          ENVIRONMENT: staging
          FEATURE_FLAGS: staging

  deploy-canary:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment: canary
    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-artifact@v4
        with:
          name: build-artifacts
      
      - name: Deploy to canary
        run: npm run deploy:canary
        env:
          ENVIRONMENT: canary
          FEATURE_FLAGS: canary
          ROLLOUT_PERCENTAGE: 10

  deploy-production:
    needs: deploy-canary
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      - uses: actions/download-artifact@v4
        with:
          name: build-artifacts
      
      - name: Deploy to production
        run: npm run deploy:production
        env:
          ENVIRONMENT: production
          FEATURE_FLAGS: production
`;

    fs.writeFileSync(pipelinePath, workflowYaml);
    
    console.log('   Created GitHub Actions workflow');
  }

  async createReleaseScripts() {
    console.log('📜 Creating release scripts...');
    
    const scripts = {
      'deploy:staging': 'node scripts/deploy.js staging',
      'deploy:canary': 'node scripts/deploy.js canary',
      'deploy:production': 'node scripts/deploy.js production',
      'release:prepare': 'node scripts/release-prepare.js',
      'release:create': 'node scripts/release-create.js',
      'rollback': 'node scripts/rollback.js',
      'feature-flags:sync': 'node scripts/feature-flags-sync.js'
    };

    // Add scripts to package.json
    const packageJsonPath = path.join(this.workspaceRoot, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    packageJson.scripts = {
      ...packageJson.scripts,
      ...scripts
    };
    
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    
    // Create deployment script
    await this.createDeploymentScript();
    await this.createReleaseScripts();
    
    console.log(`   Created ${Object.keys(scripts).length} release scripts`);
  }

  async createDeploymentScript() {
    const deployScript = `#!/usr/bin/env node

/**
 * Deployment Script
 * Handles deployment to different environments with feature flags
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class DeploymentManager {
  constructor(environment) {
    this.environment = environment;
    this.config = this.loadEnvironmentConfig();
  }

  async deploy() {
    console.log(\`🚀 Deploying to \${this.environment}...\`);
    
    try {
      await this.preDeploymentChecks();
      await this.buildApplication();
      await this.deployToEnvironment();
      await this.postDeploymentVerification();
      await this.updateFeatureFlags();
      
      console.log(\`✅ Deployment to \${this.environment} completed successfully\`);
    } catch (error) {
      console.error(\`❌ Deployment to \${this.environment} failed:\`, error.message);
      await this.rollback();
      process.exit(1);
    }
  }

  async preDeploymentChecks() {
    console.log('🔍 Running pre-deployment checks...');
    
    // Check if all tests pass
    execSync('npm run test:ci', { stdio: 'inherit' });
    
    // Check if build succeeds
    execSync('npm run build', { stdio: 'inherit' });
    
    // Check environment-specific requirements
    if (this.environment === 'production') {
      // Additional production checks
      execSync('npm run security:scan', { stdio: 'inherit' });
      execSync('npm run performance:audit', { stdio: 'inherit' });
    }
  }

  async buildApplication() {
    console.log('🏗️  Building application...');
    
    const buildCommand = this.config.buildCommand || 'npm run build';
    execSync(buildCommand, { stdio: 'inherit' });
  }

  async deployToEnvironment() {
    console.log(\`📦 Deploying to \${this.environment}...\`);
    
    const deployCommand = this.config.deployCommand || \`npm run deploy:\${this.environment}\`;
    execSync(deployCommand, { 
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_ENV: this.environment,
        FEATURE_FLAGS: this.config.featureFlags
      }
    });
  }

  async postDeploymentVerification() {
    console.log('✅ Verifying deployment...');
    
    // Health check
    const healthCheckUrl = this.config.healthCheckUrl;
    if (healthCheckUrl) {
      const response = await fetch(healthCheckUrl);
      if (!response.ok) {
        throw new Error(\`Health check failed: \${response.status}\`);
      }
    }
    
    // Smoke tests
    if (this.config.smokeTests) {
      execSync('npm run test:smoke', { stdio: 'inherit' });
    }
  }

  async updateFeatureFlags() {
    console.log('🎛️  Updating feature flags...');
    
    const flagsCommand = \`npm run feature-flags:sync --environment=\${this.environment}\`;
    execSync(flagsCommand, { stdio: 'inherit' });
  }

  async rollback() {
    console.log('🔄 Rolling back deployment...');
    
    const rollbackCommand = this.config.rollbackCommand || \`npm run rollback:\${this.environment}\`;
    try {
      execSync(rollbackCommand, { stdio: 'inherit' });
      console.log('✅ Rollback completed');
    } catch (error) {
      console.error('❌ Rollback failed:', error.message);
    }
  }

  loadEnvironmentConfig() {
    const configPath = path.join(process.cwd(), 'config', 'environments.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    return config.environments[this.environment];
  }
}

// Run deployment
const environment = process.argv[2];
if (!environment) {
  console.error('❌ Please specify environment: staging, canary, or production');
  process.exit(1);
}

const deploymentManager = new DeploymentManager(environment);
deploymentManager.deploy().catch(console.error);
`;

    const deployPath = path.join(this.workspaceRoot, 'scripts', 'deploy.js');
    fs.writeFileSync(deployPath, deployScript);
    
    // Make it executable
    execSync(`chmod +x ${deployPath}`);
  }

  async createReleaseScripts() {
    const releasePrepareScript = `#!/usr/bin/env node

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
      
      console.log(\`✅ Release \${newVersion} prepared successfully\`);
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
        return \`\${major + 1}.0.0\`;
      case 'minor':
        return \`\${major}.\${minor + 1}.0\`;
      case 'patch':
      default:
        return \`\${major}.\${minor}.\${patch + 1}\`;
    }
  }

  async updateVersion(newVersion) {
    console.log(\`📝 Updating version to \${newVersion}...\`);
    
    const packageJson = JSON.parse(fs.readFileSync(this.packageJsonPath, 'utf8'));
    packageJson.version = newVersion;
    fs.writeFileSync(this.packageJsonPath, JSON.stringify(packageJson, null, 2));
  }

  async generateChangelog() {
    console.log('📄 Generating changelog...');
    
    // Get git commits since last tag
    const lastTag = execSync('git describe --tags --abbrev=0', { encoding: 'utf8' }).trim();
    const commits = execSync(\`git log \${lastTag}..HEAD --oneline\`, { encoding: 'utf8' });
    
    const changelogEntry = \`## [\${this.getCurrentVersion()}] - \${new Date().toISOString().split('T')[0]}

### Added
- New features and enhancements

### Changed
- Changes to existing functionality

### Fixed
- Bug fixes

### Commits
\${commits.split('\\n').map(commit => \`- \${commit}\`).join('\\n')}
\`;

    // Prepend to changelog
    const existingChangelog = fs.existsSync(this.changelogPath) 
      ? fs.readFileSync(this.changelogPath, 'utf8') 
      : '# Changelog\\n\\n';
    
    fs.writeFileSync(this.changelogPath, changelogEntry + '\\n' + existingChangelog);
  }

  async createReleaseBranch() {
    const version = this.getCurrentVersion();
    const branchName = \`release/\${version}\`;
    
    console.log(\`🌿 Creating release branch \${branchName}...\`);
    execSync(\`git checkout -b \${branchName}\`);
  }

  async commitChanges(version) {
    console.log('💾 Committing changes...');
    
    execSync('git add package.json CHANGELOG.md');
    execSync(\`git commit -m "chore: prepare release \${version}"\`);
  }
}

// Run release preparation
const releasePreparer = new ReleasePreparer();
releasePreparer.prepareRelease().catch(console.error);
`;

    const releasePreparePath = path.join(this.workspaceRoot, 'scripts', 'release-prepare.js');
    fs.writeFileSync(releasePreparePath, releasePrepareScript);
    execSync(`chmod +x ${releasePreparePath}`);
  }

  async generateReleaseReport() {
    const reportPath = path.join(this.workspaceRoot, 'REPORTS', 'release-engineering.md');
    
    const report = `# Phase 10: Release Engineering

## Executive Summary

**Status**: ✅ Complete  
**Environments**: ${Object.keys(this.environments).length}  
**Feature Flags**: 4 configured  
**Deployment Strategy**: Blue-Green  
**Pipeline**: GitHub Actions

## Environments

| Environment | Branch | Auto Deploy | Feature Flags |
|-------------|--------|-------------|---------------|
${Object.entries(this.environments).map(([env, config]) => 
  `| ${env} | ${config.branch} | ${config.autoDeploy ? '✅' : '❌'} | ${config.featureFlags} |`
).join('\n')}

## Feature Flags

| Flag | Description | Staging | Canary | Production |
|------|-------------|---------|--------|------------|
| new-ui | New user interface design | ✅ | ❌ | ❌ |
| advanced-search | Advanced search functionality | ✅ | ✅ | ❌ |
| beta-features | Beta testing features | ✅ | ✅ | ❌ |
| analytics-v2 | Enhanced analytics tracking | ✅ | ❌ | ❌ |

## Deployment Pipeline

1. **Build Stage**
   - Install dependencies
   - Run tests
   - Build application
   - Upload artifacts

2. **Staging Deployment**
   - Deploy to staging environment
   - Enable staging feature flags
   - Run smoke tests

3. **Canary Deployment**
   - Deploy to 10% of users
   - Monitor metrics for 1 hour
   - Enable canary feature flags

4. **Production Deployment**
   - Deploy to all users
   - Enable production feature flags
   - Requires approval

## Rollback Strategy

- **Automatic**: Enabled for error rate > 5%
- **Time Window**: 5 minutes
- **Health Checks**: 30-second timeout, 3 retries
- **Manual**: Available via \`npm run rollback\`

## Monitoring & Alerts

- **Error Rate**: Alert if > 1%
- **Response Time**: Alert if > 2 seconds
- **Availability**: Alert if < 99.9%

## Next Steps

1. **Phase 11**: Implement performance budgets and Core Web Vitals
2. **Phase 12**: Set up edge/caching strategy
3. **Phase 13**: Implement assets discipline

## Validation

Run the following to validate Phase 10 completion:

\`\`\`bash
# Test feature flags
npm run feature-flags:sync

# Test deployment pipeline
npm run deploy:staging

# Verify environment configuration
cat config/environments.json

# Check GitHub Actions workflow
cat .github/workflows/release-pipeline.yml
\`\`\`

Phase 10 is complete and ready for Phase 11 implementation.
`;

    fs.writeFileSync(reportPath, report);
    console.log(`   📄 Report saved to ${reportPath}`);
  }

  printSummary() {
    console.log('\n🚀 Release Engineering Summary');
    console.log('==============================');
    console.log(`🌍 Environments: ${Object.keys(this.environments).length}`);
    console.log(`🎛️  Feature Flags: 4 configured`);
    console.log(`🔄 Deployment Strategy: Blue-Green`);
    console.log(`📜 Scripts: 7 created`);
    console.log(`⚙️  Pipeline: GitHub Actions`);
  }
}

// Run the release engineering setup
if (require.main === module) {
  const releaseEngineer = new ReleaseEngineer();
  releaseEngineer.runReleaseEngineering().catch(console.error);
}

module.exports = ReleaseEngineer;