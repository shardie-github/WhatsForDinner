#!/usr/bin/env node
/**
 * Quick Secrets Check
 * 
 * Fast check of critical secrets without API calls
 * Perfect for CI/CD or quick status checks
 */

const CRITICAL = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_JWT_SECRET',
];

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function quickCheck() {
  log('\n🔍 Quick Secrets Check', 'cyan');
  log('─'.repeat(40), 'cyan');

  const results = CRITICAL.map(name => ({
    name,
    configured: !!process.env[name],
  }));

  let allGood = true;

  for (const result of results) {
    const icon = result.configured ? '✅' : '❌';
    const color = result.configured ? 'green' : 'red';
    log(`${icon} ${result.name}`, color);
    if (!result.configured) allGood = false;
  }

  const configured = results.filter(r => r.configured).length;
  const missing = results.length - configured;

  log('\n' + '─'.repeat(40), 'cyan');
  log(`Configured: ${configured}/${CRITICAL.length}`, configured === CRITICAL.length ? 'green' : 'yellow');
  log(`Missing: ${missing}/${CRITICAL.length}`, missing > 0 ? 'red' : 'green');

  if (!allGood) {
    log('\n⚠️  Some critical secrets are missing!', 'yellow');
    log('   Run: node scripts/verify-env-vars.mjs for details', 'yellow');
    process.exit(1);
  } else {
    log('\n✅ All critical secrets are configured!', 'green');
    process.exit(0);
  }
}

quickCheck();
