#!/usr/bin/env node
/**
 * Improve Test Coverage
 * 
 * Analyzes current test coverage and provides recommendations
 */

import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
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
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Find test files
 */
function findTestFiles(dir = projectRoot) {
  const testFiles = [];
  
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      
      // Skip node_modules, .git, etc.
      if (entry.name.startsWith('.') || entry.name === 'node_modules') {
        continue;
      }
      
      if (entry.isDirectory()) {
        testFiles.push(...findTestFiles(fullPath));
      } else if (
        entry.isFile() &&
        (entry.name.includes('.test.') ||
         entry.name.includes('.spec.') ||
         entry.name.includes('__tests__') ||
         entry.name.endsWith('.test.ts') ||
         entry.name.endsWith('.test.tsx') ||
         entry.name.endsWith('.test.js') ||
         entry.name.endsWith('.test.jsx') ||
         entry.name.endsWith('.spec.ts') ||
         entry.name.endsWith('.spec.tsx'))
      ) {
        testFiles.push(fullPath);
      }
    }
  } catch (error) {
    // Skip directories that can't be read
  }
  
  return testFiles;
}

/**
 * Find source files
 */
function findSourceFiles(dir = projectRoot) {
  const sourceFiles = [];
  
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      
      if (entry.name.startsWith('.') || entry.name === 'node_modules') {
        continue;
      }
      
      if (entry.isDirectory()) {
        sourceFiles.push(...findSourceFiles(fullPath));
      } else if (
        entry.isFile() &&
        (entry.name.endsWith('.ts') ||
         entry.name.endsWith('.tsx') ||
         entry.name.endsWith('.js') ||
         entry.name.endsWith('.jsx')) &&
        !entry.name.includes('.test.') &&
        !entry.name.includes('.spec.') &&
        !entry.name.includes('__tests__')
      ) {
        sourceFiles.push(fullPath);
      }
    }
  } catch (error) {
    // Skip directories that can't be read
  }
  
  return sourceFiles;
}

/**
 * Analyze coverage
 */
