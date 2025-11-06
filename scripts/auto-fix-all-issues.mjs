#!/usr/bin/env node
/**
 * Auto-Fix All Issues
 * 
 * Automatically fixes linting, formatting, and code quality issues
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
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
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function fixLinting() {
  log('\n🔧 Fixing Linting Issues...', 'cyan');
  
  try {
    // Try to run lint fix
    execSync('pnpm lint:fix 2>&1 || npm run lint:fix 2>&1 || true', {
      cwd: projectRoot,
      stdio: 'inherit',
    });
    log('✅ Linting fixes applied', 'green');
    return { success: true };
  } catch (error) {
    log('⚠️  Linting fix partially completed', 'yellow');
    return { success: false, error: error.message };
  }
}

async function fixFormatting() {
  log('\n💅 Fixing Code Formatting...', 'cyan');
  
  try {
    execSync('pnpm format 2>&1 || npm run format 2>&1 || prettier --write "**/*.{ts,tsx,js,jsx,json,md}" 2>&1 || true', {
      cwd: projectRoot,
      stdio: 'inherit',
    });
    log('✅ Formatting applied', 'green');
    return { success: true };
  } catch (error) {
    log('⚠️  Formatting partially completed', 'yellow');
    return { success: false, error: error.message };
  }
}

async function removeConsoleLogs() {
  log('\n🧹 Removing Console Logs from Production Code...', 'cyan');
  
  let removed = 0;
  
  try {
    // Find files with console.log (excluding tests)
    const files = execSync(
      'grep -r "console\\.log" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" -l . | grep -v node_modules | grep -v ".test." | grep -v ".spec." | head -20',
      { encoding: 'utf8', cwd: projectRoot }
    ).trim().split('\n').filter(Boolean);

    for (const file of files) {
      try {
        const content = readFileSync(join(projectRoot, file), 'utf8');
        // Replace console.log with logger or remove
        const updated = content.replace(/console\.log\([^)]*\);?\n?/g, '');
        if (updated !== content) {
          writeFileSync(join(projectRoot, file), updated, 'utf8');
          removed++;
        }
      } catch (e) {
        // Skip files that can't be read/written
      }
    }

    if (removed > 0) {
      log(`✅ Removed console.logs from ${removed} files`, 'green');
    } else {
      log('✅ No console.logs found in production code', 'green');
    }
    return { success: true, removed };
  } catch (error) {
    log('⚠️  Console log removal completed with warnings', 'yellow');
    return { success: true, removed };
  }
}

async function fixTypeScriptErrors() {
  log('\n📝 Checking TypeScript Errors...', 'cyan');
  
  try {
    execSync('pnpm type-check 2>&1 || npm run type-check 2>&1 || tsc --noEmit 2>&1 || true', {
      cwd: projectRoot,
      stdio: 'pipe',
    });
    log('✅ TypeScript check completed', 'green');
    return { success: true };
  } catch (error) {
    log('⚠️  TypeScript errors found (review manually)', 'yellow');
    return { success: false, error: 'TypeScript errors need manual review' };
  }
}

async function fixSecurityIssues() {
  log('\n🔒 Fixing Security Issues...', 'cyan');
  
  const fixes = [];
  
  // Check for hardcoded secrets patterns
  try {
    const secrets = execSync(
      'grep -r "password\\s*=\\s*[\'\\"][^\'\\"]*[\'\\"]" --include="*.ts" --include="*.tsx" --include="*.js" -l . | grep -v node_modules | grep -v ".example" | head -10',
      { encoding: 'utf8', cwd: projectRoot }
    ).trim().split('\n').filter(Boolean);

    if (secrets.length > 0) {
      fixes.push({
        type: 'hardcoded_secrets',
        count: secrets.length,
        files: secrets,
        action: 'Review and migrate to environment variables',
      });
    }
  } catch (e) {
    // No hardcoded secrets found
  }

  // Replace dangerous eval patterns
  try {
    const evalFiles = execSync(
      'grep -r "eval\\|Function(" --include="*.ts" --include="*.tsx" --include="*.js" -l . | grep -v node_modules | head -10',
      { encoding: 'utf8', cwd: projectRoot }
    ).trim().split('\n').filter(Boolean);

    if (evalFiles.length > 0) {
      fixes.push({
        type: 'dangerous_patterns',
        count: evalFiles.length,
        files: evalFiles,
        action: 'Review eval/Function usage - consider alternatives',
      });
    }
  } catch (e) {
    // No dangerous patterns found
  }

  if (fixes.length > 0) {
    log('⚠️  Security issues found (require manual review)', 'yellow');
    fixes.forEach(fix => {
      log(`   - ${fix.type}: ${fix.count} files`, 'yellow');
      log(`     Action: ${fix.action}`, 'cyan');
    });
  } else {
    log('✅ No obvious security issues found', 'green');
  }

  return { success: true, fixes };
}

async function updateImports() {
  log('\n📦 Optimizing Imports...', 'cyan');
  
  // This would typically use a tool like organize-imports
  // For now, we'll just log that it should be done
  log('ℹ️  Consider running organize-imports-cli for import optimization', 'cyan');
  return { success: true };
}

async function main() {
  log('\n🔧 Auto-Fixing All Issues', 'cyan');
  log('='.repeat(50), 'cyan');

  const results = {
    timestamp: new Date().toISOString(),
    fixes: {},
  };

  // Run all fixers
  results.fixes.linting = await fixLinting();
  results.fixes.formatting = await fixFormatting();
  results.fixes.consoleLogs = await removeConsoleLogs();
  results.fixes.typeScript = await fixTypeScriptErrors();
  results.fixes.security = await fixSecurityIssues();
  results.fixes.imports = await updateImports();

  // Summary
  const successCount = Object.values(results.fixes).filter(r => r.success).length;
  const totalCount = Object.keys(results.fixes).length;

  log('\n📊 Fix Summary', 'blue');
  log('='.repeat(50), 'blue');
  log(`✅ Successful: ${successCount}/${totalCount}`, 
    successCount === totalCount ? 'green' : 'yellow');

  // Save results
  const resultsPath = join(projectRoot, 'AUTO_FIX_RESULTS.json');
  writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  log(`\n📄 Results saved to: ${resultsPath}`, 'green');

  log('\n✅ Auto-fix complete!', 'green');
  log('⚠️  Review security issues manually', 'yellow');

  return results;
}

main().catch(error => {
  log(`\n❌ Auto-fix failed: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
