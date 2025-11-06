#!/usr/bin/env node

/**
 * Development Environment Doctor
 * Preflight checks for development environment setup
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  }

function checkNodeVersion() {
  log('\n🔍 Checking Node.js version...', 'blue');
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  if (majorVersion >= 18) {
    log(`✅ Node.js ${nodeVersion} (LTS compatible)`, 'green');
    return true;
  } else {
    log(`❌ Node.js ${nodeVersion} (requires 18+)`, 'red');
    return false;
  }
}

function checkPackageManager() {
  log('\n🔍 Checking package manager...', 'blue');
  try {
    const pnpmVersion = execSync('pnpm --version', { encoding: 'utf8' }).trim();
    log(`✅ pnpm ${pnpmVersion}`, 'green');
    return true;
  } catch (error) {
    log('❌ pnpm not found. Install with: npm install -g pnpm', 'red');
    return false;
  }
}

function checkEnvironmentKeys() {
  log('\n🔍 Checking environment configuration...', 'blue');
  const envExamplePath = path.join(process.cwd(), '.env.example');
  const envLocalPath = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envExamplePath)) {
    log('⚠️  .env.example not found', 'yellow');
    return false;
  }
  
  const envExample = fs.readFileSync(envExamplePath, 'utf8');
  const requiredKeys = envExample
    .split('\n')
    .filter(line => line.trim() && !line.startsWith('#'))
    .map(line => line.split('=')[0])
    .filter(key => key.trim());
  
  if (fs.existsSync(envLocalPath)) {
    const envLocal = fs.readFileSync(envLocalPath, 'utf8');
    const missingKeys = requiredKeys.filter(key => 
      !envLocal.includes(key) || envLocal.includes(`${key}=`)
    );
    
    if (missingKeys.length === 0) {
      log('✅ All required environment keys present', 'green');
      return true;
    } else {
      log(`⚠️  Missing keys: ${missingKeys.join(', ')}`, 'yellow');
      return false;
    }
  } else {
    log('⚠️  .env.local not found. Copy from .env.example', 'yellow');
    return false;
  }
}

function checkPorts() {
  log('\n🔍 Checking port availability...', 'blue');
  const ports = [3000, 3001, 5432, 54321]; // Next.js, API, Postgres, Supabase
  const netstat = require('child_process').execSync('netstat -tuln 2>/dev/null || ss -tuln 2>/dev/null', { encoding: 'utf8' });
  
  let allAvailable = true;
  ports.forEach(port => {
    if (netstat.includes(`:${port}`)) {
      log(`⚠️  Port ${port} is in use`, 'yellow');
      allAvailable = false;
    } else {
      log(`✅ Port ${port} available`, 'green');
    }
  });
  
  return allAvailable;
}

function checkGitStatus() {
  log('\n🔍 Checking git status...', 'blue');
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    if (status.trim()) {
      log('⚠️  Uncommitted changes detected', 'yellow');
      log('   Consider committing or stashing changes before development', 'yellow');
      return false;
    } else {
      log('✅ Working directory clean', 'green');
      return true;
    }
  } catch (error) {
    log('❌ Git not available or not a git repository', 'red');
    return false;
  }
}

function checkDependencies() {
  log('\n🔍 Checking dependencies...', 'blue');
  const nodeModulesPath = path.join(process.cwd(), 'node_modules');
  if (fs.existsSync(nodeModulesPath)) {
    log('✅ node_modules exists', 'green');
    return true;
  } else {
    log('⚠️  node_modules not found. Run: pnpm install', 'yellow');
    return false;
  }
}

function main() {
  log('🏥 Development Environment Doctor', 'bold');
  log('================================', 'bold');
  
  const checks = [
    checkNodeVersion,
    checkPackageManager,
    checkEnvironmentKeys,
    checkPorts,
    checkGitStatus,
    checkDependencies
  ];
  
  const results = checks.map(check => check());
  const passed = results.filter(Boolean).length;
  const total = results.length;
  
  log('\n📊 Summary', 'bold');
  log('==========', 'bold');
  log(`Passed: ${passed}/${total} checks`, passed === total ? 'green' : 'yellow');
  
  if (passed === total) {
    log('\n🎉 All checks passed! Ready for development.', 'green');
    process.exit(0);
  } else {
    log('\n⚠️  Some checks failed. Please address the issues above.', 'yellow');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };