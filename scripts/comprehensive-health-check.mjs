#!/usr/bin/env node
/**
 * Comprehensive Project Health Check
 * 
 * Analyzes all aspects of the project and creates a complete health dashboard
 */

import { readFileSync, readdirSync, statSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Health check categories
const healthChecks = {
  codeQuality: {},
  security: {},
  performance: {},
  testing: {},
  documentation: {},
  dependencies: {},
  configuration: {},
  deployment: {},
  monitoring: {},
  compliance: {},
};

async function checkCodeQuality() {
  log('\n📊 Checking Code Quality...', 'cyan');
  
  const results = {
    totalFiles: 0,
    issues: [],
    metrics: {},
  };

  // Count files
  const tsFiles = execSync('find . -name "*.ts" -o -name "*.tsx" | grep -v node_modules | wc -l', {
    encoding: 'utf8',
    cwd: projectRoot,
  }).trim();
  
  results.metrics.typescriptFiles = parseInt(tsFiles) || 0;

  // Check for TODO/FIXME
  try {
    const todos = execSync('grep -r "TODO\\|FIXME\\|XXX\\|HACK" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" . | grep -v node_modules | wc -l', {
      encoding: 'utf8',
      cwd: projectRoot,
    }).trim();
    results.metrics.todos = parseInt(todos) || 0;
  } catch (e) {
    results.metrics.todos = 0;
  }

  // Check for console.logs (should be removed in production)
  try {
    const consoleLogs = execSync('grep -r "console\\.log" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" . | grep -v node_modules | grep -v ".test." | grep -v ".spec." | wc -l', {
      encoding: 'utf8',
      cwd: projectRoot,
    }).trim();
    results.metrics.consoleLogs = parseInt(consoleLogs) || 0;
  } catch (e) {
    results.metrics.consoleLogs = 0;
  }

  // Check test coverage
  try {
    const testFiles = execSync('find . -name "*.test.*" -o -name "*.spec.*" | grep -v node_modules | wc -l', {
      encoding: 'utf8',
      cwd: projectRoot,
    }).trim();
    results.metrics.testFiles = parseInt(testFiles) || 0;
  } catch (e) {
    results.metrics.testFiles = 0;
  }

  // Calculate coverage estimate
  const coverage = results.metrics.testFiles > 0
    ? Math.min(100, Math.round((results.metrics.testFiles / (results.metrics.typescriptFiles || 1)) * 100 * 2))
    : 0;
  results.metrics.estimatedCoverage = coverage;

  // Score
  let score = 100;
  if (results.metrics.todos > 50) score -= 10;
  if (results.metrics.consoleLogs > 100) score -= 10;
  if (coverage < 50) score -= 20;
  if (coverage < 20) score -= 20;

  results.score = Math.max(0, score);
  results.status = score >= 80 ? 'healthy' : score >= 60 ? 'warning' : 'critical';

  return results;
}

async function checkSecurity() {
  log('🔒 Checking Security...', 'cyan');
  
  const results = {
    vulnerabilities: 0,
    issues: [],
    metrics: {},
    score: 100,
    status: 'healthy',
  };

  // Check for secrets
  try {
    const secrets = execSync('grep -r "password\\|secret\\|key\\|token" --include="*.ts" --include="*.tsx" --include="*.js" . | grep -v node_modules | grep -v ".example" | grep -v "process.env" | grep -v "TODO" | wc -l', {
      encoding: 'utf8',
      cwd: projectRoot,
    }).trim();
    results.metrics.potentialSecrets = parseInt(secrets) || 0;
    if (results.metrics.potentialSecrets > 10) {
      results.score -= 15;
      results.issues.push('Potential hardcoded secrets found');
    }
  } catch (e) {
    results.metrics.potentialSecrets = 0;
  }

  // Check for dangerous patterns
  try {
    const evalUsage = execSync('grep -r "eval\\|Function(" --include="*.ts" --include="*.tsx" --include="*.js" . | grep -v node_modules | wc -l', {
      encoding: 'utf8',
      cwd: projectRoot,
    }).trim();
    results.metrics.dangerousPatterns = parseInt(evalUsage) || 0;
    if (results.metrics.dangerousPatterns > 0) {
      results.score -= 20;
      results.issues.push('Dangerous code patterns detected');
    }
  } catch (e) {
    results.metrics.dangerousPatterns = 0;
  }

  // Check RLS policies
  try {
    const rlsFiles = execSync('find . -name "*rls*" -o -name "*policy*" | grep -v node_modules | wc -l', {
      encoding: 'utf8',
      cwd: projectRoot,
    }).trim();
    results.metrics.rlsPolicies = parseInt(rlsFiles) || 0;
  } catch (e) {
    results.metrics.rlsPolicies = 0;
  }

  results.status = results.score >= 80 ? 'healthy' : results.score >= 60 ? 'warning' : 'critical';
  return results;
}

async function checkPerformance() {
  log('⚡ Checking Performance...', 'cyan');
  
  const results = {
    metrics: {},
    issues: [],
    score: 100,
    status: 'healthy',
  };

  // Check bundle size analysis
  try {
    if (existsSync(join(projectRoot, 'REPORTS/performance-budgets.json'))) {
      const perfData = JSON.parse(readFileSync(join(projectRoot, 'REPORTS/performance-budgets.json'), 'utf8'));
      results.metrics.bundleAnalysis = perfData;
    }
  } catch (e) {
    // Ignore
  }

  // Check for large files
  try {
    const largeFiles = execSync('find . -type f -size +500k ! -path "*/node_modules/*" ! -path "*/.git/*" | wc -l', {
      encoding: 'utf8',
      cwd: projectRoot,
    }).trim();
    results.metrics.largeFiles = parseInt(largeFiles) || 0;
    if (results.metrics.largeFiles > 10) {
      results.score -= 10;
      results.issues.push('Large files detected - consider optimization');
    }
  } catch (e) {
    results.metrics.largeFiles = 0;
  }

  // Check for lazy loading
  try {
    const lazyLoad = execSync('grep -r "lazy\\|Suspense\\|dynamic" --include="*.tsx" --include="*.ts" . | grep -v node_modules | wc -l', {
      encoding: 'utf8',
      cwd: projectRoot,
    }).trim();
    results.metrics.lazyLoadingUsage = parseInt(lazyLoad) || 0;
  } catch (e) {
    results.metrics.lazyLoadingUsage = 0;
  }

  results.status = results.score >= 80 ? 'healthy' : results.score >= 60 ? 'warning' : 'critical';
  return results;
}

async function checkTesting() {
  log('🧪 Checking Testing...', 'cyan');
  
  const results = {
    metrics: {},
    issues: [],
    score: 0,
    status: 'critical',
  };

  // Count test files
  try {
    const testFiles = execSync('find . -name "*.test.*" -o -name "*.spec.*" | grep -v node_modules | wc -l', {
      encoding: 'utf8',
      cwd: projectRoot,
    }).trim();
    results.metrics.testFiles = parseInt(testFiles) || 0;
  } catch (e) {
    results.metrics.testFiles = 0;
  }

  // Check for test configs
  const testConfigs = ['jest.config', 'vitest.config', 'playwright.config', '.test.ts', '.spec.ts'];
  results.metrics.testConfigs = testConfigs.filter(config => {
    try {
      return execSync(`find . -name "*${config}*" | grep -v node_modules | head -1`, {
        encoding: 'utf8',
        cwd: projectRoot,
      }).trim().length > 0;
    } catch {
      return false;
    }
  }).length;

  // Coverage (from earlier check)
  if (healthChecks.codeQuality.metrics?.estimatedCoverage) {
    results.metrics.coverage = healthChecks.codeQuality.metrics.estimatedCoverage;
  }

  // Score based on coverage
  if (results.metrics.coverage >= 80) {
    results.score = 100;
    results.status = 'healthy';
  } else if (results.metrics.coverage >= 50) {
    results.score = 70;
    results.status = 'warning';
  } else if (results.metrics.coverage >= 20) {
    results.score = 40;
    results.status = 'warning';
  } else {
    results.score = 20;
    results.status = 'critical';
    results.issues.push('Low test coverage - critical for production');
  }

  return results;
}

async function checkDocumentation() {
  log('📚 Checking Documentation...', 'cyan');
  
  const results = {
    metrics: {},
    issues: [],
    score: 100,
    status: 'healthy',
  };

  // Count docs
  try {
    const docs = execSync('find . -name "*.md" | grep -v node_modules | wc -l', {
      encoding: 'utf8',
      cwd: projectRoot,
    }).trim();
    results.metrics.documentationFiles = parseInt(docs) || 0;
  } catch (e) {
    results.metrics.documentationFiles = 0;
  }

  // Check for key docs
  const keyDocs = ['README.md', 'CONTRIBUTING.md', 'LICENSE', 'CHANGELOG.md', 'ARCHITECTURE.md'];
  results.metrics.keyDocs = keyDocs.filter(doc => {
    return existsSync(join(projectRoot, doc));
  }).length;

  // Check README quality
  if (existsSync(join(projectRoot, 'README.md'))) {
    const readme = readFileSync(join(projectRoot, 'README.md'), 'utf8');
    const hasSetup = readme.includes('install') || readme.includes('setup');
    const hasUsage = readme.includes('usage') || readme.includes('example');
    const hasContributing = readme.includes('contribut') || existsSync(join(projectRoot, 'CONTRIBUTING.md'));
    
    if (!hasSetup) {
      results.score -= 20;
      results.issues.push('README missing setup instructions');
    }
    if (!hasUsage) {
      results.score -= 10;
      results.issues.push('README missing usage examples');
    }
    if (!hasContributing) {
      results.score -= 10;
      results.issues.push('Missing CONTRIBUTING.md');
    }
  } else {
    results.score -= 50;
    results.issues.push('Missing README.md');
  }

  results.status = results.score >= 80 ? 'healthy' : results.score >= 60 ? 'warning' : 'critical';
  return results;
}

async function checkDependencies() {
  log('📦 Checking Dependencies...', 'cyan');
  
  const results = {
    metrics: {},
    issues: [],
    score: 100,
    status: 'healthy',
  };

  try {
    const packageJson = JSON.parse(readFileSync(join(projectRoot, 'package.json'), 'utf8'));
    const deps = Object.keys(packageJson.dependencies || {}).length;
    const devDeps = Object.keys(packageJson.devDependencies || {}).length;
    
    results.metrics.dependencies = deps;
    results.metrics.devDependencies = devDeps;
    results.metrics.total = deps + devDeps;

    // Check for outdated packages
    // This would require npm/pnpm outdated check
    results.metrics.outdated = 0; // Placeholder
    
    // Check for security
    if (deps > 200) {
      results.score -= 10;
      results.issues.push('High number of dependencies - consider audit');
    }
  } catch (e) {
    results.issues.push('Could not parse package.json');
    results.score = 0;
  }

  results.status = results.score >= 80 ? 'healthy' : results.score >= 60 ? 'warning' : 'critical';
  return results;
}

async function checkConfiguration() {
  log('⚙️  Checking Configuration...', 'cyan');
  
  const results = {
    metrics: {},
    issues: [],
    score: 100,
    status: 'healthy',
  };

  // Check for key config files
  const keyConfigs = [
    'package.json',
    'tsconfig.json',
    '.gitignore',
    '.env.example',
    'docker-compose.yml',
  ];

  results.metrics.configFiles = keyConfigs.filter(config => {
    return existsSync(join(projectRoot, config));
  }).length;

  if (results.metrics.configFiles < keyConfigs.length) {
    results.score -= (keyConfigs.length - results.metrics.configFiles) * 10;
    results.issues.push(`Missing ${keyConfigs.length - results.metrics.configFiles} key config files`);
  }

  // Check CI/CD
  const hasCI = existsSync(join(projectRoot, '.github/workflows'));
  if (hasCI) {
    try {
      const workflows = readdirSync(join(projectRoot, '.github/workflows'));
      results.metrics.workflows = workflows.length;
    } catch {
      results.metrics.workflows = 0;
    }
  } else {
    results.score -= 20;
    results.issues.push('No CI/CD configuration found');
  }

  results.status = results.score >= 80 ? 'healthy' : results.score >= 60 ? 'warning' : 'critical';
  return results;
}

async function generateHealthDashboard(allResults) {
  log('\n📊 Generating Health Dashboard...', 'cyan');

  const dashboard = {
    timestamp: new Date().toISOString(),
    overall: {
      score: 0,
      status: 'unknown',
      categories: {},
    },
    categories: allResults,
    recommendations: [],
    priorities: [],
  };

  // Calculate overall score
  const categoryScores = Object.values(allResults).map(r => r.score || 0);
  dashboard.overall.score = Math.round(
    categoryScores.reduce((sum, score) => sum + score, 0) / categoryScores.length
  );

  // Determine overall status
  if (dashboard.overall.score >= 80) {
    dashboard.overall.status = 'healthy';
  } else if (dashboard.overall.score >= 60) {
    dashboard.overall.status = 'warning';
  } else {
    dashboard.overall.status = 'critical';
  }

  // Generate recommendations
  Object.entries(allResults).forEach(([category, results]) => {
    if (results.status === 'critical' || results.status === 'warning') {
      dashboard.recommendations.push({
        category,
        priority: results.status === 'critical' ? 'high' : 'medium',
        issues: results.issues || [],
        score: results.score,
      });
    }
  });

  // Sort by priority
  dashboard.priorities = dashboard.recommendations
    .sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    })
    .slice(0, 10);

  return dashboard;
}

async function main() {
  log('\n🏥 Comprehensive Project Health Check', 'magenta');
  log('='.repeat(50), 'magenta');

  // Run all health checks
  healthChecks.codeQuality = await checkCodeQuality();
  healthChecks.security = await checkSecurity();
  healthChecks.performance = await checkPerformance();
  healthChecks.testing = await checkTesting();
  healthChecks.documentation = await checkDocumentation();
  healthChecks.dependencies = await checkDependencies();
  healthChecks.configuration = await checkConfiguration();

  // Generate dashboard
  const dashboard = await generateHealthDashboard(healthChecks);

  // Display results
  log('\n📊 Health Check Results', 'blue');
  log('='.repeat(50), 'blue');
  
  Object.entries(healthChecks).forEach(([category, results]) => {
    const icon = results.status === 'healthy' ? '✅' : results.status === 'warning' ? '⚠️' : '❌';
    const color = results.status === 'healthy' ? 'green' : results.status === 'warning' ? 'yellow' : 'red';
    log(`${icon} ${category}: ${results.score}/100 (${results.status})`, color);
  });

  log(`\n📈 Overall Health: ${dashboard.overall.score}/100 (${dashboard.overall.status})`, 
    dashboard.overall.status === 'healthy' ? 'green' : dashboard.overall.status === 'warning' ? 'yellow' : 'red');

  // Save dashboard
  const dashboardPath = join(projectRoot, 'PROJECT_HEALTH_DASHBOARD.json');
  writeFileSync(dashboardPath, JSON.stringify(dashboard, null, 2));
  log(`\n📄 Dashboard saved to: ${dashboardPath}`, 'green');

  // Display priorities
  if (dashboard.priorities.length > 0) {
    log('\n🎯 Top Priorities:', 'cyan');
    dashboard.priorities.forEach((priority, index) => {
      log(`${index + 1}. ${priority.category} (${priority.priority} priority)`, 'yellow');
      priority.issues.forEach(issue => {
        log(`   - ${issue}`, 'cyan');
      });
    });
  }

  return dashboard;
}

main().catch(error => {
  log(`\n❌ Health check failed: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