function analyzeCoverage() {
  log('📊 Analyzing test coverage...', 'cyan');
  
  const testFiles = findTestFiles();
  const sourceFiles = findSourceFiles();
  
  // Find files without tests
  const sourceFilesByPath = new Map();
  sourceFiles.forEach(file => {
    const relativePath = file.replace(projectRoot + '/', '');
    sourceFilesByPath.set(relativePath, file);
  });
  
  const testFilesByPath = new Set();
  testFiles.forEach(file => {
    const relativePath = file.replace(projectRoot + '/', '');
    // Remove .test/.spec extensions to match source files
    const basePath = relativePath
      .replace(/\.test\.(ts|tsx|js|jsx)$/, '.$1')
      .replace(/\.spec\.(ts|tsx|js|jsx)$/, '.$1')
      .replace(/__tests__\//, '');
    testFilesByPath.add(basePath);
  });
  
  const uncoveredFiles = [];
  sourceFilesByPath.forEach((file, relativePath) => {
    // Check if there's a corresponding test file
    const hasTest = Array.from(testFilesByPath).some(testPath => {
      // Simple matching logic
      const testBase = testPath
        .replace(/\.test\.(ts|tsx|js|jsx)$/, '')
        .replace(/\.spec\.(ts|tsx|js|jsx)$/, '');
      const sourceBase = relativePath
        .replace(/\.(ts|tsx|js|jsx)$/, '');
      return testBase.includes(sourceBase) || sourceBase.includes(testBase);
    });
    
    if (!hasTest) {
      uncoveredFiles.push({
        file: relativePath,
        fullPath: file,
      });
    }
  });
  
  return {
    testFiles: testFiles.length,
    sourceFiles: sourceFiles.length,
    uncoveredFiles: uncoveredFiles.length,
    coverage: testFiles.length > 0 
      ? Math.round((testFiles.length / (testFiles.length + uncoveredFiles.length)) * 100)
      : 0,
    uncoveredFilesList: uncoveredFiles.slice(0, 50), // Limit for report
  };
}

/**
 * Generate recommendations
 */
function generateRecommendations(analysis) {
  const recommendations = [];
  
  if (analysis.coverage < 50) {
    recommendations.push({
      priority: 'HIGH',
      action: 'Add tests for critical paths',
      description: 'Focus on API routes, authentication, and payment flows',
      targetFiles: analysis.uncoveredFilesList
        .filter(f => f.file.includes('api/') || f.file.includes('auth/') || f.file.includes('payments/'))
        .slice(0, 10),
    });
  }
  
  if (analysis.coverage < 80) {
    recommendations.push({
      priority: 'MEDIUM',
      action: 'Add unit tests for utility functions',
      description: 'Test helper functions, validators, and utilities',
      targetFiles: analysis.uncoveredFilesList
        .filter(f => f.file.includes('utils/') || f.file.includes('lib/'))
        .slice(0, 10),
    });
  }
  
  recommendations.push({
    priority: 'LOW',
    action: 'Set up automated coverage reporting',
    description: 'Configure coverage reporting in CI/CD',
    script: 'Add coverage:report and coverage:check to package.json',
  });
  
  return recommendations;
}

/**
 * Main function
 */
async function main() {
  log('\n📈 Improving Test Coverage', 'blue');
  log('=========================\n', 'blue');
  
  // Step 1: Analyze current coverage
  log('Step 1: Analyzing current test coverage...', 'cyan');
  const analysis = analyzeCoverage();
  
  log(`\n📊 Coverage Analysis`, 'blue');
  log(`==================`, 'blue');
  log(`Test Files: ${analysis.testFiles}`, 'cyan');
  log(`Source Files: ${analysis.sourceFiles}`, 'cyan');
  log(`Uncovered Files: ${analysis.uncoveredFiles}`, 'yellow');
  log(`Estimated Coverage: ${analysis.coverage}%`, 
    analysis.coverage >= 80 ? 'green' : analysis.coverage >= 50 ? 'yellow' : 'red');
  
  // Step 2: Generate recommendations
  log('\nStep 2: Generating recommendations...', 'cyan');
  const recommendations = generateRecommendations(analysis);
  
  log(`\n💡 Recommendations:`, 'blue');
  recommendations.forEach((rec, index) => {
    const icon = rec.priority === 'HIGH' ? '🔴' : rec.priority === 'MEDIUM' ? '🟡' : '🟢';
    log(`${icon} ${index + 1}. ${rec.action}`, rec.priority === 'HIGH' ? 'red' : 'yellow');
    log(`   ${rec.description}`, 'cyan');
    if (rec.targetFiles && rec.targetFiles.length > 0) {
      log(`   Priority files:`, 'cyan');
      rec.targetFiles.slice(0, 5).forEach(f => {
        log(`     - ${f.file}`, 'cyan');
      });
    }
    if (rec.script) {
      log(`   Script: ${rec.script}`, 'cyan');
    }
  });
  
  // Step 3: Create action plan
  const actionPlan = {
    timestamp: new Date().toISOString(),
    currentCoverage: analysis.coverage,
    targetCoverage: 80,
    gap: Math.max(0, 80 - analysis.coverage),
    recommendations,
    uncoveredFiles: analysis.uncoveredFilesList,
  };
  
  const planPath = join(projectRoot, 'TEST_COVERAGE_ACTION_PLAN.json');
  writeFileSync(planPath, JSON.stringify(actionPlan, null, 2));
  log(`\n📄 Action plan saved to: ${planPath}`, 'green');
  
  // Step 4: Add coverage scripts if missing
  try {
    const packageJson = JSON.parse(readFileSync(join(projectRoot, 'package.json'), 'utf8'));
    if (!packageJson.scripts['test:coverage']) {
      log('\n⚠️  Consider adding test:coverage script to package.json', 'yellow');
    }
  } catch (error) {
    // Ignore
  }
  
  log(`\n✅ Test coverage analysis complete!`, 'green');
  log(`\n📋 Next Steps:`, 'cyan');
  log(`   1. Review uncovered files in TEST_COVERAGE_ACTION_PLAN.json`, 'cyan');
  log(`   2. Add tests for critical paths (API routes, auth, payments)`, 'cyan');
  log(`   3. Set up coverage reporting in CI/CD`, 'cyan');
  log(`   4. Aim for 80%+ coverage`, 'cyan');
  
  return true;
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.includes('improve-test-coverage')) {
  main().catch(error => {
  log(`\n❌ Error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
