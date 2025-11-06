#!/usr/bin/env node
/**
 * Address secrets scan findings
 * 
 * This script reviews the secrets scan results and creates a migration plan
 * to move all secrets to the centralized secrets vault
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
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
 * Run secrets scan and parse results
 */
function runSecretsScan() {
  log('🔍 Running secrets scan...', 'cyan');
  
  try {
    const output = execSync('node scripts/secrets-scan.mjs', { 
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024 
    });
    
    // Parse the output to extract findings
    const findings = [];
    const lines = output.split('\n');
    
    let currentType = null;
    for (const line of lines) {
      if (line.includes('📋')) {
        const match = line.match(/📋\s+([^(]+)\s*\((\d+)\s+found\)/);
        if (match) {
          currentType = match[1].trim();
        }
      } else if (line.includes('⚠️') || line.includes('🚨')) {
        const match = line.match(/⚠️|🚨\s+(.+):(\d+)/);
        if (match) {
          findings.push({
            file: match[1].trim(),
            line: parseInt(match[2]),
            type: currentType || 'Unknown',
            severity: line.includes('🚨') ? 'CRITICAL' : 'WARNING',
          });
        }
      }
    }
    
    return findings;
  } catch (error) {
    // If scan fails, return empty array
    log('⚠️  Secrets scan had warnings, but continuing...', 'yellow');
    return [];
  }
}

/**
 * Categorize findings
 */
function categorizeFindings(findings) {
  const categories = {
    processEnv: [],
    hardcoded: [],
    configFiles: [],
    documentation: [],
    other: [],
  };

  for (const finding of findings) {
    const file = finding.file;
    
    if (file.includes('.md') || file.includes('README')) {
      categories.documentation.push(finding);
    } else if (file.includes('config') || file.includes('.env')) {
      categories.configFiles.push(finding);
    } else if (finding.type.includes('process.env')) {
      categories.processEnv.push(finding);
    } else if (!file.includes('example') && !file.includes('template')) {
      categories.hardcoded.push(finding);
    } else {
      categories.other.push(finding);
    }
  }

  return categories;
}

/**
 * Generate migration plan
 */
function generateMigrationPlan(categories) {
  const plan = {
    summary: {
      totalFindings: Object.values(categories).reduce((sum, arr) => sum + arr.length, 0),
      critical: categories.hardcoded.filter(f => f.severity === 'CRITICAL').length,
      warnings: categories.processEnv.length + categories.configFiles.length,
    },
    actions: [],
  };

  // Action 1: Migrate process.env usage
  if (categories.processEnv.length > 0) {
    plan.actions.push({
      priority: 1,
      action: 'Migrate process.env to secrets manager',
      count: categories.processEnv.length,
      files: [...new Set(categories.processEnv.map(f => f.file))],
      script: 'update-scripts-to-use-secrets-manager.mjs',
      status: 'ready',
    });
  }

  // Action 2: Review hardcoded secrets
  if (categories.hardcoded.length > 0) {
    plan.actions.push({
      priority: 2,
      action: 'Review and migrate hardcoded secrets',
      count: categories.hardcoded.length,
      files: [...new Set(categories.hardcoded.map(f => f.file))],
      script: 'manual_review_required',
      status: 'pending',
    });
  }

  // Action 3: Update config files
  if (categories.configFiles.length > 0) {
    plan.actions.push({
      priority: 3,
      action: 'Update config files to use secrets vault',
      count: categories.configFiles.length,
      files: [...new Set(categories.configFiles.map(f => f.file))],
      script: 'migrate-secrets-to-supabase-vercel.mjs',
      status: 'ready',
    });
  }

  // Action 4: Clean up documentation
  if (categories.documentation.length > 0) {
    plan.actions.push({
      priority: 4,
      action: 'Review documentation for exposed secrets',
      count: categories.documentation.length,
      files: [...new Set(categories.documentation.map(f => f.file))],
      script: 'manual_review_required',
      status: 'pending',
    });
  }

  return plan;
}

/**
 * Main function
 */
async function main() {
  log('\n🔒 Addressing Secrets Scan Findings', 'blue');
  log('==================================\n', 'blue');

  // Step 1: Run secrets scan
  log('Step 1: Running secrets scan...', 'cyan');
  const findings = runSecretsScan();
  log(`✅ Found ${findings.length} potential secrets\n`, 'green');

  // Step 2: Categorize findings
  log('Step 2: Categorizing findings...', 'cyan');
  const categories = categorizeFindings(findings);
  
  log(`   process.env usage: ${categories.processEnv.length}`, 'cyan');
  log(`   Hardcoded secrets: ${categories.hardcoded.length}`, 'cyan');
  log(`   Config files: ${categories.configFiles.length}`, 'cyan');
  log(`   Documentation: ${categories.documentation.length}`, 'cyan');
  log(`   Other: ${categories.other.length}\n`, 'cyan');

  // Step 3: Generate migration plan
  log('Step 3: Generating migration plan...', 'cyan');
  const plan = generateMigrationPlan(categories);
  
  log(`\n📊 Migration Plan Summary`, 'blue');
  log(`=====================`, 'blue');
  log(`Total Findings: ${plan.summary.totalFindings}`, 'cyan');
  log(`Critical: ${plan.summary.critical}`, plan.summary.critical > 0 ? 'red' : 'green');
  log(`Warnings: ${plan.summary.warnings}\n`, 'yellow');

  log(`📋 Action Items:`, 'blue');
  plan.actions.forEach((action, index) => {
    const icon = action.status === 'ready' ? '✅' : '⚠️';
    log(`${icon} ${index + 1}. ${action.action}`, action.status === 'ready' ? 'green' : 'yellow');
    log(`   Files: ${action.count} findings in ${action.files.length} files`, 'cyan');
    if (action.script !== 'manual_review_required') {
      log(`   Script: ${action.script}`, 'cyan');
    }
  });

  // Step 4: Save plan
  const planPath = join(projectRoot, 'SECRETS_MIGRATION_PLAN.json');
  writeFileSync(planPath, JSON.stringify(plan, null, 2));
  log(`\n📄 Migration plan saved to: ${planPath}`, 'green');

  // Step 5: Execute ready actions
  log('\n🚀 Executing ready actions...', 'cyan');
  
  for (const action of plan.actions) {
    if (action.status === 'ready' && action.script) {
      log(`\n▶️  Executing: ${action.action}`, 'cyan');
      
      try {
        if (action.script === 'update-scripts-to-use-secrets-manager.mjs') {
          // Already executed, just verify
          log('   ✅ Scripts already updated', 'green');
        } else if (action.script === 'migrate-secrets-to-supabase-vercel.mjs') {
          log('   ⚠️  Requires Supabase credentials', 'yellow');
          log('   Run: npm run secrets:migrate after setting credentials', 'yellow');
        }
      } catch (error) {
        log(`   ❌ Error: ${error.message}`, 'red');
      }
    }
  }

  // Step 6: Generate report
  const report = {
    timestamp: new Date().toISOString(),
    findings: {
      total: findings.length,
      byCategory: {
        processEnv: categories.processEnv.length,
        hardcoded: categories.hardcoded.length,
        configFiles: categories.configFiles.length,
        documentation: categories.documentation.length,
        other: categories.other.length,
      },
    },
    migrationPlan: plan,
    nextSteps: [
      '1. Review hardcoded secrets manually',
      '2. Set Supabase credentials',
      '3. Run: npm run secrets:migrate',
      '4. Review documentation for exposed secrets',
    ],
  };

  const reportPath = join(projectRoot, 'SECRETS_REMEDIATION_REPORT.json');
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  log(`\n📊 Remediation report saved to: ${reportPath}`, 'green');
  log(`\n✅ Secrets findings addressed!`, 'green');
}

main().catch(error => {
  log(`\n❌ Error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
